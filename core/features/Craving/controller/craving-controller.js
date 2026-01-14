/**
 * Craving Controller - Orchestration Model/View
 */

import { CravingModel } from '../model/craving-model.js';
import { CravingView } from '../view/craving-view.js';

export class CravingController {
    constructor() {
        this.model = new CravingModel();
        this.view = new CravingView();
        this.selectedAddictionId = null; // Addiction sélectionnée par l'utilisateur
    }

    /**
     * Rend l'écran de craving
     * @param {Object} state - State de l'application
     */
    render(state) {
        // Initialiser avec la première addiction si disponible
        const activeAddictions = state.addictions || [];
        if (activeAddictions.length > 0 && !this.selectedAddictionId) {
            this.selectedAddictionId = typeof activeAddictions[0] === 'string' 
                ? activeAddictions[0] 
                : activeAddictions[0].id;
        }
        
        const suggestedActions = this.model.getSuggestedActions(state, state.profile.lang);
        this.view.render(state, suggestedActions, state.profile.lang, this.selectedAddictionId);
        
        // Ne pas logger automatiquement le craving - attendre la sélection de l'addiction
        // Le craving sera loggé dans finish() avec l'addiction sélectionnée
        
        // Réinitialiser et démarrer le protocole
        this.model.resetProtocolState();
        this.startProtocol();
    }

    /**
     * Gère le changement d'addiction sélectionnée
     * @param {string} addictionId - ID de l'addiction sélectionnée
     * @param {Object} state - State de l'application
     */
    onAddictionChange(addictionId, state) {
        // Normaliser addictionId pour s'assurer que c'est une string
        this.selectedAddictionId = typeof addictionId === 'string' 
            ? addictionId 
            : (typeof addictionId === 'object' && addictionId.id ? addictionId.id : String(addictionId));
        
        // Re-rendre la vue avec la nouvelle addiction sélectionnée
        const suggestedActions = this.model.getSuggestedActions(state, state.profile.lang);
        this.view.render(state, suggestedActions, state.profile.lang, this.selectedAddictionId);
        
        // Logger le craving avec l'addiction sélectionnée
        Storage.addEvent(state, 'craving', this.selectedAddictionId);
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
        
        // S'assurer qu'une addiction est sélectionnée
        if (!this.selectedAddictionId) {
            const activeAddictions = state.addictions || [];
            this.selectedAddictionId = activeAddictions.length > 0 
                ? (typeof activeAddictions[0] === 'string' ? activeAddictions[0] : activeAddictions[0].id)
                : 'general';
        }
        
        // Logger le craving si pas encore fait
        const existingCraving = state.events.find(e => 
            e.type === 'craving' && 
            e.date === Storage.getDateISO() && 
            e.addictionId === this.selectedAddictionId
        );
        if (!existingCraving) {
            Storage.addEvent(state, 'craving', this.selectedAddictionId);
        }
        
        // Compter les actions faites
        const actionsDone = document.querySelectorAll('.action-chip.done').length;
        
        // Enregistrer une victoire avec l'intensité
        Storage.addEvent(state, 'win', this.selectedAddictionId, this.model.getIntensity());
        
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
