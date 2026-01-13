/**
 * Relapse Controller - Orchestration Model/View
 */

import { RelapseModel } from '../model/relapse-model.js';
import { RelapseView } from '../view/relapse-view.js';
import { CHANGE_SUGGESTIONS, LABELS } from '../data/relapse-data.js';

export class RelapseController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    open(state) {
        this.model.reset();
        
        const modalEl = this.view.createModalElement();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => {
                if (e.target === modalEl) this.close();
            });
            modalEl._hasClickListener = true;
        }
        
        this.view.renderStep1(state.profile.lang);
        this.view.show();
    }

    close() {
        this.view.hide();
    }

    goStep2() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        this.view.renderStep2(state.profile.lang, this.model.getData());
    }

    goStep3() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        // Récupérer une carte spirituelle si activée
        let spiritualCard = null;
        if (state.profile.spiritualEnabled && state.profile.religion !== 'none') {
            const cards = typeof I18n !== 'undefined' ? I18n.getSpiritualCards() : [];
            const hopeCards = cards.filter(c => ['hope', 'repentance'].includes(c.theme));
            if (hopeCards.length > 0) {
                spiritualCard = hopeCards[Math.floor(Math.random() * hopeCards.length)];
            }
        }
        
        this.view.renderStep3(state.profile.lang, this.model.getData(), spiritualCard);
    }

    setWhen(value) {
        this.model.setWhen(value);
        this.goStep2();
    }

    setTrigger(value) {
        this.model.setTrigger(value);
        this.goStep2();
    }

    selectSuggestion(index) {
        const state = typeof window !== 'undefined' ? window.state : null;
        const lang = state?.profile?.lang || 'fr';
        const suggestions = CHANGE_SUGGESTIONS[lang] || CHANGE_SUGGESTIONS.fr;
        
        this.model.setChange(suggestions[index]);
        const input = document.getElementById('changeInput');
        if (input) input.value = suggestions[index];
    }

    finish() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const changeInput = document.getElementById('changeInput');
        this.model.setChange(changeInput?.value || '');
        this.model.saveEpisode(state);
        
        this.close();
        
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        if (typeof showToast === 'function') showToast(l.recorded);
        if (typeof renderHome === 'function') renderHome();
    }

    createRuleFromRelapse() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const success = this.model.createRuleFromTrigger(state);
        if (success) {
            const lang = state.profile.lang;
            const l = LABELS[lang] || LABELS.fr;
            if (typeof showToast === 'function') showToast(l.ruleCreated);
            this.close();
            if (typeof IfThen !== 'undefined') IfThen.openRulesModal();
        }
    }
}
