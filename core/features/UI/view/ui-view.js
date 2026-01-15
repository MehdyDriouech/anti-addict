/**
 * UI View - Rendu HTML pour les modals et toasts
 */

import { TOAST_ICONS, HELP_MODAL_CONTENT } from '../data/ui-data.js';

export class UIView {
    constructor() {
        this.toastContainer = null;
    }

    /**
     * Crée ou récupère le conteneur de toasts
     * @returns {HTMLElement}
     */
    getToastContainer() {
        if (!this.toastContainer) {
            this.toastContainer = document.querySelector('.toast-container');
            if (!this.toastContainer) {
                this.toastContainer = document.createElement('div');
                this.toastContainer.className = 'toast-container';
                document.body.appendChild(this.toastContainer);
            }
        }
        return this.toastContainer;
    }

    /**
     * Affiche un toast
     * @param {string} message - Message à afficher
     * @param {string} type - Type de toast (success, error, warning, info)
     * 
     * Note: Les manipulations DOM peuvent déclencher des erreurs dans les extensions
     * de navigateur (content_script.js, background.js). Ces erreurs sont normales et
     * ne sont pas critiques. Elles sont filtrées par le filtre console dans app.js.
     */
    showToast(message, type = 'info') {
        const container = this.getToastContainer();
        const icons = TOAST_ICONS;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Auto-remove après 3 secondes
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Affiche un modal
     * @param {string} title - Titre du modal
     * @param {string} content - Contenu HTML
     * @param {Function} onConfirm - Callback de confirmation
     * @param {boolean} isDanger - Si c'est une action dangereuse
     * @param {string} modalId - ID du modal (optionnel)
     * @param {string} confirmButtonText - Texte personnalisé pour le bouton de confirmation (optionnel)
     * @returns {string} ID du modal créé
     */
    showModal(title, content, onConfirm, isDanger = false, modalId = 'dynamic-modal', confirmButtonText = null) {
        // Supprimer l'ancien modal s'il existe
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();
        
        const modalHTML = `
            <div class="modal-overlay" id="${modalId}">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" onclick="UI.closeModal('${modalId}')">✕</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="UI.closeModal('${modalId}')">
                            ${typeof I18n !== 'undefined' ? I18n.t('cancel') : 'Annuler'}
                        </button>
                        <button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" id="modal-confirm-btn-${modalId}">
                            ${confirmButtonText || (isDanger ? (typeof I18n !== 'undefined' ? I18n.t('yes') : 'Oui') : (typeof I18n !== 'undefined' ? I18n.t('save') : 'Enregistrer'))}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Activer le modal
        setTimeout(() => {
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.add('active');
        }, 10);
        
        // Ajouter le listener de confirmation
        const confirmBtn = document.getElementById(`modal-confirm-btn-${modalId}`);
        if (confirmBtn && onConfirm) {
            confirmBtn.addEventListener('click', onConfirm);
        }
        
        return modalId;
    }

    /**
     * Ferme un modal
     * @param {string} modalId - ID du modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    /**
     * Affiche le modal d'aide
     * @param {string} lang - Langue
     */
    showHelpModal(lang) {
        const content = HELP_MODAL_CONTENT[lang] || HELP_MODAL_CONTENT.fr;
        this.showModal(content.title, content.content, () => {
            this.closeModal('dynamic-modal');
        });
    }
}
