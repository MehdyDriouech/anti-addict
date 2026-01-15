/**
 * Checkin Controller - Orchestration Model/View
 */

import { CheckinModel } from '../model/checkin-model.js';
import { CheckinView } from '../view/checkin-view.js';

export class CheckinController {
    constructor() {
        this.model = new CheckinModel();
        this.view = new CheckinView();
    }

    /**
     * Rend l'écran de check-in
     * @param {Object} state - State de l'application
     */
    render(state) {
        const checkinData = this.model.getTodayCheckin(state);
        this.view.render(checkinData, state.profile.lang);
    }

    /**
     * Met à jour l'affichage de la valeur du range
     * @param {HTMLInputElement} input - Input range
     */
    updateRangeValue(input) {
        this.view.updateRangeValue(input);
    }

    /**
     * Soumet le formulaire de check-in
     * @param {Event} event - Événement de soumission
     */
    submit(event) {
        event.preventDefault();
        
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const checkinData = {
            mood: parseInt(document.getElementById('checkin-mood').value),
            stress: parseInt(document.getElementById('checkin-stress').value),
            craving: parseInt(document.getElementById('checkin-craving').value),
            solitude: parseInt(document.getElementById('checkin-solitude').value),
            exposure: document.getElementById('checkin-exposure').checked,
            notes: document.getElementById('checkin-notes').value.trim()
        };
        
        this.model.saveCheckin(state, checkinData);
        
        if (typeof UI !== 'undefined') {
            UI.showToast(I18n.t('checkin_saved'), 'success');
        }
        
        Router.navigateTo('home');
    }
}
