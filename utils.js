/**
 * utils.js - Fonctions utilitaires pour l'application Revenir
 * 
 * Helpers pour:
 * - Gestion des dates
 * - Calculs statistiques
 * - Matching des règles si-alors
 * - Génération de la heatmap
 */

// ============================================
// DATES
// ============================================

/**
 * Retourne la date du jour au format ISO (YYYY-MM-DD)
 * @returns {string}
 */
function todayISO() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Parse une date ISO en objet Date
 * @param {string} isoDate - Date au format YYYY-MM-DD
 * @returns {Date}
 */
function parseISODate(isoDate) {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Retourne la date il y a N jours au format ISO
 * @param {number} daysAgo - Nombre de jours dans le passé
 * @returns {string}
 */
function daysAgoISO(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
}

/**
 * Calcule le nombre de jours entre deux dates ISO
 * @param {string} date1 - Date ISO
 * @param {string} date2 - Date ISO
 * @returns {number}
 */
function daysBetween(date1, date2) {
    const d1 = parseISODate(date1);
    const d2 = parseISODate(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Retourne le jour de la semaine (0=Dim, 1=Lun, ..., 6=Sam)
 * @param {string} isoDate - Date ISO
 * @returns {number}
 */
function getDayOfWeek(isoDate) {
    return parseISODate(isoDate).getDay();
}

/**
 * Retourne l'heure d'un timestamp
 * @param {number} timestamp - Timestamp en ms
 * @returns {number} Heure (0-23)
 */
function getHourFromTimestamp(timestamp) {
    return new Date(timestamp).getHours();
}

/**
 * Retourne le créneau horaire (bucket) pour une heure donnée
 * @param {number} hour - Heure (0-23)
 * @returns {string} morning|noon|afternoon|evening|night|late
 */
function getTimeBucket(hour) {
    if (hour >= 5 && hour < 9) return 'morning';      // 5h-9h
    if (hour >= 9 && hour < 12) return 'noon';        // 9h-12h
    if (hour >= 12 && hour < 17) return 'afternoon';  // 12h-17h
    if (hour >= 17 && hour < 21) return 'evening';    // 17h-21h
    if (hour >= 21 && hour < 24) return 'night';      // 21h-00h
    return 'late';                                     // 00h-5h
}

/**
 * Labels des créneaux horaires pour l'UI
 */
const TIME_BUCKET_LABELS = {
    morning: { fr: 'Matin', en: 'Morning', ar: 'صباح' },
    noon: { fr: 'Midi', en: 'Noon', ar: 'ظهر' },
    afternoon: { fr: 'Après-midi', en: 'Afternoon', ar: 'بعد الظهر' },
    evening: { fr: 'Soir', en: 'Evening', ar: 'مساء' },
    night: { fr: 'Nuit', en: 'Night', ar: 'ليل' },
    late: { fr: 'Tard', en: 'Late', ar: 'متأخر' }
};

/**
 * Labels des jours de la semaine
 */
const DAY_LABELS = {
    0: { fr: 'Dim', en: 'Sun', ar: 'أحد' },
    1: { fr: 'Lun', en: 'Mon', ar: 'إثن' },
    2: { fr: 'Mar', en: 'Tue', ar: 'ثلا' },
    3: { fr: 'Mer', en: 'Wed', ar: 'أرب' },
    4: { fr: 'Jeu', en: 'Thu', ar: 'خمي' },
    5: { fr: 'Ven', en: 'Fri', ar: 'جمع' },
    6: { fr: 'Sam', en: 'Sat', ar: 'سبت' }
};

// ============================================
// FILTRES ET REQUÊTES
// ============================================

/**
 * Récupère les événements dans une plage de dates
 * @param {Array} events - Liste des événements
 * @param {number} days - Nombre de jours à inclure
 * @param {string} [addictionId] - Filtre par addiction (optionnel)
 * @returns {Array}
 */
function getEventsByDateRange(events, days, addictionId = null) {
    const startDate = daysAgoISO(days - 1);
    return events.filter(e => {
        const inRange = e.date >= startDate;
        const matchesAddiction = !addictionId || e.addictionId === addictionId || addictionId === 'any';
        return inRange && matchesAddiction;
    });
}

/**
 * Récupère les événements d'un type donné pour aujourd'hui
 * @param {Array} events - Liste des événements
 * @param {string} type - Type d'événement
 * @returns {Array}
 */
function getTodayEventsByType(events, type) {
    const today = todayISO();
    return events.filter(e => e.date === today && e.type === type);
}

// ============================================
// CALCULS STATISTIQUES
// ============================================

/**
 * Calcule le streak global (jours sans épisode)
 * @param {Object} state - State de l'application
 * @param {string} [addictionId='porn'] - ID de l'addiction
 * @returns {number} Nombre de jours du streak
 */
function computeStreakGlobal(state, addictionId = 'porn') {
    // Récupérer les épisodes (rechutes) triés par date décroissante
    const episodes = state.events
        .filter(e => e.type === 'episode' && (addictionId === 'any' || e.addictionId === addictionId))
        .sort((a, b) => b.ts - a.ts);
    
    if (episodes.length === 0) {
        // Pas d'épisode = streak depuis le premier événement/check-in ou 0
        const allTimestamps = [
            ...state.events.map(e => e.ts),
            ...state.checkins.map(c => parseISODate(c.date).getTime())
        ].filter(Boolean);
        
        if (allTimestamps.length === 0) return 0;
        
        const firstTs = Math.min(...allTimestamps);
        return Math.floor((Date.now() - firstTs) / (1000 * 60 * 60 * 24));
    }
    
    // Jours depuis le dernier épisode
    const lastEpisode = episodes[0];
    return Math.floor((Date.now() - lastEpisode.ts) / (1000 * 60 * 60 * 24));
}

/**
 * Calcule les "victoires invisibles"
 * @param {Object} state - State de l'application
 * @returns {Object} { resistedCravings, minutesSavedEstimate, positiveActionsCount }
 */
function computeInvisibleWins(state) {
    // Compteurs stockés dans state.wins
    const wins = state.wins || { resistedCravings: 0, minutesSavedEstimate: 0, positiveActionsCount: 0 };
    
    // Compter aussi les événements type "win" comme fallback
    const winEvents = state.events.filter(e => e.type === 'win').length;
    
    return {
        resistedCravings: Math.max(wins.resistedCravings, winEvents),
        minutesSavedEstimate: wins.minutesSavedEstimate || winEvents * 10,
        positiveActionsCount: wins.positiveActionsCount || 0
    };
}

/**
 * Calcule la matrice pour la heatmap
 * @param {Object} state - State de l'application
 * @param {number} days - Nombre de jours
 * @param {string} addictionId - ID de l'addiction
 * @returns {Object} Matrice { dayIndex: { bucket: score } }
 */
function computeHeatmapMatrix(state, days = 7, addictionId = 'porn') {
    const matrix = {};
    const buckets = ['morning', 'noon', 'afternoon', 'evening', 'night', 'late'];
    
    // Initialiser la matrice
    for (let d = 0; d < days; d++) {
        const dateISO = daysAgoISO(days - 1 - d);
        const dayOfWeek = getDayOfWeek(dateISO);
        matrix[d] = {
            date: dateISO,
            dayOfWeek,
            buckets: {}
        };
        buckets.forEach(b => {
            matrix[d].buckets[b] = { score: 0, cravings: 0, slopes: 0, episodes: 0 };
        });
    }
    
    // Remplir avec les événements
    const events = getEventsByDateRange(state.events, days, addictionId);
    
    events.forEach(event => {
        const eventDate = event.date;
        const hour = getHourFromTimestamp(event.ts);
        const bucket = getTimeBucket(hour);
        
        // Trouver l'index du jour
        for (let d = 0; d < days; d++) {
            if (matrix[d].date === eventDate) {
                const cell = matrix[d].buckets[bucket];
                
                // Scoring: craving=1, slope=1, episode=3
                if (event.type === 'craving') {
                    cell.cravings++;
                    cell.score += 1;
                } else if (event.type === 'slope') {
                    cell.slopes++;
                    cell.score += 1;
                } else if (event.type === 'episode') {
                    cell.episodes++;
                    cell.score += 3;
                }
                break;
            }
        }
    });
    
    return matrix;
}

/**
 * Retourne le niveau de risque pour un score
 * @param {number} score - Score de la cellule
 * @returns {string} none|low|med|high
 */
function getHeatmapLevel(score) {
    if (score === 0) return 'none';
    if (score <= 2) return 'low';
    if (score <= 5) return 'med';
    return 'high';
}

// ============================================
// MATCHING RÈGLES SI-ALORS
// ============================================

/**
 * Vérifie si le contexte actuel matche une condition
 * @param {Object} condition - Condition de la règle (if)
 * @param {Object} context - Contexte actuel
 * @returns {boolean}
 */
function matchCondition(condition, context) {
    // timeRange
    if (condition.timeRange) {
        const hour = new Date().getHours();
        const bucket = getTimeBucket(hour);
        const timeRanges = {
            night: ['night', 'late'],
            morning: ['morning'],
            afternoon: ['noon', 'afternoon'],
            evening: ['evening']
        };
        if (!timeRanges[condition.timeRange]?.includes(bucket)) {
            return false;
        }
    }
    
    // alone
    if (condition.alone !== undefined && context.alone !== condition.alone) {
        return false;
    }
    
    // stressAbove
    if (condition.stressAbove !== undefined) {
        if (context.stress === undefined || context.stress <= condition.stressAbove) {
            return false;
        }
    }
    
    // moodBelow
    if (condition.moodBelow !== undefined) {
        if (context.mood === undefined || context.mood >= condition.moodBelow) {
            return false;
        }
    }
    
    // inBedWithPhone
    if (condition.inBedWithPhone !== undefined && context.inBedWithPhone !== condition.inBedWithPhone) {
        return false;
    }
    
    // exposed
    if (condition.exposed !== undefined && context.exposed !== condition.exposed) {
        return false;
    }
    
    // triggerTag
    if (condition.triggerTag && !context.triggers?.includes(condition.triggerTag)) {
        return false;
    }
    
    return true;
}

/**
 * Trouve les règles si-alors qui matchent le contexte actuel
 * @param {Object} state - State de l'application
 * @param {Object} context - Contexte actuel { alone, stress, mood, triggers, ... }
 * @returns {Array} Règles qui matchent
 */
function matchIfThenRules(state, context = {}) {
    if (!state.ifThenRules || !Array.isArray(state.ifThenRules)) {
        return [];
    }
    
    return state.ifThenRules.filter(rule => {
        if (!rule.enabled) return false;
        return matchCondition(rule.if, context);
    });
}

// ============================================
// HELPERS DIVERS
// ============================================

/**
 * Génère un ID unique
 * @returns {string}
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Limite un texte à N caractères
 * @param {string} text - Texte à limiter
 * @param {number} maxLength - Longueur max
 * @returns {string}
 */
function truncateText(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Formate un nombre avec séparateur de milliers
 * @param {number} num - Nombre à formater
 * @returns {string}
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ============================================
// EXPORTS
// ============================================

window.Utils = {
    // Dates
    todayISO,
    parseISODate,
    daysAgoISO,
    daysBetween,
    getDayOfWeek,
    getHourFromTimestamp,
    getTimeBucket,
    TIME_BUCKET_LABELS,
    DAY_LABELS,
    
    // Filtres
    getEventsByDateRange,
    getTodayEventsByType,
    
    // Stats
    computeStreakGlobal,
    computeInvisibleWins,
    computeHeatmapMatrix,
    getHeatmapLevel,
    
    // Matching
    matchCondition,
    matchIfThenRules,
    
    // Helpers
    generateId,
    truncateText,
    formatNumber
};
