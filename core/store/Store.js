/**
 * Store.js - API centralisée d'écriture single-writer
 * 
 * Toute écriture de state doit passer par Store.update()
 * - Sérialisation des écritures (pas d'écritures concurrentes)
 * - Validation du state
 * - Hooks (analytics, security)
 * - Persist via StorageDriver
 */

import { SENSITIVE_DOMAINS } from '../config/SensitiveDomainsConfig.js';

// Queue d'écritures pour sérialisation
let writeQueue = [];
let isWriting = false;

// Hooks
let hooks = {
    analytics: null,
    security: null
};

// Initialiser les hooks si disponibles
if (typeof window !== 'undefined') {
    // Attendre que les services soient chargés
    setTimeout(() => {
        if (window.Analytics && window.Analytics.updateAnalytics) {
            registerHook('analytics', window.Analytics.updateAnalytics);
        }
        if (window.Security) {
            registerHook('security', sealSensitiveDomains);
        }
    }, 100);
}

/**
 * Hook security : chiffre et sauvegarde les domaines sensibles
 * @private
 */
async function sealSensitiveDomains(draft, options) {
    if (!window.Security || !window.Security.isEnabled()) {
        return; // Chiffrement non activé
    }

    const isEmergency = options.reason === 'emergency_used' || options.isEmergency === true;
    const isLocked = window.Security.isLocked();

    if (isLocked && !isEmergency) {
        // En mode verrouillé (sans urgence), ne pas sauvegarder les domaines sensibles
        // Retirer les domaines sensibles du draft pour éviter leur sauvegarde
        SENSITIVE_DOMAINS.forEach(domainConfig => {
            if (domainConfig.removeWhenLocked) {
                if (draft[domainConfig.key] !== undefined) {
                    delete draft[domainConfig.key];
                }
            } else if (domainConfig.subKey && draft[domainConfig.key]) {
                // Pour calendar, retirer seulement cleanDays
                if (domainConfig.key === 'calendar' && domainConfig.subKey === 'cleanDays') {
                    draft.calendar.cleanDays = [];
                }
            }
        });
        return;
    }

    // En mode urgence ou déverrouillé, sauvegarder normalement
    // Mais en urgence, on peut limiter ce qui est sauvegardé
    if (isEmergency && isLocked) {
        // En urgence verrouillée, sauvegarder seulement analytics, pas events détaillés
        if (draft.events) {
            // Garder seulement un event générique pour analytics
            const genericEvent = {
                ts: Date.now(),
                date: new Date().toISOString().split('T')[0],
                type: 'emergency_used',
                // Pas d'addictionId ni de métadonnées sensibles
            };
            draft.events = [genericEvent];
        }
    }

    try {
        const driver = await getStorageDriver();
        if (!driver || typeof driver.setDomain !== 'function') {
            return; // Pas d'IndexedDB ou pas de support domains
        }

        // Chiffrer et sauvegarder chaque domaine sensible
        for (const domainConfig of SENSITIVE_DOMAINS) {
            if (!domainConfig.encrypt) continue;
            
            const domainKey = domainConfig.key;
            let value = draft[domainKey];
            
            // Gérer les sous-clés (comme calendar.cleanDays)
            if (domainConfig.subKey && domainKey === 'calendar' && draft.calendar) {
                value = { cleanDays: draft.calendar.cleanDays || [] };
            }
            
            if (value !== undefined && value !== null) {
                try {
                    await window.Security.setDomain(domainKey, value);
                    
                    // Retirer du draft pour éviter double stockage
                    if (domainConfig.subKey && domainKey === 'calendar') {
                        // Pour calendar, on garde milestones dans state, on retire seulement cleanDays
                        if (draft.calendar) {
                            draft.calendar.cleanDays = [];
                        }
                    } else {
                        delete draft[domainKey];
                    }
                } catch (error) {
                    console.warn(`[Store] Erreur chiffrement domaine ${domainKey}:`, error);
                    // Continuer avec les autres domaines
                }
            }
        }
    } catch (error) {
        console.error('[Store] Erreur sealSensitiveDomains:', error);
        // Ne pas bloquer l'écriture si security échoue
    }
}

