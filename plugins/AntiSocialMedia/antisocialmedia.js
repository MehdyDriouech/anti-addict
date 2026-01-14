/**
 * AntiSocialMedia Plugin - Point d'entrée pour l'addiction aux réseaux sociaux
 */

import { AntiSocialMediaModel } from './model/antisocialmedia-model.js';
import { AntiSocialMediaView } from './view/antisocialmedia-view.js';
import { AntiSocialMediaController } from './controller/antisocialmedia-controller.js';
import { TRIGGERS, SLOPE_SIGNALS, ENVIRONMENT_RULES, CONTEXTUAL_TIPS, SLOPE_STEPS, UI_LABELS } from './data/antisocialmedia-data.js';

const model = new AntiSocialMediaModel();
const view = new AntiSocialMediaView();
const controller = new AntiSocialMediaController(model, view);

const AntiSocialMedia = {
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

window.AntiSocialMedia = AntiSocialMedia;
export default AntiSocialMedia;
