/**
 * Settings Model - Logique métier pour les réglages
 */

import { ADDICTION_ICONS } from '../data/settings-data.js';

export class SettingsModel {
    constructor(services = {}) {
        this.storage = services.storage || (typeof window !== 'undefined' ? window.Storage : null);
        this.i18n = services.i18n || (typeof window !== 'undefined' ? window.I18n : null);
    }

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
        this.storage?.saveState(state);
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
        this.storage?.saveState(state);
        await (this.i18n?.initI18n || (typeof I18n !== 'undefined' ? I18n.initI18n : () => {}))(state.profile.lang, state.profile.religion);
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
        this.storage?.saveState(state);
        await (this.i18n?.loadSpiritualCards || (typeof I18n !== 'undefined' ? I18n.loadSpiritualCards : () => {}))(state.profile.lang, state.profile.religion);
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
        
        this.storage?.saveState(state);
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
     * @param {Object} options - Options d'export { encrypt }
     * @returns {Promise<void>}
     */
    async exportData(state, options = {}) {
        try {
            await Storage.exportState(state, options);
        } catch (error) {
            console.error('[SettingsModel] Erreur lors de l\'export:', error);
            throw error;
        }
    }

    /**
     * Importe les données
     * @param {File} file - Fichier à importer
     * @returns {Promise<Object>} Résultat de l'import (peut contenir needsPassword: true)
     */
    async importData(file) {
        try {
            return await Storage.importState(file);
        } catch (error) {
            console.error('[SettingsModel] Erreur lors de l\'import:', error);
            return { valid: false, errors: ['Erreur lors de la lecture du fichier'], state: null };
        }
    }

    /**
     * Déchiffre et importe des données chiffrées
     * @param {Object} encryptedData - Données chiffrées
     * @param {string} pin - PIN pour déchiffrer
     * @returns {Promise<Object>} Résultat de l'import
     */
    async decryptAndImportData(encryptedData, pin) {
        try {
            return await Storage.decryptAndImport(encryptedData, pin);
        } catch (error) {
            console.error('[SettingsModel] Erreur lors du déchiffrement:', error);
            return { valid: false, errors: ['Erreur lors du déchiffrement'], state: null };
        }
    }

    /**
     * Efface toutes les données
     * @returns {Object} Nouveau state par défaut
     */
    clearData() {
        Storage.clearAllData();
        return Storage.getDefaultState();
    }

    /**
     * Active/désactive le verrouillage automatique
     * @param {Object} state - State de l'application
     * @param {boolean} enabled - Activé ou non
     * @returns {Promise<boolean>} Succès
     */
    async toggleAutoLock(state, enabled) {
        // Vérifier que le PIN est activé si on active le verrouillage automatique
        if (enabled && typeof window.Security !== 'undefined' && window.Security.hasPin) {
            const hasPin = await window.Security.hasPin();
            if (!hasPin) {
                return false; // PIN non défini
            }
        }

        if (!state.settings.autoLock) {
            state.settings.autoLock = { enabled: false, delay: 60000 };
        }
        
        state.settings.autoLock.enabled = enabled;
        this.storage?.saveState(state);
        
        // Mettre à jour le module auto-lock
        if (typeof window.AutoLock !== 'undefined' && window.AutoLock.updateConfig) {
            window.AutoLock.updateConfig(enabled, state.settings.autoLock.delay);
        }
        
        return true;
    }

    /**
     * Met à jour le délai de verrouillage automatique
     * @param {Object} state - State de l'application
     * @param {number} delay - Délai en millisecondes
     * @returns {Promise<void>}
     */
    async updateAutoLockDelay(state, delay) {
        if (!state.settings.autoLock) {
            state.settings.autoLock = { enabled: false, delay: 60000 };
        }
        
        state.settings.autoLock.delay = delay;
        this.storage?.saveState(state);
        
        // Mettre à jour le module auto-lock
        if (typeof window.AutoLock !== 'undefined' && window.AutoLock.updateConfig) {
            window.AutoLock.updateConfig(state.settings.autoLock.enabled, delay);
        }
    }

    /**
     * Active/désactive le verrouillage automatique au changement d'onglet
     * @param {Object} state - State de l'application
     * @param {boolean} enabled - Activé ou non
     * @returns {Promise<boolean>} Succès
     */
    async toggleAutoLockOnTabBlur(state, enabled) {
        // Vérifier que le PIN est activé si on active le verrouillage au changement d'onglet
        if (enabled && typeof window.Security !== 'undefined' && window.Security.hasPin) {
            const hasPin = await window.Security.hasPin();
            if (!hasPin) {
                return false; // PIN non défini
            }
        }

        if (!state.settings.autoLock) {
            state.settings.autoLock = { enabled: false, delay: 60000, autoLockOnTabBlur: false };
        }
        
        state.settings.autoLock.autoLockOnTabBlur = enabled;
        this.storage?.saveState(state);
        
        // Réinitialiser le module auto-lock pour appliquer le changement
        if (typeof window.AutoLock !== 'undefined' && window.AutoLock.init) {
            window.AutoLock.init(state);
        }
        
        return true;
    }
}
