/**
 * Programs Controller - Orchestration
 */

import { ProgramsModel } from '../model/programs-model.js';
import { ProgramsView } from '../view/programs-view.js';
import { LABELS } from '../data/programs-data.js';

export class ProgramsController {
    constructor(model, view) { this.model = model; this.view = view; this.urgeSurfingInterval = null; }

    setState(state) { this.model.setState(state); }

    async startProgram(stateOrId, programId) {
        let state, id;
        if (typeof stateOrId === 'string') { id = stateOrId; state = this.model.getState(); } 
        else { state = stateOrId; id = programId; this.model.setState(state); }
        if (!state) return;
        const success = await this.model.startProgram(state, id);
        if (success) this.openDayModal(state, 1);
    }

    async resumeProgram(state) {
        if (!state) state = this.model.getState(); else this.model.setState(state);
        if (!state) return;
        const currentDay = await this.model.resumeProgram(state);
        if (currentDay) this.openDayModal(state, currentDay);
    }

    completeProgram(state) {
        this.model.completeProgram(state);
        this.closeModal();
        const lang = state?.profile?.lang || 'fr';
        const l = LABELS[lang] || LABELS.fr;
        if (typeof showToast === 'function') showToast(l.programCompleted);
    }

    abandonProgram(state) { this.model.abandonProgram(state); this.closeModal(); }

    async switchProgram(programId) {
        const state = this.model.getState() || (typeof window !== 'undefined' ? window.state : null);
        if (!state) return;
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        if (state.programs.active && state.programs.active.id !== programId) {
            if (!confirm(l.confirmChange)) return;
        } else if (state.programs.active?.id === programId) {
            this.closeSelectModal(); this.resumeProgram(state); return;
        }
        this.closeSelectModal();
        await this.model.switchProgram(state, programId);
        this.openDayModal(state, 1);
    }

    openDayModal(state, day) {
        if (!this.model.getProgramData()) return;
        const modalEl = this.view.createProgramModal();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closeModal(); });
            modalEl._hasClickListener = true;
        }
        this.renderDayContent(state, day);
        this.view.showProgram();
    }

    closeModal() { this.view.hideProgram(); }

    renderDayContent(state, day) {
        const lang = state.profile.lang;
        const dayData = this.model.getDayData(day);
        const progress = this.model.getDayProgress(state, state.programs.active.id, day);
        const isCompleted = progress?.completed;
        const totalDays = this.model.getTotalDays();
        this.view.renderDayContent(lang, dayData, day, totalDays, isCompleted, progress);
    }

    completeDay(day) {
        const state = this.model.getState() || (typeof window !== 'undefined' ? window.state : null);
        if (!state) return;
        const exerciseData = {};
        document.querySelectorAll('[data-field]').forEach(input => { exerciseData[input.dataset.field] = input.value; });
        this.model.completeDay(state, day, exerciseData);
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        if (typeof showToast === 'function') showToast(l.dayCompleted);
        this.renderDayContent(state, day);
    }

    goToDay(day) {
        const state = this.model.getState() || (typeof window !== 'undefined' ? window.state : null);
        if (!state) return;
        this.renderDayContent(state, day);
    }

    finish() {
        const state = this.model.getState() || (typeof window !== 'undefined' ? window.state : null);
        if (!state) return;
        this.completeProgram(state);
    }

    startUrgeSurfing(duration) {
        const timerEl = document.getElementById('urgeSurfingTimer');
        const btnEl = document.getElementById('urgeSurfingBtn');
        if (!timerEl || !btnEl) return;
        btnEl.disabled = true; btnEl.textContent = '...';
        let remaining = duration;
        this.urgeSurfingInterval = setInterval(() => {
            remaining--; timerEl.textContent = remaining;
            if (remaining <= 0) {
                clearInterval(this.urgeSurfingInterval);
                timerEl.textContent = '✓'; btnEl.disabled = false;
                const state = this.model.getState() || (typeof window !== 'undefined' ? window.state : null);
                const lang = state?.profile?.lang || 'fr';
                const l = LABELS[lang] || LABELS.fr;
                btnEl.textContent = l.exerciseCompleted;
                if (state) Storage.incrementWins(state, { positiveActions: 1 });
            }
        }, 1000);
    }

    openSelectModal(state) {
        if (!state) state = this.model.getState() || (typeof window !== 'undefined' ? window.state : null);
        else this.model.setState(state);
        const modalEl = this.view.createSelectModal();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closeSelectModal(); });
            modalEl._hasClickListener = true;
        }
        const lang = state.profile.lang;
        const hasActive = this.model.hasActiveProgram(state);
        const activeProgram = this.model.getActiveProgram(state);
        this.view.renderSelectModal(lang, hasActive, activeProgram);
        this.view.showSelect();
    }

    closeSelectModal() { this.view.hideSelect(); }

    renderWidget(state) {
        const lang = state.profile.lang;
        const hasActive = this.model.hasActiveProgram(state);
        const activeProgram = this.model.getActiveProgram(state);
        return this.view.renderWidget(lang, hasActive, activeProgram);
    }

    async loadProgram(programId, lang) { return this.model.loadProgram(programId, lang); }
}
