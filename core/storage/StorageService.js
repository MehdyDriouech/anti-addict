/**
 * StorageService.js - Service de stockage (wrapper)
 * 
 * Wrapper autour des fonctions de storage.js pour permettre
 * l'injection de dépendances. Pour l'instant, délègue à window.Storage.
 */

/**
 * Service de stockage
 */
export class StorageService {
    constructor() {
        // Référence vers le module Storage global
        // Sera initialisé lors de l'utilisation
        this._storageModule = null;
    }

    /**
     * Obtient le module Storage (lazy loading)
     * @private
     */
    _getStorage() {
        if (this._storageModule) {
            return this._storageModule;
        }
        // Utiliser window.Storage si disponible
        if (typeof window !== 'undefined' && window.Storage) {
            this._storageModule = window.Storage;
            return this._storageModule;
        }
        throw new Error('Storage module not available');
    }

    // ============================================
    // CORE METHODS
    // ============================================

    async loadState() {
        return this._getStorage().loadState();
    }

    async saveState(state) {
        return this._getStorage().saveState(state);
    }

    getDefaultState() {
        return this._getStorage().getDefaultState();
    }

    exportState(state) {
        return this._getStorage().exportState(state);
    }

    async importState(file) {
        return this._getStorage().importState(file);
    }

    async decryptAndImport(encryptedData, pin) {
        return this._getStorage().decryptAndImport(encryptedData, pin);
    }

    validateImportedState(data) {
        return this._getStorage().validateImportedState(data);
    }

    // ============================================
    // STORAGE DRIVER
    // ============================================

    async initStorageDriver() {
        if (this._getStorage().initStorageDriver) {
            return await this._getStorage().initStorageDriver();
        }
    }

    getCurrentDriver() {
        if (this._getStorage().getCurrentDriver) {
            return this._getStorage().getCurrentDriver();
        }
        return null;
    }

    // ============================================
    // EVENTS
    // ============================================

    addEvent(state, type, addictionId, intensity = null, meta = null) {
        return this._getStorage().addEvent(state, type, addictionId, intensity, meta);
    }

    addCheckin(state, checkinData) {
        return this._getStorage().addCheckin(state, checkinData);
    }

    addQuickCheckin(state, data) {
        return this._getStorage().addQuickCheckin(state, data);
    }

    addEveningRitual(state, ritualData) {
        return this._getStorage().addEveningRitual(state, ritualData);
    }

    addIntention(state, intentionData) {
        return this._getStorage().addIntention(state, intentionData);
    }

    incrementWins(state, increments = {}) {
        return this._getStorage().incrementWins(state, increments);
    }

    // ============================================
    // RULES
    // ============================================

    saveIfThenRule(state, rule) {
        return this._getStorage().saveIfThenRule(state, rule);
    }

    deleteIfThenRule(state, ruleId) {
        return this._getStorage().deleteIfThenRule(state, ruleId);
    }

    // ============================================
    // EXPERIMENTS
    // ============================================

    saveExperiment(state, experiment) {
        return this._getStorage().saveExperiment(state, experiment);
    }

    // ============================================
    // ACTIONS
    // ============================================

    addCustomAction(state, action) {
        return this._getStorage().addCustomAction(state, action);
    }

    updateCustomAction(state, actionId, updates) {
        return this._getStorage().updateCustomAction(state, actionId, updates);
    }

    deleteCustomAction(state, actionId) {
        return this._getStorage().deleteCustomAction(state, actionId);
    }

    // ============================================
    // NIGHT ROUTINE
    // ============================================

    addNightRoutineLog(state, log) {
        return this._getStorage().addNightRoutineLog(state, log);
    }

    updateNightRoutineConfig(state, config) {
        return this._getStorage().updateNightRoutineConfig(state, config);
    }

    // ============================================
    // JOURNAL
    // ============================================

    addJournalEntry(state, entry) {
        return this._getStorage().addJournalEntry(state, entry);
    }

    // ============================================
    // PROGRAMS
    // ============================================

    updateActiveProgram(state, programData) {
        return this._getStorage().updateActiveProgram(state, programData);
    }

    saveProgramDayProgress(state, programId, day, progress) {
        return this._getStorage().saveProgramDayProgress(state, programId, day, progress);
    }

    // ============================================
    // COACHING
    // ============================================

    addCoachingInsight(state, insight) {
        return this._getStorage().addCoachingInsight(state, insight);
    }

    // ============================================
    // SPIRITUAL
    // ============================================

    incrementDhikr(state, count = 1) {
        return this._getStorage().incrementDhikr(state, count);
    }

    addSpiritualGoal(state, goal) {
        return this._getStorage().addSpiritualGoal(state, goal);
    }

    // ============================================
    // CALENDAR
    // ============================================

    markSobrietyDay(state, date = null) {
        return this._getStorage().markSobrietyDay(state, date);
    }

    // ============================================
    // ANTIPORN
    // ============================================

    addPhoneBedCheckin(state, phoneInBed) {
        return this._getStorage().addPhoneBedCheckin(state, phoneInBed);
    }

    incrementStoppedSlopes(state) {
        return this._getStorage().incrementStoppedSlopes(state);
    }

    // ============================================
    // STATS
    // ============================================

    calculateStreak(state) {
        return this._getStorage().calculateStreak(state);
    }

    countTodayCravings(state) {
        return this._getStorage().countTodayCravings(state);
    }

    getRecentCheckins(state, count = 7) {
        return this._getStorage().getRecentCheckins(state, count);
    }

    getTodayEveningRitual(state) {
        return this._getStorage().getTodayEveningRitual(state);
    }

    // ============================================
    // UTILS
    // ============================================

    getDateISO() {
        return this._getStorage().getDateISO();
    }

    clearAllData() {
        return this._getStorage().clearAllData();
    }

    anonymizeState(state) {
        return this._getStorage().anonymizeState(state);
    }

    createSnapshot(state, days) {
        return this._getStorage().createSnapshot(state, days);
    }

    // ============================================
    // CONSTANTS
    // ============================================

    get CURRENT_SCHEMA_VERSION() {
        return this._getStorage().CURRENT_SCHEMA_VERSION;
    }
}

// Instance singleton par défaut
const instance = new StorageService();
export default instance;
