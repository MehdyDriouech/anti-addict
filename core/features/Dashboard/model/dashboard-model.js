/**
 * Dashboard Model - Logique métier pour le dashboard
 */

export class DashboardModel {
    /**
     * Récupère les insights hebdomadaires
     * @param {Object} state - State de l'application
     * @returns {Object|null} Insights ou null
     */
    getWeeklyInsights(state) {
        if (typeof Coaching !== 'undefined' && Coaching.computeWeeklyInsights) {
            return Coaching.computeWeeklyInsights(state);
        }
        return null;
    }

    /**
     * Vérifie si des insights sont disponibles
     * @param {Object} insights - Insights
     * @returns {boolean}
     */
    hasInsights(insights) {
        return insights && insights.topTriggers && insights.topTriggers.length > 0;
    }
}
