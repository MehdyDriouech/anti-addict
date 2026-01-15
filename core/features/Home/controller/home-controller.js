/**
 * Home Controller - Orchestration Model/View
 */

import { HomeModel } from '../model/home-model.js';
import { HomeView } from '../view/home-view.js';

export class HomeController {
    constructor() {
        this.model = new HomeModel();
        this.view = new HomeView();
    }

    /**
     * Rend la page d'accueil
     * @param {Object} state - State de l'application
     */
    render(state) {
        const lang = state.profile.lang;
        const labels = this.model.getLabels(lang);
        const validationMessage = this.model.getRandomValidationMessage(lang);
        const hasProgram = this.model.hasActiveProgram(state);
        
        const renderProgressDashboard = (state) => this.renderProgressDashboard(state);
        const renderActiveProgramWidget = (state) => this.view.renderActiveProgramWidget(state);
        const renderIntentionBlock = (state) => {
            if (typeof Intentions !== 'undefined' && Intentions.renderIntentionBlock) {
                return Intentions.renderIntentionBlock(state);
            }
            return '';
        };
        
        const toolsMenuLabel = typeof Tools !== 'undefined' ? Tools.getMenuLabel(lang) : 'Mes outils';
        
        this.view.render(state, labels, validationMessage, hasProgram, renderProgressDashboard, renderActiveProgramWidget, renderIntentionBlock, toolsMenuLabel);
        this.view.renderSOSFab(state);
    }

    /**
     * Rend le dashboard de progression
     * @param {Object} state - State de l'application
     * @returns {string} HTML
     */
    renderProgressDashboard(state) {
        return this.view.renderProgressDashboard(state);
    }

    /**
     * Gère la sélection d'humeur
     * @param {Object} state - State de l'application
     * @param {string} mood - Humeur (good, ok, bad)
     * @param {number} moodValue - Valeur de l'humeur
     * @param {number} stressValue - Valeur du stress
     */
    handleMoodSelection(state, mood, moodValue, stressValue) {
        this.model.submitQuickCheckin(state, moodValue, stressValue);
        
        if (mood === 'bad') {
            const labels = this.model.getLabels(state.profile.lang);
            this.view.showHelpSuggestion(labels);
        }
        
        if (moodValue <= 3 || stressValue >= 7) {
            document.body.classList.add('focus-mode');
        } else {
            document.body.classList.remove('focus-mode');
        }
    }

    /**
     * Active le mode crise
     * @param {Object} state - State de l'application
     */
    activateCrisisMode(state) {
        document.body.classList.add('crisis-mode', 'focus-mode');
        
        if (typeof SOS !== 'undefined') {
            SOS.activate(state);
        } else {
            Router.navigateTo('craving');
        }
    }

    /**
     * Ferme la suggestion d'aide
     */
    dismissHelpSuggestion() {
        this.view.dismissHelpSuggestion();
    }

    /**
     * Rend le widget de coaching
     * @param {Object} insights - Insights hebdomadaires
     * @param {string} lang - Langue
     * @returns {string} HTML
     */
    renderCoachingWidget(insights, lang) {
        return this.view.renderCoachingWidget(insights, lang);
    }

    /**
     * Rend le fallback insight
     * @param {string} lang - Langue
     * @returns {string} HTML
     */
    renderInsightFallback(lang) {
        const labels = this.model.getLabels(lang);
        return this.view.renderInsightFallback(labels);
    }

    /**
     * Récupère les labels selon la langue
     * @param {string} lang - Langue
     * @returns {Object} Labels
     */
    getLabels(lang) {
        return this.model.getLabels(lang);
    }
}
