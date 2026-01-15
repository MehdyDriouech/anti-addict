/**
 * Coaching Model - Logique métier
 */

import { CORRELATION_THRESHOLDS, DAY_PERIODS, RULE_SUGGESTIONS, PREDEFINED_ADVICE } from '../data/coaching-data.js';

export class CoachingModel {
    constructor(services = {}) {
        this.storage = services.storage || (typeof window !== 'undefined' ? window.Storage : null);
        this.dateService = services.dateService || null;
    }

    /**
     * Helper pour obtenir la date ISO du jour
     * @returns {string}
     */
    getDateISO() {
        return this.dateService?.todayISO() || (this.storage?.getDateISO ? this.storage.getDateISO() : (typeof Storage !== 'undefined' ? Storage.getDateISO() : new Date().toISOString().split('T')[0]));
    }

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

    /**
     * Récupère l'insight actif non dismissed
     * @param {Object} state - State de l'application
     * @returns {Object|null}
     */
    getActiveInsight(state) {
        if (!state.coaching || !state.coaching.insights || state.coaching.insights.length === 0) {
            return null;
        }
        // Retourner le dernier insight non dismissed
        const nonDismissed = state.coaching.insights.filter(i => !i.dismissed);
        return nonDismissed.length > 0 ? nonDismissed[nonDismissed.length - 1] : null;
    }

    /**
     * Calcule le summary de l'insight actif (O(1) pour widget Home)
     * Lit UNIQUEMENT depuis state.coaching.insights (pas de génération)
     * @param {Object} state - State de l'application
     * @returns {Object|null} { hasInsight: boolean, messageKey: string, confidence: number } ou null
     */
    computeActiveInsightSummary(state) {
        // Vérifier si un insight existe déjà et n'est pas dismissed
        const activeInsight = this.getActiveInsight(state);
        if (activeInsight && !activeInsight.dismissed) {
            return {
                hasInsight: true,
                messageKey: activeInsight.messageKey,
                confidence: activeInsight.confidence,
                id: activeInsight.id,
                data: activeInsight.data
            };
        }

        // Pas d'insight disponible (la génération se fera lazy sur écran coaching)
        return null;
    }

