/**
 * ConsoleErrorFilterService.js - Service pour filtrer les erreurs d'extensions
 * 
 * Wrapper autour de ConsoleErrorFilter pour permettre l'injection de dépendances.
 * Remplace la fonction setupConsoleFilter() de app.js.
 */

import { ConsoleErrorFilter } from '../Utils/ConsoleErrorFilter.js';

export class ConsoleErrorFilterService {
    constructor() {
        this.filter = new ConsoleErrorFilter();
        this.isSetup = false;
    }

    /**
     * Configure le filtre de console
     * @returns {void}
     */
    setup() {
        if (this.isSetup) {
            return; // Déjà configuré
        }
        
        this.filter.setup();
        this.isSetup = true;
    }

    /**
     * Vérifie si une erreur provient d'une extension
     * @param {string} message - Message d'erreur
     * @param {string} source - Source de l'erreur
     * @param {Error} error - Objet Error
     * @returns {boolean}
     */
    isExtensionError(message, source, error) {
        return this.filter.detector.isExtensionError(message, source, error);
    }
}

// Instance singleton par défaut
const instance = new ConsoleErrorFilterService();
export default instance;
