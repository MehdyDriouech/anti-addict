/**
 * Heatmap Plugin - Point d'entrée
 */

import { HeatmapModel } from './model/heatmap-model.js';
import { HeatmapView } from './view/heatmap-view.js';
import { HeatmapController } from './controller/heatmap-controller.js';
import { BUCKETS, BUCKET_LABELS, HEATMAP_FILTERS } from './data/heatmap-data.js';

// Créer les instances
const heatmapModel = new HeatmapModel();
const heatmapView = new HeatmapView();
const heatmapController = new HeatmapController(heatmapModel, heatmapView);

// Exporter l'API publique
const Heatmap = {
    // Constantes
    BUCKETS,
    BUCKET_LABELS,
    HEATMAP_FILTERS,
    
    // Modal
    open: (state) => heatmapController.open(state),
    openHeatmapModal: (state) => heatmapController.open(state),
    close: () => heatmapController.close(),
    closeHeatmapModal: () => heatmapController.close(),
    render: (days) => heatmapController.render(null, days),
    
    // Filtres
    setFilter: (filter) => heatmapController.setFilter(filter),
    
    // Insights
    computeHeatmapInsights: (state, days, lang) => heatmapModel.computeInsights(state, days, lang),
    
    // Grid
    renderHeatmapGrid: (state, days, lang) => heatmapView.renderGrid(state, days, lang),
    
    // Tooltip
    showTooltip: (event, cellId) => heatmapController.showTooltip(event, cellId),
    hideTooltip: () => heatmapController.hideTooltip(),
    
    // Mini
    renderMiniHeatmap: (state) => heatmapController.renderMiniHeatmap(state)
};

// Exposer globalement pour compatibilité
window.Heatmap = Heatmap;

export default Heatmap;
