/**
 * storage.js - Gestion du stockage localStorage pour l'application Haven
 * 
 * Fonctionnalités:
 * - Sauvegarde/chargement du state dans localStorage
 * - Import/export JSON
 * - Migration de schéma automatique (v1 -> v2 -> v3)
 * - Validation des données importées
 * - Export anonymisé et snapshots
 * 
 * MIGRATION: Utilise maintenant StorageDriver pattern pour support IndexedDB
 */

// Clé unique pour le stockage
const STORAGE_KEY = 'revenir_state_v1';

// Version actuelle du schéma
const CURRENT_SCHEMA_VERSION = 6;

// Driver de stockage actuel (par défaut LocalStorageDriver)
let currentDriver = null;
let migrationChecked = false;

/**
 * Initialise le driver de stockage
 * Détecte IndexedDB et migre depuis localStorage si nécessaire
 */
async function initStorageDriver() {
    if (currentDriver) {
        return currentDriver;
    }
    
    // Vérifier si IndexedDB est disponible
    if (!window.indexedDB) {
        console.warn('[Storage] IndexedDB not available, using localStorage');
        return initLocalStorageDriver();
    }

    try {
        const { IndexedDBDriver } = await import('../storage/IndexedDBDriver.js');
        const idbDriver = new IndexedDBDriver();
        
        // Vérifier si IndexedDB contient déjà des données
        await idbDriver.init();
        const meta = await idbDriver.getMeta();
        
        if (meta && meta.storageVersion) {
            // IndexedDB déjà initialisé, l'utiliser
            console.log('[Storage] Using IndexedDB (already initialized)');
            currentDriver = idbDriver;
            return currentDriver;
        }

        // IndexedDB vide, vérifier localStorage pour migration
        if (!migrationChecked) {
            migrationChecked = true;
            const migrated = await migrateFromLocalStorage(idbDriver);
            
            if (migrated) {
                console.log('[Storage] Migrated from localStorage to IndexedDB');
                currentDriver = idbDriver;
                return currentDriver;
            }
        }

        // Pas de données à migrer, initialiser IndexedDB avec state par défaut
        const defaultState = getDefaultState();
        await idbDriver.save(defaultState);
        await idbDriver.setMeta({
            schemaVersion: CURRENT_SCHEMA_VERSION,
            storageVersion: 1,
            migratedFromLocalStorageAt: null
        });
        
        currentDriver = idbDriver;
        return currentDriver;
    } catch (error) {
        console.error('[Storage] IndexedDB initialization failed, falling back to localStorage', error);
        return initLocalStorageDriver();
    }
}

/**
 * Initialise LocalStorageDriver
 */
async function initLocalStorageDriver() {
    try {
        const { LocalStorageDriver } = await import('../storage/LocalStorageDriver.js');
        currentDriver = new LocalStorageDriver();
        return currentDriver;
    } catch (error) {
        console.warn('[Storage] LocalStorageDriver not available, using fallback', error);
        // Fallback vers implémentation directe localStorage
        currentDriver = {
            async load() {
                return loadStateSync();
            },
            async save(state) {
                return saveStateSync(state);
            },
            async export(state) {
                return JSON.stringify(state, null, 2);
            },
            async import(json) {
                const state = JSON.parse(json);
                return migrateState(state);
            }
        };
        return currentDriver;
    }
}

/**
 * Migre les données depuis localStorage vers IndexedDB
 * @param {IndexedDBDriver} idbDriver - Driver IndexedDB
 * @returns {Promise<boolean>} true si migration effectuée
 */
async function migrateFromLocalStorage(idbDriver) {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return false; // Pas de données à migrer
        }

        // Charger et migrer le state
        const state = JSON.parse(stored);
        const migratedState = migrateState(state);

        // Sauvegarder dans IndexedDB
        await idbDriver.save(migratedState);
        
        // Sauvegarder meta avec timestamp de migration
        await idbDriver.setMeta({
            schemaVersion: migratedState.schemaVersion || CURRENT_SCHEMA_VERSION,
            storageVersion: 1,
            migratedFromLocalStorageAt: Date.now()
        });

        // Initialiser analytics vide
        // (sera rempli progressivement)

        return true;
    } catch (error) {
        console.error('[Storage] Migration from localStorage failed', error);
        return false;
    }
}

/**
 * Charge le state de manière synchrone (compatibilité)
 */
function loadStateSync() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return getDefaultState();
        }
        
        const state = JSON.parse(stored);
        return migrateState(state);
    } catch (error) {
        console.error('[Storage] Erreur lors du chargement:', error);
        return getDefaultState();
    }
}

/**
 * Sauvegarde le state de manière synchrone (compatibilité)
 */
function saveStateSync(state) {
    try {
        state.schemaVersion = CURRENT_SCHEMA_VERSION;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('[Storage] Erreur lors de la sauvegarde:', error);
    }
}

/**
 * State par défaut de l'application (schemaVersion 4)
 */
function getDefaultState() {
    return {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        profile: {
            lang: 'fr',
            religion: 'none',
            spiritualEnabled: false,
            rtl: false
        },
        addictions: [],
        settings: {
            discreetMode: false,
            notifications: false,
            lowTextMode: false,  // V3: Mode icônes
            theme: 'dark',  // Theme: 'dark' ou 'light'
            autoLock: {  // V4: Verrouillage automatique
                enabled: false,
                delay: 60000,  // 1 minute par défaut (en millisecondes)
                autoLockOnTabBlur: false  // Verrouiller au changement d'onglet
            }
        },
        
        // Journaux
        checkins: [],
        eveningRituals: [],
        
        // Événements (cravings, episodes, wins, slopes)
        events: [],
        
        // V2: Règles "si... alors..."
        ifThenRules: [],
        
        // V2: Intentions quotidiennes
        intentions: {
            lastShownDate: null,
            history: []
        },
        
        // V2: Victoires invisibles (compteurs)
        wins: {
            resistedCravings: 0,
            minutesSavedEstimate: 0,
            positiveActionsCount: 0
        },
        
        // V2: Mode expérimentation
        experiments: [],
        
        // V2+V3: Configuration anti-porno (étendu)
        antiporn: {
            triggers: ['alone', 'night', 'boredom', 'stress'],
            environmentRules: {
                phoneOutBedroom: false,
                noPhoneBed: false,
                blockTriggersList: false,
                bedtimeHour: 23
            },
            slopeSignals: ['soft_images', 'endless_scroll', 'searching'],
            // V3: Compteur pentes stoppées
            stoppedSlopes: 0,
            // V3: Check-in téléphone au lit
            phoneBedCheckins: []
        },
        
        // ========================================
        // V3: NOUVEAUX CHAMPS
        // ========================================
        
        // V3: Routine nuit
        nightRoutine: {
            enabled: false,
            hour: 22,
            checklist: ['phone_out', 'lights_dim', 'leave_bed'],
            customChecklist: [],
            logs: []
        },
        
        // V3: Bibliothèque d'actions personnalisées
        customActions: [],
        
        // V3: Programmes guidés CBT
        programs: {
            active: null,
            history: [],
            dayProgress: {}
        },
        
        // V3: Coaching local
        // V6: Coaching V2 - Architecture adaptative
        coaching: {
            mode: 'stability', // 'observer' | 'stability' | 'guided' | 'silent'
            lastShownDate: null,
            activeAnchor: null, // { id, type, context, addictionId?, suggestedAt }
            insights: [],
            feedback: {
                useful: 0,  // Renommé de usefulCount
                dismissed: 0  // Renommé de dismissedCount
            }
        },
        
        // V3: Journal par tags
        journal: {
            entries: [],
            customTags: []
        },
        
        // V3: Spirituel avancé
        spiritual: {
            playlists: {
                morning: [],
                evening: [],
                crisis: [],
                afterRelapse: []
            },
            dhikrCount: 0,
            dailyGoals: [],
            goalHistory: []
        },
        
        // V3: SOS configuration
        sos: {
            favoriteActions: [],
            recentActions: []
        },
        
        // V3: Calendrier de progression
        calendar: {
            cleanDays: [], // Renommé de sobrietyDays pour être plus générique
            milestones: []
        },
        
        // V4: Configuration des addictions (catalogue étendu)
        addictionsConfig: {
            catalog: null  // Sera initialisé depuis AddictionsConfig.CATALOG si nécessaire
        },
        
        // V5: Configurations par addiction (multi-addictions)
        addictionConfigs: {
            // Structure par addiction:
            // porn: { triggers: [], slopeSignals: [], stoppedSlopes: 0, customTriggers: [], activeRules: [], phoneBedCheckins: [] }
            // cigarette: { ... }
            // etc.
        }
    };
}

