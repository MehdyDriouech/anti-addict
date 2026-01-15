/**
 * Spiritual Model - Logique métier
 */

import { PRESET_GOALS, THEME_FILTERS } from '../data/spiritual-data.js';

export class SpiritualModel {
    constructor(services = {}) {
        this.storage = services.storage || (typeof window !== 'undefined' ? window.Storage : null);
        this.dateService = services.dateService || null;
    }

    /**
     * Helper pour obtenir la date ISO du jour
     * @returns {string}
     */
    getDateISO() {
        return this.dateService?.todayISO() || (this.storage?.getDateISO ? this.storage.getDateISO() : (typeof Storage !== 'undefined' ? Storage.getDateISO() : new Date().toISOString().split('T')[0]));
    }

    incrementDhikr(state) { this.storage?.incrementDhikr(state, 1); }

    decrementDhikr(state) {
        if (state.spiritual.dhikrCount > 0) {
            state.spiritual.dhikrCount--;
            this.storage?.saveState(state);
        }
    }

    resetDhikr(state) {
        state.spiritual.dhikrCount = 0;
        Storage.saveState(state);
    }

    getDhikrCount(state) { return state.spiritual?.dhikrCount || 0; }

    getTodayGoals(state) {
        const today = this.getDateISO();
        return (state.spiritual?.dailyGoals || []).filter(g => g.date === today);
    }

    addPresetGoal(state, index) {
        const lang = state.profile.lang;
        const presets = PRESET_GOALS[lang] || PRESET_GOALS.fr;
        const text = presets[parseInt(index, 10)];
        if (text) this.storage?.addSpiritualGoal(state, { text, completed: false });
    }

    toggleGoal(state, index) {
        const today = this.getDateISO();
        const todayGoals = state.spiritual.dailyGoals.filter(g => g.date === today);
        if (todayGoals[index]) {
            todayGoals[index].completed = !todayGoals[index].completed;
            this.storage?.saveState(state);
            if (todayGoals[index].completed) this.storage?.incrementWins(state, { positiveActions: 1 });
            return todayGoals[index].completed;
        }
        return false;
    }

    getCardsForContext(context, addictionId = null) {
        let cards = [];
        if (typeof I18n !== 'undefined' && I18n.getSpiritualCards) {
            // Passer l'addictionId directement à getSpiritualCards pour le filtrage
            cards = I18n.getSpiritualCards(addictionId) || [];
        }
        
        const themes = THEME_FILTERS[context] || [];
        const filtered = cards.filter(c => themes.includes(c.theme) || themes.length === 0);
        return filtered.sort(() => Math.random() - 0.5).slice(0, 5);
    }

    getRandomCard(state, themes = [], addictionId = null) {
        if (!state.profile.spiritualEnabled || state.profile.religion === 'none') return null;
        let cards = [];
        if (typeof I18n !== 'undefined' && I18n.getSpiritualCards) {
            // Passer l'addictionId directement à getSpiritualCards pour le filtrage
            cards = I18n.getSpiritualCards(addictionId) || [];
        }
        
        if (themes.length > 0) cards = cards.filter(c => themes.includes(c.theme));
        if (cards.length === 0) return null;
        return cards[Math.floor(Math.random() * cards.length)];
    }

    isEnabled(state) {
        return state.profile.spiritualEnabled && state.profile.religion !== 'none';
    }
}
