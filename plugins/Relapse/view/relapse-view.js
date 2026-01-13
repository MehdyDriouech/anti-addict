/**
 * Relapse View - Rendu HTML
 */

import { TRIGGER_TAGS, CHANGE_SUGGESTIONS, LABELS } from '../data/relapse-data.js';

export class RelapseView {
    constructor() {
        this.modalEl = null;
    }

    createModalElement() {
        if (!this.modalEl) {
            this.modalEl = document.createElement('div');
            this.modalEl.className = 'modal-overlay';
            this.modalEl.id = 'relapseModal';
            document.body.appendChild(this.modalEl);
        }
        return this.modalEl;
    }

    getModalElement() { return this.modalEl; }
    show() { if (this.modalEl) this.modalEl.classList.add('active'); }
    hide() { if (this.modalEl) this.modalEl.classList.remove('active'); }

    renderStep1(lang) {
        const l = LABELS[lang] || LABELS.fr;
        
        this.modalEl.innerHTML = `
            <div class="modal-content relapse-modal">
                <button class="modal-close" onclick="Relapse.close()">×</button>
                
                <div class="relapse-step relapse-step-1">
                    <div class="relapse-icon">🌅</div>
                    <h2>${l.step1Title}</h2>
                    <p class="relapse-message">${l.step1Message}</p>
                    <p class="relapse-message-secondary">${l.step1Message2}</p>
                    
                    <button class="btn btn-primary btn-large" onclick="Relapse.goStep2()">
                        ${l.continue} →
                    </button>
                </div>
            </div>
        `;
    }

    renderStep2(lang, data) {
        const l = LABELS[lang] || LABELS.fr;
        
        const modalContent = this.modalEl.querySelector('.modal-content');
        modalContent.innerHTML = `
            <button class="modal-close" onclick="Relapse.close()">×</button>
            
            <div class="relapse-step relapse-step-2">
                <div class="form-group">
                    <label>${l.when}</label>
                    <div class="btn-group">
                        <button class="btn ${data.when === 'now' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="Relapse.setWhen('now')">
                            ${l.now}
                        </button>
                        <button class="btn ${data.when === 'today' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="Relapse.setWhen('today')">
                            ${l.today}
                        </button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>${l.trigger}</label>
                    <div class="trigger-chips">
                        ${Object.entries(TRIGGER_TAGS).map(([key, labels]) => `
                            <button class="chip ${data.trigger === key ? 'active' : ''}" 
                                    onclick="Relapse.setTrigger('${key}')">
                                ${labels[lang] || labels.fr}
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <button class="btn btn-primary btn-large" onclick="Relapse.goStep3()" 
                        ${!data.trigger ? 'disabled' : ''}>
                    ${l.next} →
                </button>
            </div>
        `;
    }

    renderStep3(lang, data, spiritualCard) {
        const l = LABELS[lang] || LABELS.fr;
        const suggestions = CHANGE_SUGGESTIONS[lang] || CHANGE_SUGGESTIONS.fr;
        
        const modalContent = this.modalEl.querySelector('.modal-content');
        modalContent.innerHTML = `
            <button class="modal-close" onclick="Relapse.close()">×</button>
            
            <div class="relapse-step relapse-step-3">
                ${spiritualCard ? `
                    <div class="spiritual-card relapse-card">
                        <p class="card-text">"${spiritualCard.text}"</p>
                        <cite>— ${spiritualCard.ref}</cite>
                    </div>
                ` : ''}
                
                <div class="form-group">
                    <label>${l.change}</label>
                    <div class="suggestion-chips">
                        ${suggestions.slice(0, 4).map((s, i) => `
                            <button class="chip suggestion-chip" onclick="Relapse.selectSuggestion(${i})">
                                ${s}
                            </button>
                        `).join('')}
                    </div>
                    <input type="text" id="changeInput" class="input" 
                           placeholder="${l.placeholder}" value="${data.change}">
                </div>
                
                <div class="relapse-actions">
                    <button class="btn btn-primary btn-large" onclick="Relapse.finish()">
                        ✓ ${l.finish}
                    </button>
                    
                    <button class="btn btn-secondary" onclick="Relapse.createRuleFromRelapse()">
                        📋 ${l.createRule}
                    </button>
                </div>
            </div>
        `;
    }
}
