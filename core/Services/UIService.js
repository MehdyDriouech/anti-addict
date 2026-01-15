/**
 * UIService.js - Service wrapper pour l'interface utilisateur
 * 
 * Wrapper autour de window.UI pour permettre l'injection de dépendances
 * et faciliter les tests.
 */

export class UIService {
    constructor(uiInstance = null) {
        // Utiliser l'instance fournie ou window.UI en fallback
        this.ui = uiInstance || (typeof window !== 'undefined' ? window.UI : null);
    }

    /**
     * Affiche un modal
     * @param {string} title - Titre du modal
     * @param {string} content - Contenu HTML
     * @param {Function} onConfirm - Callback de confirmation
     * @param {boolean} isDanger - Si c'est une action dangereuse
     * @param {string} modalId - ID du modal
     * @param {string} confirmButtonText - Texte du bouton de confirmation
     */
    showModal(title, content, onConfirm, isDanger = false, modalId = 'dynamic-modal', confirmButtonText = null) {
        if (!this.ui) {
            console.warn('[UIService] UI instance not available');
            return;
        }
        
        if (typeof this.ui.showModal === 'function') {
            this.ui.showModal(title, content, onConfirm, isDanger, modalId, confirmButtonText);
        } else {
            console.warn('[UIService] showModal method not available');
        }
    }

    /**
     * Ferme un modal
     * @param {string} modalId - ID du modal à fermer
     */
    closeModal(modalId = 'dynamic-modal') {
        if (!this.ui) {
            console.warn('[UIService] UI instance not available');
            return;
        }
        
        if (typeof this.ui.closeModal === 'function') {
            this.ui.closeModal(modalId);
        } else {
            // Fallback : fermer manuellement
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        }
    }

    /**
     * Affiche un toast
     * @param {string} message - Message à afficher
     * @param {string} type - Type de toast (success, error, warning, info)
     */
    showToast(message, type = 'info') {
        if (!this.ui) {
            console.warn('[UIService] UI instance not available');
            return;
        }
        
        if (typeof this.ui.showToast === 'function') {
            this.ui.showToast(message, type);
        } else {
            console.warn('[UIService] showToast method not available');
        }
    }
}

// Instance singleton par défaut
const instance = new UIService();
export default instance;
