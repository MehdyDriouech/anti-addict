/**
 * Intentions Model - Logique métier
 */

import { NEUTRAL_INTENTIONS } from '../data/intentions-data.js';

export class IntentionsModel {
    /**
     * Vérifie si une nouvelle intention a déjà été montrée aujourd'hui
     * @param {Object} state - State de l'application
     * @returns {boolean}
     */
    hasIntentionToday(state) {
        const today = Utils.todayISO();
        return state.intentions.lastShownDate === today;
    }

    /**
     * Récupère l'intention du jour (existante ou nouvelle)
     * @param {Object} state - State de l'application
     * @returns {Object|null} { text, ref, source }
     */
    getTodayIntention(state) {
        const today = Utils.todayISO();
        
        // Chercher dans l'historique
        const todayIntention = state.intentions.history.find(i => i.date === today);
        if (todayIntention) {
            return todayIntention;
        }
        
        return null;
    }

    /**
     * Génère une nouvelle intention aléatoire
     * @param {Object} state - State de l'application
     * @returns {Object} { text, ref, source }
     */
    generateNewIntention(state) {
        const lang = state.profile.lang;
        const spiritualEnabled = state.profile.spiritualEnabled;
        const religion = state.profile.religion;
        
        // Si spiritual activé, essayer de prendre une carte spirituelle
        if (spiritualEnabled && religion !== 'none') {
            const cards = I18n.getSpiritualCards();
            if (cards && cards.length > 0) {
                // Filtrer par thèmes positifs (hope, discipline, patience)
                const positiveCards = cards.filter(c => 
                    ['hope', 'discipline', 'patience', 'repentance'].includes(c.theme)
                );
                
                const pool = positiveCards.length > 0 ? positiveCards : cards;
                const randomCard = pool[Math.floor(Math.random() * pool.length)];
                
                return {
                    text: randomCard.text,
                    ref: randomCard.ref,
                    source: 'spiritual'
                };
            }
        }
        
        // Fallback: intentions neutres
        const neutralList = NEUTRAL_INTENTIONS[lang] || NEUTRAL_INTENTIONS.fr;
        const randomIntention = neutralList[Math.floor(Math.random() * neutralList.length)];
        
        return {
            text: randomIntention.text,
            ref: randomIntention.ref,
            source: 'neutral'
        };
    }

    /**
     * Définit l'intention du jour
     * @param {Object} state - State de l'application
     * @param {boolean} force - Forcer même si une intention existe déjà
     * @returns {Object} L'intention définie
     */
    setTodayIntention(state, force = false) {
        // Vérifier si déjà définie
        if (!force && this.hasIntentionToday(state)) {
            return this.getTodayIntention(state);
        }
        
        // Si force=true, supprimer l'intention existante d'aujourd'hui
        if (force) {
            const today = Utils.todayISO();
            state.intentions.history = state.intentions.history.filter(i => i.date !== today);
        }
        
        // Générer et sauvegarder
        const intention = this.generateNewIntention(state);
        Storage.addIntention(state, intention);
        
        return intention;
    }

    /**
     * Récupère l'historique des intentions (derniers N jours)
     * @param {Object} state - State de l'application
     * @param {number} count - Nombre d'intentions à récupérer
     * @returns {Array}
     */
    getIntentionsHistory(state, count = 7) {
        return state.intentions.history
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, count);
    }

    /**
     * Toggle l'engagement sur l'intention du jour
     * @param {Object} state - State de l'application
     */
    toggleEngagement(state) {
        const today = Utils.todayISO();
        const intention = state.intentions.history.find(i => i.date === today);
        
        if (intention) {
            intention.engaged = true;
            Storage.saveState(state);
        }
    }
}
