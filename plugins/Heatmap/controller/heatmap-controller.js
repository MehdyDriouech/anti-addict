/**
 * Heatmap Controller - Orchestration Model/View
 */

import { HeatmapModel } from '../model/heatmap-model.js';
import { HeatmapView } from '../view/heatmap-view.js';

export class HeatmapController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.currentDays = 7;
    }

    /**
     * Ouvre le modal heatmap
     * @param {Object} state - State de l'application
     */
    open(state) {
        const modalEl = this.view.createModalElement();
        
        // Ajouter l'event listener pour fermer sur clic overlay (une seule fois)
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => {
                if (e.target === modalEl) {
                    this.close();
                }
            });
            modalEl._hasClickListener = true;
        }
        
        this.render(state, this.currentDays);
        this.view.show();
    }

    /**
     * Ferme le modal heatmap
     */
    close() {
        this.view.hide();
    }

    /**
     * Re-render avec un nombre de jours différent
     * @param {Object} state - State de l'application (optionnel si déjà stocké)
     * @param {number} days - Nombre de jours
     */
    render(state, days) {
        if (days) {
            this.currentDays = days;
        }
        
        // Utiliser le state global si non fourni
        const currentState = state || (typeof window !== 'undefined' ? window.state : null);
        if (!currentState) return;
        
        const lang = currentState.profile.lang;
        const activeFilter = this.model.getActiveFilter();
        const insights = this.model.computeInsights(currentState, this.currentDays, lang);
        
        this.view.renderModal(currentState, this.currentDays, activeFilter, insights);
    }

    /**
     * Change le filtre actif
     * @param {string} filter
     */
    setFilter(filter) {
        this.model.setFilter(filter);
        this.render(null, this.currentDays);
    }

    /**
     * Affiche le tooltip pour une cellule
     * @param {Event} event
     * @param {string} cellId
     */
    showTooltip(event, cellId) {
        const currentState = typeof window !== 'undefined' ? window.state : null;
        const lang = currentState?.profile?.lang || 'fr';
        this.view.showTooltip(cellId, lang);
    }

    /**
     * Cache le tooltip
     */
    hideTooltip() {
        this.view.hideTooltip();
    }

    /**
     * Génère le mini heatmap pour la home
     * @param {Object} state - State de l'application
     * @returns {string} HTML
     */
    renderMiniHeatmap(state) {
        const bucketData = this.model.computeBucketTotals(state);
        return this.view.renderMiniHeatmap(state, bucketData);
    }
}
