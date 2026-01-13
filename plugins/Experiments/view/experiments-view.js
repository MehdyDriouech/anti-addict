/**
 * Experiments View - Rendu HTML
 */

import { EXPERIMENT_TEMPLATES, LABELS } from '../data/experiments-data.js';

export class ExperimentsView {
    constructor() {
        this.modalEl = null;
    }

    createModalElement() {
        if (!this.modalEl) {
            this.modalEl = document.createElement('div');
            this.modalEl.className = 'modal-overlay';
            this.modalEl.id = 'experimentsModal';
            document.body.appendChild(this.modalEl);
        }
        return this.modalEl;
    }

    getModalElement() { return this.modalEl; }
    show() { if (this.modalEl) this.modalEl.classList.add('active'); }
    hide() { if (this.modalEl) this.modalEl.classList.remove('active'); }

    renderModal(lang, activeExp, pastExps, getCurrentDay) {
        const l = LABELS[lang] || LABELS.fr;
        
        this.modalEl.innerHTML = `
            <div class="modal-content experiments-modal">
                <button class="modal-close" onclick="Experiments.close()">×</button>
                
                <div class="experiments-header">
                    <h2>${l.title}</h2>
                    <p>${l.subtitle}</p>
                </div>
                
                ${activeExp ? `
                    <div class="active-experiment">
                        <h3>🔬 ${l.active}</h3>
                        <div class="experiment-card active">
                            <h4>${activeExp.name}</h4>
                            <p>${activeExp.description}</p>
                            <div class="experiment-progress">
                                <span>${l.day} ${getCurrentDay(activeExp)} ${l.of} ${activeExp.days}</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${(getCurrentDay(activeExp) / activeExp.days) * 100}%"></div>
                                </div>
                            </div>
                            <div class="experiment-baseline">
                                <span>${l.baseline}: ${activeExp.baseline.cravingsPerDay} cravings/jour</span>
                            </div>
                            <button class="btn btn-secondary" onclick="Experiments.end('${activeExp.id}')">
                                ${l.end}
                            </button>
                        </div>
                    </div>
                ` : `
                    <div class="no-active-experiment">
                        <p>${l.noActive}</p>
                        <h3>${l.start}</h3>
                        <div class="experiment-templates">
                            ${Object.entries(EXPERIMENT_TEMPLATES).map(([key, tpl]) => `
                                <button class="experiment-template" onclick="Experiments.start('${key}')">
                                    <span class="template-name">${tpl.name[lang] || tpl.name.fr}</span>
                                    <span class="template-days">${tpl.days} ${l.days}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `}
                
                ${pastExps.length > 0 ? `
                    <div class="past-experiments">
                        <h3>📊 ${l.past}</h3>
                        <div class="experiments-list">
                            ${pastExps.map(exp => `
                                <div class="experiment-card past">
                                    <h4>${exp.name}</h4>
                                    <div class="experiment-results">
                                        <span>${l.baseline}: ${exp.baseline.cravingsPerDay}/j</span>
                                        <span>${l.results}: ${exp.results.cravingsPerDay}/j</span>
                                        <span class="${exp.results.improvement.cravings >= 0 ? 'positive' : 'negative'}">
                                            ${exp.results.improvement.cravings >= 0 ? '↓' : '↑'} 
                                            ${Math.abs(exp.results.improvement.cravings)}%
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderWidget(lang, activeExp, currentDay) {
        const l = LABELS[lang] || LABELS.fr;
        
        return `
            <div class="experiment-widget" onclick="Experiments.openExperimentsModal(state)">
                <div class="widget-icon">🧪</div>
                <div class="widget-content">
                    <span class="widget-title">${activeExp.name}</span>
                    <span class="widget-progress">${l.day} ${currentDay} ${l.of} ${activeExp.days}</span>
                </div>
                <div class="widget-progress-bar">
                    <div class="progress-fill" style="width: ${(currentDay / activeExp.days) * 100}%"></div>
                </div>
            </div>
        `;
    }
}
