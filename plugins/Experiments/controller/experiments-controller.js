/**
 * Experiments Controller - Orchestration
 */

import { ExperimentsModel } from '../model/experiments-model.js';
import { ExperimentsView } from '../view/experiments-view.js';
import { LABELS } from '../data/experiments-data.js';

export class ExperimentsController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    open(state) {
        const modalEl = this.view.createModalElement();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => {
                if (e.target === modalEl) this.close();
            });
            modalEl._hasClickListener = true;
        }
        
        this.renderModal(state);
        this.view.show();
    }

    close() {
        this.view.hide();
    }

    renderModal(state) {
        const lang = state.profile.lang;
        const activeExp = this.model.getActiveExperiment(state);
        const pastExps = this.model.getPastExperiments(state);
        
        this.view.renderModal(lang, activeExp, pastExps, (exp) => this.model.getCurrentDay(exp));
    }

    start(templateKey) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const experiment = this.model.startExperiment(templateKey, state);
        if (experiment) {
            this.renderModal(state);
            
            const lang = state.profile.lang;
            const l = LABELS[lang] || LABELS.fr;
            if (typeof showToast === 'function') showToast(l.experimentStarted);
        }
    }

    end(experimentId) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const experiment = this.model.endExperiment(experimentId, state);
        if (experiment) {
            this.renderModal(state);
            
            const lang = state.profile.lang;
            const l = LABELS[lang] || LABELS.fr;
            const improvement = experiment.results.improvement.cravings;
            if (typeof showToast === 'function') {
                showToast(`${l.experimentEnded} ${improvement >= 0 ? '↓' : '↑'}${Math.abs(improvement)}%`);
            }
        }
    }

    renderWidget(state) {
        const activeExp = this.model.getActiveExperiment(state);
        if (!activeExp) return '';
        
        const lang = state.profile.lang;
        const currentDay = this.model.getCurrentDay(activeExp);
        return this.view.renderWidget(lang, activeExp, currentDay);
    }

    // Délégation au model
    calculateBaseline(state, startDate) { return this.model.calculateBaseline(state, startDate); }
    calculateResults(state, experiment) { return this.model.calculateResults(state, experiment); }
    isExperimentActive(experiment) { return this.model.isExperimentActive(experiment); }
    getCurrentDay(experiment) { return this.model.getCurrentDay(experiment); }
    startExperiment(templateKey, state) { return this.model.startExperiment(templateKey, state); }
    endExperiment(experimentId, state) { return this.model.endExperiment(experimentId, state); }
    getActiveExperiment(state) { return this.model.getActiveExperiment(state); }
    getPastExperiments(state) { return this.model.getPastExperiments(state); }
}
