/**
 * Programs Model - Logique métier
 */

export class ProgramsModel {
    constructor() { this.programData = null; this.currentState = null; }

    setState(state) { this.currentState = state; }
    getState() { return this.currentState; }
    getProgramData() { return this.programData; }

    async loadProgram(programId, lang = 'fr') {
        try {
            const duration = programId === 'program_14' ? '14' : '30';
            const response = await fetch(`data/texts/programs_${duration}.${lang}.json`);
            if (!response.ok) {
                const fallbackResponse = await fetch(`data/texts/programs_${duration}.fr.json`);
                this.programData = await fallbackResponse.json();
            } else {
                this.programData = await response.json();
            }
            return this.programData;
        } catch (error) {
            console.error('[Programs] Erreur de chargement:', error);
            return null;
        }
    }

    async startProgram(state, programId) {
        this.currentState = state;
        const lang = state.profile.lang;
        this.programData = await this.loadProgram(programId, lang);
        if (!this.programData) return false;
        state.programs.active = { id: programId, startDate: Storage.getDateISO(), currentDay: 1 };
        Storage.saveState(state);
        return true;
    }

    async resumeProgram(state) {
        this.currentState = state;
        if (!state.programs.active) return null;
        this.programData = await this.loadProgram(state.programs.active.id, state.profile.lang);
        if (!this.programData) return null;
        const startDate = new Date(state.programs.active.startDate);
        const today = new Date();
        const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const currentDay = Math.min(daysSinceStart, this.programData.meta.duration);
        state.programs.active.currentDay = currentDay;
        Storage.saveState(state);
        return currentDay;
    }

    completeProgram(state) {
        if (!state.programs.active) return;
        state.programs.history.push({ id: state.programs.active.id, startDate: state.programs.active.startDate, endDate: Storage.getDateISO(), completed: true });
        state.programs.active = null;
        Storage.saveState(state);
    }

    abandonProgram(state) {
        if (!state.programs.active) return;
        state.programs.history.push({ id: state.programs.active.id, startDate: state.programs.active.startDate, endDate: Storage.getDateISO(), completed: false });
        state.programs.active = null;
        Storage.saveState(state);
    }

    switchProgram(state, programId) {
        if (state.programs.active && state.programs.active.id !== programId) {
            this.abandonProgram(state);
        }
        return this.startProgram(state, programId);
    }

    getDayData(day) {
        if (!this.programData) return null;
        return this.programData.days[day.toString()];
    }

    getDayProgress(state, programId, day) {
        const progress = state.programs.dayProgress[programId] || {};
        return progress[day] || {};
    }

    completeDay(state, day, exerciseData) {
        if (!state.programs.active) return false;
        const programId = state.programs.active.id;
        Storage.saveProgramDayProgress(state, programId, day, { completed: true, exerciseData });
        return true;
    }

    hasActiveProgram(state) { return !!state.programs.active; }
    getActiveProgram(state) { return state.programs.active; }
    getTotalDays() { return this.programData?.meta?.duration || 0; }
}
