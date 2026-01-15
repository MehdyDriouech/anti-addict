/**
 * Onboarding Model - Logique métier pour l'onboarding
 */

import { ONBOARDING_DEFAULTS } from '../data/onboarding-data.js';

export class OnboardingModel {
    /**
     * Vérifie si l'onboarding est nécessaire
     * @param {Object} state - State de l'application
     * @returns {boolean}
     */
    needsOnboarding(state) {
        return !state.addictions || state.addictions.length === 0;
    }

    /**
     * Récupère les addictions avec disclaimer
     * @param {Array} selectedAddictions - Addictions sélectionnées
     * @returns {Array} Liste des addictions avec disclaimer
     */
    getAddictionsWithDisclaimer(selectedAddictions) {
        if (typeof AddictionsConfig === 'undefined' || !AddictionsConfig.hasDisclaimer) {
            return [];
        }
        
        return selectedAddictions
            .filter(id => AddictionsConfig.hasDisclaimer(id))
            .map(id => {
                const config = AddictionsConfig.getAddictionConfig(id);
                return { id, disclaimerKey: config.disclaimerKey };
            });
    }

    /**
     * Complète l'onboarding
     * @param {Object} state - State de l'application
     * @param {Array} addictions - Addictions sélectionnées
     * @param {string} lang - Langue
     * @param {string} religion - Religion
     * @returns {Promise<boolean>} Succès
     */
    async completeOnboarding(state, addictions, lang, religion) {
        try {
            // Mettre à jour le state
            state.addictions = addictions.map(id => {
                const config = typeof AddictionsConfig !== 'undefined' && AddictionsConfig.getAddictionConfig ? AddictionsConfig.getAddictionConfig(id) : null;
                const goal = config && config.defaultGoal ? config.defaultGoal : 'abstinence';
                return { id, goal };
            });
            
            state.profile.lang = lang;
            state.profile.religion = religion;
            state.profile.spiritualEnabled = religion !== 'none';
            state.profile.rtl = lang === 'ar';
            
            // Sauvegarder
            Storage.saveState(state);
            
            // Recharger i18n
            await I18n.initI18n(state.profile.lang, state.profile.religion);
            
            return true;
        } catch (error) {
            console.error('[Onboarding] Erreur lors de la complétion:', error);
            return false;
        }
    }
}
