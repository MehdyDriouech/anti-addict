/**
 * Coaching Model - Logique métier
 */

import { CORRELATION_THRESHOLDS, DAY_PERIODS, RULE_SUGGESTIONS } from '../data/coaching-data.js';

export class CoachingModel {
    computeTopTriggers(events, count = 3) {
        const triggerCounts = {};
        events.forEach(event => {
            if (event.meta?.trigger) triggerCounts[event.meta.trigger] = (triggerCounts[event.meta.trigger] || 0) + 1;
            if (event.meta?.context) triggerCounts[event.meta.context] = (triggerCounts[event.meta.context] || 0) + 1;
        });
        return Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, count).map(([trigger, count]) => ({ trigger, count }));
    }

    computeRiskHours(events) {
        const hourCounts = {};
        events.filter(e => ['craving', 'episode', 'slope'].includes(e.type)).forEach(event => {
            const hour = new Date(event.ts).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        const sortedHours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const periods = [];
        sortedHours.forEach(([hour]) => {
            const h = parseInt(hour, 10);
            for (const [period, config] of Object.entries(DAY_PERIODS)) {
                const inRange = config.start <= config.end ? (h >= config.start && h < config.end) : (h >= config.start || h < config.end);
                if (inRange && !periods.includes(period)) periods.push(period);
            }
        });
        return { topHours: sortedHours.map(([hour, count]) => ({ hour: parseInt(hour, 10), count })), periods };
    }

    findCorrelations(state, startDate) {
        const correlations = [];
        const checkins = state.checkins.filter(c => c.date >= startDate);
        const events = state.events.filter(e => e.date >= startDate);
        if (checkins.length < CORRELATION_THRESHOLDS.minSamples) return correlations;

        const highStressDays = checkins.filter(c => c.stress >= CORRELATION_THRESHOLDS.stress);
        const normalStressDays = checkins.filter(c => c.stress < CORRELATION_THRESHOLDS.stress);
        if (highStressDays.length >= 2 && normalStressDays.length >= 2) {
            const highAvg = events.filter(e => e.type === 'craving' && highStressDays.some(d => d.date === e.date)).length / highStressDays.length;
            const normalAvg = events.filter(e => e.type === 'craving' && normalStressDays.some(d => d.date === e.date)).length / Math.max(1, normalStressDays.length);
            if (highAvg > normalAvg * 1.5) correlations.push({ type: 'stress_craving', factor: 'stress', multiplier: Math.round((highAvg / Math.max(0.1, normalAvg)) * 10) / 10, confidence: Math.min(1, highStressDays.length / 5) });
        }

        const loneDays = checkins.filter(c => c.solitude >= 7);
        if (loneDays.length >= 2) {
            const loneAvg = events.filter(e => e.type === 'craving' && loneDays.some(d => d.date === e.date)).length / loneDays.length;
            const overallAvg = events.filter(e => e.type === 'craving').length / Math.max(1, checkins.length);
            if (loneAvg > overallAvg * 1.5) correlations.push({ type: 'solitude_craving', factor: 'solitude', multiplier: Math.round((loneAvg / Math.max(0.1, overallAvg)) * 10) / 10, confidence: Math.min(1, loneDays.length / 5) });
        }

        return correlations;
    }

    suggestRules(state, events) {
        const suggestions = [];
        const existingRules = state.ifThenRules || [];
        const topTriggers = this.computeTopTriggers(events, 5);
        topTriggers.forEach(({ trigger, count }) => {
            const hasRule = existingRules.some(r => r.ifCondition?.includes(trigger) || r.id?.includes(trigger));
            if (!hasRule && count >= 2 && RULE_SUGGESTIONS[trigger]) {
                suggestions.push({ trigger, count, ...RULE_SUGGESTIONS[trigger] });
            }
        });
        const riskHours = this.computeRiskHours(events);
        if (riskHours.periods.includes('night') && !existingRules.some(r => r.ifCondition?.toLowerCase().includes('nuit') || r.ifCondition?.toLowerCase().includes('night'))) {
            suggestions.push({ trigger: 'night', ifCondition: { fr: 'Si c\'est la nuit', en: 'If it\'s night', ar: 'إذا كان الليل' }, thenAction: { fr: 'Téléphone hors chambre', en: 'Phone out of bedroom', ar: 'الهاتف خارج الغرفة' }, priority: 'high' });
        }
        return suggestions.slice(0, 3);
    }

    computeWeeklyInsights(state) {
        const last7Days = Utils.daysAgoISO(6);
        const weekEvents = state.events.filter(e => e.date >= last7Days);
        const weekCheckins = state.checkins.filter(c => c.date >= last7Days);
        return {
            date: Storage.getDateISO(), period: '7d',
            cravingsCount: weekEvents.filter(e => e.type === 'craving').length,
            episodesCount: weekEvents.filter(e => e.type === 'episode').length,
            winsCount: weekEvents.filter(e => e.type === 'win').length,
            slopesCount: weekEvents.filter(e => e.type === 'slope').length,
            topTriggers: this.computeTopTriggers(weekEvents, 3),
            riskHours: this.computeRiskHours(weekEvents),
            correlations: this.findCorrelations(state, last7Days),
            suggestedRules: this.suggestRules(state, weekEvents)
        };
    }

    isWeeklyInsightAvailable(state) {
        const lastInsight = state.coaching?.lastWeeklyInsight;
        if (!lastInsight) return true;
        return Math.floor((new Date() - new Date(lastInsight)) / (1000 * 60 * 60 * 24)) >= 7;
    }

    getRuleSuggestion(trigger) { return RULE_SUGGESTIONS[trigger] || null; }
}
