/**
 * SecurityService.js - Chiffrement lazy par domaines sensibles
 * 
 * - Chiffrement AES-GCM-256
 * - Dérivation clé PBKDF2 (PIN → clé)
 * - Stockage clé en session uniquement (mémoire)
 * - Mode verrouillé : accès domaines sensibles REFUSÉ, urgence accessible
 */

// Clé de chiffrement (en mémoire uniquement, jamais persistée)
let encryptionKey = null;
let isLocked = false;
let isEnabled = false;
let pinHash = null; // Hash du PIN pour vérification (stocké dans IndexedDB)

// Domaines sensibles
const SENSITIVE_DOMAINS = [
    'events',
    'journal',
    'addictions',
    'addictionConfigs',
    'calendar',
    'history',
    'sos'
];

/**
 * Vérifie si le chiffrement est activé
 * @returns {boolean}
 */
export function isSecurityEnabled() {
    return isEnabled;
}

/**
 * Vérifie si le mode est verrouillé
 * @returns {boolean}
 */
export function isLockedMode() {
    return isLocked;
}

/**
 * Hash un PIN pour stockage (ne jamais stocker le PIN en clair)
 * @param {string} pin - PIN utilisateur
 * @returns {Promise<string>} Hash base64
 */
async function hashPin(pin) {
    const encoder = new TextEncoder();
    const pinData = encoder.encode(pin);
    
    // Utiliser PBKDF2 pour créer un hash
    const baseKey = await crypto.subtle.importKey(
        'raw',
        pinData,
        'PBKDF2',
        false,
        ['deriveBits']
    );
    
    const salt = encoder.encode('revenir-pin-salt-v1');
    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        baseKey,
        256
    );
    
    // Convertir en base64
    const hashArray = new Uint8Array(hashBuffer);
    return arrayBufferToBase64(hashArray);
}

/**
 * Active le chiffrement avec un PIN
 * @param {string} pin - PIN utilisateur
 * @returns {Promise<boolean>}
 */
export async function enable(pin) {
    try {
        encryptionKey = await deriveKey(pin);
        pinHash = await hashPin(pin);
        isEnabled = true;
        isLocked = false;
        
        // Sauvegarder le hash dans IndexedDB
        await savePinHash(pinHash);
        
        return true;
    } catch (error) {
        console.error('[SecurityService] Erreur activation:', error);
        return false;
    }
}

/**
 * Sauvegarde le hash du PIN dans IndexedDB
 * @param {string} hash - Hash du PIN
 * @private
 */
async function savePinHash(hash) {
    try {
        const driver = await getIndexedDBDriver();
        if (!driver) {
            console.warn('[SecurityService] IndexedDB not available, PIN hash not saved');
            return;
        }
        
        const meta = await driver.getMeta() || {};
        meta.pinHash = hash;
        meta.pinEnabled = true;
        await driver.setMeta(meta);
    } catch (error) {
        console.error('[SecurityService] Erreur sauvegarde PIN hash:', error);
    }
}

/**
 * Charge le hash du PIN depuis IndexedDB
 * @returns {Promise<string|null>}
 */
async function loadPinHash() {
    try {
        const driver = await getIndexedDBDriver();
        if (!driver) {
            return null;
        }
        
        const meta = await driver.getMeta();
        return meta?.pinHash || null;
    } catch (error) {
        console.error('[SecurityService] Erreur chargement PIN hash:', error);
        return null;
    }
}

/**
 * Vérifie si un PIN est correct
 * @param {string} pin - PIN à vérifier
 * @returns {Promise<boolean>}
 */
export async function verifyPin(pin) {
    try {
        const storedHash = await loadPinHash();
        if (!storedHash) {
            // Pas de PIN défini, accepter n'importe quel PIN pour la première fois
            return true;
        }
        
        const testHash = await hashPin(pin);
        return testHash === storedHash;
    } catch (error) {
        console.error('[SecurityService] Erreur vérification PIN:', error);
        return false;
    }
}

/**
 * Change le PIN
 * @param {string} oldPin - Ancien PIN
 * @param {string} newPin - Nouveau PIN
 * @returns {Promise<boolean>}
 */