/**
 * Charge le state depuis le stockage
 * @returns {Object} Le state chargé ou le state par défaut
 * 
 * NOTE: Pour compatibilité, reste synchrone par défaut
 * La version async sera utilisée quand IndexedDB sera activé
 */
function loadState() {
    // Pour l'instant, reste synchrone pour compatibilité
    // Quand IndexedDB sera activé, on utilisera await initStorageDriver().load()
    const state = loadStateSync();
    
    // Si IndexedDB est utilisé et Security est activé, charger events depuis domains
    // (lazy loading - sera fait à la demande)
    // Pour l'instant, on garde la compatibilité avec l'ancien système
    
    return state;
}

/**
 * Sauvegarde le state dans le stockage
 * @param {Object} state - Le state à sauvegarder
 * 
 * NOTE: Pour compatibilité, reste synchrone par défaut
 * La version async sera utilisée quand IndexedDB sera activé
 * 
 * ATTENTION: Cette fonction est appelée partout dans le code.
 * Pour les nouvelles écritures, utiliser Store.update() à la place.
 */
function saveState(state) {
    // Si Store.update est disponible, on devrait l'utiliser
    // Mais saveState() est appelé directement dans beaucoup d'endroits
    // On garde la compatibilité pour l'instant
    
    // Pour l'instant, reste synchrone pour compatibilité
    // Quand IndexedDB sera activé, on utilisera await initStorageDriver().save(state)
    saveStateSync(state);
}

/**
 * Migre le state vers la version actuelle du schéma
 * Migration successive : 0 -> 1 -> 2 -> 3
 * @param {Object} state - Le state à migrer
 * @returns {Object} Le state migré
 */
function migrateState(state) {
    let currentState = { ...state };
    
    // Si pas de version, c'est la version 0 (très ancien)
    if (!currentState.schemaVersion) {
        currentState.schemaVersion = 0;
    }
    
    // Migrations successives
    while (currentState.schemaVersion < CURRENT_SCHEMA_VERSION) {
        console.log(`[Storage] Migration v${currentState.schemaVersion} -> v${currentState.schemaVersion + 1}`);
        
        switch (currentState.schemaVersion) {
            case 0:
                currentState = migrateV0ToV1(currentState);
                break;
            case 1:
                currentState = migrateV1ToV2(currentState);
                break;
            case 2:
                currentState = migrateV2ToV3(currentState);
                break;
            case 3:
                currentState = migrateV3ToV4(currentState);
                break;
            case 4:
                currentState = migrateV4ToV5(currentState);
                break;
            case 5:
                currentState = migrateV5ToV6(currentState);
                break;
            default:
                // Version inconnue, on incrémente
                currentState.schemaVersion++;
        }
    }
    
    // Migration post-schéma : corriger structure coaching si nécessaire
    if (currentState.coaching) {
        const defaultCoaching = getDefaultState().coaching;
        // Migrer lastWeeklyInsight vers lastShownDate si nécessaire
        if (currentState.coaching.lastWeeklyInsight && !currentState.coaching.lastShownDate) {
            currentState.coaching.lastShownDate = currentState.coaching.lastWeeklyInsight;
            delete currentState.coaching.lastWeeklyInsight;
        }
        // S'assurer que feedback existe et migrer les anciens noms
        if (!currentState.coaching.feedback) {
            currentState.coaching.feedback = defaultCoaching.feedback;
        } else {
            // Migration rétrocompatibilité: usefulCount/dismissedCount -> useful/dismissed
            if (currentState.coaching.feedback.usefulCount !== undefined && currentState.coaching.feedback.useful === undefined) {
                currentState.coaching.feedback.useful = currentState.coaching.feedback.usefulCount;
            }
            if (currentState.coaching.feedback.dismissedCount !== undefined && currentState.coaching.feedback.dismissed === undefined) {
                currentState.coaching.feedback.dismissed = currentState.coaching.feedback.dismissedCount;
            }
        }
        // S'assurer que insights est un tableau
        if (!Array.isArray(currentState.coaching.insights)) {
            currentState.coaching.insights = defaultCoaching.insights;
        }
        // S'assurer que mode existe (pour rétrocompatibilité)
        if (!currentState.coaching.mode) {
            currentState.coaching.mode = 'stability';
        }
        // S'assurer que activeAnchor existe
        if (currentState.coaching.activeAnchor === undefined) {
            currentState.coaching.activeAnchor = null;
        }
    }
    
    return currentState;
}

/**
 * Migration de la version 0 vers la version 1
 * @param {Object} state - Le state v0
 * @returns {Object} Le state v1
 */
function migrateV0ToV1(state) {
    const defaultState = getDefaultState();
    
    return {
        schemaVersion: 1,
        profile: {
            lang: state.profile?.lang || defaultState.profile.lang,
            religion: state.profile?.religion || defaultState.profile.religion,
            spiritualEnabled: state.profile?.spiritualEnabled ?? defaultState.profile.spiritualEnabled,
            rtl: state.profile?.rtl ?? defaultState.profile.rtl
        },
        addictions: Array.isArray(state.addictions) ? state.addictions : defaultState.addictions,
        settings: {
            discreetMode: state.settings?.discreetMode ?? defaultState.settings.discreetMode,
            notifications: state.settings?.notifications ?? defaultState.settings.notifications,
            autoLock: state.settings?.autoLock || defaultState.settings.autoLock
        },
        checkins: Array.isArray(state.checkins) ? state.checkins : defaultState.checkins,
        events: Array.isArray(state.events) ? state.events : defaultState.events
    };
}

