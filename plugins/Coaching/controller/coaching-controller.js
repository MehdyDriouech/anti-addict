/**
 * Coaching Controller - Orchestration
 */

import { CoachingModel } from '../model/coaching-model.js';
import { CoachingView } from '../view/coaching-view.js';
import { LABELS } from '../data/coaching-data.js';

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
        // 1. Urgence active
        if (window.runtime?.emergencyActive === true) {
            return false;
        }
        
        // 2. Cooldown post-urgence
        if (window.runtime?.lastEmergencyEndedAt) {
            const elapsed = now - window.runtime.lastEmergencyEndedAt;
            if (elapsed < COOLDOWN_MS) {
                return false;
            }
        }
        
        // 3. Cadence (1/jour)
        const todayISO = typeof Storage !== 'undefined' && Storage.getDateISO ? Storage.getDateISO() : new Date().toISOString().split('T')[0];
        if (state.coaching?.lastShownDate === todayISO) {
            return false;
        }
        
        // 4. Insight dismissed (vérifier candidat actif)
        const activeInsight = this.model.getActiveInsight(state);
        if (activeInsight && activeInsight.dismissed) {
            return false;
        }
        
        // 5. OK
        return true;
    }

    /**
     * Ouvre l'écran coaching (point d'entrée route #coaching)
     * @param {Object} state - State de l'application
     */
    async openCoaching(state) {
        // Vérifier canShowInsight
        if (!this.canShowInsight(state)) {
            const modalEl = this.view.createModalElement();
            const lang = state.profile.lang;
            const l = LABELS[lang] || LABELS.fr;
            this.view.renderNoInsightModal(lang, l);
            this.view.show();
            return;
        }
        
        const modalEl = this.view.createModalElement();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closeCoaching(); });
            modalEl._hasClickListener = true;
        }
        
        // Générer les données pour l'écran coaching (lazy)
        const screenData = await this.model.computeCoachingScreenData(state);
        this.view.renderCoachingModal(state.profile.lang, screenData);
        this.view.show();
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
        if (!this.model.isWeeklyInsightAvailable(state)) return '';
        return this.view.renderWidget(state.profile.lang);
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
