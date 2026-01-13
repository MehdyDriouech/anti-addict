/**
 * Experiments Model - Logique métier
 */

import { EXPERIMENT_TEMPLATES } from '../data/experiments-data.js';

export class ExperimentsModel {
    calculateBaseline(state, startDate) {
        const start = Utils.parseISODate(startDate);
        const baselineStart = new Date(start);
        baselineStart.setDate(baselineStart.getDate() - 7);
        const baselineStartISO = baselineStart.toISOString().split('T')[0];
        
        const events = state.events.filter(e => 
            e.date >= baselineStartISO && e.date < startDate
        );
        
        const cravings = events.filter(e => e.type === 'craving').length;
        const episodes = events.filter(e => e.type === 'episode').length;
        
        return {
            cravingsPerDay: Math.round((cravings / 7) * 10) / 10,
            episodesPerWeek: episodes
        };
    }

    calculateResults(state, experiment) {
        const startDate = experiment.startDate;
        const endDate = new Date(Utils.parseISODate(startDate));
        endDate.setDate(endDate.getDate() + experiment.days);
        const endDateISO = endDate.toISOString().split('T')[0];
        
        const events = state.events.filter(e => 
            e.date >= startDate && e.date <= endDateISO
        );
        
        const cravings = events.filter(e => e.type === 'craving').length;
        const episodes = events.filter(e => e.type === 'episode').length;
        
        const cravingsPerDay = Math.round((cravings / experiment.days) * 10) / 10;
        const baseline = experiment.baseline || { cravingsPerDay: 0 };
        const cravingImprovement = baseline.cravingsPerDay > 0 
            ? Math.round(((baseline.cravingsPerDay - cravingsPerDay) / baseline.cravingsPerDay) * 100)
            : 0;
        
        return {
            cravingsPerDay,
            episodesPerWeek: episodes,
            improvement: { cravings: cravingImprovement }
        };
    }

    isExperimentActive(experiment) {
        if (!experiment.active) return false;
        
        const today = Utils.todayISO();
        const endDate = new Date(Utils.parseISODate(experiment.startDate));
        endDate.setDate(endDate.getDate() + experiment.days);
        const endDateISO = endDate.toISOString().split('T')[0];
        
        return today >= experiment.startDate && today <= endDateISO;
    }

    getCurrentDay(experiment) {
        const today = Utils.todayISO();
        const start = Utils.parseISODate(experiment.startDate);
        const now = Utils.parseISODate(today);
        const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
        return Math.min(Math.max(diffDays, 1), experiment.days);
    }

    startExperiment(templateKey, state, addictionId = null) {
        const template = EXPERIMENT_TEMPLATES[templateKey];
        if (!template) return null;
        
        const lang = state.profile.lang;
        const startDate = Utils.todayISO();
        const baseline = this.calculateBaseline(state, startDate);
        const effectiveAddiction = addictionId || state.addictions?.[0] || 'porn';
        
        const experiment = {
            id: Utils.generateId(),
            name: template.name[lang] || template.name.fr,
            description: template.description[lang] || template.description.fr,
            addictionId: effectiveAddiction,
            startDate,
            days: template.days,
            rule: template.rule,
            active: true,
            baseline,
            results: null
        };
        
        Storage.saveExperiment(state, experiment);
        return experiment;
    }

    endExperiment(experimentId, state) {
        const experiment = state.experiments.find(e => e.id === experimentId);
        if (!experiment) return null;
        
        experiment.results = this.calculateResults(state, experiment);
        experiment.active = false;
        
        Storage.saveExperiment(state, experiment);
        return experiment;
    }

    getActiveExperiment(state) {
        return state.experiments.find(e => this.isExperimentActive(e)) || null;
    }

    getPastExperiments(state) {
        return state.experiments.filter(e => !this.isExperimentActive(e) && e.results);
    }
}
