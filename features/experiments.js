/**
 * experiments.js - Mode expérimentation (A/B personnel)
 * 
 * Fonctionnalités:
 * - Templates d'expériences 7 jours
 * - Calcul automatique du baseline
 * - Suivi pendant la période
 * - Affichage des résultats
 */

// ============================================
// TEMPLATES D'EXPÉRIENCES
// ============================================

const EXPERIMENT_TEMPLATES = {
    phone_out_bedroom: {
        id: 'tpl_phone_out_bedroom',
        name: {
            fr: 'Téléphone hors de la chambre',
            en: 'Phone out of bedroom',
            ar: 'الهاتف خارج الغرفة'
        },
        description: {
            fr: 'Chaque soir, laisse ton téléphone hors de ta chambre à partir de 22h.',
            en: 'Every night, leave your phone outside your bedroom from 10pm.',
            ar: 'كل مساء، اترك هاتفك خارج غرفة نومك من الساعة ١٠.'
        },
        days: 7,
        rule: { type: 'phoneOutBedroom', value: true }
    },
    no_phone_bed: {
        id: 'tpl_no_phone_bed',
        name: {
            fr: 'Pas de téléphone au lit',
            en: 'No phone in bed',
            ar: 'لا هاتف في السرير'
        },
        description: {
            fr: 'Ne jamais utiliser ton téléphone au lit pendant 7 jours.',
            en: 'Never use your phone in bed for 7 days.',
            ar: 'لا تستخدم هاتفك في السرير لمدة ٧ أيام.'
        },
        days: 7,
        rule: { type: 'noPhoneBed', value: true }
    },
    walk_on_craving: {
        id: 'tpl_walk_on_craving',
        name: {
            fr: 'Marche 2 min au craving',
            en: 'Walk 2 min on craving',
            ar: 'امشِ دقيقتين عند الرغبة'
        },
        description: {
            fr: 'À chaque craving, sors marcher 2 minutes avant de faire quoi que ce soit.',
            en: 'At every craving, go for a 2-minute walk before doing anything.',
            ar: 'عند كل رغبة، اخرج وامشِ دقيقتين قبل فعل أي شيء.'
        },
        days: 7,
        rule: { type: 'walkOnCraving', value: true }
    },
    evening_ritual: {
        id: 'tpl_evening_ritual',
        name: {
            fr: 'Rituel du soir obligatoire',
            en: 'Mandatory evening ritual',
            ar: 'طقس المساء إلزامي'
        },
        description: {
            fr: 'Faire le rituel du soir tous les jours pendant 7 jours.',
            en: 'Complete the evening ritual every day for 7 days.',
            ar: 'أكمل طقس المساء كل يوم لمدة ٧ أيام.'
        },
        days: 7,
        rule: { type: 'eveningRitual', value: true }
    },
    cold_shower: {
        id: 'tpl_cold_shower',
        name: {
            fr: 'Douche froide quotidienne',
            en: 'Daily cold shower',
            ar: 'دش بارد يومي'
        },
        description: {
            fr: 'Terminer chaque douche par 30 secondes d\'eau froide.',
            en: 'End each shower with 30 seconds of cold water.',
            ar: 'انهِ كل دش بـ ٣٠ ثانية من الماء البارد.'
        },
        days: 7,
        rule: { type: 'coldShower', value: true }
    }
};

// ============================================
// CALCULS BASELINE ET RÉSULTATS
// ============================================

/**
 * Calcule le baseline (7 jours avant l'expérience)
 * @param {Object} state - State de l'application
 * @param {string} startDate - Date de début ISO
 * @returns {Object} { cravingsPerDay, episodesPerWeek }
 */
