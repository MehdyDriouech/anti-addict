/**
 * AntiGambling Plugin - Point d'entrée pour l'addiction au jeu d'argent
 */

import { AntiGamblingModel } from './model/antigambling-model.js';
import { AntiGamblingView } from './view/antigambling-view.js';
import { AntiGamblingController } from './controller/antigambling-controller.js';
import { TRIGGERS, SLOPE_SIGNALS, ENVIRONMENT_RULES, CONTEXTUAL_TIPS, SLOPE_STEPS, UI_LABELS } from './data/antigambling-data.js';

const model = new AntiGamblingModel();
const view = new AntiGamblingView();
const controller = new AntiGamblingController(model, view);

const AntiGambling = {
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
    getRandomTips: (lang, count) => model.getRandomTips(lang, count),
    getSlopeData: (lang) => {
        return {
            signals: Object.entries(SLOPE_SIGNALS).map(([key, labels]) => [key, labels[lang] || labels.fr]),
            steps: SLOPE_STEPS,
            tips: CONTEXTUAL_TIPS[lang] || CONTEXTUAL_TIPS.fr
        };
    }
};

window.AntiGambling = AntiGambling;
export default AntiGambling;
