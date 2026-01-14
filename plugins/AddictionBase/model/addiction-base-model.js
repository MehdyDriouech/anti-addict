/**
 * AddictionBase Model - Logique métier partagée pour toutes les addictions
 */

export class AddictionBaseModel {
    constructor(addictionId) {
        this.addictionId = addictionId;
    }

    /**
     * Enregistre un événement de pente glissante
     */
    logSlope(state, signal = null, meta = {}) {
        const eventMeta = {
            signal,
            ...meta
        };
        Storage.addEvent(state, 'slope', this.addictionId, null, eventMeta);
    }

    /**
     * Enregistre un craving
     */
    logCraving(state, intensity = 5, meta = {}) {
        Storage.addEvent(state, 'craving', this.addictionId, intensity, meta);
    }

    /**
     * Enregistre une rechute/épisode
     */
    logEpisode(state, meta = {}) {
        Storage.addEvent(state, 'episode', this.addictionId, null, meta);
    }

    /**
     * Enregistre une victoire
     */
    logWin(state, withAction = false, meta = {}) {
        Storage.addEvent(state, 'win', this.addictionId, null, { withAction, ...meta });
    }

    /**
     * Récupère les pentes récentes pour cette addiction
     */
    getRecentSlopes(state, days = 7) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        
        return (state.events || [])
            .filter(e => e.type === 'slope' && e.addictionId === this.addictionId)
            .filter(e => new Date(e.timestamp) >= cutoff);
    }

    /**
     * Récupère le nombre de pentes stoppées pour cette addiction
     * @param {Object} state - State de l'application
     * @param {string} addictionId - ID de l'addiction (optionnel, utilise this.addictionId par défaut)
     */
    getStoppedSlopesCount(state, addictionId = null) {
        const targetAddictionId = addictionId || this.addictionId;
        const config = state.addictionConfigs?.[targetAddictionId] || null;
        return config?.stoppedSlopes || 0;
    }

    /**
     * Incrémente le compteur de pentes stoppées
     */
    incrementStoppedSlopes(state) {
        this.ensureAddictionConfig(state);
        state.addictionConfigs[this.addictionId].stoppedSlopes++;
        Storage.saveState(state);
        return state.addictionConfigs[this.addictionId].stoppedSlopes;
    }

    /**
     * Récupère la configuration de cette addiction dans le state
     */
    getAddictionConfig(state) {
        return state.addictionConfigs?.[this.addictionId] || null;
    }

    /**
     * S'assure que la configuration de l'addiction existe dans le state
     */
    ensureAddictionConfig(state) {
        if (!state.addictionConfigs) {
            state.addictionConfigs = {};
        }
        if (!state.addictionConfigs[this.addictionId]) {
            state.addictionConfigs[this.addictionId] = {
                triggers: [],
                slopeSignals: [],
                stoppedSlopes: 0,
                customTriggers: [],
                activeRules: []
            };
        }
    }

    /**
     * Sauvegarde les triggers personnalisés
     */
    saveCustomTriggers(state, triggers) {
        this.ensureAddictionConfig(state);
        state.addictionConfigs[this.addictionId].customTriggers = triggers;
        Storage.saveState(state);
    }

    /**
     * Toggle un trigger personnalisé
     */
    toggleTrigger(state, trigger) {
        this.ensureAddictionConfig(state);
        const triggers = state.addictionConfigs[this.addictionId].customTriggers || [];
        const idx = triggers.indexOf(trigger);
        if (idx >= 0) {
            triggers.splice(idx, 1);
        } else {
            triggers.push(trigger);
        }
        state.addictionConfigs[this.addictionId].customTriggers = triggers;
        Storage.saveState(state);
        return triggers;
    }

    /**
     * Récupère les triggers personnalisés
     */
    getCustomTriggers(state) {
        return this.getAddictionConfig(state)?.customTriggers || [];
    }

    /**
     * Calcule les statistiques pour cette addiction
     */
    getStats(state, days = 30) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        
        const events = (state.events || [])
            .filter(e => e.addictionId === this.addictionId)
            .filter(e => new Date(e.timestamp) >= cutoff);
        
        return {
            cravings: events.filter(e => e.type === 'craving').length,
            episodes: events.filter(e => e.type === 'episode').length,
            wins: events.filter(e => e.type === 'win').length,
            slopes: events.filter(e => e.type === 'slope').length,
            stoppedSlopes: this.getStoppedSlopesCount(state)
        };
    }

    /**
     * Récupère un conseil aléatoire
     */
    getRandomTip(tips, lang = 'fr') {
        const langTips = tips[lang] || tips.fr || [];
        if (langTips.length === 0) return '';
        return langTips[Math.floor(Math.random() * langTips.length)];
    }

    /**
     * Récupère plusieurs conseils aléatoires
     */
    getRandomTips(tips, lang = 'fr', count = 3) {
        const langTips = tips[lang] || tips.fr || [];
        const shuffled = [...langTips].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}
