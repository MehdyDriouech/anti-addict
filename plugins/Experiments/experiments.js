/**
 * Experiments Plugin - Point d'entrée
 */

import { ExperimentsModel } from './model/experiments-model.js';
import { ExperimentsView } from './view/experiments-view.js';
import { ExperimentsController } from './controller/experiments-controller.js';
import { EXPERIMENT_TEMPLATES } from './data/experiments-data.js';

const experimentsModel = new ExperimentsModel();
const experimentsView = new ExperimentsView();
const experimentsController = new ExperimentsController(experimentsModel, experimentsView);

const Experiments = {
    EXPERIMENT_TEMPLATES,
    
    calculateBaseline: (state, startDate) => experimentsController.calculateBaseline(state, startDate),
    calculateResults: (state, experiment) => experimentsController.calculateResults(state, experiment),
    isExperimentActive: (experiment) => experimentsController.isExperimentActive(experiment),
    getCurrentDay: (experiment) => experimentsController.getCurrentDay(experiment),
    
    startExperiment: (templateKey, state) => experimentsController.startExperiment(templateKey, state),
    endExperiment: (experimentId, state) => experimentsController.endExperiment(experimentId, state),
    getActiveExperiment: (state) => experimentsController.getActiveExperiment(state),
    getPastExperiments: (state) => experimentsController.getPastExperiments(state),
    
    openExperimentsModal: (state) => experimentsController.open(state),
    closeExperimentsModal: () => experimentsController.close(),
    close: () => experimentsController.close(),
    start: (templateKey) => experimentsController.start(templateKey),
    end: (experimentId) => experimentsController.end(experimentId),
    
    renderExperimentWidget: (state) => experimentsController.renderWidget(state)
};

window.Experiments = Experiments;

export default Experiments;
