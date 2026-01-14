/**
 * AntiSmoke Plugin - Point d'entrée pour l'addiction à la cigarette
 */

import { AntiSmokeModel } from './model/antismoke-model.js';
import { AntiSmokeView } from './view/antismoke-view.js';
import { AntiSmokeController } from './controller/antismoke-controller.js';
import { TRIGGERS, SLOPE_SIGNALS, ENVIRONMENT_RULES, CONTEXTUAL_TIPS, SLOPE_STEPS, UI_LABELS } from './data/antismoke-data.js';

const antismokeModel = new AntiSmokeModel();
const antismokeView = new AntiSmokeView();
const antismokeController = new AntiSmokeController(antismokeModel, antismokeView);

const AntiSmoke = {
    // Données exportées
    TRIGGERS,
    SLOPE_SIGNALS,
    ENVIRONMENT_RULES,
    SLOPE_STEPS,
    UI_LABELS,
    
    // API principale
    openSlopeModal: (state, selectedAddictionId) => antismokeController.openSlopeModal(state, selectedAddictionId),
    closeSlopeModal: () => antismokeController.closeSlopeModal(),
    onAddictionChange: (addictionId) => antismokeController.onAddictionChange(addictionId),
    logWithSignal: (signal) => antismokeController.logWithSignal(signal),
    confirmSlope: () => antismokeController.confirmSlope(),
    completeStep: (stepKey) => antismokeController.completeStep(stepKey),
    
    // Configuration
    openConfigModal: (state) => antismokeController.openConfigModal(state),
    closeConfigModal: () => antismokeController.closeConfigModal(),
    toggleTrigger: (trigger) => antismokeController.toggleTrigger(trigger),
    saveConfig: () => antismokeController.saveConfig(),
    
    // Statistiques
    getStats: (state) => antismokeController.getStats(state),
    getRecentSlopes: (state, days) => antismokeController.getRecentSlopes(state, days),
    
    // Helpers
    getRandomTips: (lang, count) => antismokeModel.getRandomTips(lang, count),
    calculateMoneySaved: (perDay, price, days) => antismokeModel.calculateMoneySaved(perDay, price, days),
    getSlopeData: (lang) => antismokeView.getSlopeData(lang)
};

window.AntiSmoke = AntiSmoke;
export default AntiSmoke;
