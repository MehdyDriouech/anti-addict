/**
 * AddictionBase View - Templates de rendu partagés pour toutes les addictions
 */

import { COMMON_SLOPE_STEPS, UI_LABELS } from '../data/addiction-base-data.js';

export class AddictionBaseView {
    constructor(addictionId) {
        this.addictionId = addictionId;
        this.slopeModalEl = null;
        this.configModalEl = null;
        this.currentStepIdx = 0;
        this.completedSteps = [];
    }

    /**
     * Initialise les éléments DOM pour les modales
     */
    initModals(slopeModalId, configModalId = null) {
        this.slopeModalEl = document.getElementById(slopeModalId);
        if (configModalId) {
            this.configModalEl = document.getElementById(configModalId);
        }
    }

    /**
     * Affiche la modale de pente glissante
     */
    renderSlopeModal(lang, stoppedCount, signals, slopeSteps, tips, onClose, onConfirm, onCompleteStep) {
        if (!this.slopeModalEl) return;
        
        const l = UI_LABELS[lang] || UI_LABELS.fr;
        this.currentStepIdx = 0;
        this.completedSteps = [];
        
        const stepsHtml = Object.entries(slopeSteps).map(([key, step], idx) => {
            const stepStatus = idx === 0 ? 'current' : 'locked';
            return `
                <div class="slope-step ${stepStatus}" data-step="${key}" data-idx="${idx}">
                    <div class="step-header">
                        <span class="step-number">${idx + 1}</span>
                        <span class="step-title">${step[lang] || step.fr}</span>
                        <span class="step-check">✓</span>
                    </div>
                    <p class="step-desc">${step.desc[lang] || step.desc.fr}</p>
                    <button class="btn btn-primary btn-block step-btn" onclick="${onCompleteStep}('${key}')">
                        ${l.completeStep}
                    </button>
                </div>
            `;
        }).join('');

        const signalsHtml = Object.entries(signals).map(([key, signal]) => `
            <button class="chip small" onclick="${onClose}(); window.${this.getPluginName()}.logWithSignal('${key}')">
                ${signal[lang] || signal.fr}
            </button>
        `).join('');

        const tipsHtml = (tips[lang] || tips.fr || []).slice(0, 3).map(tip => `
            <div class="tip-item">💡 ${tip}</div>
        `).join('');

        this.slopeModalEl.innerHTML = `
            <div class="modal-content slope-modal slope-advanced">
                <button class="modal-close" onclick="${onClose}()">×</button>
                <div class="slope-header">
                    <h2>${l.title}</h2>
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
                    <h3>${l.completed}</h3>
                    <p>${l.completedMessage}</p>
                    <button class="btn btn-primary btn-large" onclick="${onConfirm}()">
                        ${l.confirmButton}
                    </button>
                </div>
            </div>
        `;
        
        this.slopeModalEl.classList.add('active');
        this.setupOverlayClose(this.slopeModalEl, onClose);
    }

    /**
     * Marque une étape comme complétée
     */
    completeStep(stepKey, totalSteps, onAllCompleted) {
        const stepEl = this.slopeModalEl.querySelector(`[data-step="${stepKey}"]`);
        if (!stepEl) return;
        
        const idx = parseInt(stepEl.dataset.idx);
        stepEl.classList.remove('current');
        stepEl.classList.add('completed');
        this.completedSteps.push(stepKey);
        
        // Débloquer l'étape suivante
        const nextIdx = idx + 1;
        if (nextIdx < totalSteps) {
            const nextStep = this.slopeModalEl.querySelector(`[data-idx="${nextIdx}"]`);
            if (nextStep) {
                nextStep.classList.remove('locked');
                nextStep.classList.add('current');
            }
        }
        
        // Toutes les étapes complétées ?
        if (this.completedSteps.length >= totalSteps) {
            const stepsContainer = this.slopeModalEl.querySelector('.slope-steps-container');
            const completedSection = this.slopeModalEl.querySelector('.slope-completed');
            if (stepsContainer) stepsContainer.style.display = 'none';
            if (completedSection) completedSection.style.display = 'block';
            if (onAllCompleted) onAllCompleted();
        }
    }

    /**
     * Met à jour le compteur de pentes stoppées dans la modale
     * @param {number} count - Nouveau compteur
     * @param {string} lang - Langue
     */
    updateStoppedCount(count, lang) {
        if (!this.slopeModalEl) return;
        const counterValue = this.slopeModalEl.querySelector('.counter-value');
        if (counterValue) {
            counterValue.textContent = count;
        }
    }

    /**
     * Ferme la modale de pente
     */
    closeSlopeModal() {
        if (this.slopeModalEl) {
            this.slopeModalEl.classList.remove('active');
        }
    }

    /**
     * Configure la fermeture au clic sur l'overlay
     */
    setupOverlayClose(modalEl, onClose) {
        const handler = (e) => {
            if (e.target === modalEl) {
                if (typeof onClose === 'function') {
                    onClose();
                } else if (typeof onClose === 'string') {
                    eval(onClose + '()');
                }
                modalEl.removeEventListener('click', handler);
            }
        };
        modalEl.addEventListener('click', handler);
    }

    /**
     * Récupère le nom du plugin pour les callbacks
     */
    getPluginName() {
        const names = {
            'porn': 'AntiPorn',
            'cigarette': 'AntiSmoke',
            'alcohol': 'AntiAlcohol',
            'drugs': 'AntiDrugs',
            'social_media': 'AntiSocialMedia',
            'gaming': 'AntiGaming',
            'food': 'AntiFood',
            'shopping': 'AntiShopping'
        };
        return names[this.addictionId] || 'AntiAddiction';
    }

    /**
     * Render le bouton de configuration
     */
    renderConfigButton(lang, onClick) {
        const labels = {
            fr: '⚙️ Configurer',
            en: '⚙️ Configure',
            ar: '⚙️ إعدادات'
        };
        return `<button class="btn btn-secondary" onclick="${onClick}">${labels[lang] || labels.fr}</button>`;
    }
}
