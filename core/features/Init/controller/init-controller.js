/**
 * Init Controller - Orchestration Model/View
 */

import { InitModel } from '../model/init-model.js';
import { InitView } from '../view/init-view.js';

export class InitController {
    constructor() {
        this.model = new InitModel();
        this.view = new InitView();
    }

    /**
     * Initialise l'application
     * @param {Object} state - State de l'application
     * @returns {Promise<void>}
     */
    async init(state) {
        await this.model.init(state);
        
        // Configurer les routes
        this.setupRoutes();
        
        // Initialiser le router
        Router.init();
        
        // Appliquer les traductions à l'UI statique
        this.applyTranslations();
        
        // Écouter les événements globaux
        this.setupEventListeners();
        
        // Appliquer le thème sauvegardé
        this.model.applyTheme(state);
        
        // Vérifier si c'est la première utilisation (onboarding)
        if (this.needsOnboarding(state)) {
            if (typeof Onboarding !== 'undefined' && Onboarding.show) {
                Onboarding.show(state);
            }
        } else {
            if (typeof Onboarding !== 'undefined' && Onboarding.hide) {
                Onboarding.hide();
            }
        }
    }

    /**
     * Configure les routes
     */
    setupRoutes() {
        Router.onRoute('home', () => {
            const state = typeof window !== 'undefined' ? window.state : null;
            if (state && typeof Home !== 'undefined' && Home.render) {
                Home.render(state);
            }
        });
        
        Router.onRoute('craving', () => {
            const state = typeof window !== 'undefined' ? window.state : null;
            if (state && typeof Craving !== 'undefined' && Craving.render) {
                Craving.render(state);
            }
        });
        
        Router.onRoute('checkin', () => {
            const state = typeof window !== 'undefined' ? window.state : null;
            if (state && typeof Checkin !== 'undefined' && Checkin.render) {
                Checkin.render(state);
            }
        });
        
        Router.onRoute('history', () => {
            const state = typeof window !== 'undefined' ? window.state : null;
            if (state && typeof History !== 'undefined' && History.render) {
                History.render(state);
            }
        });
        
        Router.onRoute('dashboard', () => {
            const state = typeof window !== 'undefined' ? window.state : null;
            if (state && typeof Dashboard !== 'undefined' && Dashboard.render) {
                const renderCoachingWidget = typeof Home !== 'undefined' ? Home.renderCoachingWidget : () => '';
                const renderInsightFallback = typeof Home !== 'undefined' ? Home.renderInsightFallback : () => '';
                Dashboard.render(state, renderCoachingWidget, renderInsightFallback);
            }
        });
        
        Router.onRoute('settings', async () => {
            const state = typeof window !== 'undefined' ? window.state : null;
            if (state && typeof Settings !== 'undefined' && Settings.render) {
                await Settings.render(state);
            }
        });
        
        Router.onRoute('coaching', () => {
            const state = typeof window !== 'undefined' ? window.state : null;
            if (state && typeof Coaching !== 'undefined' && Coaching.openCoaching) {
                Coaching.openCoaching(state);
            }
        });
    }

    /**
     * Configure les écouteurs d'événements globaux
     */
    setupEventListeners() {
        // Navigation - Utiliser la délégation d'événements pour éviter les problèmes de réattachement
        // Attacher l'event listener sur le conteneur parent (nav) plutôt que sur chaque lien
        const navContainer = document.querySelector('nav.nav');
        
        if (navContainer) {
            // Supprimer les anciens listeners si existent
            if (this.handleNavClick) {
                navContainer.removeEventListener('click', this.handleNavClick);
            }
            
            // Créer une fonction liée pour pouvoir la supprimer plus tard
            this.handleNavClick = (e) => {
                const link = e.target.closest('.nav-link[data-route]');
                if (link) {
                    e.preventDefault();
                    const route = link.getAttribute('data-route');
                    if (route) {
                        // Forcer le re-render même si on est déjà sur la route
                        Router.navigateTo(route, true);
                    }
                }
            };
            
            navContainer.addEventListener('click', this.handleNavClick);
        } else {
            // Fallback : attacher sur chaque lien si le conteneur n'existe pas encore
            document.querySelectorAll('.nav-link[data-route]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const route = link.getAttribute('data-route');
                    if (route) {
                        // Forcer le re-render même si on est déjà sur la route
                        Router.navigateTo(route, true);
                    }
                });
            });
        }
        
        // Gérer aussi les boutons du header avec data-route et data-action
        // Utiliser la délégation d'événements sur document.body pour capturer tous les clics
        if (!this.handleHeaderClick) {
            this.handleHeaderClick = (e) => {
                // Vérifier si le clic est sur un nav-link dans le header
                const link = e.target.closest('.header .nav-link[data-route]');
                if (link) {
                    e.preventDefault();
                    const route = link.getAttribute('data-route');
                    if (route && typeof Router !== 'undefined') {
                        // Forcer le re-render même si on est déjà sur la route
                        Router.navigateTo(route, true);
                    }
                    return;
                }
                
                // Vérifier si le clic est sur un bouton avec data-action dans le header
                const button = e.target.closest('.header button[data-action]');
                if (button) {
                    e.preventDefault();
                    const action = button.getAttribute('data-action');
                    
                    if (action === 'toggle-lock') {
                        // Gérer le verrouillage/déverrouillage
                        if (typeof window.toggleAppLock === 'function') {
                            window.toggleAppLock();
                        } else {
                            console.warn('[Init] toggleAppLock not available, lock.js may not be loaded');
                        }
                    } else if (action === 'navigate') {
                        const route = button.getAttribute('data-route');
                        if (route && typeof Router !== 'undefined') {
                            Router.navigateTo(route, true);
                        }
                    }
                }
            };
            
            // Attacher sur document.body pour capturer tous les clics
            document.body.addEventListener('click', this.handleHeaderClick);
        }
        
        // Note: toggleAppLock est exposé dans lock.js et sera disponible une fois lock.js chargé
        // La délégation d'événements permet de gérer les clics même si la fonction n'est pas encore disponible
    }

    /**
     * Applique les traductions à l'UI statique
     */
    applyTranslations() {
        this.view.applyTranslations();
    }

    /**
     * Vérifie si l'onboarding est nécessaire
     * @param {Object} state - State de l'application
     * @returns {boolean}
     */
    needsOnboarding(state) {
        return !state.addictions || state.addictions.length === 0;
    }
}
