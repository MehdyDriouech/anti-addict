/**
 * IfThen Controller - Orchestration Model/View
 */

import { IfThenModel } from '../model/ifthen-model.js';
import { IfThenView } from '../view/ifthen-view.js';
import { LABELS } from '../data/ifthen-data.js';

export class IfThenController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    /**
     * Ouvre le modal des règles
     */
    openRulesModal() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const modalEl = this.view.createModalElement();
        
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => {
                if (e.target === modalEl) {
                    this.closeRulesModal();
                }
            });
            modalEl._hasClickListener = true;
        }
        
        const lang = state.profile.lang;
        const rules = this.model.getRules(state);
        this.view.renderRulesList(rules, lang);
        this.view.show();
    }

    closeRulesModal() {
        this.view.hide();
    }

    showTemplates() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        this.view.renderTemplates(state.profile.lang);
    }

    showCustomForm() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        this.view.renderCustomForm(state.profile.lang);
    }

    addFromTemplate(templateKey) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        this.model.createRuleFromTemplate(templateKey, state);
        this.openRulesModal();
        
        if (typeof renderHome === 'function') renderHome();
    }

    toggle(ruleId, enabled) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        this.model.toggleRule(ruleId, enabled, state);
        this.openRulesModal();
        
        if (typeof renderHome === 'function') renderHome();
    }

    deleteHandler(ruleId) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        
        if (confirm(l.confirmDelete)) {
            this.model.deleteRule(ruleId, state);
            this.openRulesModal();
            
            if (typeof renderHome === 'function') renderHome();
        }
    }

    saveCustomRule() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        
        const name = document.getElementById('ruleName')?.value || '';
        if (!name.trim()) {
            alert(l.nameRequired);
            return;
        }
        
        const conditions = {};
        if (document.getElementById('condNight')?.checked) conditions.timeRange = 'night';
        if (document.getElementById('condAlone')?.checked) conditions.alone = true;
        if (document.getElementById('condExposed')?.checked) conditions.exposed = true;
        if (document.getElementById('condBedPhone')?.checked) conditions.inBedWithPhone = true;
        
        const actionIds = [];
        document.querySelectorAll('[data-action]:checked').forEach(cb => {
            actionIds.push(cb.dataset.action);
        });
        
        this.model.createCustomRule({
            name: name.trim(),
            if: conditions,
            then: { actionIds }
        }, state);
        
        this.openRulesModal();
        if (typeof renderHome === 'function') renderHome();
    }

    // Méthodes déléguées au model
    getRules(state) { return this.model.getRules(state); }
    getActiveRules(state) { return this.model.getActiveRules(state); }
    createRuleFromTemplate(templateKey, state) { return this.model.createRuleFromTemplate(templateKey, state); }
    createCustomRule(ruleData, state) { return this.model.createCustomRule(ruleData, state); }
    updateRule(ruleId, updates, state) { return this.model.updateRule(ruleId, updates, state); }
    toggleRule(ruleId, enabled, state) { return this.model.toggleRule(ruleId, enabled, state); }
    deleteRule(ruleId, state) { return this.model.deleteRule(ruleId, state); }
    findMatchingRules(state, context) { return this.model.findMatchingRules(state, context); }
    getActionsFromRules(matchedRules, lang) { return this.model.getActionsFromRules(matchedRules, lang); }

    // Rendu summary
    renderRulesSummary(state, maxShow = 3) {
        const lang = state.profile.lang;
        const activeRules = this.model.getActiveRules(state);
        return this.view.renderRulesSummary(activeRules, lang, maxShow);
    }

    renderRulesList(state) {
        const lang = state.profile.lang;
        const rules = this.model.getRules(state);
        return this.view.renderRulesList(rules, lang);
    }

    renderRuleItem(rule, lang) {
        return this.view.renderRuleItem(rule, lang);
    }

    renderTemplates(lang) {
        return this.view.renderTemplates(lang);
    }
}
