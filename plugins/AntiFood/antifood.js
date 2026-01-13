/**
 * AntiFood Plugin - Point d'entrée pour l'addiction alimentaire compulsive
 */

import { AntiFoodModel } from './model/antifood-model.js';
import { AntiFoodView } from './view/antifood-view.js';
import { AntiFoodController } from './controller/antifood-controller.js';
import { TRIGGERS, SLOPE_SIGNALS, ENVIRONMENT_RULES, CONTEXTUAL_TIPS, SLOPE_STEPS, UI_LABELS } from './data/antifood-data.js';

const model = new AntiFoodModel();
const view = new AntiFoodView();
const controller = new AntiFoodController(model, view);

const AntiFood = {
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

window.AntiFood = AntiFood;
export default AntiFood;
