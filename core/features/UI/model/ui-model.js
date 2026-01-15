/**
 * UI Model - Logique métier pour les modals et toasts
 */

export class UIModel {
    constructor() {
        this.activeModals = new Set();
    }

    /**
     * Enregistre un modal actif
     * @param {string} modalId - ID du modal
     */
    registerModal(modalId) {
        this.activeModals.add(modalId);
    }

    /**
     * Retire un modal de la liste des actifs
     * @param {string} modalId - ID du modal
     */
    unregisterModal(modalId) {
        this.activeModals.delete(modalId);
    }

    /**
     * Vérifie si un modal est actif
     * @param {string} modalId - ID du modal
     * @returns {boolean}
     */
    isModalActive(modalId) {
        return this.activeModals.has(modalId);
    }
}
