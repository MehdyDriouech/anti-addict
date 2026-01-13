/**
 * Dashboard View - Rendu HTML pour le dashboard
 */

import { DASHBOARD_LABELS } from '../data/dashboard-data.js';

export class DashboardView {
    /**
     * Rend l'écran dashboard
     * @param {Object} state - State de l'application
     * @param {Object} insights - Insights hebdomadaires
     * @param {boolean} hasInsights - Si des insights sont disponibles
     * @param {Function} renderCoachingWidget - Fonction pour rendre le widget coaching
     * @param {Function} renderInsightFallback - Fonction pour rendre le fallback
     * @param {string} lang - Langue
     */
    render(state, insights, hasInsights, renderCoachingWidget, renderInsightFallback, lang) {
        const screen = document.getElementById('screen-dashboard');
        if (!screen) return;
        
        const l = DASHBOARD_LABELS[lang] || DASHBOARD_LABELS.fr;
        
        screen.innerHTML = `
            <button class="btn btn-ghost mb-lg" onclick="Router.navigateTo('home')">
                <span>←</span>
                <span>${I18n.t('back')}</span>
            </button>
            
            <div class="mb-lg">
                <h2>${l.title}</h2>
                <p class="text-secondary">${l.subtitle}</p>
            </div>
            
            <div class="dashboard-widgets">
                ${hasInsights ? renderCoachingWidget(insights, lang) : renderInsightFallback(lang)}
                ${typeof IfThen !== 'undefined' ? IfThen.renderRulesSummary(state) : ''}
                ${typeof Heatmap !== 'undefined' ? Heatmap.renderMiniHeatmap(state) : ''}
            </div>
        `;
    }
}
