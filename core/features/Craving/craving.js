/**
 * Craving Feature - API publique pour le protocole de craving
 */

import { CravingController } from './controller/craving-controller.js';

// Instance unique du controller
const cravingController = new CravingController();

// API publique
export const Craving = {
    render: (state) => cravingController.render(state),
    markActionDone: (chip) => cravingController.markActionDone(chip),
    openRelapse: (state) => cravingController.openRelapse(state),
    updateIntensity: (value) => cravingController.updateIntensity(value),
    showEncouragement: (state) => cravingController.showEncouragement(state),
    confirmStep: () => cravingController.confirmStep(),
    finish: (state) => cravingController.finish(state)
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
}
