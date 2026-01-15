/**
 * Coaching Controller - Orchestration
 */

import { CoachingModel } from '../model/coaching-model.js';
import { CoachingView } from '../view/coaching-view.js';
import { LABELS, COACHING_MODES } from '../data/coaching-data.js';

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes (configurable)

export class CoachingController {
    constructor(model, view) { this.model = model; this.view = view; }

    /**
     * Vérifie si un insight peut être affiché
     * @param {Object} state - State de l'application
     * @param {number} now - Timestamp actuel (optionnel)
     * @returns {boolean}
     */
    canShowInsight(state, now = Date.now()) {
        // 1. Vérifier si coaching autorisé (pas d'urgence, pas post-urgence récent)
        if (!this.model.isCoachingAllowed(state)) {
            return false;
        }
        
        // 2. Vérifier le mode de coaching
        const mode = state.coaching?.mode || 'stability';
        
        // Mode silent: ne jamais afficher sauf forte instabilité (géré dans shouldGenerateInsight)
        if (mode === 'silent') {
            // La génération d'insight gère déjà le seuil strict pour silent
            // On vérifie juste qu'on peut générer
            return this.model.shouldGenerateInsight(state);
        }
        
        // 3. Pour les autres modes, vérifier shouldGenerateInsight
        return this.model.shouldGenerateInsight(state);
    }

