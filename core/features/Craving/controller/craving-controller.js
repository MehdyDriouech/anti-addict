/**
 * Craving Controller - Orchestration Model/View
 */

import { CravingModel } from '../model/craving-model.js';
import { CravingView } from '../view/craving-view.js';
import { getServices } from '../../../Utils/serviceHelper.js';

export class CravingController {
    constructor(services = {}) {
        // Services injectés
        this.storeService = services.store || null;
        this.uiService = services.ui || null;
        this.i18nService = services.i18n || null;
        this.storageService = services.storage || null;
        this.dateService = services.date || null;
        
        // Models et Views
        this.model = new CravingModel({ 
            storage: this.storageService, 
            dateService: this.dateService 
        });
        this.view = new CravingView();
        this.selectedAddictionId = null; // Addiction sélectionnée par l'utilisateur
        this.servicesInitialized = false;
    }

    /**
     * Initialise les services (peut être appelé de manière asynchrone)
     */
    async initServices() {
        if (this.servicesInitialized) {
            return;
        }

        try {
            const services = await getServices(['storage', 'date', 'store', 'ui', 'i18n']);
            
            this.storageService = services.storage || this.storageService;
            this.dateService = services.date || this.dateService;
            this.storeService = services.store || this.storeService;
            this.uiService = services.ui || this.uiService;
            this.i18nService = services.i18n || this.i18nService;
            
            // Réinitialiser le modèle avec les services injectés
            if (this.storageService || this.dateService) {
                this.model = new CravingModel({ 
                    storage: this.storageService, 
                    dateService: this.dateService 
                });
            }
            
            this.servicesInitialized = true;
        } catch (error) {
            console.warn('[CravingController] Erreur lors de l\'initialisation des services:', error);
        }
    }

    /**
     * Rend l'écran de craving
     * @param {Object} state - State de l'application
     */
    render(state) {
        // Initialiser window.runtime si nécessaire
        if (!window.runtime) window.runtime = {};
        window.runtime.emergencyActive = true;
        window.runtime.emergencySource = 'craving';
        window.runtime.lastEmergencyEndedAt = null;
        
        // Initialiser avec la première addiction si disponible
        const activeAddictions = state.addictions || [];
        if (activeAddictions.length > 0 && !this.selectedAddictionId) {
            this.selectedAddictionId = typeof activeAddictions[0] === 'string' 
                ? activeAddictions[0] 
                : activeAddictions[0].id;
        }
        
        const suggestedActions = this.model.getSuggestedActions(state, state.profile.lang);
        this.view.render(state, suggestedActions, state.profile.lang, this.selectedAddictionId);
        
        // Ne pas logger automatiquement le craving - attendre la sélection de l'addiction
        // Le craving sera loggé dans finish() avec l'addiction sélectionnée
        
        // Réinitialiser et démarrer le protocole
        this.model.resetProtocolState();
        this.startProtocol();
    }

    /**
     * Gère le changement d'addiction sélectionnée
     * @param {string} addictionId - ID de l'addiction sélectionnée
     * @param {Object} state - State de l'application
     */
    onAddictionChange(addictionId, state) {
        // Normaliser addictionId pour s'assurer que c'est une string
        this.selectedAddictionId = typeof addictionId === 'string' 
            ? addictionId 
            : (typeof addictionId === 'object' && addictionId.id ? addictionId.id : String(addictionId));
        
        // Re-rendre la vue avec la nouvelle addiction sélectionnée
        const suggestedActions = this.model.getSuggestedActions(state, state.profile.lang);
        this.view.render(state, suggestedActions, state.profile.lang, this.selectedAddictionId);
        
        // Logger le craving avec l'addiction sélectionnée
        this.model.storage?.addEvent(state, 'craving', this.selectedAddictionId);
    }

    /**
     * Démarre le protocole
     */
    startProtocol() {
        this.model.startProtocol(
            (seconds) => {
                this.view.updateProgress(seconds);
                this.view.updateSteps(seconds);
            },
            () => {
                this.view.markAllStepsCompleted();
            }
        );
        
        this.model.startBreathing((breathingState) => {
            this.view.updateBreathingDisplay(breathingState);
        });
    }

    /**
     * Marque une action comme faite
     * @param {HTMLElement} chip - Élément chip
     */
    markActionDone(chip) {
        chip.classList.toggle('done');
        if (chip.classList.contains('done')) {
            chip.innerHTML = '✓ ' + chip.textContent.replace('✓ ', '');
        }
    }

    /**
     * Ouvre le mode relapse depuis l'écran craving
     * @param {Object} state - State de l'application
     */
    openRelapse(state) {
        this.model.stopAllTimers();
        if (typeof window !== 'undefined' && window.Relapse?.openRelapseMode) {
            window.Relapse.openRelapseMode(state);
        }
    }

