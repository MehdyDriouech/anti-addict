/**
 * Spiritual Controller - Orchestration
 */

import { SpiritualModel } from '../model/spiritual-model.js';
import { SpiritualView } from '../view/spiritual-view.js';

export class SpiritualController {
    constructor(model, view) { this.model = model; this.view = view; }

    open(state) {
        if (!this.model.isEnabled(state)) return;
        const modalEl = this.view.createModalElement();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.close(); });
            modalEl._hasClickListener = true;
        }
        this.renderModal(state);
        this.view.show();
    }

    close() { this.view.hide(); }

    renderModal(state) {
        const lang = state.profile.lang;
        const dhikrCount = this.model.getDhikrCount(state);
        const todayGoals = this.model.getTodayGoals(state);
        this.view.renderModal(lang, dhikrCount, todayGoals);
    }

    incrementDhikr() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        this.model.incrementDhikr(state);
        this.view.updateDhikrDisplay(this.model.getDhikrCount(state));
    }

    decrementDhikr() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        this.model.decrementDhikr(state);
        this.view.updateDhikrDisplay(this.model.getDhikrCount(state));
    }

    resetDhikr() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        this.model.resetDhikr(state);
        this.view.updateDhikrDisplay(0);
    }

    getTodayGoals(state) { return this.model.getTodayGoals(state); }

    addPresetGoal() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        const select = document.getElementById('presetGoal');
        const index = select?.value;
        if (index === '' || index === null) return;
        this.model.addPresetGoal(state, index);
        this.renderModal(state);
    }

    toggleGoal(index) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        this.model.toggleGoal(state, index);
        this.renderModal(state);
    }

    showPlaylist(context) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        const modalEl = this.view.createPlaylistModal();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closePlaylist(); });
            modalEl._hasClickListener = true;
        }
        const addictionId = state.addictions?.[0] || null;
        const cards = this.model.getCardsForContext(context, addictionId);
        this.view.renderPlaylistModal(state.profile.lang, context, cards);
        this.view.showPlaylist();
    }

    closePlaylist() { this.view.hidePlaylist(); }
    nextCard() { this.view.nextCard(); }

    renderWidget(state) {
        if (!this.model.isEnabled(state)) return '';
        const lang = state.profile.lang;
        const dhikrCount = this.model.getDhikrCount(state);
        return this.view.renderWidget(lang, dhikrCount);
    }

    getRandomCard(state, themes) { return this.model.getRandomCard(state, themes); }
}
