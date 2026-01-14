/**
 * SOS Controller - Orchestration Model/View
 */

import { SOSModel } from '../model/sos-model.js';
import { SOSView } from '../view/sos-view.js';
import { LABELS } from '../data/sos-data.js';

export class SOSController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.breathingInterval = null;
        this.breathingPhase = 'inhale';
        this.breathingCount = 4;
        this.breathingCycle = 0;
        this.breathingTotalSeconds = 60;
        this.breathingRunning = false;
    }

    /**
     * Active l'écran SOS
     * @param {Object} state - State de l'application
     */
    activate(state) {
        // Initialiser window.runtime si nécessaire
        if (!window.runtime) window.runtime = {};
        window.runtime.emergencyActive = true;
        window.runtime.emergencySource = 'sos';
        window.runtime.lastEmergencyEndedAt = null;
        
        this.model.activate(state);
        
        // Créer l'élément DOM si nécessaire
        this.view.createScreenElement();
        
        // Récupérer les données nécessaires
        const lang = state.profile.lang;
        const lowTextMode = this.model.getLowTextMode();
        const actionsToShow = this.model.getSOSActions(state, lang, lowTextMode ? 4 : 6);
        
        // Carte spirituelle si activée
        let spiritualCard = null;
        if (state.profile.spiritualEnabled && state.profile.religion !== 'none') {
            if (typeof I18n !== 'undefined' && I18n.getSpiritualCards) {
                const cards = I18n.getSpiritualCards();
                if (cards && cards.length > 0) {
                    spiritualCard = cards[Math.floor(Math.random() * cards.length)];
                }
            }
        }
        
        // Rendre l'écran
        this.view.renderSOSScreen(state, actionsToShow, spiritualCard, lowTextMode);
        this.view.show();
    }

    /**
     * Désactive l'écran SOS
     */
    deactivate() {
        // Unsetter flags runtime
        if (window.runtime) {
            window.runtime.emergencyActive = false;
            window.runtime.emergencySource = null;
            window.runtime.lastEmergencyEndedAt = Date.now();
        }
        
        this.model.deactivate();
        this.view.hide();
        
        if (typeof renderHome === 'function') {
            renderHome();
        }
    }

    /**
     * Vérifie si le SOS est actif
     * @returns {boolean}
     */
    isActive() {
        return this.model.isActive();
    }

    /**
     * Exécute une action depuis le SOS
     * @param {string} actionId - ID de l'action
     */
    executeAction(actionId) {
        if (typeof Actions !== 'undefined') {
            Actions.executeAction(actionId, 'sos');
        }
        
        // Highlight visuel
        this.view.highlightAction(actionId);
    }

    /**
     * Action aléatoire
     * @param {Object} state - State de l'application
     */
    randomAction(state) {
        if (typeof Actions !== 'undefined') {
            const action = Actions.getRandomAction(state, state.profile.lang, true);
            if (action) {
                Actions.executeAction(action.id, 'sos');
                
                // Afficher l'action
                if (typeof showToast === 'function') {
                    showToast(`${action.emoji} ${action.name}`);
                }
            }
        }
    }

    /**
     * Démarre l'exercice de respiration
     * @param {Object} state - State de l'application
     */
    startBreathing(state) {
        const lang = state?.profile?.lang || 'fr';
        const l = LABELS[lang] || LABELS.fr;
        
        // Créer l'overlay de respiration
        const breathingEl = this.view.createBreathingOverlay({
            inhale: l.inhale,
            hold: l.hold,
            exhale: l.exhale,
            done: l.done
        });
        
        // Animation de respiration 4-4-6
        let phase = 0;
        let count = 4;
        const phases = [
            { name: l.inhale, duration: 4, scale: 1.5 },
            { name: l.hold, duration: 4, scale: 1.5 },
            { name: l.exhale, duration: 6, scale: 1 }
        ];
        
        let totalCycles = 0;
        const maxCycles = 3;
        
        const tick = () => {
            if (count > 0) {
                const currentPhase = phases[phase];
                this.view.updateBreathingDisplay(breathingEl, currentPhase.name, count, currentPhase.scale);
                count--;
                setTimeout(tick, 1000);
            } else {
                phase++;
                if (phase >= phases.length) {
                    phase = 0;
                    totalCycles++;
                }
                
                if (totalCycles >= maxCycles) {
                    this.view.finishBreathing(breathingEl, l.done);
                    
                    setTimeout(() => {
                        breathingEl.remove();
                        Storage.incrementWins(state, { positiveActions: 1 });
                    }, 2000);
                } else {
                    const current = phases[phase];
                    count = current.duration;
                    this.view.updateBreathingDisplay(breathingEl, current.name, count, current.scale);
                    count--;
                    setTimeout(tick, 1000);
                }
            }
        };
        
        // Démarrer
        this.view.updateBreathingDisplay(breathingEl, phases[0].name, count, phases[0].scale);
        tick();
    }

    /**
     * Toggle le mode low-text
     * @param {Object} state - State de l'application
     */
    toggleLowText(state) {
        this.model.toggleLowText(state);
        
        // Re-render l'écran
        const lang = state.profile.lang;
        const lowTextMode = this.model.getLowTextMode();
        const actionsToShow = this.model.getSOSActions(state, lang, lowTextMode ? 4 : 6);
        
        let spiritualCard = null;
        if (state.profile.spiritualEnabled && state.profile.religion !== 'none') {
            if (typeof I18n !== 'undefined' && I18n.getSpiritualCards) {
                const cards = I18n.getSpiritualCards();
                if (cards && cards.length > 0) {
                    spiritualCard = cards[Math.floor(Math.random() * cards.length)];
                }
            }
        }
        
        this.view.renderSOSScreen(state, actionsToShow, spiritualCard, lowTextMode);
    }

    /**
     * Confirme la sortie du mode SOS
     * @param {Object} state - State de l'application
     */
    confirmExit(state) {
        // Appeler confirmExit du model (qui sauvegarde en mode urgence)
        this.model.confirmExit(state);
        
        // Unsetter flags runtime
        if (window.runtime) {
            window.runtime.emergencyActive = false;
            window.runtime.emergencySource = null;
            window.runtime.lastEmergencyEndedAt = Date.now();
        }
        
        this.deactivate();
        
        // Mettre à jour le state global si nécessaire
        if (typeof window !== 'undefined' && window.state) {
            // Le state sera mis à jour par Store.update dans le model
        }
        
        if (typeof showToast === 'function') {
            const lang = state?.profile?.lang || 'fr';
            const l = LABELS[lang] || LABELS.fr;
            showToast(l.success);
        }
        
        // Retourner à la home
        if (typeof Router !== 'undefined') {
            Router.navigateTo('home', true);
        }
    }

    /**
     * Génère le bouton SOS pour la home
     * @param {Object} state - State de l'application
     * @returns {string} HTML
     */
    renderSOSButton(state) {
        return this.view.renderSOSButton(state);
    }
}
