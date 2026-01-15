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
// SERVICE CONTAINER
// ============================================
import { registerServices } from './Services/ServiceRegistry.js';
import container from './Services/ServiceContainer.js';

// ============================================
// FILTRE CONSOLE - INITIALISATION PRÉCOCE
// ============================================
// Initialisation IMMÉDIATE du filtre console pour capturer les erreurs d'extensions
// qui se produisent avant DOMContentLoaded
import { ConsoleErrorFilter } from './Utils/ConsoleErrorFilter.js';
const earlyErrorFilter = new ConsoleErrorFilter();
earlyErrorFilter.setup();

// ============================================
// STATE GLOBAL
// ============================================
let state = null;

/**
 * Point d'entrée principal de l'application
 */
async function initApp() {
    // ============================================
    // INITIALISER LE SERVICE CONTAINER
    // ============================================
    // Enregistrer tous les services AVANT toute autre initialisation
    await registerServices();
    
    // Le filtre console a déjà été initialisé de manière précoce au chargement du module
    // pour capturer les erreurs d'extensions qui se produisent avant DOMContentLoaded
    // Le service ConsoleErrorFilterService est disponible si nécessaire pour d'autres usages
    
    console.log('[App] Initialisation...');
    
    // Exposer les services sur window.* pour compatibilité avec le code existant
    try {
        const storage = await container.get('storage');
        if (storage && !window.Storage) {
            window.Storage = storage;
        }
        
        const security = await container.get('security');
        if (security && !window.Security) {
            window.Security = security;
        }
        
        const store = await container.get('store');
        if (store && !window.Store) {
            window.Store = {
                update: store.update,
                registerHook: store.registerHook || (() => {}),
                initSecurityHook: store.initSecurityHook || (() => {})
            };
        }
        
        // Initialiser le hook security dans Store avec le SecurityService injecté
        if (store && store.initSecurityHook && security) {
            store.initSecurityHook(security);
        }
        
        const analytics = await container.get('analytics');
        if (analytics && !window.Analytics) {
            window.Analytics = analytics;
        }
    } catch (error) {
        console.warn('[App] Erreur lors de l\'exposition des services:', error);
    }
    
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
    const storage = await container.get('storage').catch(() => null);
    if (storage?.initStorageDriver) {
        await storage.initStorageDriver();
        
        // S'assurer que le driver est bien initialisé avant de continuer
        const driver = storage.getCurrentDriver ? storage.getCurrentDriver() : null;
        if (!driver) {
            console.warn('[App] Storage driver not initialized, retrying...');
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    } else if (typeof window !== 'undefined' && window.Storage?.initStorageDriver) {
        // Fallback pour compatibilité
        await window.Storage.initStorageDriver();
    }
    
    // Charger le state depuis le stockage
    if (storage?.loadState) {
        state = await storage.loadState();
    } else if (typeof window !== 'undefined' && window.Storage?.loadState) {
        state = window.Storage.loadState();
    }
    
    // Initialiser analytics si disponible
    const analytics = await container.get('analytics').catch(() => null);
    if (analytics?.initAnalytics) {
        await analytics.initAnalytics();
    } else if (window.Analytics?.initAnalytics) {
        await window.Analytics.initAnalytics();
    }
    
    // Enregistrer le hook analytics dans Store
    const store = await container.get('store').catch(() => null);
    if (store?.registerHook && analytics?.updateAnalytics) {
        store.registerHook('analytics', analytics.updateAnalytics);
    } else if (window.Store?.registerHook && window.Analytics?.updateAnalytics) {
        window.Store.registerHook('analytics', window.Analytics.updateAnalytics);
    }
    
    // Initialiser SecurityService (charge le PIN si défini)
    // IMPORTANT: Après initStorageDriver() pour que getIndexedDBDriver() fonctionne
    const security = await container.get('security').catch(() => null);
    if (security?.init) {
        await security.init();
    } else if (window.Security?.init) {
        await window.Security.init();
    }
    
    // Initialiser le hook security dans Store avec le SecurityService injecté
    if (store?.initSecurityHook && security) {
        store.initSecurityHook(security);
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
