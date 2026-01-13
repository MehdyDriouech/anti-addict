/**
 * IfThen Model - Logique métier CRUD et matching
 */

import { RULE_TEMPLATES, ACTIONS } from '../data/ifthen-data.js';

export class IfThenModel {
    /**
     * Récupère toutes les règles
     * @param {Object} state - State de l'application
     * @returns {Array}
     */
    getRules(state) {
        return state.ifThenRules || [];
    }

    /**
     * Récupère les règles actives
     * @param {Object} state - State de l'application
     * @returns {Array}
     */
    getActiveRules(state) {
        return this.getRules(state).filter(r => r.enabled);
    }

    /**
     * Crée une nouvelle règle à partir d'un template
     * @param {string} templateKey - Clé du template
     * @param {Object} state - State de l'application
     * @param {string} addictionId - ID de l'addiction (ou première addiction si null)
     * @returns {Object} La règle créée
     */
    createRuleFromTemplate(templateKey, state, addictionId = null) {
        const template = RULE_TEMPLATES[templateKey];
        if (!template) return null;
        
        const lang = state.profile.lang;
        const effectiveAddiction = addictionId || state.addictions?.[0] || 'porn';
        
        const rule = {
            id: Utils.generateId(),
            enabled: true,
            addictionId: effectiveAddiction,
            name: template.name[lang] || template.name.fr,
            if: { ...template.if },
            then: { ...template.then }
        };
        
        Storage.saveIfThenRule(state, rule);
        return rule;
    }

    /**
     * Crée une règle personnalisée
     * @param {Object} ruleData - Données de la règle
     * @param {Object} state - State de l'application
     * @returns {Object} La règle créée
     */
    createCustomRule(ruleData, state) {
        const rule = {
            id: Utils.generateId(),
            enabled: true,
            addictionId: ruleData.addictionId || 'porn',
            name: ruleData.name || '',
            if: ruleData.if || {},
            then: ruleData.then || { actionIds: [] }
        };
        
        Storage.saveIfThenRule(state, rule);
        return rule;
    }

    /**
     * Met à jour une règle
     * @param {string} ruleId - ID de la règle
     * @param {Object} updates - Mises à jour
     * @param {Object} state - State de l'application
     * @returns {Object|null} La règle mise à jour
     */
    updateRule(ruleId, updates, state) {
        const rules = this.getRules(state);
        const ruleIndex = rules.findIndex(r => r.id === ruleId);
        
        if (ruleIndex === -1) return null;
        
        const updatedRule = { ...rules[ruleIndex], ...updates };
        Storage.saveIfThenRule(state, updatedRule);
        return updatedRule;
    }

    /**
     * Active/désactive une règle
     * @param {string} ruleId - ID de la règle
     * @param {boolean} enabled - État souhaité
     * @param {Object} state - State de l'application
     */
    toggleRule(ruleId, enabled, state) {
        return this.updateRule(ruleId, { enabled }, state);
    }

    /**
     * Supprime une règle
     * @param {string} ruleId - ID de la règle
     * @param {Object} state - State de l'application
     */
    deleteRule(ruleId, state) {
        Storage.deleteIfThenRule(state, ruleId);
    }

    /**
     * Trouve les règles qui matchent le contexte actuel
     * @param {Object} state - State de l'application
     * @param {Object} context - Contexte { alone, stress, mood, triggers, ... }
     * @returns {Array} Règles qui matchent
     */
    findMatchingRules(state, context = {}) {
        return Utils.matchIfThenRules(state, context);
    }

    /**
     * Récupère les actions suggérées pour les règles matchées
     * @param {Array} matchedRules - Règles qui ont matché
     * @param {string} lang - Langue
     * @returns {Array} Actions avec labels
     */
    getActionsFromRules(matchedRules, lang = 'fr') {
        const actionSet = new Set();
        const actions = [];
        
        matchedRules.forEach(rule => {
            (rule.then.actionIds || []).forEach(actionId => {
                if (!actionSet.has(actionId) && ACTIONS[actionId]) {
                    actionSet.add(actionId);
                    actions.push({
                        id: actionId,
                        label: ACTIONS[actionId][lang] || ACTIONS[actionId].fr
                    });
                }
            });
        });
        
        return actions;
    }
}
