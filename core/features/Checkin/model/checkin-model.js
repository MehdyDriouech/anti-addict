/**
 * Checkin Model - Logique métier pour le check-in
 */

import { CHECKIN_DEFAULTS } from '../data/checkin-data.js';

export class CheckinModel {
    constructor(services = {}) {
        this.storage = services.storage || (typeof window !== 'undefined' ? window.Storage : null);
        this.dateService = services.dateService || null;
    }

    /**
     * Helper pour obtenir la date ISO du jour
     * @returns {string}
     */
    getDateISO() {
        return this.dateService?.todayISO() || (this.storage?.getDateISO ? this.storage.getDateISO() : (typeof Storage !== 'undefined' ? Storage.getDateISO() : new Date().toISOString().split('T')[0]));
    }

    /**
     * Récupère le check-in du jour s'il existe
     * @param {Object} state - State de l'application
     * @returns {Object} Données du check-in
     */
    getTodayCheckin(state) {
        const today = this.getDateISO();
        return state.checkins.find(c => c.date === today) || { ...CHECKIN_DEFAULTS };
    }

    /**
     * Sauvegarde un check-in
     * @param {Object} state - State de l'application
     * @param {Object} checkinData - Données du check-in
     */
    saveCheckin(state, checkinData) {
        this.storage?.addCheckin(state, checkinData);
    }
}
