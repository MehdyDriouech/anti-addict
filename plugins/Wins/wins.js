/**
 * Wins Plugin - Point d'entrée
 */

import { WinsModel } from './model/wins-model.js';
import { WinsView } from './view/wins-view.js';
import { WinsController } from './controller/wins-controller.js';
import { MINUTES_PER_WIN } from './data/wins-data.js';

// Créer les instances
const winsModel = new WinsModel();
const winsView = new WinsView();
const winsController = new WinsController(winsModel, winsView);

// Exporter l'API publique
const Wins = {
    getWinsStats: (state) => winsController.getWinsStats(state),
    recordWin: (state, withAction) => winsController.recordWin(state, withAction),
    formatMinutes: (minutes) => winsController.formatMinutes(minutes),
    renderWinsStats: (state) => winsController.renderWinsStats(state),
    renderWinsCompact: (state) => winsController.renderWinsCompact(state),
    MINUTES_PER_WIN
};

// Exposer globalement pour compatibilité
window.Wins = Wins;

export default Wins;
