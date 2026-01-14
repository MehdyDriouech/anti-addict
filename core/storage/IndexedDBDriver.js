/**
 * IndexedDBDriver.js - Implémentation IndexedDB pour le stockage
 * 
 * Schéma:
 * - meta: métadonnées (schemaVersion, storageVersion, etc.)
 * - state: données non-sensibles (profile, settings, flags UI)
 * - domains: domaines sensibles chiffrés (events, journal, etc.)
 * - analytics: agrégats quotidiens/hebdomadaires
 */

import { StorageDriver } from './StorageDriver.js';

const DB_NAME = 'revenir-db';
const DB_VERSION = 1;

// Object stores
const STORE_META = 'meta';
const STORE_STATE = 'state';
const STORE_DOMAINS = 'domains';
const STORE_ANALYTICS = 'analytics';

// Clés singleton
const KEY_SINGLETON = 'singleton';

// Version actuelle du schéma
const CURRENT_SCHEMA_VERSION = 5;
const STORAGE_VERSION = 1; // Version du stockage (1 = IndexedDB)

/**
 * IndexedDBDriver - Implémentation IndexedDB
 */
export class IndexedDBDriver extends StorageDriver {
    constructor() {
        super();
        this.db = null;
        this.initPromise = null;
    }

    /**
     * Initialise la base de données IndexedDB
     * @returns {Promise<IDBDatabase>}
     */
    async init() {
        if (this.db) {
            return this.db;
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('[IndexedDBDriver] Erreur ouverture DB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Créer object stores si nécessaire
                if (!db.objectStoreNames.contains(STORE_META)) {
                    const metaStore = db.createObjectStore(STORE_META, { keyPath: 'key' });
                    metaStore.createIndex('key', 'key', { unique: true });
                }

                if (!db.objectStoreNames.contains(STORE_STATE)) {
                    db.createObjectStore(STORE_STATE, { keyPath: 'key' });
                }

                if (!db.objectStoreNames.contains(STORE_DOMAINS)) {
                    const domainsStore = db.createObjectStore(STORE_DOMAINS, { keyPath: 'domainKey' });
                    domainsStore.createIndex('domainKey', 'domainKey', { unique: true });
                }

                if (!db.objectStoreNames.contains(STORE_ANALYTICS)) {
                    const analyticsStore = db.createObjectStore(STORE_ANALYTICS, { keyPath: 'periodKey' });
                    analyticsStore.createIndex('periodKey', 'periodKey', { unique: true });
                }
            };
        });