    /**
     * Calcule les données complètes pour l'écran coaching (lazy)
     * Génère les insights si nécessaire et les sauvegarde
     * @param {Object} state - State de l'application
     * @returns {Promise<Object>} { activeInsight, history, observations, actions }
     */
    async computeCoachingScreenData(state) {
        // Vérifier si on doit générer un nouvel insight
        let activeInsight = this.getActiveInsight(state);
        
        if (!activeInsight && this.shouldGenerateInsight(state)) {
            // Générer un nouvel insight depuis analytics summaries uniquement
            try {
                if (window.Analytics && window.Analytics.getAnalytics) {
                    const weeklyAnalytics = await window.Analytics.getAnalytics('weekly');
                    if (weeklyAnalytics) {
                        const candidates = [];
                        const mode = state.coaching?.mode || 'stability';
                        
                        // Priorité 0 - Stabilizing (nouveau, priorité maximale)
                        const stabilizingInsights = await this.generateStabilizingInsights(state);
                        candidates.push(...stabilizingInsights);
                        
                        // Priorité 1 - Habit (si modes stability/guided)
                        if (mode === 'stability' || mode === 'guided') {
                            const habitInsight = this.generateHabitInsight(state);
                            if (habitInsight) candidates.push(habitInsight);
                            
                            // Priorité 2 - Transition (si modes stability/guided)
                            const transitionInsight = await this.generateTransitionInsight(state);
                            if (transitionInsight) candidates.push(transitionInsight);
                        }
                        
                        // Priorité 3 - Rétrospectif
                        const retroInsights = this.generateRetrospectiveInsights(weeklyAnalytics, null, state.checkins || []);
                        candidates.push(...retroInsights);
                        
                        // Priorité 4 - Préventif
                        const prevWeekDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        const prevWeeklyAnalytics = await window.Analytics.getAnalytics('weekly', prevWeekDate);
                        const prevInsights = this.generatePreventiveInsights(weeklyAnalytics, prevWeeklyAnalytics);
                        candidates.push(...prevInsights);
                        
                        // Priorité 5 - Prescriptif (V1 restreinte, seulement si guided)
                        if (mode === 'guided') {
                            const prescInsights = this.generatePrescriptiveInsights(state, weeklyAnalytics);
                            candidates.push(...prescInsights);
                        }

                        // Filtrer par mode puis sélectionner le meilleur
                        const filteredByMode = this.selectInsightByMode(candidates, mode);
                        const best = filteredByMode.length > 0 ? filteredByMode[0] : null;
                        if (best && best.confidence >= 0.6) {
                            // Sauvegarder l'insight via Store.update
                            if (typeof window !== 'undefined' && window.Store && window.Store.update) {
                                await window.Store.update((draft) => {
                                    if (!draft.coaching) {
                                        draft.coaching = { mode: 'stability', lastShownDate: null, activeAnchor: null, insights: [], feedback: { useful: 0, dismissed: 0 } };
                                    }
                                    if (!draft.coaching.insights) {
                                        draft.coaching.insights = [];
                                    }
                                    draft.coaching.insights.push(best);
                                    draft.coaching.lastShownDate = this.getDateISO();
                                    
                                    // Si insight de type habit ou transition, mettre à jour activeAnchor
                                    if (best.anchor) {
                                        draft.coaching.activeAnchor = best.anchor;
                                    }
                                });
                                
                                // Mettre à jour state local
                                if (!state.coaching) {
                                    state.coaching = { mode: 'stability', lastShownDate: null, activeAnchor: null, insights: [], feedback: { useful: 0, dismissed: 0 } };
                                }
                                if (!state.coaching.insights) {
                                    state.coaching.insights = [];
                                }
                                state.coaching.insights.push(best);
                                state.coaching.lastShownDate = this.getDateISO();
                                
                                // Si insight de type habit ou transition, mettre à jour activeAnchor
                                if (best.anchor) {
                                    state.coaching.activeAnchor = best.anchor;
                                }
                                
                                activeInsight = best;
                            }
                        }
                    }
                }
            } catch (error) {
                console.warn('[Coaching] Erreur génération insight:', error);
            }
        }
        
        const history = (state.coaching?.insights || []).slice(-7).reverse(); // 7 derniers, plus récent en premier
        
        let observations = null;
        let actions = null;
        
        if (activeInsight) {
            observations = {
                days: activeInsight.evidence?.days || 7,
                sampleSize: activeInsight.evidence?.sampleSize || 0
            };
            
            if (activeInsight.type === 'prescriptive') {
                actions = this.getPrescriptiveActions(state);
            }
        }

        // Générer les conseils personnalisés pour chaque addiction active
        let personalizedAdvice = [];
        const activeAddictions = state.addictions || [];
        
        if (activeAddictions.length > 0) {
            try {
                // Récupérer analytics hebdomadaires si disponible
                let weeklyAnalytics = null;
                if (window.Analytics && window.Analytics.getAnalytics) {
                    weeklyAnalytics = await window.Analytics.getAnalytics('weekly');
                }
                
                if (weeklyAnalytics) {
                    for (const addiction of activeAddictions) {
                        const addictionId = typeof addiction === 'string' ? addiction : addiction.id;
                        const advice = this.generatePersonalizedAdvice(state, addictionId, weeklyAnalytics, state.checkins || []);
                        personalizedAdvice.push(...advice);
                    }
                    
                    // Trier par priorité : rétrospectif → préventif → prescriptif
                    const priorityOrder = { 'retrospective': 1, 'preventive': 2, 'prescriptive': 3 };
                    personalizedAdvice.sort((a, b) => {
                        const priorityDiff = (priorityOrder[a.type] || 99) - (priorityOrder[b.type] || 99);
                        if (priorityDiff !== 0) return priorityDiff;
                        return b.confidence - a.confidence;
                    });
                }
            } catch (error) {
                console.warn('[Coaching] Erreur génération conseils personnalisés:', error);
            }
        }

        return {
            activeInsight,
            history,
            observations,
            actions,
            personalizedAdvice
        };
    }

