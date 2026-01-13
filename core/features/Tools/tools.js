/**
 * Tools Feature - API publique pour le drawer d'outils
 */

import { ToolsController } from './controller/tools-controller.js';

// Instance unique du controller
const toolsController = new ToolsController();

// API publique
export const Tools = {
    openDrawer: (state, homeLabels) => toolsController.openDrawer(state, homeLabels),
    closeDrawer: () => toolsController.closeDrawer(),
    openSlope: (state) => toolsController.openSlope(state),
    openConfig: (state) => toolsController.openConfig(state),
    getMenuLabel: (lang) => toolsController.getMenuLabel(lang)
};

// Exporter globalement pour compatibilité
if (typeof window !== 'undefined') {
    window.Tools = Tools;
    window.openToolsDrawer = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) {
            const homeLabels = typeof Home !== 'undefined' ? Home.getLabels(state.profile.lang) : {};
            Tools.openDrawer(state, homeLabels);
        }
    };
    window.closeToolsDrawer = () => Tools.closeDrawer();
    window.openSlopeForCurrentAddiction = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Tools.openSlope(state);
    };
    window.openConfigForCurrentAddiction = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Tools.openConfig(state);
    };
    window.getConfigButtonLabel = (state) => {
        if (typeof Tools !== 'undefined' && Tools.getConfigButtonLabel) {
            return Tools.getConfigButtonLabel(state);
        }
        // Fallback
        const lang = state.profile?.lang || 'fr';
        const currentAddiction = state.addictions?.[0] || 'porn';
        return `Configurer ${currentAddiction}`;
    };
}