    /**
     * Ouvre l'écran coaching (point d'entrée route #coaching)
     * @param {Object} state - State de l'application
     */
    async openCoaching(state) {
        const modalEl = this.view.createModalElement();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closeCoaching(); });
            modalEl._hasClickListener = true;
        }
        
        // Toujours générer les données pour l'écran coaching (lazy)
        // Le mode détermine ce qui est généré et affiché
        const screenData = await this.model.computeCoachingScreenData(state);
        this.view.renderCoachingModal(state.profile.lang, screenData, state);
        this.view.show();
    }

    /**
     * Ouvre le modal de sélection du mode de coaching
     * @param {Object} state - State de l'application
     */
    async openModeSelector(state) {
        // Sauvegarder que le modal coaching était ouvert pour pouvoir le rouvrir si annulation
        const coachingModalWasOpen = this.view.modalEl && this.view.modalEl.classList.contains('active');
        
        // Fermer temporairement le modal coaching pour afficher le sélecteur
        this.view.hide();
        
        const currentMode = state.coaching?.mode || 'stability';
        const lang = state.profile.lang || 'fr';
        
        const modes = ['observer', 'stability', 'guided', 'silent'];
        const html = `
            <div class="form-group">
                <div class="checkbox-group">
                    ${modes.map(mode => {
                        const modeData = COACHING_MODES[mode]?.[lang] || COACHING_MODES[mode]?.fr;
                        const isSelected = mode === currentMode;
                        return `
                            <label class="checkbox-item">
                                <input type="radio" name="coaching-mode" value="${mode}" ${isSelected ? 'checked' : ''}>
                                <div>
                                    <div style="font-weight: 500;">${modeData?.name || mode}</div>
                                    <div style="font-size: 0.9em; color: var(--text-secondary); margin-top: 0.25em;">
                                        ${modeData?.description || ''}
                                    </div>
                                </div>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        const labels = {
            fr: { title: 'Mode de coaching', validate: 'Valider', cancel: 'Annuler' },
            en: { title: 'Coaching mode', validate: 'Validate', cancel: 'Cancel' },
            ar: { title: 'وضع التدريب', validate: 'التحقق', cancel: 'إلغاء' }
        };
        const l = labels[lang] || labels.fr;
        
        if (typeof UI !== 'undefined') {
            UI.showModal(l.title, html, async () => {
                const selected = document.querySelector('input[name="coaching-mode"]:checked');
                if (selected) {
                    const newMode = selected.value;
                    // Changer le mode
                    await this.changeCoachingMode(state, newMode);
                    
                    // Fermer le modal de sélection
                    UI.closeModal('dynamic-modal');
                    
                    // Recharger le modal coaching avec le nouveau mode
                    await this.openCoaching(state);
                    
                    // Afficher un toast de confirmation
                    const messages = {
                        fr: 'Mode de coaching modifié',
                        en: 'Coaching mode changed',
                        ar: 'تم تغيير وضع التدريب'
                    };
                    UI.showToast(messages[lang] || messages.fr, 'success');
                }
            }, false, 'dynamic-modal', l.validate);
            
            // Ajouter des listeners pour rouvrir le coaching si le modal est annulé ou fermé
            setTimeout(() => {
                const modal = document.getElementById('dynamic-modal');
                if (modal && coachingModalWasOpen) {
                    const reopenCoaching = () => {
                        // Attendre que le modal de sélection soit complètement fermé
                        setTimeout(() => {
                            this.openCoaching(state);
                        }, 350); // Attendre la durée de transition (300ms + marge)
                    };
                    
                    // Intercepter la fermeture via le bouton X
                    const closeBtn = modal.querySelector('.modal-close');
                    if (closeBtn) {
                        closeBtn.onclick = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            UI.closeModal('dynamic-modal');
                            reopenCoaching();
                            return false;
                        };
                    }
                    
                    // Intercepter l'annulation via le bouton Annuler
                    const cancelBtn = modal.querySelector('.btn-secondary');
                    if (cancelBtn) {
                        cancelBtn.onclick = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            UI.closeModal('dynamic-modal');
                            reopenCoaching();
                            return false;
                        };
                    }
                    
                    // Intercepter le clic sur l'overlay (en dehors du modal)
                    modal.onclick = (e) => {
                        if (e.target === modal) {
                            e.preventDefault();
                            e.stopPropagation();
                            UI.closeModal('dynamic-modal');
                            reopenCoaching();
                            return false;
                        }
                    };
                }
            }, 100);
        }
    }

    /**
     * Change le mode de coaching et sauvegarde
     * @param {Object} state - State de l'application
     * @param {string} newMode - Nouveau mode ('observer' | 'stability' | 'guided' | 'silent')
     * @returns {Promise<void>}
     */
    async changeCoachingMode(state, newMode) {
        // Valider le mode
        const validModes = ['observer', 'stability', 'guided', 'silent'];
        if (!validModes.includes(newMode)) {
            console.warn(`[Coaching] Mode invalide: ${newMode}`);
            return;
        }
        
        // Sauvegarder via Store.update
        if (typeof window !== 'undefined' && window.Store && window.Store.update) {
            await window.Store.update((draft) => {
                if (!draft.coaching) {
                    draft.coaching = { mode: 'stability', lastShownDate: null, activeAnchor: null, insights: [], feedback: { useful: 0, dismissed: 0 } };
                }
                draft.coaching.mode = newMode;
                
                // Réinitialiser activeAnchor si changement de mode (sauf si on passe à stability/guided avec ancrage valide)
                if (newMode !== 'stability' && newMode !== 'guided') {
                    draft.coaching.activeAnchor = null;
                }
            });
            
            // Mettre à jour state local
            if (!state.coaching) {
                state.coaching = { mode: 'stability', lastShownDate: null, activeAnchor: null, insights: [], feedback: { useful: 0, dismissed: 0 } };
            }
            state.coaching.mode = newMode;
            
            // Réinitialiser activeAnchor si nécessaire
            if (newMode !== 'stability' && newMode !== 'guided') {
                state.coaching.activeAnchor = null;
            }
        } else {
            // Fallback vers ancienne méthode
            if (!state.coaching) {
                state.coaching = { mode: 'stability', lastShownDate: null, activeAnchor: null, insights: [], feedback: { useful: 0, dismissed: 0 } };
            }
            state.coaching.mode = newMode;
            if (newMode !== 'stability' && newMode !== 'guided') {
                state.coaching.activeAnchor = null;
            }
            if (typeof Storage !== 'undefined' && Storage.saveState) {
                Storage.saveState(state);
            }
        }
    }

    /**
     * Ferme l'écran coaching
     */
    closeCoaching() {
        this.view.cleanup();
        if (typeof Router !== 'undefined') {
            Router.goBack();
        }
    }

    /**
     * Récupère le summary de l'insight actif (O(1) pour widget Home)
     * @param {Object} state - State de l'application
     * @returns {Object|null} { hasInsight: boolean, messageKey: string, confidence: number } ou null
     */
    getActiveInsightSummary(state) {
        return this.model.computeActiveInsightSummary(state);
    }

    /**
     * Marque un insight comme dismissed
     * @param {string} insightId - ID de l'insight
     */
    async dismissInsight(insightId) {
        if (typeof window !== 'undefined' && window.Store && window.Store.update) {
            await window.Store.update((draft) => {
                if (!draft.coaching) {
                    draft.coaching = { lastShownDate: null, insights: [], feedback: { usefulCount: 0, dismissedCount: 0 } };
                }
                const insight = draft.coaching.insights.find(i => i.id === insightId);
                if (insight) {
                    insight.dismissed = true;
                }
                draft.coaching.feedback.dismissedCount = (draft.coaching.feedback.dismissedCount || 0) + 1;
            });
        }
    }

    /**
     * Marque un insight comme utile
     * @param {string} insightId - ID de l'insight
     */
    async markInsightUseful(insightId) {
        if (typeof window !== 'undefined' && window.Store && window.Store.update) {
            await window.Store.update((draft) => {
                if (!draft.coaching) {
                    draft.coaching = { lastShownDate: null, insights: [], feedback: { usefulCount: 0, dismissedCount: 0 } };
                }
                draft.coaching.feedback.usefulCount = (draft.coaching.feedback.usefulCount || 0) + 1;
            });
        }
    }

    async openInsights(state) {
        const modalEl = this.view.createModalElement();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closeInsights(); });
            modalEl._hasClickListener = true;
        }
        const insights = await this.model.computeWeeklyInsights(state);
        this.view.renderModal(state.profile.lang, insights);
        this.view.show();
    }

    closeInsights() { this.view.hide(); }

    addSuggestedRule(trigger) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        const suggestion = this.model.getRuleSuggestion(trigger);
        if (!suggestion) return;
        const lang = state.profile.lang;
        const rule = { id: `rule_${Date.now()}`, ifCondition: suggestion.ifCondition[lang] || suggestion.ifCondition.fr, thenAction: suggestion.thenAction[lang] || suggestion.thenAction.fr, enabled: true, createdAt: Storage.getDateISO() };
        Storage.saveIfThenRule(state, rule);
        this.closeInsights();
        const l = LABELS[lang] || LABELS.fr;
        if (typeof showToast === 'function') showToast(l.ruleAdded);
    }

    renderWidget(state) {
        // Vérifier le mode de coaching
        const mode = state?.coaching?.mode || 'stability';
        
        // Mode silent: ne pas afficher
        if (mode === 'silent') {
            return '';
        }
        
        // Pour les autres modes, utiliser renderHomeWidget avec summary
        const insightSummary = this.getActiveInsightSummary(state);
        return this.view.renderHomeWidget(state, insightSummary);
    }

    async computeWeeklyInsights(state) { 
        return await this.model.computeWeeklyInsights(state); 
    }
    computeTopTriggers(events, count) { return this.model.computeTopTriggers(events, count); }
    computeRiskHours(events) { return this.model.computeRiskHours(events); }
    findCorrelations(state, startDate) { return this.model.findCorrelations(state, startDate); }
    suggestRules(state, events) { return this.model.suggestRules(state, events); }
    isWeeklyInsightAvailable(state) { return this.model.isWeeklyInsightAvailable(state); }
}