/**
 * Migration de la version 1 vers la version 2
 * Ajout: eveningRituals, ifThenRules, intentions, wins, experiments, antiporn
 * @param {Object} state - Le state v1
 * @returns {Object} Le state v2
 */
function migrateV1ToV2(state) {
    const defaultState = getDefaultState();
    
    return {
        schemaVersion: 2,
        
        // Conserver les données existantes
        profile: state.profile || defaultState.profile,
        addictions: Array.isArray(state.addictions) ? state.addictions : defaultState.addictions,
        settings: {
            ...defaultState.settings,
            ...(state.settings || {}),
            autoLock: state.settings?.autoLock || defaultState.settings.autoLock
        },
        checkins: Array.isArray(state.checkins) ? state.checkins : defaultState.checkins,
        events: Array.isArray(state.events) ? state.events : defaultState.events,
        
        // Nouveaux champs v2
        eveningRituals: Array.isArray(state.eveningRituals) ? state.eveningRituals : defaultState.eveningRituals,
        ifThenRules: state.ifThenRules || defaultState.ifThenRules,
        intentions: state.intentions || defaultState.intentions,
        wins: state.wins || defaultState.wins,
        experiments: state.experiments || defaultState.experiments,
        antiporn: state.antiporn || defaultState.antiporn
    };
}

/**
 * Migration de la version 3 vers la version 4
 * Ajout: addictionsConfig (catalogue des addictions étendu)
 * @param {Object} state - Le state v3
 * @returns {Object} Le state v4
 */
function migrateV3ToV4(state) {
    const defaultState = getDefaultState();
    
    return {
        schemaVersion: 4,
        
        // Conserver toutes les données existantes
        profile: state.profile || defaultState.profile,
        addictions: Array.isArray(state.addictions) ? state.addictions : defaultState.addictions,
        settings: {
            ...defaultState.settings,
            ...state.settings,
            autoLock: state.settings?.autoLock || defaultState.settings.autoLock
        },
        checkins: Array.isArray(state.checkins) ? state.checkins : defaultState.checkins,
        events: Array.isArray(state.events) ? state.events : defaultState.events,
        eveningRituals: Array.isArray(state.eveningRituals) ? state.eveningRituals : defaultState.eveningRituals,
        ifThenRules: state.ifThenRules || defaultState.ifThenRules,
        intentions: state.intentions || defaultState.intentions,
        wins: state.wins || defaultState.wins,
        experiments: state.experiments || defaultState.experiments,
        antiporn: state.antiporn || defaultState.antiporn,
        nightRoutine: state.nightRoutine || defaultState.nightRoutine,
        customActions: state.customActions || defaultState.customActions,
        programs: state.programs || defaultState.programs,
        coaching: state.coaching || defaultState.coaching,
        journal: state.journal || defaultState.journal,
        spiritual: state.spiritual || defaultState.spiritual,
        sos: state.sos || defaultState.sos,
        calendar: state.calendar || defaultState.calendar,
        
        // Nouveau champ v4 (optionnel, backward compatible)
        addictionsConfig: state.addictionsConfig || defaultState.addictionsConfig,
        
        // v5 sera ajouté par migrateV4ToV5
        addictionConfigs: state.addictionConfigs || defaultState.addictionConfigs
    };
}

/**
 * Migration de la version 4 vers la version 5
 * Ajout: addictionConfigs (configurations multi-addictions)
 * Migration: antiporn -> addictionConfigs.porn
 * @param {Object} state - Le state v4
 * @returns {Object} Le state v5
 */
function migrateV4ToV5(state) {
    const defaultState = getDefaultState();
    
    // Migrer les données antiporn vers addictionConfigs.porn
    const pornConfig = {
        triggers: state.antiporn?.triggers || ['alone', 'night', 'boredom', 'stress'],
        slopeSignals: state.antiporn?.slopeSignals || ['soft_images', 'endless_scroll', 'searching'],
        stoppedSlopes: state.antiporn?.stoppedSlopes || 0,
        customTriggers: state.antiporn?.customTriggers || [],
        activeRules: state.antiporn?.activeRules || [],
        phoneBedCheckins: state.antiporn?.phoneBedCheckins || [],
        environmentRules: state.antiporn?.environmentRules || {}
    };
    
    return {
        schemaVersion: 5,
        
        // Conserver toutes les données existantes
        profile: state.profile || defaultState.profile,
        addictions: Array.isArray(state.addictions) ? state.addictions : defaultState.addictions,
        settings: {
            ...defaultState.settings,
            ...state.settings,
            autoLock: state.settings?.autoLock || defaultState.settings.autoLock
        },
        checkins: Array.isArray(state.checkins) ? state.checkins : defaultState.checkins,
        events: Array.isArray(state.events) ? state.events : defaultState.events,
        eveningRituals: Array.isArray(state.eveningRituals) ? state.eveningRituals : defaultState.eveningRituals,
        ifThenRules: state.ifThenRules || defaultState.ifThenRules,
        intentions: state.intentions || defaultState.intentions,
        wins: state.wins || defaultState.wins,
        experiments: state.experiments || defaultState.experiments,
        antiporn: state.antiporn || defaultState.antiporn, // Garder pour compatibilité
        nightRoutine: state.nightRoutine || defaultState.nightRoutine,
        customActions: state.customActions || defaultState.customActions,
        programs: state.programs || defaultState.programs,
        coaching: state.coaching || defaultState.coaching,
        journal: state.journal || defaultState.journal,
        spiritual: state.spiritual || defaultState.spiritual,
        sos: state.sos || defaultState.sos,
        calendar: state.calendar || defaultState.calendar,
        addictionsConfig: state.addictionsConfig || defaultState.addictionsConfig,
        
        // Nouveau champ v5: configurations par addiction
        addictionConfigs: {
            porn: pornConfig,
            // Les autres addictions seront initialisées à la demande
            ...state.addictionConfigs
        }
    };
}

/**
 * Migration de la version 5 vers la version 6
 * Coaching V2 - Architecture adaptative
 * Ajout: coaching.mode, coaching.activeAnchor
 * Renommage: coaching.feedback.usefulCount -> useful, dismissedCount -> dismissed
 * @param {Object} state - Le state v5
 * @returns {Object} Le state v6
 */
