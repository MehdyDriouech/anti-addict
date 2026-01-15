/**
 * lock.js - Gestion du verrouillage de l'application
 */

/**
 * Met à jour l'icône de verrouillage dans le header
 */
function updateLockIcon() {
    const lockBtn = document.getElementById('lock-btn');
    if (!lockBtn) return;

    if (window.Security && window.Security.isLocked && window.Security.isLocked()) {
        lockBtn.textContent = '🔒';
        lockBtn.title = 'Déverrouiller';
    } else {
        lockBtn.textContent = '🔓';
        lockBtn.title = 'Verrouiller';
    }
}

/**
 * Met à jour la visibilité du menu du bas selon l'état de verrouillage
 */
function updateBottomNavVisibility() {
    const bottomNav = document.querySelector('nav.nav');
    if (!bottomNav) return;

    if (window.Security && window.Security.isLocked && window.Security.isLocked()) {
        // Masquer le menu du bas quand verrouillé
        bottomNav.style.display = 'none';
    } else {
        // Afficher le menu du bas quand déverrouillé
        bottomNav.style.display = '';
    }
}

/**
 * Met à jour la visibilité de l'icône de verrouillage selon la route
 */
function updateLockIconVisibility() {
    const lockBtn = document.getElementById('lock-btn');
    if (!lockBtn) return;

    // Obtenir la route actuelle
    const currentRoute = window.Router && window.Router.getCurrentRoute ? window.Router.getCurrentRoute() : null;
    
    // Masquer l'icône si on est dans les paramètres
    if (currentRoute === 'settings') {
        lockBtn.style.display = 'none';
    } else {
        lockBtn.style.display = '';
    }
}

/**
 * Bascule le verrouillage de l'application
 */
async function toggleAppLock() {
    if (!window.Security) {
        console.warn('[Lock] SecurityService not available');
        return;
    }

    // Empêcher le verrouillage depuis les paramètres
    const currentRoute = window.Router && window.Router.getCurrentRoute ? window.Router.getCurrentRoute() : null;
    if (currentRoute === 'settings') {
        if (typeof UI !== 'undefined') {
            const state = window.state;
            const lang = state?.profile?.lang || 'fr';
            const msg = lang === 'fr' ? 'Le verrouillage n\'est pas disponible depuis les paramètres' :
                       lang === 'en' ? 'Lock is not available from settings' :
                       'القفل غير متاح من الإعدادات';
            UI.showToast(msg, 'info');
        }
        return;
    }

    const isLocked = window.Security.isLocked && window.Security.isLocked();
    const isEnabled = window.Security.isEnabled && window.Security.isEnabled();

    if (!isEnabled) {
        // PIN non activé, ouvrir les réglages
        if (typeof Router !== 'undefined') {
            Router.navigateTo('settings');
        }
        if (typeof UI !== 'undefined') {
            const state = window.state;
            const lang = state?.profile?.lang || 'fr';
            const msg = lang === 'fr' ? 'Active d\'abord le verrouillage dans les réglages' :
                       lang === 'en' ? 'Enable lock in settings first' :
                       'قم بتفعيل القفل في الإعدادات أولاً';
            UI.showToast(msg, 'info');
        }
        return;
    }

    if (isLocked) {
        // Déverrouiller
        await showUnlockModal();
    } else {
        // Verrouiller
        window.Security.lock();
        updateLockIcon();
        updateBottomNavVisibility();
        
        // Toujours rediriger vers home pour afficher la vue verrouillée
        if (typeof window.Router !== 'undefined' && window.Router.navigateTo) {
            window.Router.navigateTo('home', true); // force=true pour forcer le re-render
        }
        
        const state = window.state;
        const lang = state?.profile?.lang || 'fr';
        const msg = lang === 'fr' ? 'Application verrouillée' :
                   lang === 'en' ? 'App locked' :
                   'تم قفل التطبيق';
        if (typeof UI !== 'undefined') {
            UI.showToast(msg, 'info');
        }
    }
}

/**
 * Affiche le modal de déverrouillage
 */
async function showUnlockModal() {
    const state = window.state;
    if (!state) return;

    const lang = state.profile.lang || 'fr';
    const labels = {
        fr: {
            title: 'Déverrouiller',
            message: 'Entre ton code PIN pour déverrouiller',
            pinLabel: 'Code PIN',
            unlock: 'OK',
            cancel: 'Annuler',
            wrongPin: 'Code PIN incorrect'
        },
        en: {
            title: 'Unlock',
            message: 'Enter your PIN code to unlock',
            pinLabel: 'PIN code',
            unlock: 'OK',
            cancel: 'Cancel',
            wrongPin: 'Wrong PIN code'
        },
        ar: {
            title: 'فتح القفل',
            message: 'أدخل رمز PIN لفتح القفل',
            pinLabel: 'رمز PIN',
            unlock: 'موافق',
            cancel: 'إلغاء',
            wrongPin: 'رمز PIN غير صحيح'
        }
    };
    const l = labels[lang] || labels.fr;

    const html = `
        <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--space-md);">
            ${l.message}
        </p>
        <div class="form-group">
            <label class="form-label">${l.pinLabel}</label>
            <input type="password" 
                   id="unlock-pin-input" 
                   class="form-input" 
                   inputmode="numeric" 
                   pattern="[0-9]*"
                   maxlength="10"
                   placeholder="1234"
                   autofocus>
        </div>
        <div id="unlock-error" class="error-message" style="display: none;"></div>
    `;

    if (typeof UI !== 'undefined') {
        UI.showModal(l.title, html, async () => {
            await handleUnlockPin(l, lang);
        }, false, 'dynamic-modal', l.unlock);
        
        // Ajouter listener sur Enter pour fermer automatiquement
        setTimeout(() => {
            const pinInput = document.getElementById('unlock-pin-input');
            if (pinInput) {
                pinInput.addEventListener('keypress', async (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        await handleUnlockPin(l, lang);
                    }
                });
            }
        }, 100);
    }
}