export async function changePin(oldPin, newPin) {
    try {
        // Vérifier l'ancien PIN
        const isValid = await verifyPin(oldPin);
        if (!isValid) {
            return false;
        }
        
        // Définir le nouveau PIN
        return await enable(newPin);
    } catch (error) {
        console.error('[SecurityService] Erreur changement PIN:', error);
        return false;
    }
}

/**
 * Désactive le verrouillage PIN
 * @param {string} pin - PIN actuel pour confirmation
 * @returns {Promise<boolean>}
 */
export async function disable(pin) {
    try {
        const isValid = await verifyPin(pin);
        if (!isValid) {
            return false;
        }
        
        isEnabled = false;
        isLocked = false;
        encryptionKey = null;
        pinHash = null;
        
        // Supprimer le hash de IndexedDB
        const driver = await getIndexedDBDriver();
        if (driver) {
            const meta = await driver.getMeta() || {};
            delete meta.pinHash;
            meta.pinEnabled = false;
            await driver.setMeta(meta);
        }
        
        return true;
    } catch (error) {
        console.error('[SecurityService] Erreur désactivation:', error);
        return false;
    }
}

/**
 * Vérifie si un PIN est défini
 * @returns {Promise<boolean>}
 */
export async function hasPin() {
    const hash = await loadPinHash();
    return hash !== null;
}

/**
 * Verrouille l'accès aux domaines sensibles
 */
export function lock() {
    isLocked = true;
    // Ne pas effacer la clé pour permettre unlock rapide
}

/**
 * Déverrouille avec le PIN
 * @param {string} pin - PIN utilisateur
 * @returns {Promise<boolean>}
 */
export async function unlock(pin) {
    try {
        // Vérifier le PIN avec le hash stocké
        const isValid = await verifyPin(pin);
        if (!isValid) {
            return false;
        }
        
        // Si la clé n'est pas en mémoire, la dériver depuis le PIN
        if (!encryptionKey) {
            encryptionKey = await deriveKey(pin);
        }
        
        isLocked = false;
        return true;
    } catch (error) {
        console.error('[SecurityService] Erreur déverrouillage:', error);
        return false;
    }
}

/**
 * Déverrouille automatiquement après une urgence (craving/SOS)
 * Fonctionne uniquement si la clé de chiffrement est déjà en mémoire
 * @returns {Promise<boolean>} True si déverrouillé, false si la clé n'est pas disponible
 */
export async function unlockAfterEmergency() {
    try {
        // Si la clé est déjà en mémoire, on peut déverrouiller sans PIN
        // (la clé reste en mémoire même après lock() pour permettre un unlock rapide)
        if (encryptionKey) {
            isLocked = false;
            return true;
        }
        
        // Si la clé n'est pas en mémoire, on ne peut pas déverrouiller sans PIN
        // (pour des raisons de sécurité)
        console.warn('[SecurityService] Impossible de déverrouiller après urgence : clé non disponible');
        return false;
    } catch (error) {
        console.error('[SecurityService] Erreur déverrouillage après urgence:', error);
        return false;
    }
}

/**
 * Compare deux ArrayBuffer
 * @private
 */
function arrayBufferEquals(a, b) {
    if (a.byteLength !== b.byteLength) return false;
    const viewA = new Uint8Array(a);
    const viewB = new Uint8Array(b);
    for (let i = 0; i < viewA.length; i++) {
        if (viewA[i] !== viewB[i]) return false;
    }
    return true;
}

/**
 * Dérive une clé de chiffrement depuis un PIN
 * @param {string} pin - PIN utilisateur
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(pin) {
    // Convertir PIN en ArrayBuffer
    const encoder = new TextEncoder();
    const pinData = encoder.encode(pin);

    // Importer comme clé de base
    const baseKey = await crypto.subtle.importKey(
        'raw',
        pinData,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    // Dériver la clé avec PBKDF2
    const salt = encoder.encode('revenir-salt-v1'); // En production, utiliser un salt unique par utilisateur
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        baseKey,
        {
            name: 'AES-GCM',
            length: 256
        },
        false,
        ['encrypt', 'decrypt']
    );

    return key;
}

/**
 * Chiffre des données
 * @param {any} data - Données à chiffrer
 * @returns {Promise<{v: number, alg: string, ct: string}>}
 */
