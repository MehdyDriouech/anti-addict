/**
 * History Feature - API publique pour l'historique
 */

import { HistoryController } from './controller/history-controller.js';

// Instance unique du controller
const historyController = new HistoryController();

// API publique
export const History = {
    render: (state) => historyController.render(state)
};

// Exporter globalement pour compatibilité
if (typeof window !== 'undefined') {
    window.History = History;
    window.renderHistory = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) History.render(state);
    };
    window.formatDate = (dateStr) => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) {
            return historyController.model.formatDate(dateStr, state.profile.lang);
        }
        return dateStr;
    };
}
