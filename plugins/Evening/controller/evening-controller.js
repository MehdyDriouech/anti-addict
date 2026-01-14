/**
 * Evening Controller - Orchestration Model/View
 */

import { EveningModel } from '../model/evening-model.js';
import { EveningView } from '../view/evening-view.js';

export class EveningController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    /**
     * Ouvre le rituel du soir
     * @param {Object} state - State de l'application
     */
    open(state) {
        // Charger les données existantes si présentes
        const existing = Storage.getTodayEveningRitual(state);
        this.model.loadExisting(existing);
        
        const modalEl = this.view.createModalElement();
        
        // Ajouter l'event listener pour fermer sur clic overlay
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => {
                if (e.target === modalEl) {
                    this.close();
                }
            });
            modalEl._hasClickListener = true;
        }
        
        this.renderForm(state);
        this.view.show();
    }

    /**
     * Ferme le modal
     */
    close() {
        this.view.hide();
    }

    /**
     * Rendu du formulaire
     * @param {Object} state - State (optionnel, utilise window.state si absent)
     */
    renderForm(state) {
        const currentState = state || (typeof window !== 'undefined' ? window.state : null);
        if (!currentState) return;
        
        const lang = currentState.profile.lang;
        this.view.renderForm(lang, this.model.getData(), currentState);
    }

    /**
     * Définit l'exposition pour une addiction spécifique
     * @param {string} addictionId - ID de l'addiction
     * @param {boolean} value - Valeur de l'exposition
     */
    setExposed(addictionId, value) {
        this.model.setExposed(addictionId, value);
        const state = typeof window !== 'undefined' ? window.state : null;
        this.renderForm(state);
    }

    /**
     * Définit ce qui a aidé
     * @param {string} value
     */
    setHelped(value) {
        this.model.setHelped(value);
        const input = document.getElementById('helpedInput');
        if (input) input.value = value;
    }

    /**
     * Sauvegarde le rituel et affiche le résumé
     */
    save() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        // Récupérer les valeurs des inputs
        const helpedInput = document.getElementById('helpedInput');
        const gratitudeInput = document.getElementById('gratitudeInput');
        
        const helped = helpedInput?.value || '';
        const gratitude = gratitudeInput?.value || '';
        
        // Sauvegarder via le model
        this.model.save(state, helped, gratitude);
        
        // Générer une intention pour demain
        const tomorrowIntention = typeof Intentions !== 'undefined' 
            ? Intentions.generateNewIntention(state)
            : { text: '', ref: '' };
        
        // Afficher le résumé
        const lang = state.profile.lang;
        this.view.renderSummary(lang, this.model.getData(), tomorrowIntention);
    }

    /**
     * Vérifie si le rituel est complété aujourd'hui
     * @param {Object} state - State
     * @returns {boolean}
     */
    hasCompletedToday(state) {
        return this.model.hasCompletedToday(state);
    }

    /**
     * Récupère les rituels récents
     * @param {Object} state - State
     * @param {number} days - Nombre de jours
     * @returns {Array}
     */
    getRecentRituals(state, days) {
        return this.model.getRecentRituals(state, days);
    }

    /**
     * Récupère les stats des rituels
     * @param {Object} state - State
     * @param {number} days - Nombre de jours
     * @returns {Object}
     */
    getRitualStats(state, days) {
        return this.model.getRitualStats(state, days);
    }
}
