/**
 * AntiSmoke View - Rendu HTML pour l'addiction à la cigarette
 */

import { AddictionBaseView } from '../../AddictionBase/view/addiction-base-view.js';
import { SLOPE_SIGNALS, SLOPE_STEPS, TRIGGERS, ENVIRONMENT_RULES, UI_LABELS } from '../data/antismoke-data.js';

export class AntiSmokeView extends AddictionBaseView {
    constructor() {
        super('cigarette');
    }

    /**
     * Affiche la modale de pente (envie de fumer)
     */
    renderSlopeContent(lang, stoppedCount, tips, state = null, selectedAddictionId = 'cigarette') {
        if (!this.slopeModalEl) return;
        
        const l = UI_LABELS[lang] || UI_LABELS.fr;
        this.currentStepIdx = 0;
        this.completedSteps = [];
        
        // Générer le sélecteur d'addiction si plusieurs addictions sont actives
        const selectorHtml = state && state.addictions && state.addictions.length > 1 
            ? this.renderAddictionSelector(state, selectedAddictionId, 'AntiSmoke.onAddictionChange')
            : '';
        
        const stepsHtml = Object.entries(SLOPE_STEPS).map(([key, step], idx) => {
            const stepStatus = idx === 0 ? 'current' : 'locked';
            return `
                <div class="slope-step ${stepStatus}" data-step="${key}" data-idx="${idx}">
                    <div class="step-header">
                        <span class="step-number">${idx + 1}</span>
                        <span class="step-title">${step[lang] || step.fr}</span>
                        <span class="step-check">✓</span>
                    </div>
                    <p class="step-desc">${step.desc[lang] || step.desc.fr}</p>
                    <button class="btn btn-primary btn-block step-btn" onclick="AntiSmoke.completeStep('${key}')">
                        Fait
                    </button>
                </div>
            `;
        }).join('');

        const signalsHtml = Object.entries(SLOPE_SIGNALS).map(([key, signal]) => `
            <button class="chip small" onclick="AntiSmoke.logWithSignal('${key}')">
                ${signal[lang] || signal.fr}
            </button>
        `).join('');

        const tipsHtml = tips.map(tip => `<div class="tip-item">💡 ${tip}</div>`).join('');

        this.slopeModalEl.innerHTML = `
            <div class="modal-content slope-modal slope-advanced">
                <button class="modal-close" onclick="AntiSmoke.closeSlopeModal()">×</button>
                ${selectorHtml}
                <div class="slope-header">
                    <h2>🚭 ${l.title}</h2>
                    <p>${l.subtitle}</p>
                    <div class="stopped-counter">
                        <span class="counter-value">${stoppedCount}</span>
                        <span class="counter-label">${l.stoppedCount}</span>
                    </div>
                </div>
                
                <div class="slope-signals compact">
                    <h4>${l.signalsTitle}</h4>
                    <div class="signal-chips">${signalsHtml}</div>
                </div>
                
                <div class="slope-steps-container">
                    <h4>${l.stepsTitle}</h4>
                    ${stepsHtml}
                </div>
                
                <div class="slope-tips">
                    <h4>💡 Conseils</h4>
                    ${tipsHtml}
                </div>
                
                <div class="slope-completed" style="display: none;">
                    <div class="completed-icon">🎉</div>
                    <h3>Bravo !</h3>
                    <p>Tu as résisté à cette envie. Continue comme ça !</p>
                    <button class="btn btn-primary btn-large" onclick="AntiSmoke.confirmSlope()">
                        ${l.confirmButton}
                    </button>
                </div>
            </div>
        `;
        
        this.slopeModalEl.classList.add('active');
        this.setupOverlayClose(this.slopeModalEl, () => window.AntiSmoke.closeSlopeModal());
    }

    /**
     * Récupère les données de pente pour l'addiction cigarette
     * @param {string} lang - Langue
     * @returns {Object} Données de pente
     */
    getSlopeData(lang) {
        return {
            signals: Object.entries(SLOPE_SIGNALS).map(([key, signal]) => [key, signal[lang] || signal.fr]),
            steps: SLOPE_STEPS,
            tips: CONTEXTUAL_TIPS[lang] || CONTEXTUAL_TIPS.fr
        };
    }

    /**
     * Affiche la modale de configuration
     */
    renderConfigModal(lang, customTriggers, activeRules) {
        if (!this.configModalEl) return;
        
        const l = UI_LABELS[lang] || UI_LABELS.fr;
        
        const triggersHtml = Object.entries(TRIGGERS).map(([key, labels]) => `
            <button class="chip ${customTriggers.includes(key) ? 'active' : ''}" 
                    onclick="AntiSmoke.toggleTrigger('${key}')">
                ${labels[lang] || labels.fr}
            </button>
        `).join('');
        
        const rulesHtml = Object.entries(ENVIRONMENT_RULES).map(([key, labels]) => `
            <label class="checklist-item ${activeRules.includes(key) ? 'selected' : ''}">
                <input type="checkbox" data-rule="${key}" ${activeRules.includes(key) ? 'checked' : ''}>
                <span class="item-text">${labels[lang] || labels.fr}</span>
            </label>
        `).join('');
        
        this.configModalEl.innerHTML = `
            <div class="modal-content config-modal">
                <button class="modal-close" onclick="AntiSmoke.closeConfigModal()">×</button>
                <h2>🚭 ${l.configTitle}</h2>
                
                <div class="config-section">
                    <h4>${l.signalsTitle}</h4>
                    <div class="trigger-chips">${triggersHtml}</div>
                </div>
                
                <div class="config-section">
                    <h4>Règles d'environnement</h4>
                    <div class="checklist">${rulesHtml}</div>
                </div>
                
                <button class="btn btn-primary btn-block" onclick="AntiSmoke.saveConfig()">
                    ✓ Enregistrer
                </button>
            </div>
        `;
        
        this.configModalEl.classList.add('active');
        this.setupOverlayClose(this.configModalEl, () => window.AntiSmoke.closeConfigModal());
    }
}
