/**
 * History Controller - Orchestration Model/View
 */

import { HistoryModel } from '../model/history-model.js';
import { HistoryView } from '../view/history-view.js';

export class HistoryController {
    constructor() {
        this.model = new HistoryModel();
        this.view = new HistoryView();
    }

    /**
     * Rend l'écran d'historique
     * @param {Object} state - State de l'application
     */
    render(state) {
        const checkins = this.model.getRecentCheckins(state);
        const formatDate = (dateStr, lang) => this.model.formatDate(dateStr, lang);
        this.view.render(checkins, formatDate, state.profile.lang);
    }
}
