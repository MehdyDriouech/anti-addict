/**
 * Coaching Controller - Orchestration
 */

import { CoachingModel } from '../model/coaching-model.js';
import { CoachingView } from '../view/coaching-view.js';
import { LABELS } from '../data/coaching-data.js';

export class CoachingController {
    constructor(model, view) { this.model = model; this.view = view; }

    openInsights(state) {
        const modalEl = this.view.createModalElement();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closeInsights(); });
            modalEl._hasClickListener = true;
        }
        const insights = this.model.computeWeeklyInsights(state);
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

    computeWeeklyInsights(state) { return this.model.computeWeeklyInsights(state); }
    computeTopTriggers(events, count) { return this.model.computeTopTriggers(events, count); }
    computeRiskHours(events) { return this.model.computeRiskHours(events); }
    findCorrelations(state, startDate) { return this.model.findCorrelations(state, startDate); }
    suggestRules(state, events) { return this.model.suggestRules(state, events); }
    isWeeklyInsightAvailable(state) { return this.model.isWeeklyInsightAvailable(state); }
}