/**
 * Gère le déverrouillage avec le PIN
 * @private
 */
async function handleUnlockPin(l, lang) {
    const pinInput = document.getElementById('unlock-pin-input');
    if (!pinInput) return;

    const pin = pinInput.value.trim();
    const errorEl = document.getElementById('unlock-error');

    if (window.Security && window.Security.unlock) {
        const success = await window.Security.unlock(pin);
        if (success) {
            // Fermer le modal immédiatement
            if (typeof UI !== 'undefined') {
                UI.closeModal('dynamic-modal');
            }
            
            // CORRECTION: Ordre d'exécution optimisé
            // 1. Mettre à jour l'icône de verrouillage
            updateLockIcon();
            
            // 2. Afficher le menu du bas AVANT d'attacher les listeners
            updateBottomNavVisibility();
            
            // 3. Attendre que le DOM soit mis à jour (le menu doit être visible)
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // 4. Vérifier que le menu est bien visible
            const navContainer = document.querySelector('nav.nav');
            if (!navContainer || navContainer.style.display === 'none') {
                console.warn('[Lock] Déverrouillage - Menu du bas non visible, réaffichage...');
                if (navContainer) {
                    navContainer.style.display = '';
                }
            }
            
            // 5. Réattacher les event listeners du menu du bas
            if (typeof Init !== 'undefined' && Init.setupEventListeners) {
                Init.setupEventListeners();
            } else {
                console.warn('[Lock] Déverrouillage - Init.setupEventListeners non disponible');
            }
            
            // Re-render la home pour afficher la vue normale (seulement si on est sur home)
            const currentRoute = window.Router && window.Router.getCurrentRoute ? window.Router.getCurrentRoute() : null;
            console.log('[Lock] Déverrouillage - Route actuelle:', currentRoute);
            
            if (currentRoute === 'home' && typeof Home !== 'undefined' && Home.render && window.state) {
                console.log('[Lock] Déverrouillage - Étape 4: Re-render home');
                Home.render(window.state);
            }
            
            // Réinitialiser le timer de verrouillage automatique après déverrouillage
            if (typeof window.AutoLock !== 'undefined' && window.AutoLock.resetAfterUnlock) {
                window.AutoLock.resetAfterUnlock();
            }
            
            const successMsg = lang === 'fr' ? 'Application déverrouillée' :
                             lang === 'en' ? 'App unlocked' :
                             'تم فتح القفل';
            if (typeof UI !== 'undefined') {
                UI.showToast(successMsg, 'success');
            }
        } else {
            if (errorEl) {
                errorEl.textContent = l.wrongPin;
                errorEl.style.display = 'block';
            }
            // Réinitialiser le champ
            pinInput.value = '';
            pinInput.focus();
        }
    }
}

/**
 * Vérifie si une route est une route d'urgence (accessible même verrouillée)
 * @param {string} route - Route à vérifier
 * @returns {boolean}
 */
function isEmergencyRoute(route) {
    return route === 'craving' || route === 'sos';
}

/**
 * Vérifie si l'accès à une route est autorisé
 * @param {string} route - Route à vérifier
 * @returns {boolean}
 */
function canAccessRoute(route) {
    if (!window.Security || !window.Security.isEnabled || !window.Security.isLocked) {
        return true; // Pas de sécurité activée
    }

    const isEnabled = window.Security.isEnabled();
    const isLocked = window.Security.isLocked();

    if (!isEnabled || !isLocked) {
        return true; // Pas verrouillé
    }

    // Si verrouillé, les routes d'urgence ET la home sont accessibles
    // (la home affiche la vue verrouillée mais reste accessible)
    return isEmergencyRoute(route) || route === 'home';
}

// Exposer globalement
if (typeof window !== 'undefined') {
    window.toggleAppLock = toggleAppLock;
    window.updateLockIcon = updateLockIcon;
    window.updateLockIconVisibility = updateLockIconVisibility;
    window.updateBottomNavVisibility = updateBottomNavVisibility;
    window.isEmergencyRoute = isEmergencyRoute;
    window.canAccessRoute = canAccessRoute;
    window.showUnlockModal = showUnlockModal;
}
