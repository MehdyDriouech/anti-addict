/**
 * AntiShopping Plugin - Point d'entrée pour l'addiction aux achats compulsifs
 */

import { AntiShoppingModel } from './model/antishopping-model.js';
import { AntiShoppingView } from './view/antishopping-view.js';
import { AntiShoppingController } from './controller/antishopping-controller.js';
import { TRIGGERS, SLOPE_SIGNALS, ENVIRONMENT_RULES, CONTEXTUAL_TIPS, SLOPE_STEPS, UI_LABELS } from './data/antishopping-data.js';

const model = new AntiShoppingModel();
const view = new AntiShoppingView();
const controller = new AntiShoppingController(model, view);

const AntiShopping = {
    TRIGGERS, SLOPE_SIGNALS, ENVIRONMENT_RULES, SLOPE_STEPS, UI_LABELS,
    openSlopeModal: (state, selectedAddictionId) => controller.openSlopeModal(state, selectedAddictionId),
    closeSlopeModal: () => controller.closeSlopeModal(),
    onAddictionChange: (addictionId) => controller.onAddictionChange(addictionId),
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

window.AntiShopping = AntiShopping;
export default AntiShopping;