export async function encrypt(data) {
    if (!encryptionKey) {
        throw new Error('[SecurityService] Encryption key not available');
    }

    if (isLocked) {
        throw new Error('[SecurityService] Cannot encrypt in locked mode');
    }

    try {
        // Convertir données en JSON puis en ArrayBuffer
        const json = JSON.stringify(data);
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(json);

        // Générer IV (Initialization Vector)
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // Chiffrer
        const encrypted = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            encryptionKey,
            dataBuffer
        );

        // Convertir en base64
        const encryptedArray = new Uint8Array(encrypted);
        const ct = arrayBufferToBase64(encryptedArray);
        const ivBase64 = arrayBufferToBase64(iv);

        return {
            v: 1,
            alg: 'AES-GCM-256',
            ct: `${ivBase64}:${ct}`, // IV:CT
            updatedAt: Date.now()
        };
    } catch (error) {
        console.error('[SecurityService] Erreur chiffrement:', error);
        throw error;
    }
}

/**
 * Déchiffre des données
 * @param {{v: number, alg: string, ct: string}} encrypted - Données chiffrées
 * @returns {Promise<any>}
 */
export async function decrypt(encrypted) {
    if (!encryptionKey) {
        throw new Error('[SecurityService] Encryption key not available');
    }

    if (isLocked) {
        throw new Error('[SecurityService] Cannot decrypt in locked mode');
    }

    try {
        // Extraire IV et CT
        const [ivBase64, ctBase64] = encrypted.ct.split(':');
        const iv = base64ToArrayBuffer(ivBase64);
        const ct = base64ToArrayBuffer(ctBase64);

        // Déchiffrer
        const decrypted = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            encryptionKey,
            ct
        );

        // Convertir en JSON puis en objet
        const decoder = new TextDecoder();
        const json = decoder.decode(decrypted);
        return JSON.parse(json);
    } catch (error) {
        console.error('[SecurityService] Erreur déchiffrement:', error);
        throw error;
    }
}

/**
 * Déchiffre des données avec un PIN spécifique (pour import)
 * Ne vérifie pas le hash stocké, dérive directement la clé depuis le PIN
 * @param {{v: number, alg: string, ct: string}} encrypted - Données chiffrées
 * @param {string} pin - PIN pour déchiffrer
 * @returns {Promise<any>} Données déchiffrées
 */
export async function decryptWithPin(encrypted, pin) {
    try {
        // Dériver la clé temporaire depuis le PIN (même algorithme que deriveKey)
        const tempKey = await deriveKey(pin);
        
        // Extraire IV et CT
        const [ivBase64, ctBase64] = encrypted.ct.split(':');
        const iv = base64ToArrayBuffer(ivBase64);
        const ct = base64ToArrayBuffer(ctBase64);

        // Déchiffrer avec la clé temporaire
        const decrypted = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            tempKey,
            ct
        );

        // Convertir en JSON puis en objet
        const decoder = new TextDecoder();
        const json = decoder.decode(decrypted);
        return JSON.parse(json);
    } catch (error) {
        console.error('[SecurityService] Erreur déchiffrement avec PIN:', error);
        throw new Error('PIN incorrect ou données corrompues');
    }
}

/**
 * Vérifie si un domaine est accessible (non verrouillé ou urgence)
 * @param {string} domainKey - Clé du domaine
 * @param {boolean} isEmergency - Si true, autorise l'accès même verrouillé
 * @returns {boolean}
 */
export function canAccessDomain(domainKey, isEmergency = false) {
    if (!isEnabled) {
        return true; // Chiffrement non activé, accès libre
    }

    if (isLocked && SENSITIVE_DOMAINS.includes(domainKey) && !isEmergency) {
        return false;
    }

    return true;
}

