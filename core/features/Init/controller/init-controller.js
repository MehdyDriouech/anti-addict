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
        
        Router.onRoute('settings', () => {
            const state = typeof window !== 'undefined' ? window.state : null;
            if (state && typeof Settings !== 'undefined' && Settings.render) {
                Settings.render(state);
            }
        });
    }

    /**
     * Configure les écouteurs d'événements globaux
     */
    setupEventListeners() {
        // Navigation - Utiliser les boutons avec data-route au lieu des IDs
        document.querySelectorAll('.nav-link[data-route]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                if (route) {
                    Router.navigateTo(route);
                }
            });
        });
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