    /**
     * Met à jour l'intensité
     * @param {string} value - Valeur de l'intensité
     */
    updateIntensity(value) {
        this.model.updateIntensity(value);
        this.view.updateIntensity(value);
    }

    /**
     * Affiche un texte d'encouragement
     * @param {Object} state - State de l'application
     */
    showEncouragement(state) {
        this.view.showEncouragement(state);
    }

    /**
     * Confirme une étape du protocole
     */
    confirmStep() {
        this.view.confirmStep();
    }

    /**
     * Termine le protocole et retourne à l'accueil
     * @param {Object} state - State de l'application
     */
    async finish(state) {
        this.model.stopAllTimers();
        
        // S'assurer qu'une addiction est sélectionnée
        if (!this.selectedAddictionId) {
            const activeAddictions = state.addictions || [];
            this.selectedAddictionId = activeAddictions.length > 0 
                ? (typeof activeAddictions[0] === 'string' ? activeAddictions[0] : activeAddictions[0].id)
                : 'general';
        }
        
        // Logger le craving si pas encore fait (en mode urgence, même verrouillé)
        const todayISO = this.model.dateService?.todayISO() || (this.model.storage?.getDateISO ? this.model.storage.getDateISO() : (typeof Storage !== 'undefined' ? Storage.getDateISO() : new Date().toISOString().split('T')[0]));
        const existingCraving = state.events && state.events.find ? state.events.find(e => 
            e.type === 'craving' && 
            e.date === todayISO && 
            e.addictionId === this.selectedAddictionId
        ) : null;
        if (!existingCraving) {
            // Passer isEmergency pour permettre la sauvegarde même verrouillé
            const store = this.storeService || (typeof window !== 'undefined' ? window.Store : null);
            if (store?.update) {
                await store.update((draft) => {
                    if (!draft.events) draft.events = [];
                    const todayISO = this.model.dateService?.todayISO() || 
                                   (this.model.storage?.getDateISO ? this.model.storage.getDateISO() : 
                                    new Date().toISOString().split('T')[0]);
                    draft.events.push({
                        ts: Date.now(),
                        date: todayISO,
                        type: 'craving',
                        addictionId: this.selectedAddictionId
                    });
                }, { reason: 'emergency_used' });
            } else {
                this.model.storage?.addEvent(state, 'craving', this.selectedAddictionId);
            }
        }
        
        // Compter les actions faites
        const actionsDone = document.querySelectorAll('.action-chip.done').length;
        
        // Enregistrer une victoire avec l'intensité (en mode urgence)
        const store = this.storeService || (typeof window !== 'undefined' ? window.Store : null);
        if (store?.update) {
            await store.update((draft) => {
                if (!draft.events) draft.events = [];
                const todayISO = this.model.dateService?.todayISO() || 
                               (this.model.storage?.getDateISO ? this.model.storage.getDateISO() : 
                                new Date().toISOString().split('T')[0]);
                draft.events.push({
                    ts: Date.now(),
                    date: todayISO,
                    type: 'win',
                    addictionId: this.selectedAddictionId,
                    intensity: this.model.getIntensity()
                });
            }, { reason: 'emergency_used' });
        } else {
            this.model.storage?.addEvent(state, 'win', this.selectedAddictionId, this.model.getIntensity());
        }
        
        // Incrémenter les victoires invisibles (en mode urgence)
        if (typeof window !== 'undefined' && window.Wins?.recordWin) {
            window.Wins.recordWin(state, actionsDone > 0);
        } else if (store?.update) {
            // Fallback si Wins n'est pas disponible
            await store.update((draft) => {
                if (!draft.wins) {
                    draft.wins = { resistedCravings: 0, minutesSavedEstimate: 0, positiveActionsCount: 0 };
                }
                if (actionsDone > 0) {
                    draft.wins.positiveActionsCount = (draft.wins.positiveActionsCount || 0) + actionsDone;
                }
            }, { reason: 'emergency_used' });
        }
        
        // Unsetter flags runtime
        if (window.runtime) {
            window.runtime.emergencyActive = false;
            window.runtime.emergencySource = null;
            window.runtime.lastEmergencyEndedAt = Date.now();
        }
        
        // Message de succès
        const i18n = this.i18nService || (typeof window !== 'undefined' ? window.I18n : null);
        const message = i18n?.t('protocol_complete') || 'Protocole terminé';
        this.uiService?.showToast(message, 'success');
        
        // Retourner à l'accueil (reste verrouillé si l'app était verrouillée)
        // Forcer le re-render pour s'assurer que la vue se met à jour
        const router = await getServices(['router']).then(s => s.router).catch(() => null);
        if (router?.navigateTo) {
            router.navigateTo('home', true);
        } else if (typeof window !== 'undefined' && window.Router?.navigateTo) {
            window.Router.navigateTo('home', true);
        }
    }
}
