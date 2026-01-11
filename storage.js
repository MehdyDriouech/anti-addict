/**
 * storage.js - Gestion du stockage localStorage pour l'application Revenir
 * 
 * Fonctionnalités:
 * - Sauvegarde/chargement du state dans localStorage
 * - Import/export JSON
 * - Migration de schéma automatique (v1 -> v2 -> v3)
 * - Validation des données importées
 * - Export anonymisé et snapshots
 */

// Clé unique pour le stockage
const STORAGE_KEY = 'revenir_state_v1';

// Version actuelle du schéma
const CURRENT_SCHEMA_VERSION = 4;

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
            theme: 'dark'  // Theme: 'dark' ou 'light'
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
        coaching: {
            lastWeeklyInsight: null,
            insights: []
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
        
        // V3: Calendrier sobriété
        calendar: {
            sobrietyDays: [],
            milestones: []
        },
        
        // V4: Configuration des addictions (catalogue étendu)
        addictionsConfig: {
            catalog: null  // Sera initialisé depuis AddictionsConfig.CATALOG si nécessaire
        }
    };
}

/**
 * Charge le state depuis localStorage
 * @returns {Object} Le state chargé ou le state par défaut
 */
function loadState() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return getDefaultState();
        }
        
        const state = JSON.parse(stored);
        
        // Migration si nécessaire
        return migrateState(state);
    } catch (error) {
        console.error('[Storage] Erreur lors du chargement:', error);
        return getDefaultState();
    }
}

/**
 * Sauvegarde le state dans localStorage
 * @param {Object} state - Le state à sauvegarder
 */
function saveState(state) {
    try {
        // S'assurer que la version du schéma est présente
        state.schemaVersion = CURRENT_SCHEMA_VERSION;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('[Storage] Erreur lors de la sauvegarde:', error);
    }
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
            default:
                // Version inconnue, on incrémente
                currentState.schemaVersion++;
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
            notifications: state.settings?.notifications ?? defaultState.settings.notifications
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
        addictions: state.addictions || defaultState.addictions,
        settings: state.settings || defaultState.settings,
        checkins: state.checkins || defaultState.checkins,
        events: state.events || defaultState.events,
        
        // Nouveaux champs v2
        eveningRituals: state.eveningRituals || defaultState.eveningRituals,
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
        addictions: state.addictions || defaultState.addictions,
        settings: state.settings || defaultState.settings,
        checkins: state.checkins || defaultState.checkins,
        events: state.events || defaultState.events,
        eveningRituals: state.eveningRituals || defaultState.eveningRituals,
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
        addictionsConfig: state.addictionsConfig || defaultState.addictionsConfig
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
    
    // Étendre settings avec lowTextMode
    const settings = {
        ...defaultState.settings,
        ...state.settings,
        lowTextMode: state.settings?.lowTextMode ?? false
    };
    
    return {
        schemaVersion: 3,
        
        // Conserver les données existantes V2
        profile: state.profile || defaultState.profile,
        addictions: state.addictions || defaultState.addictions,
        settings,
        checkins: state.checkins || defaultState.checkins,
        events: state.events || defaultState.events,
        eveningRituals: state.eveningRituals || defaultState.eveningRituals,
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
 * @param {Object} options - Options d'export { anonymized, snapshot }
 */
function exportState(state, options = {}) {
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
        
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const suffix = options.anonymized ? '-anon' : options.snapshot ? `-${options.snapshot}d` : '';
        const link = document.createElement('a');
        link.href = url;
        link.download = `revenir-backup${suffix}-${getDateISO()}.json`;
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
 * @returns {Promise<Object>} Le résultat de la validation
 */
function importState(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const validation = validateImportedState(data);
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
 * Retourne la date du jour au format ISO (YYYY-MM-DD)
 * @returns {string}
 */
function getDateISO() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

/**
 * Ajoute un événement au state
 * @param {Object} state - Le state actuel
 * @param {string} type - Type d'événement (craving, episode, win, slope)
 * @param {string} addictionId - ID de l'addiction concernée
 * @param {number} intensity - Intensité optionnelle (0-10)
 * @param {Object} meta - Métadonnées additionnelles (déclencheur, contexte, etc.)
 * @returns {Object} Le state modifié
 */
function addEvent(state, type, addictionId, intensity = null, meta = null) {
    const event = {
        ts: Date.now(),
        date: getDateISO(),
        type,
        addictionId
    };
    
    if (intensity !== null) {
        event.intensity = intensity;
    }
    
    if (meta !== null) {
        event.meta = meta;
    }
    
    state.events.push(event);
    saveState(state);
    return state;
}

/**
 * Ajoute un check-in au state
 * @param {Object} state - Le state actuel
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
    
    // Remplacer le check-in du jour s'il existe déjà
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
    state.coaching.lastWeeklyInsight = getDateISO();
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
    const targetDate = date || getDateISO();
    if (!state.calendar.sobrietyDays.includes(targetDate)) {
        state.calendar.sobrietyDays.push(targetDate);
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
    validateImportedState,
    
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
