/**
 * UI Controller - Orchestration Model/View
 */

import { UIModel } from '../model/ui-model.js';
import { UIView } from '../view/ui-view.js';

export class UIController {
    constructor() {
        this.model = new UIModel();
        this.view = new UIView();
    }

    /**
     * Affiche un toast
     * @param {string} message - Message à afficher
     * @param {string} type - Type de toast
     */
    showToast(message, type = 'info') {
        this.view.showToast(message, type);
    }

    /**
     * Affiche un modal
     * @param {string} title - Titre du modal
     * @param {string} content - Contenu HTML
     * @param {Function} onConfirm - Callback de confirmation
     * @param {boolean} isDanger - Si c'est une action dangereuse
     * @param {string} modalId - ID du modal (optionnel)
     * @returns {string} ID du modal créé
     */
    showModal(title, content, onConfirm, isDanger = false, modalId = 'dynamic-modal') {
        const id = this.view.showModal(title, content, onConfirm, isDanger, modalId);
        this.model.registerModal(id);
        return id;
    }

    /**
     * Ferme un modal
     * @param {string} modalId - ID du modal
     */
    closeModal(modalId) {
        this.view.closeModal(modalId);
        this.model.unregisterModal(modalId);
    }

    /**
     * Affiche le modal d'aide
     * @param {string} lang - Langue
     */
    showHelpModal(lang) {
        this.view.showHelpModal(lang);
    }
}
