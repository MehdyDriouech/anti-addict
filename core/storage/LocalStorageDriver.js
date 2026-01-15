/**
 * LocalStorageDriver.js - Implémentation legacy localStorage
 * 
 * Wrapper autour du code existant pour compatibilité
 */

import { StorageDriver } from './StorageDriver.js';

const STORAGE_KEY = 'revenir_state_v1';
const CURRENT_SCHEMA_VERSION = 5;

/**
 * State par défaut (copié depuis storage.js pour compatibilité)
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
            lowTextMode: false,
            theme: 'dark'
        },
        checkins: [],
        eveningRituals: [],
        events: [],
        ifThenRules: [],
        intentions: {
            lastShownDate: null,
            history: []
        },
        wins: {
            resistedCravings: 0,
            minutesSavedEstimate: 0,
            positiveActionsCount: 0
        },
        experiments: [],
        antiporn: {
            triggers: ['alone', 'night', 'boredom', 'stress'],
            environmentRules: {
                phoneOutBedroom: false,
                noPhoneBed: false,
                blockTriggersList: false,
                bedtimeHour: 23
            },
            slopeSignals: ['soft_images', 'endless_scroll', 'searching'],
            stoppedSlopes: 0,
            phoneBedCheckins: []
        },
        nightRoutine: {
            enabled: false,
            hour: 22,
            checklist: ['phone_out', 'lights_dim', 'leave_bed'],
            customChecklist: [],
            logs: []
        },
        customActions: [],
        programs: {
            active: null,
            history: [],
            dayProgress: {}
        },
        coaching: {
            lastWeeklyInsight: null,
            insights: []
        },
        journal: {
            entries: [],
            customTags: []
        },
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
        sos: {
            favoriteActions: [],
            recentActions: []
        },
        calendar: {
            cleanDays: [],
            milestones: []
        },
        addictionsConfig: {
            catalog: null
        },
        addictionConfigs: {}
    };
}

/**
 * Migre le state vers la version actuelle
 * Utilise la logique de migration depuis storage.js si disponible
 */
function migrateState(state) {
    // Si window.Storage existe avec migrateState, l'utiliser
    if (typeof window !== 'undefined' && window.Storage) {
        // Utiliser la fonction de migration existante
        // On simule un chargement pour déclencher la migration
        try {
            const stored = JSON.stringify(state);
            localStorage.setItem(STORAGE_KEY, stored);
            // Charger via Storage.loadState qui fait la migration
            const migrated = window.Storage.loadState();
            return migrated;
        } catch (e) {
            console.warn('[LocalStorageDriver] Migration via Storage.loadState failed, using basic migration', e);
        }
    }

    // Migration basique si Storage n'est pas disponible
    let currentState = { ...state };
    
    if (!currentState.schemaVersion) {
        currentState.schemaVersion = 0;
    }
    
    // Migration minimale vers v5
    if (currentState.schemaVersion < CURRENT_SCHEMA_VERSION) {
        const defaultState = getDefaultState();
        currentState = {
            ...defaultState,
            ...currentState,
            schemaVersion: CURRENT_SCHEMA_VERSION
        };
    }
    
    return currentState;
}

/**
 * LocalStorageDriver - Implémentation localStorage
 */
export class LocalStorageDriver extends StorageDriver {
    /**
     * Charge le state depuis localStorage
     * @returns {Promise<Object>}
     */
    async load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return getDefaultState();
            }
            
            const state = JSON.parse(stored);
            return migrateState(state);
        } catch (error) {
            console.error('[LocalStorageDriver] Erreur lors du chargement:', error);
            return getDefaultState();
        }
    }

    /**
     * Sauvegarde le state dans localStorage
     * @param {Object} state - Le state à sauvegarder
     * @returns {Promise<void>}
     */
    async save(state) {
        try {
            state.schemaVersion = CURRENT_SCHEMA_VERSION;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('[LocalStorageDriver] Erreur lors de la sauvegarde:', error);
            throw error;
        }
    }

    /**
     * Exporte le state en JSON string
     * @param {Object} state - Le state à exporter
     * @returns {Promise<string>}
     */
    async export(state) {
        return Promise.resolve(JSON.stringify(state, null, 2));
    }

    /**
     * Importe un state depuis un JSON string
     * @param {string} json - JSON stringifié
     * @returns {Promise<Object>}
     */
    async import(json) {
        try {
            const state = JSON.parse(json);
            return migrateState(state);
        } catch (error) {
            console.error('[LocalStorageDriver] Erreur lors de l\'import:', error);
            throw error;
        }
    }
}
