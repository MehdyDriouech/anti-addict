/**
 * Heatmap View - Rendu HTML
 */

import { BUCKETS, BUCKET_LABELS, HEATMAP_FILTERS, LABELS } from '../data/heatmap-data.js';

export class HeatmapView {
    constructor() {
        this.modalEl = null;
    }

    /**
     * Crée l'élément modal s'il n'existe pas
     * @returns {HTMLElement}
     */
    createModalElement() {
        if (!this.modalEl) {
            this.modalEl = document.createElement('div');
            this.modalEl.className = 'modal-overlay';
            this.modalEl.id = 'heatmapModal';
            document.body.appendChild(this.modalEl);
        }
        return this.modalEl;
    }

    /**
     * Récupère l'élément modal
     * @returns {HTMLElement}
     */
    getModalElement() {
        return this.modalEl;
    }

    /**
     * Affiche le modal
     */
    show() {
        if (this.modalEl) {
            this.modalEl.classList.add('active');
        }
    }

    /**
     * Cache le modal
     */
    hide() {
        if (this.modalEl) {
            this.modalEl.classList.remove('active');
        }
    }

    /**
     * Rendu du modal heatmap
     * @param {Object} state - State de l'application
     * @param {number} days - Nombre de jours
     * @param {string} activeFilter - Filtre actif
     * @param {Array} insights - Insights calculés
     */
    renderModal(state, days, activeFilter, insights) {
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        
        this.modalEl.innerHTML = `
            <div class="modal-content heatmap-modal">
                <div class="heatmap-header-with-close">
                    <button class="modal-close" onclick="Heatmap.close()">×</button>
                </div>
                <div class="heatmap-header">
                    <h2>${l.title}</h2>
                    <p>${l.subtitle}</p>
                </div>
                
                <!-- Filtres -->
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
                    ${this.renderGrid(state, days, lang)}
                </div>
                
                <!-- Insights section -->
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
    renderGrid(state, days, lang) {
        const matrix = Utils.computeHeatmapMatrix(state, days, 'porn');
        const dayLabels = Utils.DAY_LABELS;
        
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
     * @param {string} cellId - ID de la cellule
     * @param {string} lang - Langue
     */
    showTooltip(cellId, lang) {
        const cell = document.getElementById(cellId);
        if (!cell) return;
        
        const l = LABELS[lang] || LABELS.fr;
        const date = cell.dataset.date;
        const bucket = cell.dataset.bucket;
        const cravings = parseInt(cell.dataset.cravings) || 0;
        const slopes = parseInt(cell.dataset.slopes) || 0;
        const episodes = parseInt(cell.dataset.episodes) || 0;
        const score = parseInt(cell.dataset.score) || 0;
        
        if (score === 0) {
            this.hideTooltip();
            return;
        }
        
        const bucketLabel = BUCKET_LABELS[bucket]?.[lang] || bucket;
        
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
            const modalRect = this.modalEl.querySelector('.modal-content').getBoundingClientRect();
            
            tooltip.style.top = (rect.bottom - modalRect.top + 5) + 'px';
            tooltip.style.left = (rect.left - modalRect.left) + 'px';
            tooltip.classList.remove('hidden');
        }
    }

    /**
     * Cache le tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('heatmapTooltip');
        if (tooltip) {
            tooltip.classList.add('hidden');
        }
    }

    /**
     * Génère un mini aperçu de la heatmap
     * @param {Object} state - State de l'application
     * @param {Object} bucketData - { maxBucket, maxScore }
     * @returns {string} HTML
     */
    renderMiniHeatmap(state, bucketData) {
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        const matrix = Utils.computeHeatmapMatrix(state, 7, 'porn');
        
        const riskBucketLabel = bucketData.maxBucket 
            ? (Utils.TIME_BUCKET_LABELS[bucketData.maxBucket]?.[lang] || bucketData.maxBucket)
            : '—';
        
        return `
            <div class="mini-heatmap" onclick="Heatmap.open(state)">
                <div class="mini-heatmap-header">
                    <h4>🗓️ ${l.miniTitle}</h4>
                    <button class="btn-small btn-secondary">${l.view}</button>
                </div>
                <div class="mini-heatmap-grid">
                    ${Array.from({ length: 7 }).map((_, d) => {
                        const dayData = matrix[d];
                        if (!dayData) return '';
                        
                        let dayScore = 0;
                        BUCKETS.forEach(b => {
                            dayScore += dayData.buckets[b].score;
                        });
                        const level = Utils.getHeatmapLevel(dayScore);
                        const dayLabel = Utils.DAY_LABELS[dayData.dayOfWeek]?.[lang] || '?';
                        
                        return `<div class="mini-cell ${level}" title="${dayLabel}: ${dayScore}">${dayLabel}</div>`;
                    }).join('')}
                </div>
                ${bucketData.maxBucket && bucketData.maxScore > 0 ? `
                    <div class="risk-insight">
                        ⚠️ ${l.highRisk}: ${riskBucketLabel}
                    </div>
                ` : ''}
            </div>
        `;
    }
}
