/**
 * Home Feature - API publique pour la page d'accueil
 */

import { HomeController } from './controller/home-controller.js';

// Instance unique du controller
const homeController = new HomeController();

// API publique
export const Home = {
    render: (state) => homeController.render(state),
    handleMoodSelection: (state, mood, moodValue, stressValue) => 
        homeController.handleMoodSelection(state, mood, moodValue, stressValue),
    activateCrisisMode: (state) => homeController.activateCrisisMode(state),
    dismissHelpSuggestion: () => homeController.dismissHelpSuggestion(),
    renderCoachingWidget: (insights, lang) => homeController.renderCoachingWidget(insights, lang),
    renderInsightFallback: (lang) => homeController.renderInsightFallback(lang),
    getLabels: (lang) => homeController.getLabels(lang)
};

// Exporter globalement pour compatibilité
if (typeof window !== 'undefined') {
    window.Home = Home;
    window.renderHome = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Home.render(state);
    };
    window.handleMoodSelection = (mood, moodValue, stressValue) => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Home.handleMoodSelection(state, mood, moodValue, stressValue);
    };
    window.showHelpSuggestion = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) {
            const labels = Home.getLabels(state.profile.lang);
            homeController.view.showHelpSuggestion(labels);
        }
    };
    window.dismissHelpSuggestion = () => Home.dismissHelpSuggestion();
    window.activateCrisisMode = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Home.activateCrisisMode(state);
    };
    window.renderSOSFab = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) homeController.view.renderSOSFab(state);
    };
    window.renderProgressDashboard = (state) => homeController.renderProgressDashboard(state);
    window.renderActiveProgramWidget = (state) => homeController.view.renderActiveProgramWidget(state);
    window.renderCoachingWidget = (insights, lang) => Home.renderCoachingWidget(insights, lang);
    window.renderInsightFallback = (lang) => Home.renderInsightFallback(lang);
}
