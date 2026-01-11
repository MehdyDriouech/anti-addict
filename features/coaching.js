/**
 * coaching.js - Module Coaching local
 * 
 * Fonctionnalités:
 * - Insights hebdomadaires automatiques
 * - Détection des corrélations (stress > cravings, etc.)
 * - Top 3 déclencheurs de la semaine
 * - Heures à risque
 * - Suggestions de règles automatiques
 */

// ============================================
// CONSTANTES
// ============================================

// Seuils pour les corrélations
const CORRELATION_THRESHOLDS = {
    stress: 7,          // Stress >= 7 = stress élevé
    craving: 6,         // Craving >= 6 = craving élevé
    minSamples: 3       // Minimum d'échantillons pour une corrélation
};

// Périodes de la journée
const DAY_PERIODS = {
    morning: { start: 6, end: 12, fr: 'Matin', en: 'Morning', ar: 'صباح' },
    afternoon: { start: 12, end: 18, fr: 'Après-midi', en: 'Afternoon', ar: 'بعد الظهر' },
    evening: { start: 18, end: 22, fr: 'Soir', en: 'Evening', ar: 'مساء' },
    night: { start: 22, end: 6, fr: 'Nuit', en: 'Night', ar: 'ليل' }
};

// ============================================
// ANALYSE DES DONNÉES
// ============================================

/**
 * Calcule les insights de la semaine
 * @param {Object} state - State de l'application
 * @returns {Object} Insights compilés
 */
function computeWeeklyInsights(state) {
    const last7Days = Utils.daysAgoISO(6);
    
    // Récupérer les données de la semaine
    const weekEvents = state.events.filter(e => e.date >= last7Days);
    const weekCheckins = state.checkins.filter(c => c.date >= last7Days);
    
    const insights = {
        date: Storage.getDateISO(),
        period: '7d',
        
        // Stats globales
        cravingsCount: weekEvents.filter(e => e.type === 'craving').length,
        episodesCount: weekEvents.filter(e => e.type === 'episode').length,
        winsCount: weekEvents.filter(e => e.type === 'win').length,
        slopesCount: weekEvents.filter(e => e.type === 'slope').length,
        
        // Top déclencheurs
        topTriggers: computeTopTriggers(weekEvents, 3),
        
        // Heures à risque
        riskHours: computeRiskHours(weekEvents),
        
        // Corrélations
        correlations: findCorrelations(state, last7Days),
        
        // Suggestions de règles
        suggestedRules: suggestRules(state, weekEvents, weekCheckins)
    };
    
    return insights;
}

/**
 * Calcule les top N déclencheurs
 */
function computeTopTriggers(events, count = 3) {
    const triggerCounts = {};
    
    events.forEach(event => {
        if (event.meta?.trigger) {
            triggerCounts[event.meta.trigger] = (triggerCounts[event.meta.trigger] || 0) + 1;
        }
        if (event.meta?.context) {
            triggerCounts[event.meta.context] = (triggerCounts[event.meta.context] || 0) + 1;
        }
    });
    
    return Object.entries(triggerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([trigger, count]) => ({ trigger, count }));
}

/**
 * Calcule les heures à risque
 */
