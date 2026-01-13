/**
 * SOS Model - Logique métier
 */

import { PRIORITY_ACTIONS } from '../data/sos-data.js';

export class SOSModel {
    constructor() {
        this.sosActive = false;
        this.lowTextMode = false;
    }

    /**
     * Récupère les actions pour le SOS
     * @param {Object} state - State de l'application
     * @param {string} lang - Langue
     * @param {number} count - Nombre d'actions à retourner
     * @returns {Array} Liste d'actions
     */
    getSOSActions(state, lang, count = 6) {
        // D'abord les favoris
        let actions = [];
        
        if (typeof Actions !== 'undefined') {
            const favorites = Actions.getFavoriteActions(state, lang);
            actions = [...favorites];
            
            // Compléter avec des actions prioritaires
            if (actions.length < count) {
                const allActions = Actions.getAllActions(state, lang);
                const priority = allActions.filter(a => 
                    PRIORITY_ACTIONS.includes(a.id) && !a.favorite
                );
                actions = [...actions, ...priority];
            }
            
            // Compléter avec des actions aléatoires
            if (actions.length < count) {
                const allActions = Actions.getAllActions(state, lang);
                const remaining = allActions.filter(a => 
                    !actions.some(existing => existing.id === a.id)
                ).sort(() => Math.random() - 0.5);
                actions = [...actions, ...remaining];
            }
        }
        
        return actions.slice(0, count);
    }

    /**
     * Vérifie si le SOS est actif
     * @returns {boolean}
     */
    isActive() {
        return this.sosActive;
    }

    /**
     * Active le mode SOS
     * @param {Object} state - State de l'application
     * @param {string} addictionId - ID de l'addiction (ou première addiction si null)
     */
    activate(state, addictionId = null) {
        this.sosActive = true;
        this.lowTextMode = state.settings?.lowTextMode || false;
        
        // Logger l'événement SOS
        const effectiveAddiction = addictionId || state.addictions?.[0] || 'porn';
        Storage.addEvent(state, 'craving', effectiveAddiction, null, { context: 'sos' });
    }

    /**
     * Désactive le mode SOS
     */
    deactivate() {
        this.sosActive = false;
    }

    /**
     * Toggle le mode low-text
     * @param {Object} state - State de l'application
     */
    toggleLowText(state) {
        this.lowTextMode = !this.lowTextMode;
        state.settings.lowTextMode = this.lowTextMode;
        Storage.saveState(state);
    }

    /**
     * Confirme la sortie du mode SOS
     * @param {Object} state - State de l'application
     */
    confirmExit(state) {
        // Incrémenter les cravings résistés
        Storage.incrementWins(state, { resistedCravings: 1, minutesSaved: 15 });
    }

    /**
     * Récupère le mode low-text
     * @returns {boolean}
     */
    getLowTextMode() {
        return this.lowTextMode;
    }
}
