/**
 * Wins Controller - Orchestration Model/View
 */

import { WinsModel } from '../model/wins-model.js';
import { WinsView } from '../view/wins-view.js';

export class WinsController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    /**
     * Récupère les stats des victoires
     * @param {Object} state - State de l'application
     * @returns {Object} Stats
     */
    getWinsStats(state) {
        return this.model.getWinsStats(state);
    }

    /**
     * Enregistre une victoire
     * @param {Object} state - State de l'application
     * @param {boolean} withAction - Si une action positive a été faite
     * @returns {Object} State modifié
     */
    recordWin(state, withAction = false) {
        return this.model.recordWin(state, withAction);
    }

    /**
     * Formate les minutes
     * @param {number} minutes - Nombre de minutes
     * @returns {string} Formaté
     */
    formatMinutes(minutes) {
        return this.model.formatMinutes(minutes);
    }

    /**
     * Génère le HTML pour afficher les victoires invisibles
     * @param {Object} state - State de l'application
     * @returns {string} HTML
     */
    renderWinsStats(state) {
        const stats = this.model.getWinsStats(state);
        const lang = state.profile.lang;
        return this.view.renderWinsStats(stats, lang, (m) => this.model.formatMinutes(m));
    }

    /**
     * Génère le HTML compact pour le dashboard
     * @param {Object} state - State de l'application
     * @returns {string} HTML
     */
    renderWinsCompact(state) {
        const stats = this.model.getWinsStats(state);
        const lang = state.profile.lang;
        return this.view.renderWinsCompact(stats, lang, (m) => this.model.formatMinutes(m));
    }
}
