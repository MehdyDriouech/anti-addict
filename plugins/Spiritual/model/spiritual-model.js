/**
 * Spiritual Model - Logique métier
 */

import { PRESET_GOALS, THEME_FILTERS } from '../data/spiritual-data.js';

export class SpiritualModel {
    incrementDhikr(state) { Storage.incrementDhikr(state, 1); }

    decrementDhikr(state) {
        if (state.spiritual.dhikrCount > 0) {
            state.spiritual.dhikrCount--;
            Storage.saveState(state);
        }
    }

    resetDhikr(state) {
        state.spiritual.dhikrCount = 0;
        Storage.saveState(state);
    }

    getDhikrCount(state) { return state.spiritual?.dhikrCount || 0; }

    getTodayGoals(state) {
        const today = Storage.getDateISO();
        return (state.spiritual?.dailyGoals || []).filter(g => g.date === today);
    }

    addPresetGoal(state, index) {
        const lang = state.profile.lang;
        const presets = PRESET_GOALS[lang] || PRESET_GOALS.fr;
        const text = presets[parseInt(index, 10)];
        if (text) Storage.addSpiritualGoal(state, { text, completed: false });
    }

    toggleGoal(state, index) {
        const today = Storage.getDateISO();
        const todayGoals = state.spiritual.dailyGoals.filter(g => g.date === today);
        if (todayGoals[index]) {
            todayGoals[index].completed = !todayGoals[index].completed;
            Storage.saveState(state);
            if (todayGoals[index].completed) Storage.incrementWins(state, { positiveActions: 1 });
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
