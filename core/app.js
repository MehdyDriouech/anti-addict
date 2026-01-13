/**
 * app.js - Point d'entrée principal de l'application Revenir V5
 * 
 * Ce fichier a été refactorisé pour utiliser l'architecture MVC avec features séparées.
 * Toutes les fonctionnalités ont été extraites dans app/core/features/
 */

// ============================================
// IMPORTS DES FEATURES
// ============================================
import { UI } from './features/UI/ui.js';
import { Tools } from './features/Tools/tools.js';
import { Checkin } from './features/Checkin/checkin.js';
import { History } from './features/History/history.js';
import { Settings } from './features/Settings/settings.js';
import { Craving } from './features/Craving/craving.js';
import { Home } from './features/Home/home.js';
import { Onboarding } from './features/Onboarding/onboarding.js';
import { Init } from './features/Init/init.js';
import { Dashboard } from './features/Dashboard/dashboard.js';

// ============================================
// STATE GLOBAL
// ============================================
let state = null;

// ============================================
// INITIALISATION
// ============================================

/**
 * Point d'entrée principal de l'application
 */
async function initApp() {
    console.log('[App] Initialisation...');
    
    // Charger le state depuis localStorage
    state = Storage.loadState();
    
    // Initialiser l'application via la feature Init
    await Init.init(state);
    
    console.log('[App] Initialisé avec succès');
}

// ============================================
// GLOBAL EXPORTS
// ============================================

// Exposer state pour les features qui en ont besoin
Object.defineProperty(window, 'state', {
    get: function() { return state; },
    set: function(value) { state = value; },
    configurable: true
});

// ============================================
// DÉMARRAGE
// ============================================
document.addEventListener('DOMContentLoaded', initApp);
