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
 * Filtre console pour ignorer les erreurs d'extensions de navigateur
 * Ces erreurs proviennent d'extensions mal écrites qui observent les mutations DOM
 * et ne sont pas critiques pour le fonctionnement de l'application.
 */
function setupConsoleFilter() {
    // Sauvegarder les fonctions originales
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Fonction helper pour vérifier si une erreur provient d'une extension
    function isExtensionError(message, source, error) {
        if (!message && !source && !error) return false;
        const msg = (message || '').toString();
        const src = (source || '').toString();
        const errorStack = (error?.stack || '').toString();
        const errorMessage = (error?.message || '').toString();
        const combined = msg + ' ' + src + ' ' + errorStack + ' ' + errorMessage;
        
        // FILTRE AGRESSIF 1: Détecter "deref" dans n'importe quel contexte
        // "deref" est très spécifique aux extensions et apparaît souvent seul
        if (combined.includes('deref') || combined.includes('Cannot read properties of null (reading \'deref\')')) {
            return true;
        }
        
        // FILTRE AGRESSIF 2: Détecter toutes les erreurs MutationObserver
        // Les extensions utilisent souvent MutationObserver et causent des erreurs
        if (combined.includes('MutationObserver')) {
            return true;
        }
        
        // Détecter les URLs d'extensions Chrome
        if (combined.includes('chrome-extension://') || 
            combined.includes('moz-extension://') ||
            combined.includes('safari-extension://')) {
            return true;
        }
        
        // Détecter les erreurs dans content_script.js et background.js
        // Vérifier dans le message, la source ET la stack trace
        if (combined.includes('content_script.js') || 
            combined.includes('background.js') ||
            combined.includes('content_script') ||
            errorStack.includes('content_script.js') ||
            errorStack.includes('background.js')) {
            return true;
        }
        
        // Détecter les erreurs spécifiques des extensions
        if (combined.includes('Attempting to use a disconnected port object') ||
            combined.includes('Error in event handler') ||
            combined.includes('Called encrypt() without a session key')) {
            return true;
        }
        
        return false;
    }
    
    // Filtrer les erreurs d'extensions via console.error
    console.error = function(...args) {
        const message = args.join(' ');
        // Extraire l'erreur si elle est dans les arguments
        const error = args.find(arg => arg instanceof Error);
        
        // Vérifier aussi dans tous les arguments (certains peuvent être des objets avec stack)
        let foundError = error;
        if (!foundError) {
            for (const arg of args) {
                if (arg && typeof arg === 'object' && arg.stack) {
                    foundError = arg;
                    break;
                }
            }
        }
        
        // Extraire la stack trace de tous les arguments
        let stackTrace = '';
        if (foundError) {
            stackTrace = foundError.stack || '';
        } else {
            // Chercher une stack trace dans les arguments string
            for (const arg of args) {
                if (typeof arg === 'string' && arg.includes('at ')) {
                    stackTrace += ' ' + arg;
                }
            }
        }
        
        if (isExtensionError(message, null, foundError || { stack: stackTrace })) {
            return; // Ignorer silencieusement
        }
        originalError.apply(console, args);
    };
    
    // Filtrer les warnings d'extensions
    console.warn = function(...args) {
        const message = args.join(' ');
        const error = args.find(arg => arg instanceof Error);
        
        // Vérifier aussi dans tous les arguments
        let foundError = error;
        if (!foundError) {
            for (const arg of args) {
                if (arg && typeof arg === 'object' && arg.stack) {
                    foundError = arg;
                    break;
                }
            }
        }
        
        let stackTrace = '';
        if (foundError) {
            stackTrace = foundError.stack || '';
        } else {
            for (const arg of args) {
                if (typeof arg === 'string' && arg.includes('at ')) {
                    stackTrace += ' ' + arg;
                }
            }
        }
        
        if (isExtensionError(message, null, foundError || { stack: stackTrace })) {
            return; // Ignorer silencieusement
        }
        originalWarn.apply(console, args);
    };
    
    // Intercepter window.onerror pour capturer les erreurs non gérées
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
        if (isExtensionError(message, source, error)) {
            return true; // Empêcher l'affichage de l'erreur
        }
        // Appeler le handler original s'il existe
        if (originalOnError) {
            return originalOnError.call(this, message, source, lineno, colno, error);
        }
        return false;
    };
    
    // Intercepter les erreurs non gérées de promesses
    window.addEventListener('unhandledrejection', function(event) {
        const reason = event.reason;
        const message = reason?.message || reason?.toString() || '';
        const stack = reason?.stack || '';
        const error = reason instanceof Error ? reason : null;
        
        if (isExtensionError(message + ' ' + stack, null, error)) {
            event.preventDefault(); // Empêcher l'affichage de l'erreur
            return;
        }
    });
}

/**
 * Point d'entrée principal de l'application
 */
async function initApp() {
    // Configurer le filtre console en premier pour ignorer les erreurs d'extensions
    setupConsoleFilter();
    
    console.log('[App] Initialisation...');
    
    // Initialiser le driver de stockage (détecte IndexedDB et migre si nécessaire)
    // IMPORTANT: Doit être complété avant SecurityService.init() pour que le PIN soit chargé
    if (Storage.initStorageDriver) {
        await Storage.initStorageDriver();
        
        // S'assurer que le driver est bien initialisé avant de continuer
        const driver = Storage.getCurrentDriver ? Storage.getCurrentDriver() : null;
        if (!driver) {
            console.warn('[App] Storage driver not initialized, retrying...');
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    // Charger le state depuis le stockage
    state = Storage.loadState();
    
    // Initialiser analytics si disponible
    if (window.Analytics && window.Analytics.initAnalytics) {
        await window.Analytics.initAnalytics();
    }
    
    // Enregistrer le hook analytics dans Store
    if (window.Store && window.Analytics && window.Analytics.updateAnalytics) {
        window.Store.registerHook('analytics', window.Analytics.updateAnalytics);
    }
    
    // Initialiser SecurityService (charge le PIN si défini)
    // IMPORTANT: Après initStorageDriver() pour que getIndexedDBDriver() fonctionne
    if (window.Security && window.Security.init) {
        await window.Security.init();
    }
    
    // Mettre à jour l'icône de verrouillage
    if (window.updateLockIcon) {
        window.updateLockIcon();
    }
    
    // Initialiser l'application via la feature Init
    await Init.init(state);
    
    // Mettre à jour l'icône de verrouillage après initialisation
    if (window.updateLockIcon) {
        window.updateLockIcon();
    }
    
    // Mettre à jour la visibilité du menu du bas
    if (window.updateBottomNavVisibility) {
        window.updateBottomNavVisibility();
    }
    
    // Mettre à jour la visibilité de l'icône de verrouillage
    if (window.updateLockIconVisibility) {
        window.updateLockIconVisibility();
    }
    
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
