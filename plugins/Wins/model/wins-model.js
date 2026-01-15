/**
 * Wins Model - Logique métier
 */

import { MINUTES_PER_WIN } from '../data/wins-data.js';

export class WinsModel {
    constructor(services = {}) {
        this.storage = services.storage || (typeof window !== 'undefined' ? window.Storage : null);
    }

    /**
     * Récupère les compteurs de victoires invisibles
     * @param {Object} state - State de l'application
     * @returns {Object} { resistedCravings, minutesSavedEstimate, positiveActionsCount }
     */
    getWinsStats(state) {
        return {
            resistedCravings: state.wins?.resistedCravings || 0,
            minutesSavedEstimate: state.wins?.minutesSavedEstimate || 0,
            positiveActionsCount: state.wins?.positiveActionsCount || 0
        };
    }

    /**
     * Enregistre une victoire (craving résisté)
     * @param {Object} state - State de l'application
     * @param {boolean} withAction - Si une action positive a été faite
     * @param {string} addictionId - ID de l'addiction (ou première addiction si null)
     * @returns {Object} State modifié
     */
    recordWin(state, withAction = false, addictionId = null) {
        const effectiveAddiction = addictionId || state.addictions?.[0] || 'porn';
        
        // Incrémenter les compteurs
        this.storage?.incrementWins(state, {
            resistedCravings: 1,
            minutesSaved: MINUTES_PER_WIN,
            positiveActions: withAction ? 1 : 0
        });
        
        // Ajouter un événement "win"
        this.storage?.addEvent(state, 'win', effectiveAddiction, null, { withAction });
        
        return state;
    }

    /**
     * Formate les minutes en heures et minutes
     * @param {number} minutes - Nombre de minutes
     * @returns {string} Format "Xh Ymin" ou "Y min"
     */
    formatMinutes(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) {
            return `${hours}h`;
        }
        return `${hours}h ${mins}min`;
    }
}