function migrateV5ToV6(state) {
    const defaultState = getDefaultState();
    const defaultCoaching = defaultState.coaching;
    
    // Migrer le coaching avec les nouveaux champs
    const coaching = {
        mode: state.coaching?.mode || 'stability', // Par défaut: stability
        lastShownDate: state.coaching?.lastShownDate || null,
        activeAnchor: state.coaching?.activeAnchor || null, // Nouveau champ
        insights: Array.isArray(state.coaching?.insights) ? state.coaching.insights : [],
        feedback: {
            // Migration: usefulCount -> useful, dismissedCount -> dismissed
            useful: state.coaching?.feedback?.useful ?? 
                   state.coaching?.feedback?.usefulCount ?? 
                   defaultCoaching.feedback.useful,
            dismissed: state.coaching?.feedback?.dismissed ?? 
                      state.coaching?.feedback?.dismissedCount ?? 
                      defaultCoaching.feedback.dismissed
        }
    };
    
    return {
        schemaVersion: 6,
        
        // Conserver toutes les données existantes
        profile: state.profile || defaultState.profile,
        addictions: Array.isArray(state.addictions) ? state.addictions : defaultState.addictions,
        settings: {
            ...defaultState.settings,
            ...state.settings,
            autoLock: state.settings?.autoLock || defaultState.settings.autoLock
        },
        checkins: Array.isArray(state.checkins) ? state.checkins : defaultState.checkins,
        events: Array.isArray(state.events) ? state.events : defaultState.events,
        eveningRituals: Array.isArray(state.eveningRituals) ? state.eveningRituals : defaultState.eveningRituals,
        ifThenRules: state.ifThenRules || defaultState.ifThenRules,
        intentions: state.intentions || defaultState.intentions,
        wins: state.wins || defaultState.wins,
        experiments: state.experiments || defaultState.experiments,
        antiporn: state.antiporn || defaultState.antiporn,
        nightRoutine: state.nightRoutine || defaultState.nightRoutine,
        customActions: state.customActions || defaultState.customActions,
        programs: state.programs || defaultState.programs,
        coaching, // Coaching migré avec nouveaux champs
        journal: state.journal || defaultState.journal,
        spiritual: state.spiritual || defaultState.spiritual,
        sos: state.sos || defaultState.sos,
        calendar: state.calendar || defaultState.calendar,
        addictionsConfig: state.addictionsConfig || defaultState.addictionsConfig,
        addictionConfigs: state.addictionConfigs || defaultState.addictionConfigs
    };
}

/**
 * Migration de la version 2 vers la version 3
 * Ajout: nightRoutine, customActions, programs, coaching, journal, spiritual, sos, calendar
 * Extension: antiporn (stoppedSlopes, phoneBedCheckins), settings (lowTextMode)
 * @param {Object} state - Le state v2
 * @returns {Object} Le state v3
 */
function migrateV2ToV3(state) {
    const defaultState = getDefaultState();
    
    // Étendre antiporn existant avec nouveaux champs
    const antiporn = {
        ...defaultState.antiporn,
        ...state.antiporn,
        stoppedSlopes: state.antiporn?.stoppedSlopes || 0,
        phoneBedCheckins: state.antiporn?.phoneBedCheckins || []
    };
    
    // Étendre settings avec lowTextMode et autoLock
    const settings = {
        ...defaultState.settings,
        ...state.settings,
        lowTextMode: state.settings?.lowTextMode ?? false,
        autoLock: state.settings?.autoLock || defaultState.settings.autoLock
    };
    
    return {
        schemaVersion: 3,
        
        // Conserver les données existantes V2
        profile: state.profile || defaultState.profile,
        addictions: Array.isArray(state.addictions) ? state.addictions : defaultState.addictions,
        settings,
        checkins: Array.isArray(state.checkins) ? state.checkins : defaultState.checkins,
        events: Array.isArray(state.events) ? state.events : defaultState.events,
        eveningRituals: Array.isArray(state.eveningRituals) ? state.eveningRituals : defaultState.eveningRituals,
        ifThenRules: state.ifThenRules || defaultState.ifThenRules,
        intentions: state.intentions || defaultState.intentions,
        wins: state.wins || defaultState.wins,
        experiments: state.experiments || defaultState.experiments,
        antiporn,
        
        // Nouveaux champs V3
        nightRoutine: state.nightRoutine || defaultState.nightRoutine,
        customActions: state.customActions || defaultState.customActions,
        programs: state.programs || defaultState.programs,
        coaching: state.coaching || defaultState.coaching,
        journal: state.journal || defaultState.journal,
        spiritual: state.spiritual || defaultState.spiritual,
        sos: state.sos || defaultState.sos,
        calendar: state.calendar || defaultState.calendar
    };
}

/**
 * Valide la structure d'un state importé
 * @param {Object} data - Les données à valider
 * @returns {Object} { valid: boolean, errors: string[], state: Object|null }
 */
function validateImportedState(data) {
    const errors = [];
    
    // Vérifications de base
    if (!data || typeof data !== 'object') {
        return { valid: false, errors: ['Format invalide: objet attendu'], state: null };
    }
    
    // Vérifier la présence des champs obligatoires
    if (!data.profile || typeof data.profile !== 'object') {
        errors.push('Profil manquant ou invalide');
    } else {
        // Valider les valeurs du profil
        const validLangs = ['fr', 'en', 'ar'];
        const validReligions = ['none', 'islam', 'christianity', 'judaism', 'buddhism'];
        
        if (data.profile.lang && !validLangs.includes(data.profile.lang)) {
            errors.push('Langue invalide');
        }
        if (data.profile.religion && !validReligions.includes(data.profile.religion)) {
            errors.push('Religion invalide');
        }
    }
    
    // Valider les addictions
    if (data.addictions && !Array.isArray(data.addictions)) {
        errors.push('Format addictions invalide');
    } else if (data.addictions) {
        const validAddictions = ['porn', 'cigarette', 'alcohol', 'drugs', 'social_media', 'gaming', 'food', 'shopping'];
        const validGoals = ['abstinence', 'reduce', 'choice'];
        
        data.addictions.forEach((addiction, index) => {
            if (!addiction.id || !validAddictions.includes(addiction.id)) {
                errors.push(`Addiction ${index + 1}: ID invalide`);
            }
            if (!addiction.goal || !validGoals.includes(addiction.goal)) {
                errors.push(`Addiction ${index + 1}: objectif invalide`);
            }
        });
    }
    
    // Valider les check-ins
    if (data.checkins && !Array.isArray(data.checkins)) {
        errors.push('Format check-ins invalide');
    } else if (data.checkins) {
        data.checkins.forEach((checkin, index) => {
            if (!checkin.date || !/^\d{4}-\d{2}-\d{2}$/.test(checkin.date)) {
                errors.push(`Check-in ${index + 1}: date invalide`);
            }
            if (typeof checkin.mood !== 'number' || checkin.mood < 0 || checkin.mood > 10) {
                errors.push(`Check-in ${index + 1}: humeur invalide (0-10)`);
            }
        });
    }
    
    // Valider les événements
    if (data.events && !Array.isArray(data.events)) {
        errors.push('Format événements invalide');
    } else if (data.events) {
        const validTypes = ['craving', 'episode', 'win', 'slope'];
        
        data.events.forEach((event, index) => {
            if (!event.type || !validTypes.includes(event.type)) {
                errors.push(`Événement ${index + 1}: type invalide`);
            }
            if (!event.ts || typeof event.ts !== 'number') {
                errors.push(`Événement ${index + 1}: timestamp invalide`);
            }
        });
    }
    
    // Valider les tableaux V2
    if (data.ifThenRules && !Array.isArray(data.ifThenRules)) {
        errors.push('Format règles si-alors invalide');
    }
    if (data.eveningRituals && !Array.isArray(data.eveningRituals)) {
        errors.push('Format rituels du soir invalide');
    }
    if (data.experiments && !Array.isArray(data.experiments)) {
        errors.push('Format expériences invalide');
    }
    
    // Valider les tableaux V3
    if (data.customActions && !Array.isArray(data.customActions)) {
        errors.push('Format actions personnalisées invalide');
    }
    
    if (errors.length > 0) {
        return { valid: false, errors, state: null };
    }
    
    // Migrer si nécessaire
    const migratedState = migrateState(data);
    return { valid: true, errors: [], state: migratedState };
}

