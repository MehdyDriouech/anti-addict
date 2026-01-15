/**
 * Settings Feature - API publique pour les réglages
 */

import { SettingsController } from './controller/settings-controller.js';
import { getServices } from '../../Utils/serviceHelper.js';

// Instance unique du controller
let settingsController = new SettingsController();

// Initialiser les services de manière asynchrone
async function initControllerServices() {
    try {
        const services = await getServices([
            'storage', 'security', 'i18n', 'ui', 'message', 
            'modal', 'form', 'errorHandler'
        ]);
        settingsController = new SettingsController(services);
        await settingsController.initServices();
    } catch (error) {
        console.warn('[Settings] Erreur lors de l\'initialisation des services, utilisation des fallbacks:', error);
        // Le controller utilisera les fallbacks window.*
    }
}

// Initialiser immédiatement si possible
initControllerServices();

// API publique
export const Settings = {
    render: async (state) => await settingsController.render(state),
    applyTheme: (themeName) => settingsController.applyTheme(themeName),
    toggleTheme: (state) => settingsController.toggleTheme(state),
    openLanguageModal: (state) => settingsController.openLanguageModal(state),
    openReligionModal: (state) => settingsController.openReligionModal(state),
    openCoachingModeModal: (state) => settingsController.openCoachingModeModal(state),
    toggleAddiction: (state, addictionId, enabled) => settingsController.toggleAddiction(state, addictionId, enabled),
    toggleSpiritualCards: (state, enabled) => settingsController.toggleSpiritualCards(state, enabled),
    exportData: async (state) => await settingsController.exportData(state),
    triggerImport: () => settingsController.triggerImport(),
    handleImport: (state, input) => settingsController.handleImport(state, input),
    confirmClearData: (state) => settingsController.confirmClearData(state),
    getAddictionIcon: (addictionId) => settingsController.model.getAddictionIcon(addictionId),
    
    // PIN Settings
    togglePinLock: (enabled) => settingsController.togglePinLock(enabled),
    openSetPinModal: () => settingsController.openSetPinModal(),
    openChangePinModal: () => settingsController.openChangePinModal(),
    
    // Auto-lock Settings
    toggleAutoLock: async (state, enabled) => await settingsController.toggleAutoLock(state, enabled),
    toggleAutoLockOnTabBlur: async (state, enabled) => await settingsController.toggleAutoLockOnTabBlur(state, enabled),
    openAutoLockDelayModal: (state) => settingsController.openAutoLockDelayModal(state)
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
    window.openCoachingModeModal = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Settings.openCoachingModeModal(state);
    };
    window.toggleAddiction = (addictionId, enabled) => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Settings.toggleAddiction(state, addictionId, enabled);
    };
    window.toggleSpiritualCards = (enabled) => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Settings.toggleSpiritualCards(state, enabled);
    };
    window.exportData = async () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) await Settings.exportData(state);
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
    window.toggleAutoLock = (enabled) => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Settings.toggleAutoLock(state, enabled);
    };
    window.openAutoLockDelayModal = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Settings.openAutoLockDelayModal(state);
    };
    window.toggleAutoLockOnTabBlur = (enabled) => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Settings.toggleAutoLockOnTabBlur(state, enabled);
    };
}
