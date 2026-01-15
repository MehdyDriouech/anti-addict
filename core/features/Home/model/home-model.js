/**
 * Home Model - Logique métier pour la page d'accueil
 */

import { HOME_LABELS } from '../data/home-data.js';

export class HomeModel {
    /**
     * Récupère les labels selon la langue
     * @param {string} lang - Langue
     * @returns {Object} Labels
     */
    getLabels(lang) {
        return HOME_LABELS[lang] || HOME_LABELS.fr;
    }

    /**
     * Récupère un message de validation aléatoire
     * @param {string} lang - Langue
     * @returns {string} Message
     */
    getRandomValidationMessage(lang) {
        const labels = this.getLabels(lang);
        const messages = labels.validationMessages || [];
        return messages[Math.floor(Math.random() * messages.length)] || messages[0] || '';
    }

    /**
     * Récupère les insights hebdomadaires
     * @param {Object} state - State de l'application
     * @returns {Object|null} Insights ou null
     */
    getWeeklyInsights(state) {
        if (typeof Coaching !== 'undefined' && Coaching.computeWeeklyInsights) {
            return Coaching.computeWeeklyInsights(state);
        }
        return null;
    }

    /**
     * Vérifie si un programme est actif
     * @param {Object} state - State de l'application
     * @returns {boolean}
     */
    hasActiveProgram(state) {
        return state.programs?.active !== null;
    }

    /**
     * Soumet un check-in rapide
     * @param {Object} state - State de l'application
     * @param {number} mood - Humeur (0-10)
     * @param {number} stress - Stress (0-10)
     */
    submitQuickCheckin(state, mood, stress) {
        const checkinData = {
            mood: mood,
            stress: stress,
            craving: stress > 7 ? 8 : stress > 4 ? 5 : 2,
            solitude: 5,
            exposure: false,
            notes: '',
            quickCheckin: true
        };
        
        Storage.addCheckin(state, checkinData);
    }
}
