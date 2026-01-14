/**
 * Dashboard Model - Logique métier pour le dashboard
 */

export class DashboardModel {
    /**
     * Récupère les insights hebdomadaires
     * @param {Object} state - State de l'application
     * @returns {Promise<Object|null>} Insights ou null
     */
    async getWeeklyInsights(state) {
        if (typeof Coaching !== 'undefined' && Coaching.computeWeeklyInsights) {
            return await Coaching.computeWeeklyInsights(state);
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
