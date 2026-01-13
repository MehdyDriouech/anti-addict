/**
 * Settings Feature - API publique pour les réglages
 */

import { SettingsController } from './controller/settings-controller.js';

// Instance unique du controller
const settingsController = new SettingsController();

// API publique
export const Settings = {
    render: (state) => settingsController.render(state),
    applyTheme: (themeName) => settingsController.applyTheme(themeName),
    toggleTheme: (state) => settingsController.toggleTheme(state),
    openLanguageModal: (state) => settingsController.openLanguageModal(state),
    openReligionModal: (state) => settingsController.openReligionModal(state),
    toggleAddiction: (state, addictionId, enabled) => settingsController.toggleAddiction(state, addictionId, enabled),
    toggleSpiritualCards: (state, enabled) => settingsController.toggleSpiritualCards(state, enabled),
    exportData: (state) => settingsController.exportData(state),
    triggerImport: () => settingsController.triggerImport(),
    handleImport: (state, input) => settingsController.handleImport(state, input),
    confirmClearData: (state) => settingsController.confirmClearData(state),
    getAddictionIcon: (addictionId) => settingsController.model.getAddictionIcon(addictionId)
};

// Exporter globalement pour compatibilité
if (typeof window !== 'undefined') {
    window.Settings = Settings;
    window.renderSettings = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Settings.render(state);
    };
    window.applyTheme = (themeName) => Settings.applyTheme(themeName);
    window.toggleTheme = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Settings.toggleTheme(state);
    };
    window.openLanguageModal = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Settings.openLanguageModal(state);
    };
    window.openReligionModal = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Settings.openReligionModal(state);
    };
    window.toggleAddiction = (addictionId, enabled) => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Settings.toggleAddiction(state, addictionId, enabled);
    };
    window.toggleSpiritualCards = (enabled) => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Settings.toggleSpiritualCards(state, enabled);
    };
    window.exportData = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Settings.exportData(state);
    };
    window.triggerImport = () => Settings.triggerImport();
    window.handleImport = (input) => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Settings.handleImport(state, input);
    };
    window.confirmClearData = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Settings.confirmClearData(state);
    };
    window.getAddictionIcon = (addictionId) => Settings.getAddictionIcon(addictionId);
}
