/**
 * Init Feature - API publique pour l'initialisation
 */

import { InitController } from './controller/init-controller.js';

// Instance unique du controller
const initController = new InitController();

// API publique
export const Init = {
    init: (state) => initController.init(state),
    applyTranslations: () => initController.applyTranslations(),
    setupRoutes: () => initController.setupRoutes(),
    setupEventListeners: () => initController.setupEventListeners()
};

// Exporter globalement pour compatibilité
if (typeof window !== 'undefined') {
    window.Init = Init;
}
