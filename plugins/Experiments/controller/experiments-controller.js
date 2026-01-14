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

    delete(experimentId) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        
        // Demander confirmation
        if (typeof UI !== 'undefined' && UI.showConfirm) {
            UI.showConfirm(l.deleteConfirm, () => {
                const deleted = this.model.deleteExperiment(experimentId, state);
                if (deleted) {
                    this.renderModal(state);
                    if (typeof UI !== 'undefined' && UI.showToast) {
                        UI.showToast(l.experimentDeleted, 'success');
                    } else if (typeof showToast === 'function') {
                        showToast(l.experimentDeleted);
                    }
                }
            });
        } else {
            // Fallback si UI.showConfirm n'existe pas
            if (confirm(l.deleteConfirm)) {
                const deleted = this.model.deleteExperiment(experimentId, state);
                if (deleted) {
                    this.renderModal(state);
                    if (typeof UI !== 'undefined' && UI.showToast) {
                        UI.showToast(l.experimentDeleted, 'success');
                    } else if (typeof showToast === 'function') {
                        showToast(l.experimentDeleted);
                    }
                }
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
