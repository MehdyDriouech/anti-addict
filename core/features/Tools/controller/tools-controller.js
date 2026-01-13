/**
 * Tools Controller - Orchestration Model/View
 */

import { ToolsModel } from '../model/tools-model.js';
import { ToolsView } from '../view/tools-view.js';

export class ToolsController {
    constructor() {
        this.model = new ToolsModel();
        this.view = new ToolsView();
    }

    /**
     * Ouvre le drawer des outils
     * @param {Object} state - State de l'application
     * @param {Object} homeLabels - Labels de la page d'accueil
     */
    openDrawer(state, homeLabels) {
        const configButtonLabel = this.model.getConfigButtonLabel(state);
        this.view.renderDrawer(state, homeLabels, configButtonLabel);
    }

    /**
     * Ferme le drawer
     */
    closeDrawer() {
        this.view.closeDrawer();
    }

    /**
     * Ouvre la modale "pente" pour l'addiction courante
     * @param {Object} state - State de l'application
     */
    openSlope(state) {
        const currentAddiction = state.addictions?.[0] || 'porn';
        const pluginName = this.model.getPluginName(currentAddiction);
        
        if (pluginName && typeof window[pluginName] !== 'undefined') {
            window[pluginName].openSlopeModal(state);
        } else {
            // Fallback vers AntiPorn
            if (typeof AntiPorn !== 'undefined') {
                AntiPorn.openSlopeModal(state);
            }
        }
    }

    /**
     * Ouvre la modale de configuration pour l'addiction courante
     * @param {Object} state - State de l'application
     */
    openConfig(state) {
        if (!state) {
            console.error('[Config] State non disponible');
            return;
        }
        
        const currentAddiction = state.addictions?.[0] || 'porn';
        const pluginName = this.model.getPluginName(currentAddiction);
        
        if (pluginName && typeof window[pluginName] !== 'undefined') {
            if (window[pluginName].openConfigModal) {
                window[pluginName].openConfigModal(state);
            } else {
                console.warn(`[Config] Plugin ${pluginName} n'a pas de méthode openConfigModal`);
                if (typeof UI !== 'undefined') {
                    UI.showToast('Configuration non disponible pour cette addiction', 'warning');
                }
            }
        } else {
            // Fallback vers AntiPorn
            if (typeof AntiPorn !== 'undefined' && AntiPorn.openConfigModal) {
                AntiPorn.openConfigModal(state);
            } else {
                console.error('[Config] Aucun plugin de configuration disponible');
                if (typeof UI !== 'undefined') {
                    UI.showToast('Configuration non disponible', 'error');
                }
            }
        }
    }

    /**
     * Récupère le label du menu selon la langue
     * @param {string} lang - Langue
     * @returns {string} Label du menu
     */
    getMenuLabel(lang) {
        return this.view.getMenuLabel(lang);
    }
}
