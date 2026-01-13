/**
 * AntiDrugs Plugin - Point d'entrée pour l'addiction aux substances
 */

import { AntiDrugsModel } from './model/antidrugs-model.js';
import { AntiDrugsView } from './view/antidrugs-view.js';
import { AntiDrugsController } from './controller/antidrugs-controller.js';
import { TRIGGERS, SLOPE_SIGNALS, ENVIRONMENT_RULES, CONTEXTUAL_TIPS, SLOPE_STEPS, UI_LABELS } from './data/antidrugs-data.js';

const model = new AntiDrugsModel();
const view = new AntiDrugsView();
const controller = new AntiDrugsController(model, view);

const AntiDrugs = {
    TRIGGERS, SLOPE_SIGNALS, ENVIRONMENT_RULES, SLOPE_STEPS, UI_LABELS,
    openSlopeModal: (state) => controller.openSlopeModal(state),
    closeSlopeModal: () => controller.closeSlopeModal(),
    logWithSignal: (signal) => controller.logWithSignal(signal),
    confirmSlope: () => controller.confirmSlope(),
    completeStep: (stepKey) => controller.completeStep(stepKey),
    openConfigModal: (state) => controller.openConfigModal(state),
    closeConfigModal: () => controller.closeConfigModal(),
    toggleTrigger: (trigger) => controller.toggleTrigger(trigger),
    saveConfig: () => controller.saveConfig(),
    getStats: (state) => controller.getStats(state),
    getRecentSlopes: (state, days) => controller.getRecentSlopes(state, days),
    getRandomTips: (lang, count) => model.getRandomTips(lang, count)
};

window.AntiDrugs = AntiDrugs;
export default AntiDrugs;