function computeRiskHours(events) {
    const hourCounts = {};
    
    const negativeEvents = events.filter(e => 
        e.type === 'craving' || e.type === 'episode' || e.type === 'slope'
    );
    
    negativeEvents.forEach(event => {
        const date = new Date(event.ts);
        const hour = date.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    // Trouver les heures avec le plus d'événements
    const sortedHours = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    // Déterminer les périodes à risque
    const periods = [];
    
    sortedHours.forEach(([hour, count]) => {
        const h = parseInt(hour, 10);
        for (const [period, config] of Object.entries(DAY_PERIODS)) {
            if (config.start <= config.end) {
                if (h >= config.start && h < config.end) {
                    if (!periods.includes(period)) periods.push(period);
                }
            } else {
                if (h >= config.start || h < config.end) {
                    if (!periods.includes(period)) periods.push(period);
                }
            }
        }
    });
    
    return {
        topHours: sortedHours.map(([hour, count]) => ({ hour: parseInt(hour, 10), count })),
        periods
    };
}

/**
 * Trouve les corrélations entre facteurs
 */
function findCorrelations(state, startDate) {
    const correlations = [];
    const checkins = state.checkins.filter(c => c.date >= startDate);
    const events = state.events.filter(e => e.date >= startDate);
    
    if (checkins.length < CORRELATION_THRESHOLDS.minSamples) {
        return correlations;
    }
    
    // Corrélation stress élevé -> cravings
    const highStressDays = checkins.filter(c => c.stress >= CORRELATION_THRESHOLDS.stress);
    const normalStressDays = checkins.filter(c => c.stress < CORRELATION_THRESHOLDS.stress);
    
    if (highStressDays.length >= 2 && normalStressDays.length >= 2) {
        const highStressCravings = events.filter(e => 
            e.type === 'craving' && 
            highStressDays.some(d => d.date === e.date)
        ).length;
        
        const normalStressCravings = events.filter(e => 
            e.type === 'craving' && 
            normalStressDays.some(d => d.date === e.date)
        ).length;
        
        const highAvg = highStressCravings / highStressDays.length;
        const normalAvg = normalStressCravings / Math.max(1, normalStressDays.length);
        
        if (highAvg > normalAvg * 1.5) {
            correlations.push({
                type: 'stress_craving',
                factor: 'stress',
                multiplier: Math.round((highAvg / Math.max(0.1, normalAvg)) * 10) / 10,
                confidence: Math.min(1, highStressDays.length / 5)
            });
        }
    }
    
    // Corrélation solitude -> cravings
    const loneDays = checkins.filter(c => c.solitude >= 7);
    if (loneDays.length >= 2) {
        const loneCravings = events.filter(e => 
            e.type === 'craving' && 
            loneDays.some(d => d.date === e.date)
        ).length;
        
        const loneAvg = loneCravings / loneDays.length;
        const overallAvg = events.filter(e => e.type === 'craving').length / Math.max(1, checkins.length);
        
        if (loneAvg > overallAvg * 1.5) {
            correlations.push({
                type: 'solitude_craving',
                factor: 'solitude',
                multiplier: Math.round((loneAvg / Math.max(0.1, overallAvg)) * 10) / 10,
                confidence: Math.min(1, loneDays.length / 5)
            });
        }
    }
    
    // Corrélation téléphone au lit -> événements nocturnes
    const phoneBedCheckins = state.antiporn?.phoneBedCheckins || [];
    const phoneInBedDays = phoneBedCheckins.filter(c => c.phoneInBed).map(c => c.date);
    const phoneOutDays = phoneBedCheckins.filter(c => !c.phoneInBed).map(c => c.date);
    
    if (phoneInBedDays.length >= 2 && phoneOutDays.length >= 2) {
        const nightEvents = events.filter(e => {
            const hour = new Date(e.ts).getHours();
            return hour >= 22 || hour < 6;
        });
        
        const phoneInEvents = nightEvents.filter(e => phoneInBedDays.includes(e.date)).length;
        const phoneOutEvents = nightEvents.filter(e => phoneOutDays.includes(e.date)).length;
        
        const inAvg = phoneInEvents / phoneInBedDays.length;
        const outAvg = phoneOutEvents / Math.max(1, phoneOutDays.length);
        
        if (inAvg > outAvg * 2) {
            correlations.push({
                type: 'phone_bed_night',
                factor: 'phone_in_bed',
                multiplier: Math.round((inAvg / Math.max(0.1, outAvg)) * 10) / 10,
                confidence: Math.min(1, phoneInBedDays.length / 5)
            });
        }
    }
    
    return correlations;
}

/**
 * Suggère des règles basées sur les patterns
 */
function suggestRules(state, events, checkins) {
    const suggestions = [];
    const existingRules = state.ifThenRules || [];
    
    // Analyser les déclencheurs fréquents
    const topTriggers = computeTopTriggers(events, 5);
    
    topTriggers.forEach(({ trigger, count }) => {
        // Vérifier si une règle existe déjà pour ce déclencheur
        const hasRule = existingRules.some(r => 
            r.ifCondition?.includes(trigger) || r.id?.includes(trigger)
        );
        
        if (!hasRule && count >= 2) {
            // Suggérer une règle basée sur le déclencheur
            const suggestion = generateRuleSuggestion(trigger);
            if (suggestion) {
                suggestions.push({
                    trigger,
                    count,
                    ...suggestion
                });
            }
        }
    });
    
    // Suggérer des règles basées sur les heures à risque
    const riskHours = computeRiskHours(events);
    if (riskHours.periods.includes('night')) {
        const hasNightRule = existingRules.some(r => 
            r.ifCondition?.toLowerCase().includes('nuit') || 
            r.ifCondition?.toLowerCase().includes('night')
        );
        
        if (!hasNightRule) {
            suggestions.push({
                trigger: 'night',
                ifCondition: { fr: 'Si c\'est la nuit', en: 'If it\'s night', ar: 'إذا كان الليل' },
                thenAction: { fr: 'Téléphone hors chambre', en: 'Phone out of bedroom', ar: 'الهاتف خارج الغرفة' },
                priority: 'high'
            });
        }
    }
    
    return suggestions.slice(0, 3);
}

/**
 * Génère une suggestion de règle pour un déclencheur
 */
function generateRuleSuggestion(trigger) {
    const rules = {
        alone: {
            ifCondition: { fr: 'Si je suis seul', en: 'If I\'m alone', ar: 'إذا كنت وحدي' },
            thenAction: { fr: 'Appeler quelqu\'un', en: 'Call someone', ar: 'اتصل بشخص ما' }
        },
        night: {
            ifCondition: { fr: 'Si c\'est la nuit', en: 'If it\'s night', ar: 'إذا كان الليل' },
            thenAction: { fr: 'Téléphone dans le salon', en: 'Phone in living room', ar: 'الهاتف في الصالة' }
        },
        boredom: {
            ifCondition: { fr: 'Si je m\'ennuie', en: 'If I\'m bored', ar: 'إذا شعرت بالملل' },
            thenAction: { fr: 'Sortir marcher 5 min', en: 'Walk 5 min', ar: 'امش 5 دقائق' }
        },
        stress: {
            ifCondition: { fr: 'Si je suis stressé', en: 'If I\'m stressed', ar: 'إذا كنت متوترا' },
            thenAction: { fr: 'Respiration 4-4-6', en: 'Breathing 4-4-6', ar: 'تنفس 4-4-6' }
        },
        fatigue: {
            ifCondition: { fr: 'Si je suis fatigué', en: 'If I\'m tired', ar: 'إذا كنت متعبا' },
            thenAction: { fr: 'Douche froide ou dormir', en: 'Cold shower or sleep', ar: 'دش بارد أو نوم' }
        }
    };
    
    return rules[trigger] || null;
}

// ============================================
// AFFICHAGE DES INSIGHTS
// ============================================

let insightModalEl = null;

/**
 * Ouvre le modal des insights
 */
function openInsightsModal(state) {
    if (!insightModalEl) {
        insightModalEl = document.createElement('div');
        insightModalEl.className = 'modal-overlay';
        insightModalEl.id = 'insightsModal';
        document.body.appendChild(insightModalEl);
    }
    
    const insights = computeWeeklyInsights(state);
    renderInsightsModal(state, insights);
    insightModalEl.classList.add('active');
}

/**
 * Ferme le modal
 */
function closeInsightsModal() {
    if (insightModalEl) {
        insightModalEl.classList.remove('active');
    }
}

/**
 * Rendu du modal insights
 */
function renderInsightsModal(state, insights) {
    const lang = state.profile.lang;
    
    const labels = {
        fr: {
            title: '📊 Insights de la semaine',
            summary: 'Résumé',
            cravings: 'cravings',
            episodes: 'épisodes',
            wins: 'victoires',
            slopes: 'pentes',
            triggers: 'Top déclencheurs',
            hours: 'Heures à risque',
            correlations: 'Patterns détectés',
            suggestions: 'Règles suggérées',
            addRule: 'Ajouter cette règle',
            noData: 'Pas assez de données cette semaine',
            stressCorrelation: 'Stress élevé = {x}x plus de cravings',
            solitudeCorrelation: 'Solitude = {x}x plus de cravings',
            phoneCorrelation: 'Téléphone au lit = {x}x plus d\'événements nocturnes'
        },
        en: {
            title: '📊 Weekly insights',
            summary: 'Summary',
            cravings: 'cravings',
            episodes: 'episodes',
            wins: 'wins',
            slopes: 'slopes',
            triggers: 'Top triggers',
            hours: 'Risk hours',
            correlations: 'Detected patterns',
            suggestions: 'Suggested rules',
            addRule: 'Add this rule',
            noData: 'Not enough data this week',
            stressCorrelation: 'High stress = {x}x more cravings',
            solitudeCorrelation: 'Loneliness = {x}x more cravings',
            phoneCorrelation: 'Phone in bed = {x}x more night events'
        },
        ar: {
            title: '📊 رؤى الأسبوع',
            summary: 'ملخص',
            cravings: 'رغبات',
            episodes: 'حوادث',
            wins: 'انتصارات',
            slopes: 'منحدرات',
            triggers: 'أعلى المحفزات',
            hours: 'ساعات الخطر',
            correlations: 'الأنماط المكتشفة',
            suggestions: 'قواعد مقترحة',
            addRule: 'إضافة هذه القاعدة',
            noData: 'بيانات غير كافية هذا الأسبوع',
            stressCorrelation: 'ضغط عالي = {x} ضعف الرغبات',
            solitudeCorrelation: 'وحدة = {x} ضعف الرغبات',
            phoneCorrelation: 'هاتف في السرير = {x} ضعف أحداث الليل'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    // Formatage des corrélations
    const formatCorrelation = (corr) => {
        const templates = {
            stress_craving: l.stressCorrelation,
            solitude_craving: l.solitudeCorrelation,
            phone_bed_night: l.phoneCorrelation
        };
        return (templates[corr.type] || '').replace('{x}', corr.multiplier);
    };
    
    insightModalEl.innerHTML = `
        <div class="modal-content insights-modal">
            <button class="modal-close" onclick="Coaching.closeInsights()">×</button>
            
            <h2>${l.title}</h2>
            
            <!-- Stats résumé -->
            <div class="insights-summary">
                <h4>${l.summary}</h4>
                <div class="insights-stats-grid">
                    <div class="insight-stat">
                        <span class="stat-value">${insights.cravingsCount}</span>
                        <span class="stat-label">${l.cravings}</span>
                    </div>
                    <div class="insight-stat ${insights.episodesCount > 0 ? 'negative' : ''}">
                        <span class="stat-value">${insights.episodesCount}</span>
                        <span class="stat-label">${l.episodes}</span>
                    </div>
                    <div class="insight-stat positive">
                        <span class="stat-value">${insights.winsCount}</span>
                        <span class="stat-label">${l.wins}</span>
                    </div>
                    <div class="insight-stat">
                        <span class="stat-value">${insights.slopesCount}</span>
                        <span class="stat-label">${l.slopes}</span>
                    </div>
                </div>
            </div>
            
            <!-- Top déclencheurs -->
            ${insights.topTriggers.length > 0 ? `
                <div class="insights-section">
                    <h4>🎯 ${l.triggers}</h4>
                    <div class="triggers-list">
                        ${insights.topTriggers.map(t => {
                            const triggerLabel = AntiPorn?.TRIGGERS?.[t.trigger]?.[lang] || t.trigger;
                            return `
                                <div class="trigger-item">
                                    <span class="trigger-name">${triggerLabel}</span>
                                    <span class="trigger-count">${t.count}x</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Heures à risque -->
            ${insights.riskHours.topHours.length > 0 ? `
                <div class="insights-section">
                    <h4>⏰ ${l.hours}</h4>
                    <div class="hours-list">
                        ${insights.riskHours.topHours.map(h => `
                            <span class="hour-chip">${h.hour}h (${h.count}x)</span>
                        `).join('')}
                    </div>
                    <p class="periods-text">
                        ${insights.riskHours.periods.map(p => DAY_PERIODS[p][lang] || p).join(', ')}
                    </p>
                </div>
            ` : ''}
            
            <!-- Corrélations -->
            ${insights.correlations.length > 0 ? `
                <div class="insights-section">
                    <h4>🔗 ${l.correlations}</h4>
                    <div class="correlations-list">
                        ${insights.correlations.map(c => `
                            <div class="correlation-item" style="opacity: ${0.5 + c.confidence * 0.5}">
                                <span class="correlation-icon">⚡</span>
                                <span class="correlation-text">${formatCorrelation(c)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Suggestions de règles -->
            ${insights.suggestedRules.length > 0 ? `
                <div class="insights-section">
                    <h4>💡 ${l.suggestions}</h4>
                    <div class="suggestions-list">
                        ${insights.suggestedRules.map(s => `
                            <div class="suggestion-card">
                                <p class="suggestion-if">${s.ifCondition?.[lang] || s.ifCondition?.fr || ''}</p>
                                <p class="suggestion-then">→ ${s.thenAction?.[lang] || s.thenAction?.fr || ''}</p>
                                <button class="btn btn-small btn-secondary" 
                                        onclick="Coaching.addSuggestedRule('${s.trigger}')">
                                    + ${l.addRule}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${insights.cravingsCount === 0 && insights.topTriggers.length === 0 ? `
                <p class="no-data">${l.noData}</p>
            ` : ''}
        </div>
    `;
}

/**
 * Ajoute une règle suggérée
 */
function addSuggestedRule(trigger) {
    const suggestion = generateRuleSuggestion(trigger);
    if (!suggestion) return;
    
    const lang = state?.profile?.lang || 'fr';
    
    const rule = {
        id: `rule_${Date.now()}`,
        ifCondition: suggestion.ifCondition[lang] || suggestion.ifCondition.fr,
        thenAction: suggestion.thenAction[lang] || suggestion.thenAction.fr,
        enabled: true,
        createdAt: Storage.getDateISO()
    };
    
    Storage.saveIfThenRule(state, rule);
    closeInsightsModal();
    
    if (typeof showToast === 'function') {
        const messages = {
            fr: 'Règle ajoutée !',
            en: 'Rule added!',
            ar: 'تمت إضافة القاعدة!'
        };
        showToast(messages[lang]);
    }
}

/**
 * Vérifie si un nouvel insight hebdomadaire est disponible
 */
function isWeeklyInsightAvailable(state) {
    const lastInsight = state.coaching?.lastWeeklyInsight;
    if (!lastInsight) return true;
    
    const last = new Date(lastInsight);
    const now = new Date();
    const daysDiff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    
    return daysDiff >= 7;
}

/**
 * Génère le widget insights pour la home
 */
function renderInsightsWidget(state) {
    const lang = state.profile.lang;
    const available = isWeeklyInsightAvailable(state);
    
    if (!available) return '';
    
    const labels = {
        fr: { new: 'Nouveaux insights', view: 'Voir' },
        en: { new: 'New insights', view: 'View' },
        ar: { new: 'رؤى جديدة', view: 'عرض' }
    };
    
    const l = labels[lang] || labels.fr;
    
    return `
        <div class="insights-widget" onclick="Coaching.openInsights(state)">
            <span class="widget-icon">📊</span>
            <span class="widget-text">${l.new}</span>
            <span class="widget-badge">!</span>
        </div>
    `;
}

// ============================================
// EXPORTS
// ============================================

window.Coaching = {
    // Constantes
    CORRELATION_THRESHOLDS,
    DAY_PERIODS,
    
    // Analyse
    computeWeeklyInsights,
    computeTopTriggers,
    computeRiskHours,
    findCorrelations,
    suggestRules,
    
    // Modal
    openInsights: openInsightsModal,
    closeInsights: closeInsightsModal,
    addSuggestedRule,
    
    // Utils
    isWeeklyInsightAvailable,
    renderInsightsWidget
};
