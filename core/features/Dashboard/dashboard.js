/**
 * Dashboard Feature - API publique pour le dashboard
 */

import { DashboardController } from './controller/dashboard-controller.js';

// Instance unique du controller
const dashboardController = new DashboardController();

// API publique
export const Dashboard = {
    render: (state, renderCoachingWidget, renderInsightFallback) => 
        dashboardController.render(state, renderCoachingWidget, renderInsightFallback)
};

// Exporter globalement pour compatibilité
if (typeof window !== 'undefined') {
    window.Dashboard = Dashboard;
    window.renderDashboard = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) {
            const renderCoachingWidget = typeof Home !== 'undefined' ? Home.renderCoachingWidget : () => '';
            const renderInsightFallback = typeof Home !== 'undefined' ? Home.renderInsightFallback : () => '';
            Dashboard.render(state, renderCoachingWidget, renderInsightFallback);
        }
    };
}
