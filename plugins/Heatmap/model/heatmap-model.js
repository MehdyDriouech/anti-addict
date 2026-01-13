/**
 * Heatmap Model - Logique métier
 */

import { BUCKETS, BUCKET_LABELS, INSIGHT_TEXTS } from '../data/heatmap-data.js';

export class HeatmapModel {
    constructor() {
        this.activeFilter = 'all';
    }

    /**
     * Récupère le filtre actif
     * @returns {string}
     */
    getActiveFilter() {
        return this.activeFilter;
    }

    /**
     * Change le filtre actif
     * @param {string} filter
     */
    setFilter(filter) {
        this.activeFilter = filter;
    }

    /**
     * Calcule les insights basés sur les données
     * @param {Object} state - State de l'application
     * @param {number} days - Nombre de jours
     * @param {string} lang - Langue
     * @param {string} addictionId - ID de l'addiction (ou null pour toutes)
     * @returns {Array<string>}
     */
    computeInsights(state, days, lang, addictionId = null) {
        const insights = [];
        // Si pas d'addiction spécifique, utiliser la première addiction sélectionnée ou toutes
        const effectiveAddiction = addictionId || (state.addictions?.[0] || null);
        const matrix = Utils.computeHeatmapMatrix(state, days, effectiveAddiction);
        
        // Calculer les totaux par créneau
        const bucketTotals = {};
        BUCKETS.forEach(b => bucketTotals[b] = 0);
        
        let weekendTotal = 0;
        let weekdayTotal = 0;
        
        for (let d = 0; d < days; d++) {
            if (!matrix[d]) continue;
            
            const isWeekend = matrix[d].dayOfWeek >= 5;
            
            BUCKETS.forEach(bucket => {
                const score = matrix[d].buckets[bucket].score;
                bucketTotals[bucket] += score;
                
                if (isWeekend) weekendTotal += score;
                else weekdayTotal += score;
            });
        }
        
        // Insight: Créneau le plus risqué
        const maxBucket = Object.entries(bucketTotals)
            .sort((a, b) => b[1] - a[1])[0];
        
        if (maxBucket && maxBucket[1] > 0) {
            const bucketLabel = BUCKET_LABELS[maxBucket[0]]?.[lang] || maxBucket[0];
            const insightFn = INSIGHT_TEXTS.riskiestSlot[lang] || INSIGHT_TEXTS.riskiestSlot.fr;
            insights.push(insightFn(bucketLabel));
        }
        
        // Insight: Week-end vs semaine
        const weekendAvg = weekendTotal / (days / 7 * 2);
        const weekdayAvg = weekdayTotal / (days / 7 * 5);
        
        if (weekendAvg > weekdayAvg * 1.5) {
            insights.push(INSIGHT_TEXTS.weekendsRiskier[lang] || INSIGHT_TEXTS.weekendsRiskier.fr);
        }
        
        // Insight: Soir/nuit dominant
        const eveningNight = bucketTotals.evening + bucketTotals.night + bucketTotals.late;
        const daytime = bucketTotals.morning + bucketTotals.noon + bucketTotals.afternoon;
        
        if (eveningNight > daytime * 2) {
            insights.push(INSIGHT_TEXTS.eveningNightRisk[lang] || INSIGHT_TEXTS.eveningNightRisk.fr);
        }
        
        // Insight: Corrélation avec stress
        if (state.checkins) {
            const highStressDays = state.checkins.filter(c => c.stress >= 7);
            if (highStressDays.length >= 3) {
                const highStressDates = highStressDays.map(c => c.date);
                const eventsOnHighStress = state.events.filter(e => 
                    highStressDates.includes(e.date) &&
                    (e.type === 'craving' || e.type === 'episode')
                ).length;
                
                if (eventsOnHighStress > highStressDays.length * 0.5) {
                    insights.push(INSIGHT_TEXTS.stressCorrelation[lang] || INSIGHT_TEXTS.stressCorrelation.fr);
                }
            }
        }
        
        return insights.slice(0, 3);
    }

    /**
     * Calcule les totaux par bucket pour le mini heatmap
     * @param {Object} state - State de l'application
     * @param {string} addictionId - ID de l'addiction (ou null pour toutes)
     * @returns {Object} { maxBucket, maxScore, bucketTotals }
     */
    computeBucketTotals(state, addictionId = null) {
        const effectiveAddiction = addictionId || (state.addictions?.[0] || null);
        const matrix = Utils.computeHeatmapMatrix(state, 7, effectiveAddiction);
        
        const bucketTotals = {};
        BUCKETS.forEach(b => bucketTotals[b] = 0);
        
        for (let d = 0; d < 7; d++) {
            if (matrix[d]) {
                BUCKETS.forEach(bucket => {
                    bucketTotals[bucket] += matrix[d].buckets[bucket].score;
                });
            }
        }
        
        // Trouver le créneau le plus risqué
        let maxBucket = null;
        let maxScore = 0;
        Object.entries(bucketTotals).forEach(([bucket, score]) => {
            if (score > maxScore) {
                maxScore = score;
                maxBucket = bucket;
            }
        });
        
        return { maxBucket, maxScore, bucketTotals };
    }
}
