/**
 * app.js - Point d'entrée principal de l'application Haven V5
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
import { Commitments } from './features/Commitments/commitments.js';

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
        
        // Normaliser pour recherche case-insensitive
        const combinedLower = combined.toLowerCase();
        
        // Vérifier le nom de l'erreur et le nom du constructeur pour détecter les erreurs typées
        // Cela capture FrameIsBrowserFrameError et autres erreurs typées des extensions
        if (error) {
            const errorName = (error.name || '').toString().toLowerCase();
            const constructorName = (error.constructor?.name || '').toString().toLowerCase();
            if (errorName.includes('frameisbrowserframeerror') || 
                constructorName.includes('frameisbrowserframeerror')) {
                return true;
            }
        }
        
        // FILTRE AGRESSIF 1: Détecter "deref" dans n'importe quel contexte
        // "deref" est très spécifique aux extensions et apparaît souvent seul
        // Détecter toutes les variantes : "deref", ".deref()", "reading 'deref'", etc.
        if (combinedLower.includes('deref') || 
            combined.includes('Cannot read properties of null (reading \'deref\')') ||
            combined.includes('Cannot read property \'deref\'') ||
            combined.match(/\.deref\s*\(/)) {
            return true;
        }
        
        // FILTRE AGRESSIF 2: Détecter toutes les erreurs MutationObserver
        // Les extensions utilisent souvent MutationObserver et causent des erreurs
        if (combinedLower.includes('mutationobserver')) {
            return true;
        }
        
        // FILTRE AGRESSIF 3: Détecter les patterns d'extensions modernes
        // WeakRef et FinalizationRegistry sont utilisés par les extensions modernes
        if (combinedLower.includes('weakref') || 
            combinedLower.includes('finalizationregistry')) {
            return true;
        }
        
        // Détecter les URLs d'extensions Chrome (plus agressif)
        if (combinedLower.includes('chrome-extension://') || 
            combinedLower.includes('moz-extension://') ||
            combinedLower.includes('safari-extension://') ||
            combinedLower.includes('extension://')) {
            return true;
        }
        
        // Détecter les erreurs dans content_script.js et background.js
        // Vérifier dans le message, la source ET la stack trace
        // Accepter aussi juste le nom de fichier sans chemin complet
        if (combinedLower.includes('content_script.js') || 
            combinedLower.includes('background.js') ||
            combinedLower.includes('content_script') ||
            combinedLower.includes('background_script') ||
            // Détecter même si c'est juste le nom de fichier dans le message
            msg.includes('content_script.js') ||
            src.includes('content_script.js') ||
            errorStack.includes('content_script.js') ||
            errorStack.includes('background.js')) {
            return true;
        }
        
        // Détecter FrameIsBrowserFrameError et les erreurs de frames de navigateur
        // Cette erreur se produit quand une extension tente d'injecter un content script
        // dans un frame de navigateur (chrome://, about:, etc.)
        if (combinedLower.includes('frameisbrowserframeerror') ||
            combinedLower.includes('is a browser frame') ||
            (combinedLower.includes('frame') && combinedLower.includes('browser frame'))) {
            return true;
        }
        
        // Détecter les erreurs spécifiques des extensions
        // Amélioration : détecter toutes les variantes de "disconnected port"
        if (combinedLower.includes('attempting to use a disconnected port object') ||
            combinedLower.includes('disconnected port object') ||
            combinedLower.includes('disconnected port') ||
            combinedLower.includes('error in event handler') ||
            combinedLower.includes('called encrypt() without a session key') ||
            combinedLower.includes('extension context invalidated') ||
            combinedLower.includes('message port closed')) {
            return true;
        }
        
        // Détecter les patterns de stack trace typiques des extensions
        // Souvent les extensions ont des stack traces avec leur ID dans l'URL
        if (errorStack && (
            /chrome-extension:\/\/[a-z]+\/content_script\.js/i.test(errorStack) ||
            /moz-extension:\/\/[a-z]+\/content_script\.js/i.test(errorStack) ||
            /at.*content_script\.js.*\d+:\d+/i.test(errorStack)
        )) {
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
    
    // Intercepter aussi via addEventListener('error') pour capturer plus d'erreurs
    // Cela capture les mêmes erreurs que window.onerror mais peut être plus fiable
    window.addEventListener('error', function(event) {
        const message = event.message || '';
        const source = event.filename || event.source || '';
        const error = event.error;
        
        if (isExtensionError(message, source, error)) {
            event.preventDefault(); // Empêcher l'affichage de l'erreur
            event.stopPropagation(); // Empêcher la propagation
            return false;
        }
    }, true); // Utiliser capture phase pour intercepter plus tôt
    
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
    
    // Initialiser window.runtime pour flags d'urgence
    if (!window.runtime) {
        window.runtime = {
            emergencyActive: false,
            emergencySource: null,
            lastEmergencyEndedAt: null
        };
    }
    
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
    
    // Initialiser le verrouillage automatique après que Security soit prêt
    if (window.AutoLock && window.AutoLock.init) {
        window.AutoLock.init(state);
    }
    
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
