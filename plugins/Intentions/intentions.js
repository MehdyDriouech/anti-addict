/**
 * Intentions Plugin - Point d'entrée
 */

import { IntentionsModel } from './model/intentions-model.js';
import { IntentionsView } from './view/intentions-view.js';
import { IntentionsController } from './controller/intentions-controller.js';
import { NEUTRAL_INTENTIONS } from './data/intentions-data.js';

// Créer les instances
const intentionsModel = new IntentionsModel();
const intentionsView = new IntentionsView();
const intentionsController = new IntentionsController(intentionsModel, intentionsView);

// Exporter l'API publique
const Intentions = {
    hasIntentionToday: (state) => intentionsController.hasIntentionToday(state),
    getTodayIntention: (state) => intentionsController.getTodayIntention(state),
    generateNewIntention: (state) => intentionsController.generateNewIntention(state),
    setTodayIntention: (state, force) => intentionsController.setTodayIntention(state, force),
    getIntentionsHistory: (state, count) => intentionsController.getIntentionsHistory(state, count),
    renderIntentionBlock: (state) => intentionsController.renderIntentionBlock(state),
    onNewIntention: (state) => intentionsController.onNewIntention(state),
    toggleEngagement: (state) => intentionsController.toggleEngagement(state),
    NEUTRAL_INTENTIONS
};

// Exposer globalement pour compatibilité
window.Intentions = Intentions;

export default Intentions;
