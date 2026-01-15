/**
 * Craving Feature - API publique pour le protocole de craving
 */

import { CravingController } from './controller/craving-controller.js';
import { getServices } from '../../Utils/serviceHelper.js';

// Instance unique du controller
let cravingController = new CravingController();

// Initialiser les services de manière asynchrone
async function initControllerServices() {
    try {
        const services = await getServices(['storage', 'date', 'store', 'ui', 'i18n']);
        cravingController = new CravingController(services);
        await cravingController.initServices();
    } catch (error) {
        console.warn('[Craving] Erreur lors de l\'initialisation des services, utilisation des fallbacks:', error);
        // Le controller utilisera les fallbacks window.*
    }
}

// Initialiser immédiatement si possible
initControllerServices();

// API publique
export const Craving = {
    render: (state) => cravingController.render(state),
    markActionDone: (chip) => cravingController.markActionDone(chip),
    openRelapse: (state) => cravingController.openRelapse(state),
    updateIntensity: (value) => cravingController.updateIntensity(value),
    showEncouragement: (state) => cravingController.showEncouragement(state),
    confirmStep: () => cravingController.confirmStep(),
    finish: (state) => cravingController.finish(state),
    onAddictionChange: (addictionId, state) => cravingController.onAddictionChange(addictionId, state)
};

// Exporter globalement pour compatibilité
if (typeof window !== 'undefined') {
    window.Craving = Craving;
    window.renderCraving = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Craving.render(state);
    };
    window.markActionDone = (chip) => Craving.markActionDone(chip);
    window.openRelapseFromCraving = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Craving.openRelapse(state);
    };
    window.updateIntensity = (value) => Craving.updateIntensity(value);
    window.showEncouragement = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Craving.showEncouragement(state);
    };
    window.confirmProtocolStep = () => Craving.confirmStep();
    window.finishProtocol = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Craving.finish(state);
    };
    window.onCravingAddictionChange = (addictionId) => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Craving.onAddictionChange(addictionId, state);
    };
}
