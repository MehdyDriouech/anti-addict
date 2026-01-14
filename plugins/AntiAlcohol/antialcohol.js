/**
 * AntiAlcohol Plugin - Point d'entrée pour l'addiction à l'alcool
 */

import { AntiAlcoholModel } from './model/antialcohol-model.js';
import { AntiAlcoholView } from './view/antialcohol-view.js';
import { AntiAlcoholController } from './controller/antialcohol-controller.js';
import { TRIGGERS, SLOPE_SIGNALS, ENVIRONMENT_RULES, CONTEXTUAL_TIPS, SLOPE_STEPS, UI_LABELS } from './data/antialcohol-data.js';

const model = new AntiAlcoholModel();
const view = new AntiAlcoholView();
const controller = new AntiAlcoholController(model, view);

const AntiAlcohol = {
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

window.AntiAlcohol = AntiAlcohol;
export default AntiAlcohol;
