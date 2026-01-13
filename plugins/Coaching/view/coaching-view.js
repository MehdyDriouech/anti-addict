/**
 * Coaching View - Rendu HTML
 */

import { DAY_PERIODS, LABELS } from '../data/coaching-data.js';

export class CoachingView {
    constructor() { this.modalEl = null; }

    createModalElement() {
        if (!this.modalEl) {
            this.modalEl = document.createElement('div');
            this.modalEl.className = 'modal-overlay';
            this.modalEl.id = 'insightsModal';
            document.body.appendChild(this.modalEl);
        }
        return this.modalEl;
    }

    show() { if (this.modalEl) this.modalEl.classList.add('active'); }
    hide() { if (this.modalEl) this.modalEl.classList.remove('active'); }

    formatCorrelation(corr, l) {
        const templates = { stress_craving: l.stressCorrelation, solitude_craving: l.solitudeCorrelation, phone_bed_night: l.phoneCorrelation };
        return (templates[corr.type] || '').replace('{x}', corr.multiplier);
    }

    renderModal(lang, insights) {
        const l = LABELS[lang] || LABELS.fr;
        this.modalEl.innerHTML = `
            <div class="modal-content insights-modal">
                <button class="modal-close" onclick="Coaching.closeInsights()">×</button>
                <h2>${l.title}</h2>
                <div class="insights-summary"><h4>${l.summary}</h4>
                    <div class="insights-stats-grid">
                        <div class="insight-stat"><span class="stat-value">${insights.cravingsCount}</span><span class="stat-label">${l.cravings}</span></div>
                        <div class="insight-stat ${insights.episodesCount > 0 ? 'negative' : ''}"><span class="stat-value">${insights.episodesCount}</span><span class="stat-label">${l.episodes}</span></div>
                        <div class="insight-stat positive"><span class="stat-value">${insights.winsCount}</span><span class="stat-label">${l.wins}</span></div>
                        <div class="insight-stat"><span class="stat-value">${insights.slopesCount}</span><span class="stat-label">${l.slopes}</span></div>
                    </div>
                </div>
                ${insights.topTriggers.length > 0 ? `<div class="insights-section"><h4>🎯 ${l.triggers}</h4><div class="triggers-list">${insights.topTriggers.map(t => `<div class="trigger-item"><span class="trigger-name">${typeof AntiPorn !== 'undefined' && AntiPorn.TRIGGERS?.[t.trigger]?.[lang] || t.trigger}</span><span class="trigger-count">${t.count}x</span></div>`).join('')}</div></div>` : ''}
                ${insights.riskHours.topHours.length > 0 ? `<div class="insights-section"><h4>⏰ ${l.hours}</h4><div class="hours-list">${insights.riskHours.topHours.map(h => `<span class="hour-chip">${h.hour}h (${h.count}x)</span>`).join('')}</div><p class="periods-text">${insights.riskHours.periods.map(p => DAY_PERIODS[p][lang] || p).join(', ')}</p></div>` : ''}
                ${insights.correlations.length > 0 ? `<div class="insights-section"><h4>🔗 ${l.correlations}</h4><div class="correlations-list">${insights.correlations.map(c => `<div class="correlation-item" style="opacity: ${0.5 + c.confidence * 0.5}"><span class="correlation-icon">⚡</span><span class="correlation-text">${this.formatCorrelation(c, l)}</span></div>`).join('')}</div></div>` : ''}
                ${insights.suggestedRules.length > 0 ? `<div class="insights-section"><h4>💡 ${l.suggestions}</h4><div class="suggestions-list">${insights.suggestedRules.map(s => `<div class="suggestion-card"><p class="suggestion-if">${s.ifCondition?.[lang] || s.ifCondition?.fr || ''}</p><p class="suggestion-then">→ ${s.thenAction?.[lang] || s.thenAction?.fr || ''}</p><button class="btn btn-small btn-secondary" onclick="Coaching.addSuggestedRule('${s.trigger}')">+ ${l.addRule}</button></div>`).join('')}</div></div>` : ''}
                ${insights.cravingsCount === 0 && insights.topTriggers.length === 0 ? `<p class="no-data">${l.noData}</p>` : ''}
            </div>
        `;
    }

    renderWidget(lang) {
        const l = LABELS[lang] || LABELS.fr;
        return `<div class="insights-widget" onclick="Coaching.openInsights(state)"><span class="widget-icon">📊</span><span class="widget-text">${l.new}</span><span class="widget-badge">!</span></div>`;
    }
}
