/**
 * Checkin Model - Logique métier pour le check-in
 */

import { CHECKIN_DEFAULTS } from '../data/checkin-data.js';

export class CheckinModel {
    /**
     * Récupère le check-in du jour s'il existe
     * @param {Object} state - State de l'application
     * @returns {Object} Données du check-in
     */
    getTodayCheckin(state) {
        const today = Storage.getDateISO();
        return state.checkins.find(c => c.date === today) || { ...CHECKIN_DEFAULTS };
    }

    /**
     * Sauvegarde un check-in
     * @param {Object} state - State de l'application
     * @param {Object} checkinData - Données du check-in
     */
    saveCheckin(state, checkinData) {
        Storage.addCheckin(state, checkinData);
    }
}
