/**
 * wins.js - Gestion des "victoires invisibles"
 * 
 * Compteurs:
 * - Cravings résistés
 * - Minutes estimées gagnées
 * - Actions positives réalisées
 */

// ============================================
// CONSTANTES
// ============================================

// Minutes gagnées estimées par craving résisté
const MINUTES_PER_WIN = 10;

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Récupère les compteurs de victoires invisibles
 * @param {Object} state - State de l'application
 * @returns {Object} { resistedCravings, minutesSavedEstimate, positiveActionsCount }
 */
function getWinsStats(state) {
    return {
        resistedCravings: state.wins?.resistedCravings || 0,
        minutesSavedEstimate: state.wins?.minutesSavedEstimate || 0,
        positiveActionsCount: state.wins?.positiveActionsCount || 0
    };
}

/**
 * Enregistre une victoire (craving résisté)
 * @param {Object} state - State de l'application
 * @param {boolean} withAction - Si une action positive a été faite
 * @returns {Object} State modifié
 */
function recordWin(state, withAction = false) {
    // Incrémenter les compteurs
    Storage.incrementWins(state, {
        resistedCravings: 1,
        minutesSaved: MINUTES_PER_WIN,
        positiveActions: withAction ? 1 : 0
    });
    
    // Ajouter un événement "win"
    Storage.addEvent(state, 'win', 'porn', null, { withAction });
    
    return state;
}

/**
 * Formate les minutes en heures et minutes
 * @param {number} minutes - Nombre de minutes
 * @returns {string} Format "Xh Ymin" ou "Y min"
 */
function formatMinutes(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${mins}min`;
}

/**
 * Génère le HTML pour afficher les victoires invisibles
 * @param {Object} state - State de l'application
 * @returns {string} HTML
 */
function renderWinsStats(state) {
    const stats = getWinsStats(state);
    const lang = state.profile.lang;
    
    const labels = {
        fr: {
            title: 'Victoires invisibles',
            resisted: 'Cravings résistés',
            saved: 'Temps gagné',
            actions: 'Actions positives'
        },
        en: {
            title: 'Invisible wins',
            resisted: 'Cravings resisted',
            saved: 'Time saved',
            actions: 'Positive actions'
        },
        ar: {
            title: 'انتصارات خفية',
            resisted: 'رغبات مقاومة',
            saved: 'وقت موفر',
            actions: 'أفعال إيجابية'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    return `
        <div class="wins-stats">
            <h4 class="wins-title">${l.title}</h4>
            <div class="wins-grid">
                <div class="win-stat">
                    <span class="win-icon">🛡️</span>
                    <span class="win-value">${stats.resistedCravings}</span>
                    <span class="win-label">${l.resisted}</span>
                </div>
                <div class="win-stat">
                    <span class="win-icon">⏱️</span>
                    <span class="win-value">${formatMinutes(stats.minutesSavedEstimate)}</span>
                    <span class="win-label">${l.saved}</span>
                </div>
                <div class="win-stat">
                    <span class="win-icon">✨</span>
                    <span class="win-value">${stats.positiveActionsCount}</span>
                    <span class="win-label">${l.actions}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Génère le HTML compact pour le dashboard
 * @param {Object} state - State de l'application
 * @returns {string} HTML (3 items pour une grille)
 */
function renderWinsCompact(state) {
    const stats = getWinsStats(state);
    const lang = state.profile.lang;
    
    const labels = {
        fr: { resisted: 'Résistés', saved: 'Temps', actions: 'Actions' },
        en: { resisted: 'Resisted', saved: 'Time', actions: 'Actions' },
        ar: { resisted: 'مقاومة', saved: 'وقت', actions: 'أفعال' }
    };
    
    const l = labels[lang] || labels.fr;
    
    return `
        <div class="progress-item">
            <span class="progress-value">${stats.resistedCravings}</span>
            <span class="progress-label">🛡️ ${l.resisted}</span>
        </div>
        <div class="progress-item">
            <span class="progress-value">${formatMinutes(stats.minutesSavedEstimate)}</span>
            <span class="progress-label">⏱️ ${l.saved}</span>
        </div>
        <div class="progress-item">
            <span class="progress-value">${stats.positiveActionsCount}</span>
            <span class="progress-label">✨ ${l.actions}</span>
        </div>
    `;
}

// ============================================
// EXPORTS
// ============================================

window.Wins = {
    getWinsStats,
    recordWin,
    formatMinutes,
    renderWinsStats,
    renderWinsCompact,
    MINUTES_PER_WIN
};
