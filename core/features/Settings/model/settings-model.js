/**
 * Settings Model - Logique métier pour les réglages
 */

import { ADDICTION_ICONS } from '../data/settings-data.js';

export class SettingsModel {
    /**
     * Récupère l'icône d'une addiction
     * @param {string} addictionId - ID de l'addiction
     * @returns {string} Icône
     */
    getAddictionIcon(addictionId) {
        return ADDICTION_ICONS[addictionId] || '📋';
    }

    /**
     * Applique un thème
     * @param {string} themeName - Nom du thème (light/dark)
     */
    applyTheme(themeName) {
        const html = document.documentElement;
        if (themeName === 'light') {
            html.classList.add('theme-light');
        } else {
            html.classList.remove('theme-light');
        }
    }

    /**
     * Bascule le thème
     * @param {Object} state - State de l'application
     * @returns {string} Nouveau thème
     */
    toggleTheme(state) {
        const currentTheme = state.settings.theme || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        state.settings.theme = newTheme;
        Storage.saveState(state);
        this.applyTheme(newTheme);
        
        return newTheme;
    }

    /**
     * Met à jour la langue
     * @param {Object} state - State de l'application
     * @param {string} lang - Nouvelle langue
     * @returns {Promise<void>}
     */
    async updateLanguage(state, lang) {
        state.profile.lang = lang;
        state.profile.rtl = lang === 'ar';
        Storage.saveState(state);
        await I18n.initI18n(state.profile.lang, state.profile.religion);
    }

    /**
     * Met à jour la religion
     * @param {Object} state - State de l'application
     * @param {string} religion - Nouvelle religion
     * @returns {Promise<void>}
     */
    async updateReligion(state, religion) {
        state.profile.religion = religion;
        state.profile.spiritualEnabled = religion !== 'none';
        Storage.saveState(state);
        await I18n.loadSpiritualCards(state.profile.lang, state.profile.religion);
    }

    /**
     * Toggle une addiction
     * @param {Object} state - State de l'application
     * @param {string} addictionId - ID de l'addiction
     * @param {boolean} enabled - Activé ou non
     * @returns {Promise<boolean>} Succès
     */
    async toggleAddiction(state, addictionId, enabled) {
        // Vérifier si un disclaimer est nécessaire
        if (enabled && typeof AddictionsConfig !== 'undefined' && AddictionsConfig.hasDisclaimer) {
            const needsDisclaimer = AddictionsConfig.hasDisclaimer(addictionId);
            if (needsDisclaimer) {
                const config = AddictionsConfig.getAddictionConfig(addictionId);
                const proceed = await this.showDisclaimerModal([{ id: addictionId, disclaimerKey: config.disclaimerKey }]);
                if (!proceed) {
                    return false;
                }
            }
        }
        
        // Ajouter ou retirer l'addiction
        if (enabled) {
            const config = typeof AddictionsConfig !== 'undefined' && AddictionsConfig.getAddictionConfig ? AddictionsConfig.getAddictionConfig(addictionId) : null;
            const goal = config && config.defaultGoal ? config.defaultGoal : 'abstinence';
            
            if (!state.addictions.some(a => a.id === addictionId)) {
                state.addictions.push({ id: addictionId, goal });
            }
        } else {
            state.addictions = state.addictions.filter(a => a.id !== addictionId);
        }
        
        Storage.saveState(state);
        return true;
    }

    /**
     * Affiche le modal de disclaimer (à implémenter depuis Onboarding)
     * @param {Array} addictionsWithDisclaimer - Liste des addictions avec disclaimer
     * @returns {Promise<boolean>}
     */
    async showDisclaimerModal(addictionsWithDisclaimer) {
        // Cette fonction sera implémentée dans Onboarding
        if (typeof Onboarding !== 'undefined' && Onboarding.showDisclaimerModal) {
            return await Onboarding.showDisclaimerModal(addictionsWithDisclaimer);
        }
        return true;
    }

    /**
     * Exporte les données
     * @param {Object} state - State de l'application
     */
    exportData(state) {
        Storage.exportState(state);
    }

    /**
     * Importe les données
     * @param {File} file - Fichier à importer
     * @returns {Promise<Object>} Résultat de l'import
     */
    async importData(file) {
        return await Storage.importState(file);
    }

    /**
     * Efface toutes les données
     * @returns {Object} Nouveau state par défaut
     */
    clearData() {
        Storage.clearAllData();
        return Storage.getDefaultState();
    }
}