/**
 * Récupère un domaine sensible (déchiffré)
 * @param {string} domainKey - Clé du domaine
 * @param {boolean} isEmergency - Si true, autorise l'accès même verrouillé (pour urgence)
 * @returns {Promise<any>}
 */
export async function getDomain(domainKey, isEmergency = false) {
    if (!isEnabled) {
        // Chiffrement non activé, retourner null
        return null;
    }

    if (isLocked && SENSITIVE_DOMAINS.includes(domainKey) && !isEmergency) {
        throw new Error(`[SecurityService] Domain ${domainKey} is locked`);
    }

    try {
        const driver = await getIndexedDBDriver();
        if (!driver) {
            return null;
        }

        const encrypted = await driver.getDomain(domainKey);
        if (!encrypted) {
            return null;
        }

        return await decrypt(encrypted);
    } catch (error) {
        console.error(`[SecurityService] Erreur récupération domaine ${domainKey}:`, error);
        throw error;
    }
}

/**
 * Sauvegarde un domaine sensible (chiffré)
 * @param {string} domainKey - Clé du domaine
 * @param {any} value - Valeur à sauvegarder
 * @returns {Promise<void>}
 */
export async function setDomain(domainKey, value) {
    if (!isEnabled) {
        // Chiffrement non activé, ne rien faire
        return;
    }

    if (isLocked && SENSITIVE_DOMAINS.includes(domainKey)) {
        throw new Error(`[SecurityService] Cannot save domain ${domainKey} in locked mode`);
    }

    try {
        const encrypted = await encrypt(value);
        const driver = await getIndexedDBDriver();
        if (!driver) {
            throw new Error('[SecurityService] IndexedDB driver not available');
        }

        await driver.setDomain(domainKey, encrypted);
    } catch (error) {
        console.error(`[SecurityService] Erreur sauvegarde domaine ${domainKey}:`, error);
        throw error;
    }
}

/**
 * Récupère le driver IndexedDB
 * @private
 */
async function getIndexedDBDriver() {
    try {
        if (typeof window !== 'undefined' && window.Storage) {
            // Essayer d'obtenir le driver actuel
            if (window.Storage.getCurrentDriver) {
                const driver = window.Storage.getCurrentDriver();
                if (driver && typeof driver.getMeta === 'function') {
                    return driver;
                }
            }
            // Sinon, initialiser le driver
            if (window.Storage.initStorageDriver) {
                const driver = await window.Storage.initStorageDriver();
                if (driver && typeof driver.getMeta === 'function') {
                    return driver;
                }
            }
        }
    } catch (error) {
        console.error('[SecurityService] Erreur récupération driver:', error);
    }
    return null;
}

/**
 * Convertit ArrayBuffer en base64
 * @private
 */
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Convertit base64 en ArrayBuffer
 * @private
 */
function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Initialise SecurityService au démarrage
 * Charge le hash du PIN si disponible
 */
export async function init() {
    try {
        // Attendre que le driver soit disponible (avec retry)
        let driver = null;
        let retries = 0;
        const maxRetries = 5;
        
        while (!driver && retries < maxRetries) {
            driver = await getIndexedDBDriver();
            if (!driver) {
                retries++;
                // Attendre un peu avant de réessayer
                await new Promise(resolve => setTimeout(resolve, 100 * retries));
            }
        }
        
        if (!driver) {
            console.warn('[SecurityService] IndexedDB driver not available after retries, PIN may not persist');
            return;
        }
        
        const hash = await loadPinHash();
        if (hash) {
            pinHash = hash;
            isEnabled = true;
            // Ne pas déverrouiller automatiquement, l'utilisateur doit entrer le PIN
            isLocked = true;
            console.log('[SecurityService] PIN chargé depuis IndexedDB, app verrouillée');
        }
    } catch (error) {
        console.error('[SecurityService] Erreur initialisation:', error);
    }
}

export default {
    isEnabled: isSecurityEnabled,
    isLocked: isLockedMode,
    enable,
    disable,
    lock,
    unlock,
    unlockAfterEmergency,
    verifyPin,
    changePin,
    hasPin,
    encrypt,
    decrypt,
    decryptWithPin,
    getDomain,
    setDomain,
    init
};
