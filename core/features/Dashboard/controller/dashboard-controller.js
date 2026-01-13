/**
 * Dashboard Controller - Orchestration Model/View
 */

import { DashboardModel } from '../model/dashboard-model.js';
import { DashboardView } from '../view/dashboard-view.js';

export class DashboardController {
    constructor() {
        this.model = new DashboardModel();
        this.view = new DashboardView();
    }

    /**
     * Rend l'écran dashboard
     * @param {Object} state - State de l'application
     * @param {Function} renderCoachingWidget - Fonction pour rendre le widget coaching
     * @param {Function} renderInsightFallback - Fonction pour rendre le fallback
     */
    render(state, renderCoachingWidget, renderInsightFallback) {
        const insights = this.model.getWeeklyInsights(state);
        const hasInsights = this.model.hasInsights(insights);
        this.view.render(state, insights, hasInsights, renderCoachingWidget, renderInsightFallback, state.profile.lang);
    }
}
