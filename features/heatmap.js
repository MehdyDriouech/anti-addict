/**
 * heatmap.js - Heatmap des risques
 * 
 * Affichage d'une grille visuelle:
 * - 7 jours x 6 créneaux horaires
 * - Scoring: cravings*1 + slopes*1 + episodes*3
 * - UI pure CSS (pas de librairie)
 * - Tooltips au clic
 * 
 * V3 Extensions:
 * - Filtres multi-facteurs (stress élevé, soir/nuit)
 * - Vue agrégée par facteur
 * - Corrélations avec check-ins
 */

// ============================================
// CONSTANTES
// ============================================

const BUCKETS = ['morning', 'noon', 'afternoon', 'evening', 'night', 'late'];

const BUCKET_LABELS = {
    morning: { fr: '5h-9h', en: '5-9am', ar: '٥-٩ص' },
    noon: { fr: '9h-12h', en: '9-12pm', ar: '٩-١٢' },
    afternoon: { fr: '12h-17h', en: '12-5pm', ar: '١٢-٥م' },
    evening: { fr: '17h-21h', en: '5-9pm', ar: '٥-٩م' },
    night: { fr: '21h-0h', en: '9pm-12', ar: '٩م-١٢' },
    late: { fr: '0h-5h', en: '12-5am', ar: '١٢-٥ص' }
};

// V3: Filtres disponibles
const HEATMAP_FILTERS = {
    all: { fr: 'Tous', en: 'All', ar: 'الكل' },
    high_stress: { fr: 'Stress élevé', en: 'High stress', ar: 'ضغط عالي' },
    night_only: { fr: 'Soir/Nuit', en: 'Evening/Night', ar: 'مساء/ليل' },
    weekends: { fr: 'Week-ends', en: 'Weekends', ar: 'نهاية الأسبوع' }
};

// V3: State local du filtre actif
let activeFilter = 'all';

// ============================================
// MODAL HEATMAP
// ============================================

let heatmapModalEl = null;

/**
 * Ouvre le modal heatmap
 * @param {Object} state - State de l'application
 */
function openHeatmapModal(state) {
    if (!heatmapModalEl) {
        heatmapModalEl = document.createElement('div');
        heatmapModalEl.className = 'modal-overlay';
        heatmapModalEl.id = 'heatmapModal';
        document.body.appendChild(heatmapModalEl);
    }
    
    renderHeatmapModal(state);
    heatmapModalEl.classList.add('active');
}

/**
 * Ferme le modal heatmap
 */
function closeHeatmapModal() {
    if (heatmapModalEl) {
        heatmapModalEl.classList.remove('active');
    }
}

/**
 * Rendu du modal heatmap
 */
