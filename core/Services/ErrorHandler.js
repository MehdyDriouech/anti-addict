/**
 * ErrorHandler.js - Service centralisé pour la gestion des erreurs
 * 
 * Centralise le logging et la notification des erreurs pour unifier
 * le comportement dans toute l'application.
 */

export class ErrorHandler {
    constructor(uiService = null) {
        this.uiService = uiService;
    }

    /**
     * Gère une erreur de manière centralisée
     * @param {Error|string} error - Erreur à gérer
     * @param {string} context - Contexte de l'erreur (ex: 'SettingsController')
     * @param {string} userMessage - Message à afficher à l'utilisateur (optionnel)
     * @param {Object} options - Options { logLevel?, showToast? }
     */
    handle(error, context, userMessage = null, options = {}) {
        const {
            logLevel = 'error',
            showToast = true,
            toastType = 'error'
        } = options;

        // Logger l'erreur
        const errorMessage = error instanceof Error ? error.message : error;
        const errorStack = error instanceof Error ? error.stack : '';
        
        if (logLevel === 'error') {
            console.error(`[${context}] ${errorMessage}`, errorStack ? { stack: errorStack } : '');
        } else if (logLevel === 'warn') {
            console.warn(`[${context}] ${errorMessage}`);
        } else {
            console.log(`[${context}] ${errorMessage}`);
        }

        // Afficher un toast à l'utilisateur si demandé
        if (showToast && this.uiService && userMessage) {
            this.uiService.showToast(userMessage, toastType);
        }
    }

    /**
     * Gère une erreur silencieusement (log uniquement)
     * @param {Error|string} error - Erreur à gérer
     * @param {string} context - Contexte de l'erreur
     */
    handleSilently(error, context) {
        this.handle(error, context, null, { showToast: false });
    }

    /**
     * Gère une erreur avec un message utilisateur personnalisé
     * @param {Error|string} error - Erreur à gérer
     * @param {string} context - Contexte de l'erreur
     * @param {string} userMessage - Message à afficher
     * @param {string} toastType - Type de toast (error, warning, info)
     */
    handleWithUserMessage(error, context, userMessage, toastType = 'error') {
        this.handle(error, context, userMessage, { toastType });
    }
}

// Instance singleton par défaut
const instance = new ErrorHandler();
export default instance;