    /**
     * Génère les insights rétrospectifs (priorité 1)
     * @param {Object} weeklyAnalytics - Analytics hebdomadaires
     * @param {Object} dailyAnalytics - Analytics quotidiens (optionnel)
     * @param {Array} checkins - Check-ins (optionnel)
     * @returns {Array} Insights candidats
     */
    generateRetrospectiveInsights(weeklyAnalytics, dailyAnalytics, checkins) {
        const insights = [];
        const todayISO = this.getDateISO();

        if (!weeklyAnalytics) return insights;

        // Insight 1 : "Cette semaine: X urgences, Y victoires"
        if (weeklyAnalytics.totalCravings >= 0 || weeklyAnalytics.totalWins >= 0) {
            insights.push({
                id: `retro_weekly_summary_${todayISO}`,
                date: todayISO,
                type: 'retrospective',
                scope: 'global',
                messageKey: 'coaching.insight.weekly_summary',
                confidence: 1.0,
                evidence: {
                    days: 7,
                    sampleSize: weeklyAnalytics.totalCravings + weeklyAnalytics.totalWins || 0
                },
                dismissed: false,
                data: {
                    cravings: weeklyAnalytics.totalCravings || 0,
                    wins: weeklyAnalytics.totalWins || 0
                }
            });
        }

        // Insight 2 : "Intensité moyenne: avg" (si intensityCount >= 5)
        if (weeklyAnalytics.intensityCount >= 5 && weeklyAnalytics.avgIntensity > 0) {
            insights.push({
                id: `retro_avg_intensity_${todayISO}`,
                date: todayISO,
                type: 'retrospective',
                scope: 'global',
                messageKey: 'coaching.insight.avg_intensity',
                confidence: 1.0,
                evidence: {
                    days: 7,
                    sampleSize: weeklyAnalytics.intensityCount
                },
                dismissed: false,
                data: {
                    avgIntensity: Math.round(weeklyAnalytics.avgIntensity * 10) / 10
                }
            });
        }

        return insights;
    }

    /**
     * Génère les insights préventifs (priorité 2)
     * @param {Object} weeklyAnalytics - Analytics semaine actuelle
     * @param {Object} prevWeeklyAnalytics - Analytics semaine précédente (optionnel)
     * @returns {Array} Insights candidats
     */
    generatePreventiveInsights(weeklyAnalytics, prevWeeklyAnalytics) {
        const insights = [];
        const todayISO = this.getDateISO();

        if (!weeklyAnalytics || !prevWeeklyAnalytics) return insights;

        // Insight 3 : "Cette semaine est plus chargée que la précédente"
        const thisWeekCravings = weeklyAnalytics.totalCravings || 0;
        const prevWeekCravings = prevWeeklyAnalytics.totalCravings || 0;
        
        if (thisWeekCravings >= prevWeekCravings * 1.5 && prevWeekCravings >= 2) {
            const confidence = Math.min(1.0, Math.max(0.6, prevWeekCravings / 5));
            insights.push({
                id: `prev_week_comparison_${todayISO}`,
                date: todayISO,
                type: 'preventive',
                scope: 'global',
                messageKey: 'coaching.insight.week_comparison',
                confidence: confidence,
                evidence: {
                    days: 14,
                    sampleSize: thisWeekCravings + prevWeekCravings
                },
                dismissed: false,
                data: {
                    thisWeek: thisWeekCravings,
                    prevWeek: prevWeekCravings
                }
            });
        }

        return insights;
    }

    /**
     * Génère les insights prescriptifs (priorité 3, V1 restreinte)
     * AUCUNE phrase "ça marche mieux" (pas de données)
     * @param {Object} state - State de l'application
     * @param {Object} weeklyAnalytics - Analytics hebdomadaires
     * @returns {Array} Insights candidats
     */
    generatePrescriptiveInsights(state, weeklyAnalytics) {
        const insights = [];
        const todayISO = this.getDateISO();

        // Actions favorites ou suggestions de règles uniquement
        const hasFavoriteActions = state.sos?.favoriteActions && state.sos.favoriteActions.length > 0;
        const hasIfThenPlugin = typeof IfThen !== 'undefined';

        if (hasFavoriteActions || hasIfThenPlugin) {
            insights.push({
                id: `presc_suggested_actions_${todayISO}`,
                date: todayISO,
                type: 'prescriptive',
                scope: 'global',
                messageKey: 'coaching.insight.suggested_actions',
                confidence: 0.7,
                evidence: {
                    days: 7,
                    sampleSize: 0
                },
                dismissed: false
            });
        }

        return insights;
    }

    /**
     * Récupère les actions prescriptives (favorites ou suggestions)
     * @param {Object} state - State de l'application
     * @returns {Object} { favoriteActions: Array, hasIfThen: boolean }
     */
    getPrescriptiveActions(state) {
        return {
            favoriteActions: state.sos?.favoriteActions || [],
            hasIfThen: typeof IfThen !== 'undefined'
        };
    }

    /**
     * Vérifie si un nouvel insight peut être généré
     * @param {Object} state - State de l'application
     * @returns {boolean}
     * @deprecated Utiliser shouldGenerateInsight() à la place (respecte les modes)
     */
    shouldGenerateNewInsight(state) {
        // Déléguer à shouldGenerateInsight pour respecter les modes
        return this.shouldGenerateInsight(state);
    }