function renderHeatmapModal(state, days = 7) {
    const lang = state.profile.lang;
    
    const labels = {
        fr: {
            title: '🗓️ Heatmap des risques',
            subtitle: 'Identifie tes moments à risque',
            legend: 'Légende',
            low: 'Faible',
            med: 'Moyen',
            high: 'Élevé',
            noData: 'Pas de données',
            days7: '7 jours',
            days14: '14 jours',
            days30: '30 jours',
            filters: 'Filtres',
            insights: 'Insights'
        },
        en: {
            title: '🗓️ Risk heatmap',
            subtitle: 'Identify your risk moments',
            legend: 'Legend',
            low: 'Low',
            med: 'Medium',
            high: 'High',
            noData: 'No data',
            days7: '7 days',
            days14: '14 days',
            days30: '30 days',
            filters: 'Filters',
            insights: 'Insights'
        },
        ar: {
            title: '🗓️ خريطة المخاطر',
            subtitle: 'حدد لحظات الخطر',
            legend: 'مفتاح',
            low: 'منخفض',
            med: 'متوسط',
            high: 'مرتفع',
            noData: 'لا بيانات',
            days7: '٧ أيام',
            days14: '١٤ يوم',
            days30: '٣٠ يوم',
            filters: 'مرشحات',
            insights: 'رؤى'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    // V3: Calculer les insights
    const insights = computeHeatmapInsights(state, days, lang);
    
    heatmapModalEl.innerHTML = `
        <div class="modal-content heatmap-modal">
            <button class="modal-close" onclick="Heatmap.close()">×</button>
            
            <div class="heatmap-header">
                <h2>${l.title}</h2>
                <p>${l.subtitle}</p>
            </div>
            
            <!-- V3: Filtres -->
            <div class="heatmap-filters">
                <span class="filter-label">${l.filters}:</span>
                <div class="filter-chips">
                    ${Object.entries(HEATMAP_FILTERS).map(([key, labels]) => `
                        <button class="chip ${activeFilter === key ? 'active' : ''}" 
                                onclick="Heatmap.setFilter('${key}')">
                            ${labels[lang] || labels.fr}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div class="heatmap-controls">
                <div class="btn-group">
                    <button class="btn ${days === 7 ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="Heatmap.render(7)">
                        ${l.days7}
                    </button>
                    <button class="btn ${days === 14 ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="Heatmap.render(14)">
                        ${l.days14}
                    </button>
                </div>
            </div>
            
            <div class="heatmap-container">
                ${renderHeatmapGrid(state, days, lang)}
            </div>
            
            <!-- V3: Insights section -->
            ${insights.length > 0 ? `
                <div class="heatmap-insights">
                    <h4>💡 ${l.insights}</h4>
                    <ul class="insights-list">
                        ${insights.map(i => `<li>${i}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="heatmap-legend">
                <span class="legend-title">${l.legend}:</span>
                <div class="legend-items">
                    <span class="legend-item"><span class="cell none"></span> ${l.noData}</span>
                    <span class="legend-item"><span class="cell low"></span> ${l.low}</span>
                    <span class="legend-item"><span class="cell med"></span> ${l.med}</span>
                    <span class="legend-item"><span class="cell high"></span> ${l.high}</span>
                </div>
            </div>
            
            <div id="heatmapTooltip" class="heatmap-tooltip hidden"></div>
        </div>
    `;
}

/**
 * Génère le HTML de la grille heatmap
 * @param {Object} state - State de l'application
 * @param {number} days - Nombre de jours
 * @param {string} lang - Langue
 * @returns {string} HTML
 */
function renderHeatmapGrid(state, days, lang) {
    const matrix = Utils.computeHeatmapMatrix(state, days, 'porn');
    const dayLabels = Utils.DAY_LABELS;
    
    // Header avec les créneaux
    let html = '<div class="heatmap-grid">';
    
    // Ligne d'en-tête
    html += '<div class="heatmap-row header">';
    html += '<div class="heatmap-cell corner"></div>';
    
    BUCKETS.forEach(bucket => {
        const label = BUCKET_LABELS[bucket]?.[lang] || BUCKET_LABELS[bucket]?.fr;
        html += `<div class="heatmap-cell header-cell">${label}</div>`;
    });
    html += '</div>';
    
    // Lignes de données (jours)
    for (let d = 0; d < days; d++) {
        const dayData = matrix[d];
        if (!dayData) continue;
        
        const dayLabel = dayLabels[dayData.dayOfWeek]?.[lang] || dayLabels[dayData.dayOfWeek]?.fr;
        
        html += '<div class="heatmap-row">';
        html += `<div class="heatmap-cell row-label">${dayLabel}</div>`;
        
        BUCKETS.forEach(bucket => {
            const cell = dayData.buckets[bucket];
            const level = Utils.getHeatmapLevel(cell.score);
            const cellId = `cell-${d}-${bucket}`;
            
            html += `
                <div class="heatmap-cell ${level}" 
                     id="${cellId}"
                     data-day="${d}" 
                     data-bucket="${bucket}"
                     data-date="${dayData.date}"
                     data-score="${cell.score}"
                     data-cravings="${cell.cravings}"
                     data-slopes="${cell.slopes}"
                     data-episodes="${cell.episodes}"
                     onclick="Heatmap.showTooltip(event, '${cellId}')">
                    ${cell.score > 0 ? cell.score : ''}
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

/**
 * Affiche le tooltip pour une cellule
 */
function showTooltip(event, cellId) {
    const cell = document.getElementById(cellId);
    if (!cell) return;
    
    const lang = state?.profile?.lang || 'fr';
    const date = cell.dataset.date;
    const bucket = cell.dataset.bucket;
    const cravings = parseInt(cell.dataset.cravings) || 0;
    const slopes = parseInt(cell.dataset.slopes) || 0;
    const episodes = parseInt(cell.dataset.episodes) || 0;
    const score = parseInt(cell.dataset.score) || 0;
    
    if (score === 0) {
        hideTooltip();
        return;
    }
    
    const bucketLabel = BUCKET_LABELS[bucket]?.[lang] || bucket;
    
    const labels = {
        fr: { cravings: 'Cravings', slopes: 'Pentes', episodes: 'Épisodes' },
        en: { cravings: 'Cravings', slopes: 'Slopes', episodes: 'Episodes' },
        ar: { cravings: 'رغبات', slopes: 'منحدرات', episodes: 'حوادث' }
    };
    
    const l = labels[lang] || labels.fr;
    
    const tooltip = document.getElementById('heatmapTooltip');
    if (tooltip) {
        tooltip.innerHTML = `
            <div class="tooltip-header">${date} • ${bucketLabel}</div>
            <div class="tooltip-stats">
                ${cravings > 0 ? `<div>${l.cravings}: ${cravings}</div>` : ''}
                ${slopes > 0 ? `<div>${l.slopes}: ${slopes}</div>` : ''}
                ${episodes > 0 ? `<div>${l.episodes}: ${episodes}</div>` : ''}
            </div>
        `;
        
        // Positionner le tooltip
        const rect = cell.getBoundingClientRect();
        const modalRect = heatmapModalEl.querySelector('.modal-content').getBoundingClientRect();
        
        tooltip.style.top = (rect.bottom - modalRect.top + 5) + 'px';
        tooltip.style.left = (rect.left - modalRect.left) + 'px';
        tooltip.classList.remove('hidden');
    }
}

/**
 * Cache le tooltip
 */
function hideTooltip() {
    const tooltip = document.getElementById('heatmapTooltip');
    if (tooltip) {
        tooltip.classList.add('hidden');
    }
}

/**
 * Re-render avec un nombre de jours différent
 */
function render(days) {
    renderHeatmapModal(state, days);
}

/**
 * V3: Change le filtre actif
 */
function setFilter(filter) {
    activeFilter = filter;
    renderHeatmapModal(state, 7);
}

/**
 * V3: Calcule les insights basés sur les données
 */
function computeHeatmapInsights(state, days, lang) {
    const insights = [];
    const matrix = Utils.computeHeatmapMatrix(state, days, 'porn');
    
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
        const insightText = {
            fr: `Créneau le plus à risque: ${bucketLabel}`,
            en: `Highest risk time: ${bucketLabel}`,
            ar: `الوقت الأكثر خطورة: ${bucketLabel}`
        };
        insights.push(insightText[lang] || insightText.fr);
    }
    
    // Insight: Week-end vs semaine
    const weekendAvg = weekendTotal / (days / 7 * 2);
    const weekdayAvg = weekdayTotal / (days / 7 * 5);
    
    if (weekendAvg > weekdayAvg * 1.5) {
        const insightText = {
            fr: 'Week-ends plus risqués que la semaine',
            en: 'Weekends riskier than weekdays',
            ar: 'نهايات الأسبوع أكثر خطورة من أيام الأسبوع'
        };
        insights.push(insightText[lang] || insightText.fr);
    }
    
    // Insight: Soir/nuit dominant
    const eveningNight = bucketTotals.evening + bucketTotals.night + bucketTotals.late;
    const daytime = bucketTotals.morning + bucketTotals.noon + bucketTotals.afternoon;
    
    if (eveningNight > daytime * 2) {
        const insightText = {
            fr: 'La majorité des risques sont le soir/nuit',
            en: 'Most risks are in evening/night',
            ar: 'معظم المخاطر في المساء/الليل'
        };
        insights.push(insightText[lang] || insightText.fr);
    }
    
    // Insight: Corrélation avec stress (si données dispo)
    const highStressDays = state.checkins.filter(c => c.stress >= 7);
    if (highStressDays.length >= 3) {
        const highStressDates = highStressDays.map(c => c.date);
        const eventsOnHighStress = state.events.filter(e => 
            highStressDates.includes(e.date) &&
            (e.type === 'craving' || e.type === 'episode')
        ).length;
        
        if (eventsOnHighStress > highStressDays.length * 0.5) {
            const insightText = {
                fr: 'Stress élevé = plus de risques',
                en: 'High stress = more risks',
                ar: 'ضغط عالي = مخاطر أكثر'
            };
            insights.push(insightText[lang] || insightText.fr);
        }
    }
    
    return insights.slice(0, 3);
}

// ============================================
// MINI HEATMAP POUR HOME
// ============================================

/**
 * Génère un mini aperçu de la heatmap (7 jours, simplifié)
 * @param {Object} state - State de l'application
 * @returns {string} HTML
 */
function renderMiniHeatmap(state) {
    const lang = state.profile.lang;
    const matrix = Utils.computeHeatmapMatrix(state, 7, 'porn');
    
    const labels = {
        fr: { title: 'Moments à risque', view: 'Voir détails' },
        en: { title: 'Risk moments', view: 'View details' },
        ar: { title: 'لحظات الخطر', view: 'عرض التفاصيل' }
    };
    
    const l = labels[lang] || labels.fr;
    
    // Calculer les créneaux les plus à risque
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
    
    const riskBucketLabel = maxBucket 
        ? (Utils.TIME_BUCKET_LABELS[maxBucket]?.[lang] || maxBucket)
        : '—';
    
    return `
        <div class="mini-heatmap" onclick="Heatmap.openHeatmapModal(state)">
            <div class="mini-heatmap-header">
                <h4>🗓️ ${l.title}</h4>
                <button class="btn-small btn-secondary">${l.view}</button>
            </div>
            <div class="mini-heatmap-grid">
                ${Array.from({ length: 7 }).map((_, d) => {
                    const dayData = matrix[d];
                    if (!dayData) return '';
                    
                    // Score total du jour
                    let dayScore = 0;
                    BUCKETS.forEach(b => {
                        dayScore += dayData.buckets[b].score;
                    });
                    const level = Utils.getHeatmapLevel(dayScore);
                    const dayLabel = Utils.DAY_LABELS[dayData.dayOfWeek]?.[lang] || '?';
                    
                    return `<div class="mini-cell ${level}" title="${dayLabel}: ${dayScore}">${dayLabel}</div>`;
                }).join('')}
            </div>
            ${maxBucket && maxScore > 0 ? `
                <div class="risk-insight">
                    ⚠️ ${lang === 'fr' ? 'Risque élevé' : lang === 'ar' ? 'خطر مرتفع' : 'High risk'}: ${riskBucketLabel}
                </div>
            ` : ''}
        </div>
    `;
}

// ============================================
// EXPORTS
// ============================================

window.Heatmap = {
    // Constantes
    BUCKETS,
    BUCKET_LABELS,
    HEATMAP_FILTERS,
    
    // Modal
    openHeatmapModal,
    closeHeatmapModal,
    close: closeHeatmapModal,
    render,
    
    // V3: Filtres
    setFilter,
    
    // V3: Insights
    computeHeatmapInsights,
    
    // Grid
    renderHeatmapGrid,
    
    // Tooltip
    showTooltip,
    hideTooltip,
    
    // Mini
    renderMiniHeatmap
};