        return this.initPromise;
    }

    /**
     * Charge le state depuis IndexedDB
     * @returns {Promise<Object>}
     */
    async load() {
        try {
            await this.init();

            // Charger meta pour vérifier si migration nécessaire
            const meta = await this.getMeta();
            
            // Si pas de meta, retourner state par défaut
            if (!meta || !meta.storageVersion) {
                return this.getDefaultState();
            }

            // Charger state non-sensible
            const stateData = await this.getState();
            if (!stateData) {
                return this.getDefaultState();
            }

            // Construire le state complet
            const state = {
                ...stateData.value,
                schemaVersion: meta.schemaVersion || CURRENT_SCHEMA_VERSION
            };

            // Les domaines sensibles seront chargés à la demande (lazy)
            // Pour l'instant, on initialise les tableaux vides
            // Ils seront déchiffrés via SecurityService.getDomain() si nécessaire
            state.events = [];
            state.journal = state.journal || { entries: [], customTags: [] };
            state.calendar = state.calendar || { cleanDays: [], milestones: [] };

            // Charger events depuis domains si disponible (lazy, sera fait à la demande)
            // Pour l'instant, on laisse events vide, il sera chargé quand nécessaire

            return state;
        } catch (error) {
            console.error('[IndexedDBDriver] Erreur lors du chargement:', error);
            throw error;
        }
    }

    /**
     * Sauvegarde le state dans IndexedDB
     * @param {Object} state - Le state à sauvegarder
     * @returns {Promise<void>}
     */
    async save(state) {
        try {
            await this.init();

            const transaction = this.db.transaction(
                [STORE_META, STORE_STATE],
                'readwrite'
            );

            // Séparer données sensibles et non-sensibles
            const { nonSensitive, sensitive } = this.separateSensitiveData(state);

            // Sauvegarder meta
            const meta = {
                key: KEY_SINGLETON,
                schemaVersion: state.schemaVersion || CURRENT_SCHEMA_VERSION,
                storageVersion: STORAGE_VERSION,
                updatedAt: Date.now()
            };
            await this.putInTransaction(transaction, STORE_META, meta);

            // Sauvegarder state non-sensible
            const stateData = {
                key: KEY_SINGLETON,
                value: nonSensitive,
                updatedAt: Date.now()
            };
            await this.putInTransaction(transaction, STORE_STATE, stateData);

            // Les domaines sensibles seront sauvegardés séparément via setDomain()
            // (géré par SecurityService)

            await this.waitForTransaction(transaction);
        } catch (error) {
            console.error('[IndexedDBDriver] Erreur lors de la sauvegarde:', error);
            throw error;
        }
    }

    /**
     * Exporte le state en JSON string
     * @param {Object} state - Le state à exporter
     * @returns {Promise<string>}
     */
    async export(state) {
        // Pour l'export, on reconstruit le state complet
        // (les domaines sensibles seront déchiffrés si nécessaire)
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
            // La migration sera gérée par storage.js
            return state;
        } catch (error) {
            console.error('[IndexedDBDriver] Erreur lors de l\'import:', error);
            throw error;
        }
    }

    /**
     * Récupère les métadonnées
     * @returns {Promise<Object|null>}
     */
    async getMeta() {
        await this.init();
        return this.get(STORE_META, KEY_SINGLETON);
    }

    /**
     * Met à jour les métadonnées
     * @param {Object} meta - Métadonnées à sauvegarder
     * @returns {Promise<void>}
     */
    async setMeta(meta) {
        await this.init();
        const data = {
            key: KEY_SINGLETON,
            ...meta,
            updatedAt: Date.now()
        };
        return this.put(STORE_META, data);
    }

    /**
     * Récupère le state non-sensible
     * @returns {Promise<Object|null>}
     */
    async getState() {
        await this.init();
        return this.get(STORE_STATE, KEY_SINGLETON);
    }

    /**
     * Récupère un domaine sensible
     * @param {string} domainKey - Clé du domaine
     * @returns {Promise<Object|null>}
     */
    async getDomain(domainKey) {
        await this.init();
        return this.get(STORE_DOMAINS, domainKey);
    }

    /**
     * Sauvegarde un domaine sensible
     * @param {string} domainKey - Clé du domaine
     * @param {Object} encryptedData - Données chiffrées { v, alg, ct, updatedAt }
     * @returns {Promise<void>}
     */
    async setDomain(domainKey, encryptedData) {
        await this.init();
        const data = {
            domainKey,
            ...encryptedData,
            updatedAt: Date.now()
        };
        return this.put(STORE_DOMAINS, data);
    }

    /**
     * Récupère les analytics pour une période
     * @param {string} periodKey - Clé de période (YYYY-MM-DD ou YYYY-WW)
     * @returns {Promise<Object|null>}
     */
    async getAnalytics(periodKey) {
        await this.init();
        return this.get(STORE_ANALYTICS, periodKey);
    }

    /**
     * Sauvegarde les analytics pour une période
     * @param {string} periodKey - Clé de période
     * @param {Object} analytics - Données analytics
     * @returns {Promise<void>}
     */
    async setAnalytics(periodKey, analytics) {
        await this.init();
        const data = {
            periodKey,
            ...analytics,
            updatedAt: Date.now()
        };
        return this.put(STORE_ANALYTICS, data);
    }

    /**
     * Opération générique GET
     * @private
     */
    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Opération générique PUT
     * @private
     */
    async put(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * PUT dans une transaction existante
     * @private
     */
    async putInTransaction(transaction, storeName, data) {
        return new Promise((resolve, reject) => {
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Attend la fin d'une transaction
     * @private
     */
    async waitForTransaction(transaction) {
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Sépare les données sensibles et non-sensibles
     * @private
     */
    separateSensitiveData(state) {
        const sensitiveDomains = [
            'events',
            'journal',
            'addictions',
            'addictionConfigs',
            'calendar',
            'history',
            'sos'
        ];

        const nonSensitive = { ...state };
        const sensitive = {};

        // Extraire les domaines sensibles
        sensitiveDomains.forEach(domain => {
            if (domain === 'calendar') {
                // Pour calendar, on extrait seulement cleanDays
                if (nonSensitive.calendar) {
                    sensitive.calendar = {
                        cleanDays: nonSensitive.calendar.cleanDays || []
                    };
                    // Garder milestones dans non-sensible
                    nonSensitive.calendar = {
                        milestones: nonSensitive.calendar.milestones || []
                    };
                }
            } else if (nonSensitive[domain] !== undefined) {
                sensitive[domain] = nonSensitive[domain];
                delete nonSensitive[domain];
            }
        });

        return { nonSensitive, sensitive };
    }

    /**
     * Retourne le state par défaut
     * @private
     */
    getDefaultState() {
        // Utiliser window.Storage.getDefaultState si disponible
        if (typeof window !== 'undefined' && window.Storage && window.Storage.getDefaultState) {
            return window.Storage.getDefaultState();
        }

        // Fallback basique
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
}
