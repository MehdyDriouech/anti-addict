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

/**
 * Initialise le router et écoute les changements de hash
 */
function initRouter() {
    // Écouter les changements de hash
    window.addEventListener('hashchange', handleRouteChange);
    
    // Gérer la route initiale
    handleRouteChange();
}

/**
 * Gère le changement de route
 */
function handleRouteChange() {
    const hash = window.location.hash.slice(1) || 'home';
    const route = routes[hash] || 'home';
    
    // Éviter de re-renderer si même route
    if (route === currentRoute) return;
    
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
 */
function navigateTo(route) {
    window.location.hash = route;
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
