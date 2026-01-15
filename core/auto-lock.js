/**
 * auto-lock.js - Gestion du verrouillage automatique après inactivité
 */

let inactivityTimer = null;
let autoLockEnabled = false;
let autoLockDelay = 60000; // 1 minute par défaut (en millisecondes)
let isInitialized = false;
let eventListenersAttached = false;

/**
 * Initialise le système de verrouillage automatique
 * @param {Object} state - State de l'application
 */
function initAutoLock(state) {
    if (!state || !state.settings) {
        console.warn('[AutoLock] State invalide, utilisation des valeurs par défaut');
        autoLockEnabled = false;
        autoLockDelay = 60000;
        return;
    }

    // Récupérer la configuration depuis le state
    const autoLockConfig = state.settings.autoLock || { enabled: false, delay: 60000 };
    autoLockEnabled = autoLockConfig.enabled || false;
    autoLockDelay = autoLockConfig.delay || 60000;

    // Vérifier que le PIN est activé avant de démarrer
    if (autoLockEnabled && typeof window.Security !== 'undefined' && window.Security.isEnabled) {
        const pinEnabled = window.Security.isEnabled();
        if (!pinEnabled) {
            console.warn('[AutoLock] PIN non activé, désactivation du verrouillage automatique');
            autoLockEnabled = false;
        }
    }

    // Arrêter le timer existant
    stopTimer();

    // Attacher les écouteurs d'événements si pas déjà fait
    if (!eventListenersAttached) {
        attachEventListeners();
        eventListenersAttached = true;
    }

    // Démarrer le timer si activé
    if (autoLockEnabled) {
        startTimer();
    }

    isInitialized = true;
    console.log('[AutoLock] Initialisé:', { enabled: autoLockEnabled, delay: autoLockDelay });
}

/**
 * Attache les écouteurs d'événements pour détecter l'activité utilisateur
 */
function attachEventListeners() {
    // Événements utilisateur qui réinitialisent le timer
    const events = ['mousedown', 'mousemove', 'keypress', 'keydown', 'scroll', 'touchstart', 'touchmove', 'click'];
    
    events.forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });

    // Gestion de la visibilité de l'onglet
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

/**
 * Gère le changement de visibilité de l'onglet
 */
function handleVisibilityChange() {
    if (document.hidden) {
        // Onglet en arrière-plan : suspendre le timer
        stopTimer();
    } else {
        // Onglet redevient visible : reprendre le timer
        if (autoLockEnabled) {
            resetTimer();
        }
    }
}

/**
 * Réinitialise le timer d'inactivité
 */
function resetTimer() {
    if (!autoLockEnabled) return;
    
    // Ne pas réinitialiser si l'app est déjà verrouillée
    if (window.Security && window.Security.isLocked && window.Security.isLocked()) {
        return;
    }

    // Ne pas réinitialiser si le PIN n'est pas activé
    if (window.Security && window.Security.isEnabled && !window.Security.isEnabled()) {
        return;
    }

    // Ne pas réinitialiser si l'onglet est en arrière-plan
    if (document.hidden) {
        return;
    }

    clearTimeout(inactivityTimer);
    startTimer();
}

/**
 * Démarre le timer d'inactivité
 */
function startTimer() {
    if (!autoLockEnabled) return;

    // Vérifier que le PIN est activé
    if (window.Security && window.Security.isEnabled && !window.Security.isEnabled()) {
        console.warn('[AutoLock] PIN non activé, arrêt du timer');
        return;
    }

    // Ne pas démarrer si déjà verrouillé
    if (window.Security && window.Security.isLocked && window.Security.isLocked()) {
        return;
    }

    clearTimeout(inactivityTimer);

    inactivityTimer = setTimeout(() => {
        // Vérifier à nouveau avant de verrouiller
        if (window.Security && window.Security.lock && window.Security.isEnabled && window.Security.isEnabled()) {
            const isLocked = window.Security.isLocked && window.Security.isLocked();
            
            if (!isLocked) {
                console.log('[AutoLock] Verrouillage automatique après inactivité');
                window.Security.lock();
                
                // Mettre à jour l'UI
                if (typeof updateLockIcon === 'function') {
                    updateLockIcon();
                }
                if (typeof updateBottomNavVisibility === 'function') {
                    updateBottomNavVisibility();
                }
                
                // Toujours rediriger vers home pour afficher la vue verrouillée
                if (typeof window.Router !== 'undefined' && window.Router.navigateTo) {
                    window.Router.navigateTo('home', true); // force=true pour forcer le re-render
                }
                
                // Afficher un toast informatif
                if (typeof UI !== 'undefined' && typeof I18n !== 'undefined') {
                    const state = window.state;
                    const lang = state?.profile?.lang || 'fr';
                    const msg = lang === 'fr' ? 'Application verrouillée automatiquement' :
                               lang === 'en' ? 'App automatically locked' :
                               'تم قفل التطبيق تلقائياً';
                    UI.showToast(msg, 'info');
                }
            }
        }
    }, autoLockDelay);
}

/**
 * Arrête le timer d'inactivité
 */
function stopTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
}

/**
 * Met à jour la configuration du verrouillage automatique
 * @param {boolean} enabled - Activé ou non
 * @param {number} delay - Délai en millisecondes
 */
function updateConfig(enabled, delay) {
    autoLockEnabled = enabled;
    autoLockDelay = delay || 60000;

    // Arrêter le timer actuel
    stopTimer();

    // Redémarrer si activé
    if (autoLockEnabled) {
        // Vérifier que le PIN est activé
        if (window.Security && window.Security.isEnabled && window.Security.isEnabled()) {
            startTimer();
        } else {
            console.warn('[AutoLock] PIN non activé, impossible d\'activer le verrouillage automatique');
            autoLockEnabled = false;
        }
    }
}

/**
 * Réinitialise le timer après déverrouillage
 * À appeler après un déverrouillage manuel ou automatique
 */
function resetAfterUnlock() {
    if (autoLockEnabled) {
        resetTimer();
    }
}

/**
 * Vérifie si le verrouillage automatique est activé
 * @returns {boolean}
 */
function isAutoLockEnabled() {
    return autoLockEnabled;
}

/**
 * Obtient le délai actuel
 * @returns {number} Délai en millisecondes
 */
function getAutoLockDelay() {
    return autoLockDelay;
}

// Exposer globalement
if (typeof window !== 'undefined') {
    window.AutoLock = {
        init: initAutoLock,
        resetTimer: resetTimer,
        startTimer: startTimer,
        stopTimer: stopTimer,
        updateConfig: updateConfig,
        resetAfterUnlock: resetAfterUnlock,
        isEnabled: isAutoLockEnabled,
        getDelay: getAutoLockDelay
    };
}
