/**
 * Evening View - Rendu HTML
 */

import { HELPED_SUGGESTIONS, LABELS, EXPOSURE_QUESTIONS } from '../data/evening-data.js';

export class EveningView {
    constructor() {
        this.modalEl = null;
    }

    /**
     * Crée l'élément modal
     * @returns {HTMLElement}
     */
    createModalElement() {
        if (!this.modalEl) {
            this.modalEl = document.createElement('div');
            this.modalEl.className = 'modal-overlay';
            this.modalEl.id = 'eveningModal';
            document.body.appendChild(this.modalEl);
        }
        return this.modalEl;
    }

    /**
     * Récupère l'élément modal
     * @returns {HTMLElement}
     */
    getModalElement() {
        return this.modalEl;
    }

    /**
     * Affiche le modal
     */
    show() {
        if (this.modalEl) {
            this.modalEl.classList.add('active');
        }
    }

    /**
     * Cache le modal
     */
    hide() {
        if (this.modalEl) {
            this.modalEl.classList.remove('active');
        }
    }

    /**
     * Rendu du formulaire du rituel
     * @param {string} lang - Langue
     * @param {Object} eveningData - Données du rituel
     * @param {string} addictionId - ID de l'addiction courante
     */
    renderForm(lang, eveningData, addictionId = null) {
        const l = LABELS[lang] || LABELS.fr;
        const suggestions = HELPED_SUGGESTIONS[lang] || HELPED_SUGGESTIONS.fr;
        
        // Récupérer la question d'exposition contextuelle
        const exposureQuestion = this.getExposureQuestion(lang, addictionId);
        
        this.modalEl.innerHTML = `
            <div class="modal-content evening-modal">
                <button class="modal-close" onclick="Evening.close()">×</button>
                
                <div class="evening-header">
                    <h2>${l.title}</h2>
                    <p class="evening-subtitle">${l.subtitle}</p>
                </div>
                
                <div class="evening-form">
                    <!-- Exposition -->
                    <div class="form-group">
                        <label>${exposureQuestion}</label>
                        <div class="btn-group">
                            <button class="btn ${eveningData.exposed ? 'btn-danger' : 'btn-secondary'}" 
                                    onclick="Evening.setExposed(true)">
                                ${l.yes}
                            </button>
                            <button class="btn ${!eveningData.exposed ? 'btn-success' : 'btn-secondary'}" 
                                    onclick="Evening.setExposed(false)">
                                ${l.no}
                            </button>
                        </div>
                    </div>
                    
                    <!-- Ce qui a aidé -->
                    <div class="form-group">
                        <label>${l.helped}</label>
                        <div class="suggestion-chips mini">
                            ${suggestions.map(s => `
                                <button class="chip mini ${eveningData.helped === s ? 'active' : ''}" 
                                        onclick="Evening.setHelped('${s}')">
                                    ${s}
                                </button>
                            `).join('')}
                        </div>
                        <input type="text" id="helpedInput" class="input" 
                               placeholder="${l.helpedPlaceholder}" 
                               value="${eveningData.helped}">
                    </div>
                    
                    <!-- Gratitude -->
                    <div class="form-group">
                        <label>${l.gratitude}</label>
                        <input type="text" id="gratitudeInput" class="input" 
                               placeholder="${l.gratitudePlaceholder}" 
                               value="${eveningData.gratitude}"
                               maxlength="50">
                    </div>
                    
                    <button class="btn btn-primary btn-large" onclick="Evening.save()">
                        ✓ ${l.save}
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Récupère la question d'exposition selon l'addiction
     * @param {string} lang - Langue
     * @param {string} addictionId - ID de l'addiction
     * @returns {string} Question d'exposition
     */
    getExposureQuestion(lang, addictionId) {
        const questions = EXPOSURE_QUESTIONS[lang] || EXPOSURE_QUESTIONS.fr;
        const effectiveAddiction = addictionId || 'porn';
        return questions[effectiveAddiction] || questions.porn || LABELS[lang]?.exposed || LABELS.fr.exposed;
    }

    /**
     * Rendu du résumé après le rituel
     * @param {string} lang - Langue
     * @param {Object} eveningData - Données du rituel
     * @param {Object} tomorrowIntention - Intention pour demain
     */
    renderSummary(lang, eveningData, tomorrowIntention) {
        const l = LABELS[lang] || LABELS.fr;
        
        const modalContent = this.modalEl.querySelector('.modal-content');
        modalContent.innerHTML = `
            <button class="modal-close" onclick="Evening.close()">×</button>
            
            <div class="evening-summary">
                <div class="summary-icon">✨</div>
                <h2>${l.titleComplete}</h2>
                
                <div class="summary-card">
                    <h4>${l.summary}</h4>
                    
                    <div class="summary-item">
                        <span class="summary-label">${l.exposedLabel}:</span>
                        <span class="summary-value ${eveningData.exposed ? 'negative' : 'positive'}">
                            ${eveningData.exposed ? l.exposedYes : l.exposedNo}
                        </span>
                    </div>
                    
                    ${eveningData.helped ? `
                        <div class="summary-item">
                            <span class="summary-label">${l.helpedLabel}:</span>
                            <span class="summary-value">${eveningData.helped}</span>
                        </div>
                    ` : ''}
                    
                    ${eveningData.gratitude ? `
                        <div class="summary-item">
                            <span class="summary-label">${l.gratitudeLabel}:</span>
                            <span class="summary-value highlight">${eveningData.gratitude}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="tomorrow-intention">
                    <h4>💡 ${l.tomorrow}</h4>
                    <blockquote>
                        "${tomorrowIntention.text}"
                        ${tomorrowIntention.ref ? `<cite>— ${tomorrowIntention.ref}</cite>` : ''}
                    </blockquote>
                </div>
                
                <button class="btn btn-primary btn-large" onclick="Evening.close()">
                    ${l.goodNight}
                </button>
            </div>
        `;
    }
}