    /**
     * Sélectionne le meilleur insight parmi les candidats (priorité 1→2→3, puis confidence)
     * @param {Array} candidates - Insights candidats
     * @returns {Object|null} Meilleur insight ou null
     */
    selectBestInsight(candidates) {
        if (!candidates || candidates.length === 0) return null;

        // Trier par priorité (1→2→3) puis par confidence décroissante
        const priorityOrder = { 'retrospective': 1, 'preventive': 2, 'prescriptive': 3 };
        candidates.sort((a, b) => {
            const priorityDiff = (priorityOrder[a.type] || 99) - (priorityOrder[b.type] || 99);
            if (priorityDiff !== 0) return priorityDiff;
            return b.confidence - a.confidence;
        });

        return candidates[0];
    }

    async computeWeeklyInsights(state) {
        const last7Days = Utils.daysAgoISO(6);
        const weekCheckins = state.checkins.filter(c => c.date >= last7Days);
        
        // Utiliser analytics si disponible
        let cravingsCount = 0;
        let episodesCount = 0;
        let winsCount = 0;
        let slopesCount = 0;
        
        if (window.Analytics && window.Analytics.getAnalytics) {
            try {
                // Récupérer analytics de la semaine actuelle
                const weekAnalytics = await window.Analytics.getAnalytics('weekly');
                if (weekAnalytics) {
                    cravingsCount = weekAnalytics.totalCravings || 0;
                    episodesCount = weekAnalytics.totalEpisodes || 0;
                    winsCount = weekAnalytics.totalWins || 0;
                    // slopesCount n'est pas dans analytics pour l'instant
                }
            } catch (error) {
                console.warn('[Coaching] Erreur récupération analytics', error);
            }
        }
        
        // NOTE: Pour compatibilité avec l'ancien code, on garde computeWeeklyInsights
        // mais il ne doit plus être utilisé pour le nouveau coaching (utiliser computeActiveInsightSummary)
        // Fallback vers events si analytics non disponible (pour compatibilité)
        const weekEvents = (state.events || []).filter(e => e.date >= last7Days);
        if (cravingsCount === 0 && weekEvents.length > 0) {
            cravingsCount = weekEvents.filter(e => e.type === 'craving').length;
            episodesCount = weekEvents.filter(e => e.type === 'episode').length;
            winsCount = weekEvents.filter(e => e.type === 'win').length;
            slopesCount = weekEvents.filter(e => e.type === 'slope').length;
        }
        
        // Pour topTriggers et riskHours, on a encore besoin des events (compatibilité)
        // Mais le nouveau coaching ne doit PAS utiliser ces données
        let eventsForDetails = weekEvents;
        if (window.Security && window.Security.getDomain && weekEvents.length === 0) {
            try {
                const eventsDomain = await window.Security.getDomain('events', false);
                if (eventsDomain && Array.isArray(eventsDomain)) {
                    eventsForDetails = eventsDomain.filter(e => e.date >= last7Days);
                }
            } catch (error) {
                console.warn('[Coaching] Events non disponibles pour détails', error);
            }
        }
        
        return {
            date: this.getDateISO(), period: '7d',
            cravingsCount,
            episodesCount,
            winsCount,
            slopesCount,
            topTriggers: this.computeTopTriggers(eventsForDetails, 3),
            riskHours: this.computeRiskHours(eventsForDetails),
            correlations: this.findCorrelations(state, last7Days),
            suggestedRules: this.suggestRules(state, eventsForDetails)
        };
    }

    isWeeklyInsightAvailable(state) {
        const lastShown = state.coaching?.lastShownDate;
        if (!lastShown) return true;
        return Math.floor((new Date() - new Date(lastShown)) / (1000 * 60 * 60 * 24)) >= 7;
    }

    getRuleSuggestion(trigger) { return RULE_SUGGESTIONS[trigger] || null; }

