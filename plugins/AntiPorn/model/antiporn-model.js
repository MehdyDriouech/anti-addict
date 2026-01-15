/**
 * AntiPorn Model - Logique métier pour l'addiction au contenu adulte
 */

import { AddictionBaseModel } from '../../AddictionBase/model/addiction-base-model.js';
import { CONTEXTUAL_TIPS } from '../data/antiporn-data.js';

export class AntiPornModel extends AddictionBaseModel {
    constructor(services = {}) {
        super('porn', services);
        this.slopeStep = 0;
        this.slopeStepsCompleted = { leave: false, water: false, move: false };
    }

    resetSlopeSteps() {
        this.slopeStep = 0;
        this.slopeStepsCompleted = { leave: false, water: false, move: false };
    }

    completeStep(stepKey, state) {
        this.slopeStepsCompleted[stepKey] = true;
        this.slopeStep++;
        const allCompleted = Object.values(this.slopeStepsCompleted).every(v => v);
        if (allCompleted) {
            this.incrementStoppedSlopes(state);
            this.logSlope(state, 'completed_steps');
        }
        return allCompleted;
    }

    isAllStepsCompleted() {
        return Object.values(this.slopeStepsCompleted).every(v => v);
    }

    getCurrentStep() { return this.slopeStep; }
    getStepsCompleted() { return { ...this.slopeStepsCompleted }; }

    getRandomTips(lang = 'fr', count = 3) {
        return super.getRandomTips(CONTEXTUAL_TIPS, lang, count);
    }

    // Night Routine
    isNightRoutineTime(state) {
        if (!state.nightRoutine?.enabled) return false;
        const now = new Date();
        const hour = now.getHours();
        const routineHour = state.nightRoutine.hour || 22;
        return hour >= routineHour || hour < 6;
    }

    toggleNightRoutine(state, enabled) {
        if (!state.nightRoutine) state.nightRoutine = {};
        state.nightRoutine.enabled = enabled;
        this.storage?.saveState(state);
    }

    addCustomNightItem(state, text) {
        if (!state.nightRoutine) state.nightRoutine = {};
        if (!state.nightRoutine.customChecklist) state.nightRoutine.customChecklist = [];
        state.nightRoutine.customChecklist.push(text);
        this.storage?.saveState(state);
    }

    removeCustomNightItem(state, index) {
        if (state.nightRoutine?.customChecklist) {
            state.nightRoutine.customChecklist.splice(index, 1);
            this.storage?.saveState(state);
        }
    }

    saveNightRoutine(state, checklist, hour) {
        if (!state.nightRoutine) state.nightRoutine = {};
        state.nightRoutine.checklist = checklist;
        state.nightRoutine.hour = hour;
        if (!state.nightRoutine.logs) state.nightRoutine.logs = [];
        const today = this.dateService?.todayISO() || (this.storage?.getDateISO ? this.storage.getDateISO() : (typeof Storage !== 'undefined' ? Storage.getDateISO() : new Date().toISOString().split('T')[0]));
        const existingIdx = state.nightRoutine.logs.findIndex(l => l.date === today);
        const log = { date: today, checklist, completed: true };
        if (existingIdx >= 0) state.nightRoutine.logs[existingIdx] = log;
        else state.nightRoutine.logs.push(log);
        this.storage?.saveState(state);
    }

    // Phone Bed - utilise addictionConfigs au lieu de antiporn
    answerPhoneBed(state, phoneInBed) {
        this.ensureAddictionConfig(state);
        if (!state.addictionConfigs.porn.phoneBedCheckins) {
            state.addictionConfigs.porn.phoneBedCheckins = [];
        }
        const today = this.dateService?.todayISO() || (this.storage?.getDateISO ? this.storage.getDateISO() : (typeof Storage !== 'undefined' ? Storage.getDateISO() : new Date().toISOString().split('T')[0]));
        const checkins = state.addictionConfigs.porn.phoneBedCheckins;
        const existingIdx = checkins.findIndex(c => c.date === today);
        const checkin = { date: today, phoneInBed };
        if (existingIdx >= 0) checkins[existingIdx] = checkin;
        else checkins.push(checkin);
        this.storage?.saveState(state);
    }

    getPhoneBedStats(state, days = 7) {
        const config = this.getAddictionConfig(state);
        const checkins = config?.phoneBedCheckins || [];
        const startDate = Utils.daysAgoISO(days - 1);
        const recentCheckins = checkins.filter(c => c.date >= startDate);
        const phoneOutDays = recentCheckins.filter(c => !c.phoneInBed).length;
        return { total: recentCheckins.length, phoneOut: phoneOutDays, phoneIn: recentCheckins.length - phoneOutDays };
    }
}
