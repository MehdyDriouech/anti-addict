/**
 * AntiGaming Plugin - Point d'entrée pour l'addiction aux jeux vidéo
 */

import { AntiGamingModel } from './model/antigaming-model.js';
import { AntiGamingView } from './view/antigaming-view.js';
import { AntiGamingController } from './controller/antigaming-controller.js';
import { TRIGGERS, SLOPE_SIGNALS, ENVIRONMENT_RULES, CONTEXTUAL_TIPS, SLOPE_STEPS, UI_LABELS } from './data/antigaming-data.js';

const model = new AntiGamingModel();
const view = new AntiGamingView();
const controller = new AntiGamingController(model, view);

const AntiGaming = {
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

window.AntiGaming = AntiGaming;
export default AntiGaming;