/**
 * Exporte le state en fichier JSON téléchargeable
 * @param {Object} state - Le state à exporter
 * @param {Object} options - Options d'export { anonymized, snapshot, encrypt }
 */
async function exportState(state, options = {}) {
    try {
        let dataToExport = { ...state };
        
        // V3: Export anonymisé (sans notes personnelles)
        if (options.anonymized) {
            dataToExport = anonymizeState(dataToExport);
        }
        
        // V3: Snapshot (derniers N jours uniquement)
        if (options.snapshot) {
            dataToExport = createSnapshot(dataToExport, options.snapshot);
        }
        
        // V4: Chiffrement avec PIN si disponible
        let finalData;
        let isEncrypted = false;
        
        // Vérifier si un PIN est défini et si le chiffrement est demandé
        const shouldEncrypt = options.encrypt !== false; // Par défaut, chiffrer si PIN disponible
        if (shouldEncrypt && typeof Security !== 'undefined' && Security.hasPin) {
            const hasPin = await Security.hasPin();
            if (hasPin) {
                try {
                    // S'assurer que l'app n'est pas verrouillée pour pouvoir chiffrer
                    if (Security.isLockedMode && Security.isLockedMode()) {
                        throw new Error('Application verrouillée. Déverrouillez d\'abord pour exporter.');
                    }
                    
                    // Chiffrer les données
                    const encrypted = await Security.encrypt(dataToExport);
                    
                    // Créer wrapper avec métadonnées
                    finalData = {
                        version: 2,
                        encrypted: true,
                        encryption: encrypted,
                        metadata: {
                            exportDate: getDateISO(),
                            hasPassword: true
                        }
                    };
                    isEncrypted = true;
                } catch (encryptError) {
                    console.warn('[Storage] Erreur lors du chiffrement, export en clair:', encryptError);
                    // En cas d'erreur, exporter en clair
                    finalData = dataToExport;
                }
            } else {
                finalData = dataToExport;
            }
        } else {
            finalData = dataToExport;
        }
        
        const dataStr = JSON.stringify(finalData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const suffix = options.anonymized ? '-anon' : options.snapshot ? `-${options.snapshot}d` : '';
        const encryptedSuffix = isEncrypted ? '-encrypted' : '';
        const link = document.createElement('a');
        link.href = url;
        link.download = `revenir-backup${suffix}${encryptedSuffix}-${getDateISO()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('[Storage] Erreur lors de l\'export:', error);
        throw error;
    }
}

/**
 * V3: Anonymise le state (retire notes et données sensibles)
 * @param {Object} state - Le state à anonymiser
 * @returns {Object} State anonymisé
 */
function anonymizeState(state) {
    const anon = JSON.parse(JSON.stringify(state));
    
    // Retirer les notes des check-ins
    anon.checkins = anon.checkins.map(c => {
        const { notes, ...rest } = c;
        return rest;
    });
    
    // Retirer la gratitude et ce qui a aidé des rituels
    anon.eveningRituals = anon.eveningRituals.map(r => ({
        date: r.date,
        exposed: r.exposed
    }));
    
    // Retirer le texte des intentions
    anon.intentions.history = anon.intentions.history.map(i => ({
        date: i.date,
        source: i.source
    }));
    
    // Retirer le contenu des entrées journal
    if (anon.journal?.entries) {
        anon.journal.entries = anon.journal.entries.map(e => ({
            date: e.date,
            tags: e.tags
        }));
    }
    
    return anon;
}

/**
 * V3: Crée un snapshot des N derniers jours
 * @param {Object} state - Le state source
 * @param {number} days - Nombre de jours (7 ou 30)
 * @returns {Object} State avec uniquement les données récentes
 */
function createSnapshot(state, days) {
    const snapshot = JSON.parse(JSON.stringify(state));
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffISO = cutoffDate.toISOString().split('T')[0];
    const cutoffTs = cutoffDate.getTime();
    
    // Filtrer les check-ins
    snapshot.checkins = snapshot.checkins.filter(c => c.date >= cutoffISO);
    
    // Filtrer les events
    snapshot.events = snapshot.events.filter(e => e.ts >= cutoffTs);
    
    // Filtrer les rituels du soir
    snapshot.eveningRituals = snapshot.eveningRituals.filter(r => r.date >= cutoffISO);
    
    // Filtrer l'historique des intentions
    snapshot.intentions.history = snapshot.intentions.history.filter(i => i.date >= cutoffISO);
    
    // Filtrer les logs de routine nuit
    if (snapshot.nightRoutine?.logs) {
        snapshot.nightRoutine.logs = snapshot.nightRoutine.logs.filter(l => l.date >= cutoffISO);
    }
    
    // Filtrer le journal
    if (snapshot.journal?.entries) {
        snapshot.journal.entries = snapshot.journal.entries.filter(e => e.date >= cutoffISO);
    }
    
    return snapshot;
}

/**
 * Importe un state depuis un fichier JSON
 * @param {File} file - Le fichier à importer
 * @returns {Promise<Object>} Le résultat de la validation ou { needsPassword: true, encryptedData: ... }
 */
function importState(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Vérifier si le fichier est chiffré (nouveau format v2)
                if (data.version === 2 && data.encrypted === true && data.encryption) {
                    // Fichier chiffré, retourner un objet spécial pour demander le PIN
                    resolve({
                        needsPassword: true,
                        encryptedData: data.encryption,
                        metadata: data.metadata || {}
                    });
                    return;
                }
                
                // Fichier non chiffré (ancien format ou export sans PIN)
                // Si c'est un format v2 non chiffré, extraire les données directement
                let dataToValidate = data;
                if (data.version === 2 && data.encrypted === false) {
                    // Format v2 non chiffré (peut contenir les données directement ou dans un champ data)
                    dataToValidate = data.data || data;
                }
                
                const validation = validateImportedState(dataToValidate);
                resolve(validation);
            } catch (error) {
                resolve({ valid: false, errors: ['Fichier JSON invalide'], state: null });
            }
        };
        
        reader.onerror = () => {
            resolve({ valid: false, errors: ['Erreur de lecture du fichier'], state: null });
        };
        
        reader.readAsText(file);
    });
}

/**
 * Déchiffre et importe des données chiffrées
 * @param {Object} encryptedData - Données chiffrées (format Security.encrypt)
 * @param {string} pin - PIN pour déchiffrer
 * @returns {Promise<Object>} Le résultat de la validation
 */
async function decryptAndImport(encryptedData, pin) {
    try {
        // Vérifier que Security est disponible avec decryptWithPin
        if (typeof Security === 'undefined' || !Security.decryptWithPin) {
            return { valid: false, errors: ['Service de sécurité non disponible'], state: null };
        }
        
        try {
            // Déchiffrer directement avec le PIN (sans vérifier le hash stocké)
            // decryptWithPin dérive la clé depuis le PIN et déchiffre directement
            const decryptedData = await Security.decryptWithPin(encryptedData, pin);
            
            // Les données sont déjà parsées par decryptWithPin
            let parsedData = decryptedData;
            
            // Valider les données déchiffrées
            const validation = validateImportedState(parsedData);
            
            return validation;
        } catch (decryptError) {
            console.error('[Storage] Erreur lors du déchiffrement:', decryptError);
            // Si l'erreur indique un PIN incorrect, retourner needsPassword: true
            const errorMsg = decryptError.message || 'Erreur de déchiffrement';
            return { 
                valid: false, 
                errors: [errorMsg.includes('PIN') || errorMsg.includes('incorrect') 
                    ? 'PIN incorrect' 
                    : 'Erreur de déchiffrement. PIN incorrect ou données corrompues.'], 
                state: null, 
                needsPassword: true 
            };
        }
    } catch (error) {
        console.error('[Storage] Erreur lors du déchiffrement et import:', error);
        return { valid: false, errors: ['Erreur lors du déchiffrement'], state: null };
    }
}

/**
 * Retourne la date du jour au format ISO (YYYY-MM-DD)
 * @returns {string}
 */
function getDateISO() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

/**
 * Ajoute un événement au state
 * @param {Object} state - Le state actuel (pour compatibilité, mais non utilisé si Store est disponible)
 * @param {string} type - Type d'événement (craving, episode, win, slope)
 * @param {string} addictionId - ID de l'addiction concernée
 * @param {number} intensity - Intensité optionnelle (0-10)
 * @param {Object} meta - Métadonnées additionnelles (déclencheur, contexte, etc.)
 * @returns {Object} Le state modifié
 */
function addEvent(state, type, addictionId, intensity = null, meta = null) {
    // Normaliser addictionId pour éviter les objets
    const normalizedAddictionId = normalizeAddictionId(addictionId);
    
    const event = {
        ts: Date.now(),
        date: getDateISO(),
        type,
        addictionId: normalizedAddictionId
    };
    
    if (intensity !== null) {
        event.intensity = intensity;
    }
    
    if (meta !== null) {
        event.meta = meta;
    }
    
    // Utiliser Store.update() si disponible (nouveau chemin)
    if (typeof window !== 'undefined' && window.Store && window.Store.update) {
        const reason = type === 'craving' && meta?.context === 'emergency' ? 'emergency_used' : undefined;
        
        // Appel asynchrone mais on retourne le state immédiatement pour compatibilité
        window.Store.update((draft) => {
            // S'assurer que events existe
            if (!draft.events) {
                draft.events = [];
            }
            draft.events.push(event);
        }, { reason }).catch(error => {
            console.error('[Storage.addEvent] Erreur Store.update:', error);
            // Fallback vers ancienne méthode
            state.events.push(event);
            saveState(state);
        });
        
        // Retourner le state mis à jour (approximatif, car async)
        if (!state.events) {
            state.events = [];
        }
        state.events.push(event);
        return state;
    }
    
    // Ancienne méthode (fallback)
    state.events.push(event);
    saveState(state);
    return state;
}

/**
 * Normalise un addictionId (peut être string ou objet)
 * @param {string|Object} addictionId - ID de l'addiction
 * @returns {string|null} ID normalisé ou null
 */
function normalizeAddictionId(addictionId) {
    if (!addictionId) return null;
    if (typeof addictionId === 'string') return addictionId;
    if (typeof addictionId === 'object' && addictionId.id) return addictionId.id;
    return String(addictionId);
}

/**
 * Ajoute un check-in au state
 * @param {Object} state - Le state actuel (pour compatibilité)
 * @param {Object} checkinData - Données du check-in
 * @returns {Object} Le state modifié
 */
function addCheckin(state, checkinData) {
    const checkin = {
        date: getDateISO(),
        mood: checkinData.mood,
        stress: checkinData.stress,
        craving: checkinData.craving
    };
    
    // Champs optionnels
    if (checkinData.solitude !== undefined) {
        checkin.solitude = checkinData.solitude;
    }
    if (checkinData.exposure !== undefined) {
        checkin.exposure = checkinData.exposure;
    }
    if (checkinData.notes) {
        checkin.notes = checkinData.notes;
    }
    // V3: Tags
    if (checkinData.tags) {
        checkin.tags = checkinData.tags;
    }
    
    // Utiliser Store.update() si disponible
    if (typeof window !== 'undefined' && window.Store && window.Store.update) {
        window.Store.update((draft) => {
            if (!draft.checkins) {
                draft.checkins = [];
            }
            const existingIndex = draft.checkins.findIndex(c => c.date === checkin.date);
            if (existingIndex >= 0) {
                draft.checkins[existingIndex] = checkin;
            } else {
                draft.checkins.push(checkin);
            }
        }).catch(error => {
            console.error('[Storage.addCheckin] Erreur Store.update:', error);
            // Fallback vers ancienne méthode
            const existingIndex = state.checkins.findIndex(c => c.date === checkin.date);
            if (existingIndex >= 0) {
                state.checkins[existingIndex] = checkin;
            } else {
                state.checkins.push(checkin);
            }
            saveState(state);
        });
        
        // Retourner state mis à jour (approximatif)
        const existingIndex = state.checkins.findIndex(c => c.date === checkin.date);
        if (existingIndex >= 0) {
            state.checkins[existingIndex] = checkin;
        } else {
            state.checkins.push(checkin);
        }
        return state;
    }
    
    // Ancienne méthode (fallback)
    const existingIndex = state.checkins.findIndex(c => c.date === checkin.date);
    if (existingIndex >= 0) {
        state.checkins[existingIndex] = checkin;
    } else {
        state.checkins.push(checkin);
    }
    
    saveState(state);
    return state;
}

/**
 * V3: Ajoute un check-in rapide (1 swipe)
 * @param {Object} state - Le state actuel
 * @param {Object} data - { craving: 0-10, exposure: boolean }
 * @returns {Object} Le state modifié
 */
function addQuickCheckin(state, data) {
    const checkin = {
        date: getDateISO(),
        craving: data.craving,
        exposure: data.exposure ?? false,
        quick: true,
        mood: 5,
        stress: 5
    };
    
    const existingIndex = state.checkins.findIndex(c => c.date === checkin.date);
    if (existingIndex >= 0) {
        // Fusionner avec le check-in existant
        state.checkins[existingIndex] = {
            ...state.checkins[existingIndex],
            craving: checkin.craving,
            exposure: checkin.exposure
        };
    } else {
        state.checkins.push(checkin);
    }
    
    saveState(state);
    return state;
}

/**
 * Ajoute un rituel du soir au state
 * @param {Object} state - Le state actuel
 * @param {Object} ritualData - Données du rituel { exposed, helped, gratitude }
 * @returns {Object} Le state modifié
 */
function addEveningRitual(state, ritualData) {
    const ritual = {
        date: getDateISO(),
        exposed: ritualData.exposed ?? false,
        helped: ritualData.helped || '',
        gratitude: ritualData.gratitude || ''
    };
    
    // Remplacer le rituel du jour s'il existe déjà
    const existingIndex = state.eveningRituals.findIndex(r => r.date === ritual.date);
    if (existingIndex >= 0) {
        state.eveningRituals[existingIndex] = ritual;
    } else {
        state.eveningRituals.push(ritual);
    }
    
    saveState(state);
    return state;
}

/**
 * Ajoute une intention à l'historique
 * @param {Object} state - Le state actuel
 * @param {Object} intentionData - { text, ref, source }
 * @returns {Object} Le state modifié
 */
function addIntention(state, intentionData) {
    const intention = {
        date: getDateISO(),
        text: intentionData.text,
        ref: intentionData.ref || null,
        source: intentionData.source || 'neutral'
    };
    
    state.intentions.lastShownDate = intention.date;
    state.intentions.history.push(intention);
    
    saveState(state);
    return state;
}

/**
 * Incrémente les compteurs de victoires invisibles
 * @param {Object} state - Le state actuel
 * @param {Object} increments - { resistedCravings, minutesSaved, positiveActions }
 * @returns {Object} Le state modifié
 */
function incrementWins(state, increments = {}) {
    if (increments.resistedCravings) {
        state.wins.resistedCravings += increments.resistedCravings;
    }
    if (increments.minutesSaved) {
        state.wins.minutesSavedEstimate += increments.minutesSaved;
    }
    if (increments.positiveActions) {
        state.wins.positiveActionsCount += increments.positiveActions;
    }
    
    saveState(state);
    return state;
}

/**
 * Ajoute ou met à jour une règle si-alors
 * @param {Object} state - Le state actuel
 * @param {Object} rule - La règle à ajouter/modifier
 * @returns {Object} Le state modifié
 */
function saveIfThenRule(state, rule) {
    const existingIndex = state.ifThenRules.findIndex(r => r.id === rule.id);
    
    if (existingIndex >= 0) {
        state.ifThenRules[existingIndex] = rule;
    } else {
        state.ifThenRules.push(rule);
    }
    
    saveState(state);
    return state;
}

/**
 * Supprime une règle si-alors
 * @param {Object} state - Le state actuel
 * @param {string} ruleId - ID de la règle à supprimer
 * @returns {Object} Le state modifié
 */
function deleteIfThenRule(state, ruleId) {
    state.ifThenRules = state.ifThenRules.filter(r => r.id !== ruleId);
    saveState(state);
    return state;
}

/**
 * Ajoute ou met à jour une expérience
 * @param {Object} state - Le state actuel
 * @param {Object} experiment - L'expérience à ajouter/modifier
 * @returns {Object} Le state modifié
 */
function saveExperiment(state, experiment) {
    const existingIndex = state.experiments.findIndex(e => e.id === experiment.id);
    
    if (existingIndex >= 0) {
        state.experiments[existingIndex] = experiment;
    } else {
        state.experiments.push(experiment);
    }
    
    saveState(state);
    return state;
}

// ============================================
// V3: NOUVELLES FONCTIONS STORAGE
// ============================================

/**
 * V3: Ajoute une action personnalisée
 * @param {Object} state - Le state actuel
 * @param {Object} action - { id, name, emoji, category, favorite }
 * @returns {Object} Le state modifié
 */
function addCustomAction(state, action) {
    if (!action.id) {
        action.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    action.createdAt = getDateISO();
    state.customActions.push(action);
    saveState(state);
    return state;
}

/**
 * V3: Met à jour une action personnalisée
 * @param {Object} state - Le state actuel
 * @param {string} actionId - ID de l'action
 * @param {Object} updates - Mises à jour
 * @returns {Object} Le state modifié
 */
function updateCustomAction(state, actionId, updates) {
    const index = state.customActions.findIndex(a => a.id === actionId);
    if (index >= 0) {
        state.customActions[index] = { ...state.customActions[index], ...updates };
        saveState(state);
    }
    return state;
}

/**
 * V3: Supprime une action personnalisée
 * @param {Object} state - Le state actuel
 * @param {string} actionId - ID de l'action
 * @returns {Object} Le state modifié
 */
function deleteCustomAction(state, actionId) {
    state.customActions = state.customActions.filter(a => a.id !== actionId);
    saveState(state);
    return state;
}

/**
 * V3: Enregistre un log de routine nuit
 * @param {Object} state - Le state actuel
 * @param {Object} log - { checklist: [], completed: boolean }
 * @returns {Object} Le state modifié
 */
function addNightRoutineLog(state, log) {
    const entry = {
        date: getDateISO(),
        checklist: log.checklist || [],
        completed: log.completed ?? false,
        time: new Date().toISOString()
    };
    
    state.nightRoutine.logs.push(entry);
    saveState(state);
    return state;
}

/**
 * V3: Met à jour la configuration de routine nuit
 * @param {Object} state - Le state actuel
 * @param {Object} config - Configuration { enabled, hour, checklist }
 * @returns {Object} Le state modifié
 */
function updateNightRoutineConfig(state, config) {
    state.nightRoutine = {
        ...state.nightRoutine,
        ...config
    };
    saveState(state);
    return state;
}

/**
 * V3: Ajoute une entrée journal
 * @param {Object} state - Le state actuel
 * @param {Object} entry - { text, tags, context }
 * @returns {Object} Le state modifié
 */
function addJournalEntry(state, entry) {
    const journalEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        date: getDateISO(),
        time: new Date().toISOString(),
        text: entry.text || '',
        tags: entry.tags || [],
        context: entry.context || null
    };
    
    state.journal.entries.push(journalEntry);
    saveState(state);
    return state;
}

/**
 * V3: Met à jour le programme actif
 * @param {Object} state - Le state actuel
 * @param {Object} programData - Données du programme
 * @returns {Object} Le state modifié
 */
function updateActiveProgram(state, programData) {
    state.programs.active = programData;
    saveState(state);
    return state;
}

/**
 * V3: Enregistre la progression d'un jour de programme
 * @param {Object} state - Le state actuel
 * @param {string} programId - ID du programme
 * @param {number} day - Numéro du jour
 * @param {Object} progress - { completed, exerciseData }
 * @returns {Object} Le state modifié
 */
function saveProgramDayProgress(state, programId, day, progress) {
    if (!state.programs.dayProgress[programId]) {
        state.programs.dayProgress[programId] = {};
    }
    state.programs.dayProgress[programId][day] = {
        ...progress,
        completedAt: getDateISO()
    };
    saveState(state);
    return state;
}

/**
 * V3: Ajoute un insight coaching
 * @param {Object} state - Le state actuel
 * @param {Object} insight - Données de l'insight
 * @returns {Object} Le state modifié
 */
function addCoachingInsight(state, insight) {
    const entry = {
        id: Date.now().toString(36),
        date: getDateISO(),
        ...insight
    };
    state.coaching.insights.push(entry);
    state.coaching.lastShownDate = getDateISO();
    saveState(state);
    return state;
}

/**
 * V3: Incrémente le compteur dhikr
 * @param {Object} state - Le state actuel
 * @param {number} count - Nombre à ajouter
 * @returns {Object} Le state modifié
 */
function incrementDhikr(state, count = 1) {
    state.spiritual.dhikrCount += count;
    saveState(state);
    return state;
}

/**
 * V3: Ajoute un objectif spirituel quotidien
 * @param {Object} state - Le state actuel
 * @param {Object} goal - { text, completed }
 * @returns {Object} Le state modifié
 */
function addSpiritualGoal(state, goal) {
    const entry = {
        id: Date.now().toString(36),
        date: getDateISO(),
        text: goal.text,
        completed: goal.completed ?? false
    };
    state.spiritual.dailyGoals.push(entry);
    saveState(state);
    return state;
}

/**
 * V3: Marque un jour comme sobre dans le calendrier
 * @param {Object} state - Le state actuel
 * @param {string} date - Date ISO (optionnel, défaut aujourd'hui)
 * @returns {Object} Le state modifié
 */
function markSobrietyDay(state, date = null) {
    // Migration : si sobrietyDays existe mais pas cleanDays, migrer
    if (state.calendar?.sobrietyDays && !state.calendar.cleanDays) {
        state.calendar.cleanDays = [...state.calendar.sobrietyDays];
        delete state.calendar.sobrietyDays;
    }
    
    if (!state.calendar.cleanDays) {
        state.calendar.cleanDays = [];
    }
    
    const targetDate = date || getDateISO();
    if (!state.calendar.cleanDays.includes(targetDate)) {
        state.calendar.cleanDays.push(targetDate);
        saveState(state);
    }
    return state;
}

/**
 * V3: Ajoute un check-in téléphone au lit
 * @param {Object} state - Le state actuel
 * @param {boolean} phoneInBed - Téléphone dans la chambre ?
 * @returns {Object} Le state modifié
 */
function addPhoneBedCheckin(state, phoneInBed) {
    const entry = {
        date: getDateISO(),
        phoneInBed,
        time: new Date().toISOString()
    };
    state.antiporn.phoneBedCheckins.push(entry);
    saveState(state);
    return state;
}

/**
 * V3: Incrémente le compteur de pentes stoppées
 * @param {Object} state - Le state actuel
 * @returns {Object} Le state modifié
 */
function incrementStoppedSlopes(state) {
    state.antiporn.stoppedSlopes++;
    saveState(state);
    return state;
}

/**
 * Calcule le streak (jours consécutifs sans épisode)
 * @param {Object} state - Le state actuel
 * @returns {number} Nombre de jours du streak
 */
function calculateStreak(state) {
    // Sécurité : s'assurer que events et checkins existent et sont des tableaux
    if (!state.events || !Array.isArray(state.events)) {
        state.events = [];
    }
    if (!state.checkins || !Array.isArray(state.checkins)) {
        state.checkins = [];
    }
    
    // Récupérer les épisodes (rechutes) triés par date
    const episodes = state.events
        .filter(e => e.type === 'episode')
        .sort((a, b) => b.ts - a.ts);
    
    if (episodes.length === 0) {
        // Pas d'épisode = streak depuis le début
        // On compte depuis le premier événement ou check-in
        const firstEvent = [...state.events, ...state.checkins]
            .map(e => e.ts || new Date(e.date).getTime())
            .sort((a, b) => a - b)[0];
        
        if (!firstEvent) return 0;
        
        const daysSinceFirst = Math.floor((Date.now() - firstEvent) / (1000 * 60 * 60 * 24));
        return daysSinceFirst;
    }
    
    // Calculer les jours depuis le dernier épisode
    const lastEpisode = episodes[0];
    const daysSinceEpisode = Math.floor((Date.now() - lastEpisode.ts) / (1000 * 60 * 60 * 24));
    
    return daysSinceEpisode;
}

/**
 * Compte les cravings du jour
 * @param {Object} state - Le state actuel
 * @returns {number} Nombre de cravings aujourd'hui
 */
function countTodayCravings(state) {
    // Sécurité : s'assurer que events existe et est un tableau
    if (!state.events || !Array.isArray(state.events)) {
        return 0;
    }
    const today = getDateISO();
    return state.events.filter(e => e.type === 'craving' && e.date === today).length;
}

/**
 * Récupère les N derniers check-ins
 * @param {Object} state - Le state actuel
 * @param {number} count - Nombre de check-ins à récupérer
 * @returns {Array} Les derniers check-ins
 */
function getRecentCheckins(state, count = 7) {
    // Sécurité : s'assurer que checkins existe et est un tableau
    if (!state.checkins || !Array.isArray(state.checkins)) {
        return [];
    }
    return state.checkins
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, count);
}

/**
 * Récupère le rituel du soir d'aujourd'hui
 * @param {Object} state - Le state actuel
 * @returns {Object|null} Le rituel du jour ou null
 */
function getTodayEveningRitual(state) {
    // Sécurité : s'assurer que eveningRituals existe et est un tableau
    if (!state.eveningRituals || !Array.isArray(state.eveningRituals)) {
        return null;
    }
    const today = getDateISO();
    return state.eveningRituals.find(r => r.date === today) || null;
}

/**
 * Efface toutes les données
 */
function clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
}

// Export des fonctions pour utilisation globale
window.Storage = {
    // Core
    loadState,
    saveState,
    getDefaultState,
    exportState,
    importState,
    decryptAndImport,
    validateImportedState,
    
    // Storage Driver (nouveau)
    initStorageDriver,
    getCurrentDriver: () => currentDriver,
    
    // Events
    addEvent,
    addCheckin,
    addQuickCheckin,
    addEveningRitual,
    addIntention,
    incrementWins,
    
    // Rules
    saveIfThenRule,
    deleteIfThenRule,
    
    // Experiments
    saveExperiment,
    
    // V3: Actions
    addCustomAction,
    updateCustomAction,
    deleteCustomAction,
    
    // V3: Night routine
    addNightRoutineLog,
    updateNightRoutineConfig,
    
    // V3: Journal
    addJournalEntry,
    
    // V3: Programs
    updateActiveProgram,
    saveProgramDayProgress,
    
    // V3: Coaching
    addCoachingInsight,
    
    // V3: Spiritual
    incrementDhikr,
    addSpiritualGoal,
    
    // V3: Calendar
    markSobrietyDay,
    
    // V3: Antiporn
    addPhoneBedCheckin,
    incrementStoppedSlopes,
    
    // Stats
    calculateStreak,
    countTodayCravings,
    getRecentCheckins,
    getTodayEveningRitual,
    
    // Utils
    getDateISO,
    clearAllData,
    anonymizeState,
    createSnapshot,
    
    // Constants
    CURRENT_SCHEMA_VERSION
};