function calculateBaseline(state, startDate) {
    // Récupérer les 7 jours avant startDate
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

/**
 * Calcule les résultats d'une expérience
 * @param {Object} state - State de l'application
 * @param {Object} experiment - L'expérience
 * @returns {Object} { cravingsPerDay, episodesPerWeek, improvement }
 */
function calculateResults(state, experiment) {
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
    const episodesPerWeek = episodes;
    
    // Calculer l'amélioration
    const baseline = experiment.baseline || { cravingsPerDay: 0, episodesPerWeek: 0 };
    const cravingImprovement = baseline.cravingsPerDay > 0 
        ? Math.round(((baseline.cravingsPerDay - cravingsPerDay) / baseline.cravingsPerDay) * 100)
        : 0;
    
    return {
        cravingsPerDay,
        episodesPerWeek,
        improvement: {
            cravings: cravingImprovement
        }
    };
}

/**
 * Vérifie si une expérience est en cours
 * @param {Object} experiment - L'expérience
 * @returns {boolean}
 */
function isExperimentActive(experiment) {
    if (!experiment.active) return false;
    
    const today = Utils.todayISO();
    const endDate = new Date(Utils.parseISODate(experiment.startDate));
    endDate.setDate(endDate.getDate() + experiment.days);
    const endDateISO = endDate.toISOString().split('T')[0];
    
    return today >= experiment.startDate && today <= endDateISO;
}

/**
 * Calcule le jour actuel de l'expérience (1-indexed)
 * @param {Object} experiment - L'expérience
 * @returns {number}
 */
function getCurrentDay(experiment) {
    const today = Utils.todayISO();
    const start = Utils.parseISODate(experiment.startDate);
    const now = Utils.parseISODate(today);
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(Math.max(diffDays, 1), experiment.days);
}

// ============================================
// CRUD EXPÉRIENCES
// ============================================

/**
 * Démarre une nouvelle expérience
 * @param {string} templateKey - Clé du template
 * @param {Object} state - State de l'application
 * @returns {Object} L'expérience créée
 */
function startExperiment(templateKey, state) {
    const template = EXPERIMENT_TEMPLATES[templateKey];
    if (!template) return null;
    
    const lang = state.profile.lang;
    const startDate = Utils.todayISO();
    
    // Calculer le baseline
    const baseline = calculateBaseline(state, startDate);
    
    const experiment = {
        id: Utils.generateId(),
        name: template.name[lang] || template.name.fr,
        description: template.description[lang] || template.description.fr,
        addictionId: 'porn',
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

/**
 * Termine une expérience (calcul des résultats)
 * @param {string} experimentId - ID de l'expérience
 * @param {Object} state - State de l'application
 * @returns {Object} L'expérience mise à jour
 */
function endExperiment(experimentId, state) {
    const experiment = state.experiments.find(e => e.id === experimentId);
    if (!experiment) return null;
    
    const results = calculateResults(state, experiment);
    
    experiment.active = false;
    experiment.results = results;
    
    Storage.saveExperiment(state, experiment);
    return experiment;
}

/**
 * Récupère l'expérience active
 * @param {Object} state - State de l'application
 * @returns {Object|null}
 */
function getActiveExperiment(state) {
    return state.experiments.find(e => isExperimentActive(e)) || null;
}

/**
 * Récupère les expériences passées
 * @param {Object} state - State de l'application
 * @returns {Array}
 */
function getPastExperiments(state) {
    return state.experiments.filter(e => !isExperimentActive(e) && e.results);
}

// ============================================
// MODAL EXPÉRIENCES
// ============================================

let experimentsModalEl = null;

/**
 * Ouvre le modal expériences
 * @param {Object} state - State de l'application
 */
function openExperimentsModal(state) {
    if (!experimentsModalEl) {
        experimentsModalEl = document.createElement('div');
        experimentsModalEl.className = 'modal-overlay';
        experimentsModalEl.id = 'experimentsModal';
        document.body.appendChild(experimentsModalEl);
    }
    
    renderExperimentsModal(state);
    experimentsModalEl.classList.add('active');
}

/**
 * Ferme le modal
 */
function closeExperimentsModal() {
    if (experimentsModalEl) {
        experimentsModalEl.classList.remove('active');
    }
}

/**
 * Rendu du modal expériences
 */
function renderExperimentsModal(state) {
    const lang = state.profile.lang;
    const activeExp = getActiveExperiment(state);
    const pastExps = getPastExperiments(state);
    
    const labels = {
        fr: {
            title: '🧪 Expériences',
            subtitle: 'Teste des changements pendant 7 jours',
            active: 'Expérience en cours',
            day: 'Jour',
            of: 'sur',
            end: 'Terminer',
            noActive: 'Aucune expérience en cours',
            start: 'Démarrer une expérience',
            past: 'Expériences passées',
            noPast: 'Aucune expérience terminée',
            improvement: 'Amélioration cravings',
            baseline: 'Baseline',
            results: 'Résultats'
        },
        en: {
            title: '🧪 Experiments',
            subtitle: 'Test changes for 7 days',
            active: 'Active experiment',
            day: 'Day',
            of: 'of',
            end: 'End',
            noActive: 'No active experiment',
            start: 'Start an experiment',
            past: 'Past experiments',
            noPast: 'No completed experiments',
            improvement: 'Cravings improvement',
            baseline: 'Baseline',
            results: 'Results'
        },
        ar: {
            title: '🧪 التجارب',
            subtitle: 'اختبر التغييرات لمدة ٧ أيام',
            active: 'تجربة نشطة',
            day: 'اليوم',
            of: 'من',
            end: 'إنهاء',
            noActive: 'لا توجد تجربة نشطة',
            start: 'ابدأ تجربة',
            past: 'التجارب السابقة',
            noPast: 'لا توجد تجارب مكتملة',
            improvement: 'تحسن الرغبات',
            baseline: 'الخط الأساسي',
            results: 'النتائج'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    experimentsModalEl.innerHTML = `
        <div class="modal-content experiments-modal">
            <button class="modal-close" onclick="Experiments.close()">×</button>
            
            <div class="experiments-header">
                <h2>${l.title}</h2>
                <p>${l.subtitle}</p>
            </div>
            
            ${activeExp ? `
                <div class="active-experiment">
                    <h3>🔬 ${l.active}</h3>
                    <div class="experiment-card active">
                        <h4>${activeExp.name}</h4>
                        <p>${activeExp.description}</p>
                        <div class="experiment-progress">
                            <span>${l.day} ${getCurrentDay(activeExp)} ${l.of} ${activeExp.days}</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(getCurrentDay(activeExp) / activeExp.days) * 100}%"></div>
                            </div>
                        </div>
                        <div class="experiment-baseline">
                            <span>${l.baseline}: ${activeExp.baseline.cravingsPerDay} cravings/jour</span>
                        </div>
                        <button class="btn btn-secondary" onclick="Experiments.end('${activeExp.id}')">
                            ${l.end}
                        </button>
                    </div>
                </div>
            ` : `
                <div class="no-active-experiment">
                    <p>${l.noActive}</p>
                    <h3>${l.start}</h3>
                    <div class="experiment-templates">
                        ${Object.entries(EXPERIMENT_TEMPLATES).map(([key, tpl]) => `
                            <button class="experiment-template" onclick="Experiments.start('${key}')">
                                <span class="template-name">${tpl.name[lang] || tpl.name.fr}</span>
                                <span class="template-days">${tpl.days} jours</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `}
            
            ${pastExps.length > 0 ? `
                <div class="past-experiments">
                    <h3>📊 ${l.past}</h3>
                    <div class="experiments-list">
                        ${pastExps.map(exp => `
                            <div class="experiment-card past">
                                <h4>${exp.name}</h4>
                                <div class="experiment-results">
                                    <span>${l.baseline}: ${exp.baseline.cravingsPerDay}/j</span>
                                    <span>${l.results}: ${exp.results.cravingsPerDay}/j</span>
                                    <span class="${exp.results.improvement.cravings >= 0 ? 'positive' : 'negative'}">
                                        ${exp.results.improvement.cravings >= 0 ? '↓' : '↑'} 
                                        ${Math.abs(exp.results.improvement.cravings)}%
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Démarre une expérience depuis l'UI
 */
function start(templateKey) {
    const experiment = startExperiment(templateKey, state);
    if (experiment) {
        renderExperimentsModal(state);
        
        if (typeof showToast === 'function') {
            const lang = state?.profile?.lang || 'fr';
            const messages = {
                fr: 'Expérience démarrée !',
                en: 'Experiment started!',
                ar: 'بدأت التجربة!'
            };
            showToast(messages[lang] || messages.fr);
        }
    }
}

/**
 * Termine une expérience depuis l'UI
 */
function end(experimentId) {
    const experiment = endExperiment(experimentId, state);
    if (experiment) {
        renderExperimentsModal(state);
        
        if (typeof showToast === 'function') {
            const lang = state?.profile?.lang || 'fr';
            const improvement = experiment.results.improvement.cravings;
            const messages = {
                fr: `Expérience terminée ! ${improvement >= 0 ? 'Amélioration' : 'Variation'}: ${improvement}%`,
                en: `Experiment ended! ${improvement >= 0 ? 'Improvement' : 'Change'}: ${improvement}%`,
                ar: `انتهت التجربة! ${improvement >= 0 ? 'تحسن' : 'تغير'}: ${improvement}%`
            };
            showToast(messages[lang] || messages.fr);
        }
    }
}

// ============================================
// MINI WIDGET POUR HOME
// ============================================

/**
 * Génère un mini widget si une expérience est active
 * @param {Object} state - State de l'application
 * @returns {string} HTML
 */
function renderExperimentWidget(state) {
    const activeExp = getActiveExperiment(state);
    if (!activeExp) return '';
    
    const lang = state.profile.lang;
    const currentDay = getCurrentDay(activeExp);
    
    const labels = {
        fr: { day: 'Jour', of: 'sur' },
        en: { day: 'Day', of: 'of' },
        ar: { day: 'اليوم', of: 'من' }
    };
    
    const l = labels[lang] || labels.fr;
    
    return `
        <div class="experiment-widget" onclick="Experiments.openExperimentsModal(state)">
            <div class="widget-icon">🧪</div>
            <div class="widget-content">
                <span class="widget-title">${activeExp.name}</span>
                <span class="widget-progress">${l.day} ${currentDay} ${l.of} ${activeExp.days}</span>
            </div>
            <div class="widget-progress-bar">
                <div class="progress-fill" style="width: ${(currentDay / activeExp.days) * 100}%"></div>
            </div>
        </div>
    `;
}

// ============================================
// EXPORTS
// ============================================

window.Experiments = {
    // Templates
    EXPERIMENT_TEMPLATES,
    
    // Calculs
    calculateBaseline,
    calculateResults,
    isExperimentActive,
    getCurrentDay,
    
    // CRUD
    startExperiment,
    endExperiment,
    getActiveExperiment,
    getPastExperiments,
    
    // Modal
    openExperimentsModal,
    closeExperimentsModal,
    close: closeExperimentsModal,
    start,
    end,
    
    // Widget
    renderExperimentWidget
};
