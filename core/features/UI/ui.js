/**
 * UI Feature - API publique pour les modals et toasts
 */

import { UIController } from './controller/ui-controller.js';

// Instance unique du controller
const uiController = new UIController();

// API publique
export const UI = {
    showToast: (message, type) => uiController.showToast(message, type),
    showModal: (title, content, onConfirm, isDanger, modalId, confirmButtonText) => 
        uiController.showModal(title, content, onConfirm, isDanger, modalId, confirmButtonText),
    closeModal: (modalId) => uiController.closeModal(modalId),
    showHelpModal: (lang) => uiController.showHelpModal(lang)
};

// Exporter globalement pour compatibilité
if (typeof window !== 'undefined') {
    window.UI = UI;
    window.showToast = (message, type) => UI.showToast(message, type);
    window.closeModal = (modalId) => UI.closeModal(modalId);
    window.showHelpModal = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) {
            UI.showHelpModal(state.profile.lang);
        }
    };
}
