/**
 * Craving Controller - Orchestration Model/View
 */

import { CravingModel } from '../model/craving-model.js';
import { CravingView } from '../view/craving-view.js';

export class CravingController {
    constructor() {
        this.model = new CravingModel();
        this.view = new CravingView();
    }

    /**
     * Rend l'écran de craving
     * @param {Object} state - State de l'application
     */
    render(state) {
        const suggestedActions = this.model.getSuggestedActions(state, state.profile.lang);
        this.view.render(state, suggestedActions, state.profile.lang);
        
        // Logger automatiquement le craving
        const primaryAddiction = state.addictions[0]?.id || 'general';
        Storage.addEvent(state, 'craving', primaryAddiction);
        
        // Réinitialiser et démarrer le protocole
        this.model.resetProtocolState();
        this.startProtocol();
    }

    /**
     * Démarre le protocole
     */
    startProtocol() {
        this.model.startProtocol(
            (seconds) => {
                this.view.updateProgress(seconds);
                this.view.updateSteps(seconds);
            },
            () => {
                this.view.markAllStepsCompleted();
            }
        );
        
        this.model.startBreathing((breathingState) => {
            this.view.updateBreathingDisplay(breathingState);
        });
    }

    /**
     * Marque une action comme faite
     * @param {HTMLElement} chip - Élément chip
     */
    markActionDone(chip) {
        chip.classList.toggle('done');
        if (chip.classList.contains('done')) {
            chip.innerHTML = '✓ ' + chip.textContent.replace('✓ ', '');
        }
    }

    /**
     * Ouvre le mode relapse depuis l'écran craving
     * @param {Object} state - State de l'application
     */
    openRelapse(state) {
        this.model.stopAllTimers();
        if (typeof Relapse !== 'undefined') {
            Relapse.openRelapseMode(state);
        }
    }

    /**
     * Met à jour l'intensité
     * @param {string} value - Valeur de l'intensité
     */
    updateIntensity(value) {
        this.model.updateIntensity(value);
        this.view.updateIntensity(value);
    }

    /**
     * Affiche un texte d'encouragement
     * @param {Object} state - State de l'application
     */
    showEncouragement(state) {
        this.view.showEncouragement(state);
    }

    /**
     * Confirme une étape du protocole
     */
    confirmStep() {
        this.view.confirmStep();
    }

    /**
     * Termine le protocole et retourne à l'accueil
     * @param {Object} state - State de l'application
     */
    finish(state) {
        this.model.stopAllTimers();
        
        // Compter les actions faites
        const actionsDone = document.querySelectorAll('.action-chip.done').length;
        
        // Enregistrer une victoire avec l'intensité
        const primaryAddiction = state.addictions[0]?.id || 'general';
        Storage.addEvent(state, 'win', primaryAddiction, this.model.getIntensity());
        
        // Incrémenter les victoires invisibles
        if (typeof Wins !== 'undefined') {
            Wins.recordWin(state, actionsDone > 0);
        }
        
        // Message de succès
        if (typeof UI !== 'undefined') {
            UI.showToast(I18n.t('protocol_complete'), 'success');
        }
        
        // Retourner à l'accueil
        Router.navigateTo('home');
    }
}
