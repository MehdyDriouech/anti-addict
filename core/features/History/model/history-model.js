/**
 * History Model - Logique métier pour l'historique
 */

import { HISTORY_DAYS } from '../data/history-data.js';

export class HistoryModel {
    /**
     * Récupère les check-ins récents
     * @param {Object} state - State de l'application
     * @param {number} days - Nombre de jours
     * @returns {Array} Liste des check-ins
     */
    getRecentCheckins(state, days = HISTORY_DAYS) {
        return Storage.getRecentCheckins(state, days);
    }

    /**
     * Formate une date ISO en format lisible
     * @param {string} dateStr - Date ISO
     * @param {string} lang - Langue
     * @returns {string} Date formatée
     */
    formatDate(dateStr, lang) {
        const date = new Date(dateStr);
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return date.toLocaleDateString(lang, options);
    }
}
