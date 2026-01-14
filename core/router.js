/**
 * router.js - Navigation SPA simple basée sur le hash
 * 
 * Fonctionnalités:
 * - Navigation par hash (#home, #craving, #checkin, #settings)
 * - Historique du navigateur
 * - Callbacks pour chaque route
 */

// Configuration des routes
const routes = {
    '': 'home',
    'home': 'home',
    'craving': 'craving',
    'checkin': 'checkin',
    'settings': 'settings',
    'history': 'history',
    'dashboard': 'dashboard'
};

// Callbacks enregistrés pour chaque route
let routeCallbacks = {};

// Route actuelle
let currentRoute = '';

// Flag pour forcer le re-render même si on est déjà sur la route
let forceRender = false;

/**
 * Initialise le router et écoute les changements de hash
 */
function initRouter() {
    // Écouter les changements de hash (sans forcer)
    window.addEventListener('hashchange', () => handleRouteChange(false));
    
    // Gérer la route initiale
    handleRouteChange(false);
}

/**
 * Gère le changement de route
 * @param {boolean} force - Force le re-render même si on est déjà sur la route
 */
function handleRouteChange(force = false) {
    const hash = window.location.hash.slice(1) || 'home';
    const route = routes[hash] || 'home';
    
    // Éviter de re-renderer si même route (sauf si force est true)
    if (route === currentRoute && !force && !forceRender) {
        forceRender = false; // Reset le flag
        return;
    }
    
    // Reset le flag après utilisation
    forceRender = false;
    
    // Vérifier si la route est accessible (protection verrouillage)
    if (typeof window !== 'undefined' && window.canAccessRoute) {
        if (!window.canAccessRoute(route)) {
            // Route bloquée, rediriger vers home ou afficher modal de déverrouillage
            if (window.Security && window.Security.isLocked && window.Security.isLocked()) {
                // Afficher le modal de déverrouillage
                if (window.showUnlockModal) {
                    window.showUnlockModal();
                }
                // Revenir à la route précédente ou home
                if (currentRoute && window.canAccessRoute(currentRoute)) {
                    window.location.hash = currentRoute;
                } else {
                    window.location.hash = 'home';
                }
                return;
            }
        }
    }
    
    currentRoute = route;
    
    // Appeler le callback de la route
    if (routeCallbacks[route]) {
        routeCallbacks[route]();
    }
    
    // Mettre à jour la navigation active
    updateNavigation(route);
}

/**
 * Navigue vers une route
 * @param {string} route - Nom de la route
 * @param {boolean} force - Force le re-render même si on est déjà sur la route
 */
function navigateTo(route, force = false) {
    // Vérifier si la route est accessible (protection verrouillage)
    if (typeof window !== 'undefined' && window.canAccessRoute) {
        if (!window.canAccessRoute(route)) {
            // Route bloquée, afficher modal de déverrouillage
            if (window.Security && window.Security.isLocked && window.Security.isLocked()) {
                if (window.showUnlockModal) {
                    window.showUnlockModal();
                }
                return;
            }
        }
    }
    
    // Si on est déjà sur cette route et qu'on veut forcer, activer le flag
    if (route === currentRoute && force) {
        forceRender = true;
        // Forcer le changement de hash pour déclencher hashchange
        const currentHash = window.location.hash;
        window.location.hash = route === 'home' ? '' : route;
        // Si le hash n'a pas changé (déjà sur la route), forcer manuellement
        if (window.location.hash === currentHash) {
            handleRouteChange(true);
        }
    } else {
        window.location.hash = route === 'home' ? '' : route;
    }
}

/**
 * Enregistre un callback pour une route
 * @param {string} route - Nom de la route
 * @param {Function} callback - Fonction à appeler
 */
function onRoute(route, callback) {
    routeCallbacks[route] = callback;
}

/**
 * Met à jour l'état actif de la navigation
 * @param {string} route - Route active
 */
function updateNavigation(route) {
    // Mettre à jour la visibilité de l'icône de verrouillage
    if (typeof window !== 'undefined' && window.updateLockIconVisibility) {
        window.updateLockIconVisibility();
    }
    // Masquer tous les écrans
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Afficher l'écran correspondant
    const activeScreen = document.getElementById(`screen-${route}`);
    if (activeScreen) {
        activeScreen.classList.add('active');
    }
    
    // Mettre à jour les liens de navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkRoute = link.getAttribute('data-route');
        link.classList.toggle('active', linkRoute === route);
    });
}

/**
 * Retourne la route actuelle
 * @returns {string}
 */
function getCurrentRoute() {
    return currentRoute;
}

/**
 * Revenir à la page précédente
 */
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        navigateTo('home');
    }
}

// Export global
window.Router = {
    init: initRouter,
    navigateTo,
    onRoute,
    getCurrentRoute,
    goBack,
    updateNavigation
};