    /**
     * Génère des conseils personnalisés pour une addiction
     * @param {Object} state - State de l'application
     * @param {string} addictionId - ID de l'addiction
     * @param {Object} weeklyAnalytics - Analytics hebdomadaires
     * @param {Array} checkins - Check-ins de la semaine
     * @returns {Array} Conseils personnalisés [{ addictionId, type, messageKey, suggestedAction, confidence }]
     */
    generatePersonalizedAdvice(state, addictionId, weeklyAnalytics, checkins) {
        const advice = [];
        
        // Récupérer les conseils prédéfinis pour cette addiction
        const predefined = PREDEFINED_ADVICE[addictionId];
        if (!predefined) return advice;

        // Analyser les patterns depuis analytics et checkins
        const weekCheckins = checkins || [];
        const avgStress = weekCheckins.length > 0 
            ? weekCheckins.reduce((sum, c) => sum + (c.stress || 0), 0) / weekCheckins.length 
            : 0;
        const avgSolitude = weekCheckins.length > 0 
            ? weekCheckins.reduce((sum, c) => sum + (c.solitude || 0), 0) / weekCheckins.length 
            : 0;
        const totalCravings = weeklyAnalytics?.totalCravings || 0;
        const totalWins = weeklyAnalytics?.totalWins || 0;

        // Rétrospectif : conseils basés sur ce qui s'est passé
        if (predefined.retrospective && predefined.retrospective.length > 0) {
            // Si des victoires, suggérer conseil de traversée/résistance
            if (totalWins > 0) {
                const victoryAdvice = predefined.retrospective.find(a => 
                    a.id.includes('stayed_present') || 
                    a.id.includes('traversed') || 
                    a.id.includes('resisted') ||
                    a.id.includes('attention_occasions') ||
                    a.id.includes('attentive')
                );
                if (victoryAdvice) {
                    advice.push({
                        addictionId,
                        type: 'retrospective',
                        messageKey: victoryAdvice.messageKey,
                        suggestedAction: victoryAdvice.suggestedAction,
                        confidence: Math.min(1.0, totalWins / 5)
                    });
                }
            }
            
            // Si solitude moyenne élevée, suggérer conseil solitude
            if (avgSolitude >= 6) {
                const solitudeAdvice = predefined.retrospective.find(a => 
                    a.id.includes('solitude') || 
                    a.id.includes('alone')
                );
                if (solitudeAdvice && !advice.some(a => a.messageKey === solitudeAdvice.messageKey)) {
                    advice.push({
                        addictionId,
                        type: 'retrospective',
                        messageKey: solitudeAdvice.messageKey,
                        suggestedAction: solitudeAdvice.suggestedAction,
                        confidence: 0.7
                    });
                }
            }
            
            // Si énergie basse (stress élevé), suggérer conseil énergie/stress
            if (avgStress >= 7) {
                const energyAdvice = predefined.retrospective.find(a => 
                    a.id.includes('energy') || 
                    a.id.includes('low_energy') ||
                    a.id.includes('stress')
                );
                if (energyAdvice && !advice.some(a => a.messageKey === energyAdvice.messageKey)) {
                    advice.push({
                        addictionId,
                        type: 'retrospective',
                        messageKey: energyAdvice.messageKey,
                        suggestedAction: energyAdvice.suggestedAction,
                        confidence: 0.7
                    });
                }
            }
            
            // Si routines/régularité détectée, suggérer conseil routine
            if (totalCravings >= 3) {
                const routineAdvice = predefined.retrospective.find(a => 
                    a.id.includes('routine') || 
                    a.id.includes('regular') ||
                    a.id.includes('often')
                );
                if (routineAdvice && !advice.some(a => a.messageKey === routineAdvice.messageKey)) {
                    advice.push({
                        addictionId,
                        type: 'retrospective',
                        messageKey: routineAdvice.messageKey,
                        suggestedAction: routineAdvice.suggestedAction,
                        confidence: 0.6
                    });
                }
            }
        }

        // Préventif : conseils pour anticiper
        if (predefined.preventive && predefined.preventive.length > 0) {
            // Si stress élevé, suggérer conseil stress
            if (avgStress >= 7) {
                const stressAdvice = predefined.preventive.find(a => a.id.includes('stress'));
                if (stressAdvice) {
                    advice.push({
                        addictionId,
                        type: 'preventive',
                        messageKey: stressAdvice.messageKey,
                        suggestedAction: stressAdvice.suggestedAction,
                        confidence: 0.8
                    });
                }
            }
            
            // Si solitude élevée, suggérer conseil solitude
            if (avgSolitude >= 6) {
                const solitudeAdvice = predefined.preventive.find(a => 
                    a.id.includes('solitude') || 
                    a.id.includes('alone')
                );
                if (solitudeAdvice && !advice.some(a => a.messageKey === solitudeAdvice.messageKey)) {
                    advice.push({
                        addictionId,
                        type: 'preventive',
                        messageKey: solitudeAdvice.messageKey,
                        suggestedAction: solitudeAdvice.suggestedAction,
                        confidence: 0.7
                    });
                }
            }
            
            // Si fatigue détectée (stress élevé ou solitude), suggérer conseil fatigue
            if (avgStress >= 6 || avgSolitude >= 6) {
                const fatigueAdvice = predefined.preventive.find(a => 
                    a.id.includes('fatigue') || 
                    a.id.includes('tired')
                );
                if (fatigueAdvice && !advice.some(a => a.messageKey === fatigueAdvice.messageKey)) {
                    advice.push({
                        addictionId,
                        type: 'preventive',
                        messageKey: fatigueAdvice.messageKey,
                        suggestedAction: fatigueAdvice.suggestedAction,
                        confidence: 0.7
                    });
                }
            }
            
            // Si beaucoup d'urgences, suggérer conseil général préventif (pas déjà ajouté)
            if (totalCravings >= 3) {
                const generalAdvice = predefined.preventive.find(a => 
                    !a.id.includes('stress') && 
                    !a.id.includes('solitude') && 
                    !a.id.includes('alone') &&
                    !a.id.includes('fatigue') &&
                    !a.id.includes('tired')
                );
                if (generalAdvice && !advice.some(a => a.messageKey === generalAdvice.messageKey)) {
                    advice.push({
                        addictionId,
                        type: 'preventive',
                        messageKey: generalAdvice.messageKey,
                        suggestedAction: generalAdvice.suggestedAction,
                        confidence: 0.6
                    });
                }
            }
        }

        // Prescriptif : actions suggérées (toujours disponibles)
        if (predefined.prescriptive && predefined.prescriptive.length > 0) {
            // Limiter à 2-3 conseils prescriptifs
            const prescriptiveAdvice = predefined.prescriptive.slice(0, 2).map(adviceItem => ({
                addictionId,
                type: 'prescriptive',
                messageKey: adviceItem.messageKey,
                suggestedAction: adviceItem.suggestedAction,
                confidence: 0.7
            }));
            advice.push(...prescriptiveAdvice);
        }

        return advice;
    }

