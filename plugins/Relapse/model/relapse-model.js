/**
 * Relapse Model - Logique métier
 */

import { CONDITION_MAP, TRIGGER_TAGS } from '../data/relapse-data.js';

export class RelapseModel {
    constructor() {
        this.data = {
            when: 'now',
            trigger: null,
            change: ''
        };
    }

    reset() {
        this.data = { when: 'now', trigger: null, change: '' };
    }

    getData() {
        return { ...this.data };
    }

    setWhen(value) {
        this.data.when = value;
    }

    setTrigger(value) {
        this.data.trigger = value;
    }

    setChange(value) {
        this.data.change = value;
    }

    /**
     * Enregistre l'épisode avec les métadonnées
     * @param {Object} state - State de l'application
     * @param {string} addictionId - ID de l'addiction (ou première addiction si null)
     */
    saveEpisode(state, addictionId = null) {
        const effectiveAddiction = addictionId || state.addictions?.[0] || 'porn';
        Storage.addEvent(state, 'episode', effectiveAddiction, null, {
            when: this.data.when,
            trigger: this.data.trigger,
            change: this.data.change
        });
    }

    /**
     * Crée une règle si-alors à partir du déclencheur
     * @param {Object} state - State de l'application
     * @returns {boolean} Succès
     */
    createRuleFromTrigger(state) {
        const trigger = this.data.trigger;
        if (!trigger) return false;
        
        const lang = state.profile.lang;
        const condition = CONDITION_MAP[trigger] || { triggerTag: trigger };
        const actionIds = ['leave_room', 'breathing_446', 'walk_2min'];
        
        if (typeof IfThen !== 'undefined') {
            IfThen.createCustomRule({
                name: TRIGGER_TAGS[trigger]?.[lang] || trigger,
                if: condition,
                then: { actionIds }
            }, state);
            return true;
        }
        return false;
    }
}
