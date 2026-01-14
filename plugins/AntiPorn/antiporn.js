/**
 * AntiPorn Plugin - Point d'entrée
 */

import { AntiPornModel } from './model/antiporn-model.js';
import { AntiPornView } from './view/antiporn-view.js';
import { AntiPornController } from './controller/antiporn-controller.js';
import { TRIGGERS, SLOPE_SIGNALS, ENVIRONMENT_RULES, CONTEXTUAL_TIPS, NIGHT_CHECKLIST_ITEMS, SLOPE_STEPS } from './data/antiporn-data.js';

const antipornModel = new AntiPornModel();
const antipornView = new AntiPornView();
const antipornController = new AntiPornController(antipornModel, antipornView);

const AntiPorn = {
    TRIGGERS, SLOPE_SIGNALS, ENVIRONMENT_RULES, CONTEXTUAL_TIPS, NIGHT_CHECKLIST_ITEMS, SLOPE_STEPS,
    
    logSlope: (state, signal) => antipornController.logSlope(state, signal),
    getRecentSlopes: (state, days) => antipornController.getRecentSlopes(state, days),
    
    openSlopeModal: (state, selectedAddictionId) => antipornController.openSlopeModal(state, selectedAddictionId),
    closeSlopeModal: () => antipornController.closeSlopeModal(),
    onAddictionChange: (addictionId) => antipornController.onAddictionChange(addictionId),
    logWithSignal: (signal) => antipornController.logWithSignal(signal),
    confirmSlope: () => antipornController.confirmSlope(),
    completeStep: (stepKey) => antipornController.completeStep(stepKey),
    
    openNightModal: (state, selectedAddictionId) => antipornController.openNightModal(state, selectedAddictionId),
    closeNightModal: () => antipornController.closeNightModal(),
    onNightAddictionChange: (addictionId) => antipornController.onNightAddictionChange(addictionId),
    toggleNightRoutine: () => antipornController.toggleNightRoutine(),
    addCustomNightItem: () => antipornController.addCustomNightItem(),
    removeCustomNightItem: (index) => antipornController.removeCustomNightItem(index),
    saveNightRoutine: () => antipornController.saveNightRoutine(),
    isNightRoutineTime: (state) => antipornController.isNightRoutineTime(state),
    
    openPhoneBedModal: (state) => antipornController.openPhoneBedModal(state),
    closePhoneBedModal: () => antipornController.closePhoneBedModal(),
    answerPhoneBed: (phoneInBed) => antipornController.answerPhoneBed(phoneInBed),
    getPhoneBedStats: (state) => antipornController.getPhoneBedStats(state),
    
    openConfigModal: (state, selectedAddictionId) => antipornController.openConfigModal(state, selectedAddictionId),
    closeConfigModal: () => antipornController.closeConfigModal(),
    onConfigAddictionChange: (addictionId) => antipornController.onConfigAddictionChange(addictionId),
    toggleTrigger: (trigger) => antipornController.toggleTrigger(trigger),
    saveConfig: () => antipornController.saveConfig(),
    
    renderEnvironmentChecklist: (state) => antipornController.renderEnvironmentChecklist(state),
    getRandomTips: (lang, count) => antipornController.getRandomTips(lang, count),
    renderNightButton: (state) => antipornController.renderNightButton(state),
    getSlopeData: (lang) => antipornView.getSlopeData(lang)
};

window.AntiPorn = AntiPorn;
export default AntiPorn;