    /**
     * Génère les insights stabilisants (lien instabilité ↔ urgences)
     * Priorité: stabilizing > habit > transition > retrospective > preventive > prescriptive
     * @param {Object} state - State de l'application
     * @returns {Array} Insights de type 'stabilizing'
     */
    async generateStabilizingInsights(state) {
        const insights = [];
        const todayISO = this.getDateISO();

        try {
            // Utiliser analytics summaries uniquement
            if (!window.Analytics || !window.Analytics.getAnalytics) {
                return insights;
            }

            const weeklyAnalytics = await window.Analytics.getAnalytics('weekly');
            if (!weeklyAnalytics) return insights;

            // Analyser instabilité via check-ins de la semaine
            // Calculer la date 7 jours en arrière
            const todayDate = new Date();
            const last7DaysDate = new Date(todayDate);
            last7DaysDate.setDate(todayDate.getDate() - 6); // 6 jours pour avoir 7 jours au total
            const last7Days = last7DaysDate.toISOString().split('T')[0];

            const weekCheckins = (state.checkins || []).filter(c => c.date >= last7Days);
            
            if (weekCheckins.length < 3) return insights; // Pas assez de données

            // Calculer instabilité moyenne (stress + solitude élevés)
            const avgStress = weekCheckins.reduce((sum, c) => sum + (c.stress || 0), 0) / weekCheckins.length;
            const avgSolitude = weekCheckins.reduce((sum, c) => sum + (c.solitude || 0), 0) / weekCheckins.length;
            const totalCravings = weeklyAnalytics.totalCravings || 0;

            // Détecter corrélation instabilité ↔ urgences
            const instabilityScore = (avgStress >= 7 ? 1 : 0) + (avgSolitude >= 6 ? 1 : 0);
            const hasHighCravings = totalCravings >= 3;

            if (instabilityScore >= 1 && hasHighCravings) {
                const confidence = Math.min(1.0, Math.max(0.6, (instabilityScore + totalCravings) / 10));
                
                let messageKey = 'coaching.insight.stabilizing.general';
                let data = { instabilityScore, cravings: totalCravings };

                if (avgStress >= 7) {
                    messageKey = 'coaching.insight.stabilizing.stress';
                    data = { stress: Math.round(avgStress), cravings: totalCravings };
                }
                if (avgSolitude >= 6) {
                    // Si déjà stress, on garde stress. Sinon, on utilise solitude
                    if (messageKey === 'coaching.insight.stabilizing.general') {
                        messageKey = 'coaching.insight.stabilizing.solitude';
                        data = { solitude: Math.round(avgSolitude), cravings: totalCravings };
                    }
                }

                insights.push({
                    id: `stabilizing_${todayISO}_${Date.now()}`,
                    date: todayISO,
                    type: 'stabilizing',
                    scope: 'global',
                    messageKey,
                    confidence,
                    evidence: {
                        days: 7,
                        sampleSize: weekCheckins.length
                    },
                    dismissed: false,
                    data
                });
            }
        } catch (error) {
            console.warn('[Coaching] Erreur génération stabilizing insights:', error);
        }

        return insights;
    }

