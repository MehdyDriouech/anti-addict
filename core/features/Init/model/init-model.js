/**
 * Init Model - Logique métier pour l'initialisation
 */

import { INIT_DEFAULTS } from '../data/init-data.js';

export class InitModel {
    /**
     * Initialise l'application
     * @param {Object} state - State de l'application
     * @returns {Promise<void>}
     */
    async init(state) {
        // Initialiser le state pour les modules qui en ont besoin
        if (typeof Programs !== 'undefined' && Programs.setState) {
            Programs.setState(state);
        }
        
        // Initialiser i18n avec la langue du profil
        await I18n.initI18n(state.profile.lang, state.profile.religion);
    }

    /**
     * Applique le thème sauvegardé
     * @param {Object} state - State de l'application
     */
    applyTheme(state) {
        const themeName = state.settings?.theme || INIT_DEFAULTS.theme;
        if (typeof Settings !== 'undefined' && Settings.applyTheme) {
            Settings.applyTheme(themeName);
        } else {
            // Fallback
            const html = document.documentElement;
            if (themeName === 'light') {
                html.classList.add('theme-light');
            } else {
                html.classList.remove('theme-light');
            }
        }
    }
}
