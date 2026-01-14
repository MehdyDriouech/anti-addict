/**
 * Evening Plugin - Point d'entrée
 */

import { EveningModel } from './model/evening-model.js';
import { EveningView } from './view/evening-view.js';
import { EveningController } from './controller/evening-controller.js';
import { HELPED_SUGGESTIONS } from './data/evening-data.js';

// Créer les instances
const eveningModel = new EveningModel();
const eveningView = new EveningView();
const eveningController = new EveningController(eveningModel, eveningView);

// Exporter l'API publique
const Evening = {
    // Data
    HELPED_SUGGESTIONS,
    
    // Flow
    openEveningRitual: (state) => eveningController.open(state),
    closeEveningRitual: () => eveningController.close(),
    close: () => eveningController.close(),
    
    // Form
    setExposed: (addictionId, value) => eveningController.setExposed(addictionId, value),
    setHelped: (value) => eveningController.setHelped(value),
    save: () => eveningController.save(),
    
    // Helpers
    hasCompletedToday: (state) => eveningController.hasCompletedToday(state),
    getRecentRituals: (state, days) => eveningController.getRecentRituals(state, days),
    getRitualStats: (state, days) => eveningController.getRitualStats(state, days)
};

// Exposer globalement pour compatibilité
window.Evening = Evening;

export default Evening;