    /**
     * Génère un insight de type 'habit' (proposition d'ancrage)
     * Règles: Un seul ancrage actif à la fois, pas si activeAnchor < 7 jours
     * @param {Object} state - State de l'application
     * @returns {Object|null} Insight de type 'habit' ou null
     */
    generateHabitInsight(state) {
        // Vérifier qu'il n'y a pas déjà un ancrage actif récent (< 7 jours)
        const activeAnchor = state.coaching?.activeAnchor;
        if (activeAnchor) {
            const anchorDate = new Date(activeAnchor.suggestedAt);
            const daysSinceAnchor = Math.floor((Date.now() - anchorDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceAnchor < 7) {
                return null; // Ancrage encore actif
            }
        }

        // Déterminer le contexte (morning/day/evening)
        const now = new Date();
        const hour = now.getHours();
        let context = 'day';
        if (hour >= 6 && hour < 12) context = 'morning';
        else if (hour >= 12 && hour < 18) context = 'day';
        else if (hour >= 18 && hour < 22) context = 'evening';
        else context = 'evening'; // Nuit = evening pour simplifier

        const todayISO = this.getDateISO();

        // Générer ancrage selon contexte
        const anchorId = `anchor_${context}_${todayISO}_${Date.now()}`;
        
        const habitInsights = {
            morning: {
                messageKey: 'coaching.habit.morning.water',
                data: { context: 'morning', action: 'water' }
            },
            day: {
                messageKey: 'coaching.habit.day.pause',
                data: { context: 'day', action: 'pause' }
            },
            evening: {
                messageKey: 'coaching.habit.evening.closure',
                data: { context: 'evening', action: 'closure' }
            }
        };

        const insightData = habitInsights[context] || habitInsights.day;

        return {
            id: anchorId,
            date: todayISO,
            type: 'habit',
            scope: 'global',
            messageKey: insightData.messageKey,
            confidence: 0.7,
            evidence: {
                days: 0,
                sampleSize: 0
            },
            dismissed: false,
            data: insightData.data,
            anchor: {
                id: anchorId,
                type: 'anchor',
                context,
                suggestedAt: todayISO
            }
        };
    }

    /**
     * Génère un insight de type 'transition' (fermeture d'un moment à risque)
     * Priorité aux moments critiques (fin de soirée, après stress)
     * @param {Object} state - State de l'application
     * @returns {Object|null} Insight de type 'transition' ou null
     */
    async generateTransitionInsight(state) {
        const now = new Date();
        const hour = now.getHours();
        const todayISO = this.getDateISO();

        // Vérifier si on est dans un moment critique (fin de soirée: 20h-22h)
        const isEveningEnd = hour >= 20 && hour < 22;
        
        // Vérifier si stress récent (check-in du jour avec stress élevé)
        const todayCheckin = (state.checkins || []).find(c => c.date === todayISO);
        const hasRecentStress = todayCheckin && todayCheckin.stress >= 7;

        if (!isEveningEnd && !hasRecentStress) {
            return null; // Pas de transition nécessaire
        }

        const transitionId = `transition_${todayISO}_${Date.now()}`;
        
        let messageKey = 'coaching.transition.evening';
        let data = { context: 'evening' };

        if (hasRecentStress) {
            messageKey = 'coaching.transition.stress';
            data = { context: 'stress', stress: todayCheckin.stress };
        }

        return {
            id: transitionId,
            date: todayISO,
            type: 'transition',
            scope: 'global',
            messageKey,
            confidence: 0.8,
            evidence: {
                days: 1,
                sampleSize: 1
            },
            dismissed: false,
            data,
            anchor: {
                id: transitionId,
                type: 'transition',
                context: data.context,
                suggestedAt: todayISO
            }
        };
    }

    /**
     * Filtre et sélectionne les insights selon le mode de coaching actif
     * @param {Array} insights - Liste d'insights candidats
     * @param {string} coachingMode - Mode de coaching ('observer' | 'stability' | 'guided' | 'silent')
     * @returns {Array} Insights filtrés selon le mode
     */
    selectInsightByMode(insights, coachingMode) {
        if (!insights || insights.length === 0) return [];

        const mode = coachingMode || 'stability';

        // Filtrer selon le mode
        let allowedTypes = [];
        
        switch (mode) {
            case 'observer':
                // Observer: seulement retrospective, stabilizing
                allowedTypes = ['retrospective', 'stabilizing'];
                break;
            case 'stability':
                // Stability: stabilizing, habit, transition, retrospective (priorité)
                allowedTypes = ['stabilizing', 'habit', 'transition', 'retrospective'];
                break;
            case 'guided':
                // Guided: tous sauf prescriptive (priorité modérée)
                allowedTypes = ['stabilizing', 'habit', 'transition', 'retrospective', 'preventive'];
                break;
            case 'silent':
                // Silent: uniquement stabilizing avec forte instabilité (filtré après)
                allowedTypes = ['stabilizing'];
                break;
            default:
                // Par défaut: stability
                allowedTypes = ['stabilizing', 'habit', 'transition', 'retrospective'];
        }

        // Filtrer par type autorisé
        let filtered = insights.filter(insight => allowedTypes.includes(insight.type));

        // Pour silent mode: vérifier que l'instabilité est très élevée
        if (mode === 'silent') {
            filtered = filtered.filter(insight => {
                if (insight.type === 'stabilizing') {
                    // Vérifier seuil strict d'instabilité
                    const instabilityScore = insight.data?.instabilityScore || 0;
                    const cravings = insight.data?.cravings || 0;
                    return instabilityScore >= 2 && cravings >= 5;
                }
                return false;
            });
        }

        // Trier par priorité: stabilizing > habit > transition > retrospective > preventive > prescriptive
        const priorityOrder = {
            'stabilizing': 1,
            'habit': 2,
            'transition': 3,
            'retrospective': 4,
            'preventive': 5,
            'prescriptive': 6
        };

        filtered.sort((a, b) => {
            const priorityDiff = (priorityOrder[a.type] || 99) - (priorityOrder[b.type] || 99);
            if (priorityDiff !== 0) return priorityDiff;
            return b.confidence - a.confidence;
        });

        return filtered;
    }

    /**
     * Détermine si un insight peut être généré (respect mode + fréquence)
     * @param {Object} state - State de l'application
     * @returns {boolean}
     */
    shouldGenerateInsight(state) {
        const mode = state.coaching?.mode || 'stability';
        const todayISO = this.getDateISO();
        const lastShownDate = state.coaching?.lastShownDate;

        // Vérifier fréquence selon le mode
        if (lastShownDate) {
            // Calculer jours écoulés depuis lastShownDate
            const today = new Date(todayISO);
            const lastShown = new Date(lastShownDate);
            const daysSinceLastShown = Math.floor((today - lastShown) / (1000 * 60 * 60 * 24));

            switch (mode) {
                case 'silent':
                    // Silent: exceptionnelle (max 1/14 jours)
                    if (daysSinceLastShown < 14) return false;
                    break;
                case 'observer':
                    // Observer: max 1/semaine
                    if (daysSinceLastShown < 7) return false;
                    break;
                case 'stability':
                    // Stability: max 1/3 jours
                    if (daysSinceLastShown < 3) return false;
                    break;
                case 'guided':
                    // Guided: max 1/jour
                    if (daysSinceLastShown < 1) return false;
                    break;
            }
        }

        // Ne pas générer si activeAnchor < 7 jours (modes stability/guided uniquement)
        if ((mode === 'stability' || mode === 'guided')) {
            const activeAnchor = state.coaching?.activeAnchor;
            if (activeAnchor) {
                const anchorDate = new Date(activeAnchor.suggestedAt);
                const daysSinceAnchor = Math.floor((Date.now() - anchorDate.getTime()) / (1000 * 60 * 60 * 24));
                if (daysSinceAnchor < 7) {
                    return false; // Ancrage encore actif
                }
            }
        }

        // Ne pas générer si insight actif non dismissed
        const activeInsight = this.getActiveInsight(state);
        if (activeInsight && !activeInsight.dismissed) {
            return false;
        }

        return true;
    }

    /**
     * Vérifie si le coaching est autorisé (pas d'urgence, pas post-urgence récent)
     * @param {Object} state - State de l'application
     * @returns {boolean}
     */
    isCoachingAllowed(state) {
        // Vérifier si urgence active
        if (window.runtime?.emergencyActive === true) {
            return false;
        }

        // Vérifier cooldown post-urgence (5 minutes)
        const COOLDOWN_MS = 5 * 60 * 1000;
        if (window.runtime?.lastEmergencyEndedAt) {
            const elapsed = Date.now() - window.runtime.lastEmergencyEndedAt;
            if (elapsed < COOLDOWN_MS) {
                return false;
            }
        }

        return true;
    }
}
