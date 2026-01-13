/**
 * SOS Plugin - Point d'entrée
 */

import { SOSModel } from './model/sos-model.js';
import { SOSView } from './view/sos-view.js';
import { SOSController } from './controller/sos-controller.js';
import { EMERGENCY_MESSAGES, PRIORITY_ACTIONS } from './data/sos-data.js';

// Créer les instances
const sosModel = new SOSModel();
const sosView = new SOSView();
const sosController = new SOSController(sosModel, sosView);

// Exporter l'API publique
const SOS = {
    // Constantes
    EMERGENCY_MESSAGES,
    PRIORITY_ACTIONS,
    
    // Lifecycle
    activate: (state) => sosController.activate(state),
    deactivate: () => sosController.deactivate(),
    isActive: () => sosController.isActive(),
    
    // Actions
    executeAction: (actionId) => sosController.executeAction(actionId),
    randomAction: (state) => sosController.randomAction(state),
    startBreathing: (state) => sosController.startBreathing(state),
    
    // UI
    toggleLowText: (state) => sosController.toggleLowText(state),
    confirmExit: (state) => sosController.confirmExit(state),
    renderSOSButton: (state) => sosController.renderSOSButton(state)
};

// Exposer globalement pour compatibilité
window.SOS = SOS;

export default SOS;
