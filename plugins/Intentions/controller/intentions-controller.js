/**
 * Intentions Controller - Orchestration Model/View
 */

import { IntentionsModel } from '../model/intentions-model.js';
import { IntentionsView } from '../view/intentions-view.js';
import { LABELS } from '../data/intentions-data.js';

export class IntentionsController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    /**
     * Vérifie si une intention existe aujourd'hui
     * @param {Object} state - State de l'application
     * @returns {boolean}
     */
    hasIntentionToday(state) {
        return this.model.hasIntentionToday(state);
    }

    /**
     * Récupère l'intention du jour
     * @param {Object} state - State de l'application
     * @returns {Object|null}
     */
    getTodayIntention(state) {
        return this.model.getTodayIntention(state);
    }

    /**
     * Génère une nouvelle intention
     * @param {Object} state - State de l'application
     * @returns {Object}
     */
    generateNewIntention(state) {
        return this.model.generateNewIntention(state);
    }

    /**
     * Définit l'intention du jour
     * @param {Object} state - State de l'application
     * @param {boolean} force - Forcer même si une intention existe déjà
     * @returns {Object}
     */
    setTodayIntention(state, force = false) {
        return this.model.setTodayIntention(state, force);
    }

    /**
     * Récupère l'historique
     * @param {Object} state - State de l'application
     * @param {number} count - Nombre d'intentions
     * @returns {Array}
     */
    getIntentionsHistory(state, count = 7) {
        return this.model.getIntentionsHistory(state, count);
    }

    /**
     * Génère le HTML pour afficher l'intention du jour
     * @param {Object} state - State de l'application
     * @returns {string} HTML
     */
    renderIntentionBlock(state) {
        const lang = state.profile.lang;
        let intention = this.model.getTodayIntention(state);
        
        // Si pas d'intention, en générer une
        if (!intention) {
            intention = this.model.setTodayIntention(state);
        }
        
        // Vérifier si l'utilisateur s'est engagé aujourd'hui
        const today = Utils.todayISO();
        const isEngaged = intention.engaged === true;
        
        return this.view.renderIntentionBlock(intention, lang, isEngaged);
    }

    /**
     * Toggle l'engagement
     * @param {Object} state - State de l'application
     */
    toggleEngagement(state) {
        this.model.toggleEngagement(state);
        
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        
        // Feedback positif
        if (typeof showToast === 'function') {
            showToast(l.success, 'success');
        }
        
        // Re-render
        if (typeof renderHome === 'function') {
            renderHome();
        }
    }

    /**
     * Handler pour le bouton "Nouvelle intention"
     * @param {Object} state - State de l'application
     */
    onNewIntention(state) {
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        
        if (this.model.hasIntentionToday(state)) {
            if (!confirm(l.confirmNew)) {
                return;
            }
        }
        
        this.model.setTodayIntention(state, true);
        
        // Re-render Home
        if (typeof renderHome === 'function') {
            renderHome();
        }
    }
}