/**
 * Enregistre un hook
 * @param {string} name - Nom du hook ('analytics', 'security')
 * @param {Function} hook - Fonction du hook
 */
export function registerHook(name, hook) {
    if (name === 'analytics' || name === 'security') {
        hooks[name] = hook;
    }
}

/**
 * Met à jour le state via l'API centralisée
 * @param {Function} mutator - Fonction qui modifie le draft
 * @param {Object} options - Options { reason?: string }
 * @returns {Promise<void>}
 */
export async function update(mutator, options = {}) {
    return new Promise((resolve, reject) => {
        writeQueue.push({ mutator, options, resolve, reject });
        processQueue();
    });
}

/**
 * Traite la queue d'écritures (sérialisé)
 */
async function processQueue() {
    if (isWriting || writeQueue.length === 0) {
        return;
    }

    isWriting = true;

    while (writeQueue.length > 0) {
        const { mutator, options, resolve, reject } = writeQueue.shift();

        try {
            await processWrite(mutator, options);
            resolve();
        } catch (error) {
            console.error('[Store] Erreur lors de l\'écriture:', error);
            reject(error);
        }
    }

    isWriting = false;
}

/**
 * Traite une écriture
 * @private
 */
async function processWrite(mutator, options) {
    // 1. Cloner window.state → draft
    const currentState = window.state;
    if (!currentState) {
        throw new Error('[Store] window.state is not initialized');
    }

    const draft = deepClone(currentState);

    // 2. Appliquer mutator
    mutator(draft);

    // 3. Validation du state
    validateState(draft);

    // 4. Hooks (security avant analytics pour que analytics puisse lire les events)
    if (hooks.security) {
        await hooks.security(draft, options);
    }

    if (hooks.analytics) {
        await hooks.analytics(draft, options);
    }

    // 5. Persist via StorageDriver
    const driver = await getStorageDriver();
    await driver.save(draft);

    // 6. Remplacer window.state
    window.state = draft;
}

/**
 * Récupère le driver de stockage
 * @private
 */
async function getStorageDriver() {
    if (typeof window !== 'undefined' && window.Storage && window.Storage.initStorageDriver) {
        return await window.Storage.initStorageDriver();
    }
    
    // Fallback vers localStorage direct
    return {
        async save(state) {
            if (typeof window !== 'undefined' && window.Storage && window.Storage.saveState) {
                window.Storage.saveState(state);
            }
        }
    };
}

/**
 * Valide le state
 * @private
 */
function validateState(state) {
    if (!state || typeof state !== 'object') {
        throw new Error('[Store] Invalid state: must be an object');
    }

    if (!state.schemaVersion) {
        throw new Error('[Store] Invalid state: missing schemaVersion');
    }

    // Validations de base
    if (!state.profile || typeof state.profile !== 'object') {
        throw new Error('[Store] Invalid state: missing or invalid profile');
    }

    if (!state.settings || typeof state.settings !== 'object') {
        throw new Error('[Store] Invalid state: missing or invalid settings');
    }

    // Valider que les tableaux sont bien des tableaux
    const arrayFields = [
        'addictions', 'checkins', 'events', 'ifThenRules',
        'experiments', 'customActions', 'intentions.history'
    ];

    arrayFields.forEach(field => {
        const keys = field.split('.');
        let value = state;
        for (const key of keys) {
            value = value?.[key];
        }
        if (value !== undefined && !Array.isArray(value)) {
            throw new Error(`[Store] Invalid state: ${field} must be an array`);
        }
    });
}

/**
 * Clone profond d'un objet
 * @private
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }

    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }

    return cloned;
}

/**
 * Exporte l'API Store
 */
export default {
    update,
    registerHook
};
