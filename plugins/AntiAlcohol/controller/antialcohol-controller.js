/**
 * AntiAlcohol Controller - Orchestration pour l'addiction à l'alcool
 */

import { AntiAlcoholModel } from '../model/antialcohol-model.js';
import { AntiAlcoholView } from '../view/antialcohol-view.js';
import { SLOPE_STEPS } from '../data/antialcohol-data.js';
import { getServices } from '../../../core/Utils/serviceHelper.js';

export class AntiAlcoholController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.currentState = null;
        this.currentSelectedAddiction = null;
        this.servicesInitialized = false;
    }

    /**
     * Initialise les services (peut être appelé de manière asynchrone)
     */
    async initServices() {
        if (this.servicesInitialized) {
            return;
        }

        try {
            const { storage, date } = await getServices(['storage', 'date']);
            
            if (this.model && (!this.model.storage || !this.model.dateService)) {
                this.model = new AntiAlcoholModel({ storage, dateService: date });
            }
            
            this.servicesInitialized = true;
        } catch (error) {
            console.warn('[AntiAlcoholController] Erreur lors de l\'initialisation des services:', error);
        }
    }

    init() {
        if (!document.getElementById('antialcoholModal')) {
            const modal = document.createElement('div');
            modal.id = 'antialcoholModal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }
        if (!document.getElementById('antialcoholConfigModal')) {
            const modal = document.createElement('div');
            modal.id = 'antialcoholConfigModal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }
        this.view.slopeModalEl = document.getElementById('antialcoholModal');
        this.view.configModalEl = document.getElementById('antialcoholConfigModal');
    }

    openSlopeModal(state, selectedAddictionId = null) {
        this.currentState = state;
        this.init();
        
        // Déterminer l'addiction sélectionnée
        if (!selectedAddictionId) {
            selectedAddictionId = state.currentAddiction || state.addictions?.[0]?.id || state.addictions?.[0] || 'alcohol';
        }
        this.currentSelectedAddiction = selectedAddictionId;
        
        const lang = state.profile?.lang || 'fr';
        const stoppedCount = this.model.getStoppedSlopesCount(state, selectedAddictionId);
        const tips = this.model.getRandomTips(lang, 3);
        this.view.renderSlopeContent(lang, stoppedCount, tips, state, selectedAddictionId);
    }

    /**
     * Gère le changement d'addiction dans le sélecteur
     * @param {string} addictionId - ID de la nouvelle addiction sélectionnée
     */
    onAddictionChange(addictionId) {
        if (!this.currentState) {
            this.currentState = typeof window !== 'undefined' ? window.state : null;
        }
        if (!this.currentState) return;
        
        // Normaliser addictionId
        const normalizedAddictionId = typeof addictionId === 'string' 
            ? addictionId 
            : (typeof addictionId === 'object' && addictionId.id ? addictionId.id : String(addictionId));
        
        // Si on change vers la même addiction, ne rien faire
        if (normalizedAddictionId === this.currentSelectedAddiction) {
            return;
        }
        
        this.currentSelectedAddiction = normalizedAddictionId;
        this.currentState.currentAddiction = normalizedAddictionId;
        
        // Si l'addiction change vers une autre, ouvrir la modale du plugin correspondant
        if (normalizedAddictionId !== 'alcohol') {
            const pluginNames = {
                'porn': 'AntiPorn',
                'cigarette': 'AntiSmoke',
                'drugs': 'AntiDrugs',
                'social_media': 'AntiSocialMedia',
                'gaming': 'AntiGaming',
                'food': 'AntiFood',
                'shopping': 'AntiShopping'
            };
            const pluginName = pluginNames[normalizedAddictionId];
            if (pluginName && typeof window[pluginName] !== 'undefined' && window[pluginName].openSlopeModal) {
                this.closeSlopeModal();
                window[pluginName].openSlopeModal(this.currentState, normalizedAddictionId);
                return;
            }
        }
        
        // Sinon, re-rendre avec la nouvelle addiction
        const lang = this.currentState.profile?.lang || 'fr';
        const stoppedCount = this.model.getStoppedSlopesCount(this.currentState, normalizedAddictionId);
        const tips = this.model.getRandomTips(lang, 3);
        this.view.renderSlopeContent(lang, stoppedCount, tips, this.currentState, normalizedAddictionId);
    }

    closeSlopeModal() { this.view.closeSlopeModal(); }

    logWithSignal(signal) {
        if (this.currentState) this.model.logSlope(this.currentState, signal);
    }

    completeStep(stepKey) {
        const totalSteps = Object.keys(SLOPE_STEPS).length;
        this.view.completeStep(stepKey, totalSteps, () => {});
    }

    confirmSlope() {
        if (this.currentState) {
            const count = this.model.incrementStoppedSlopes(this.currentState);
            const lang = this.currentState.profile?.lang || 'fr';
            
            // Mettre à jour l'affichage du compteur avant de fermer
            this.view.updateStoppedCount(count, lang);
            
            // Attendre un peu pour que l'utilisateur voie la mise à jour
            setTimeout(() => {
                this.closeSlopeModal();
                if (typeof showToast === 'function') {
                    const messages = { fr: `Bravo ! ${count} envies résistées. 🍷❌`, en: `Well done! ${count} cravings resisted. 🍷❌`, ar: `أحسنت! ${count} رغبات تم مقاومتها. 🍷❌` };
                    showToast(messages[lang] || messages.fr);
                }
            }, 500);
        }
    }

    openConfigModal(state) {
        this.currentState = state;
        this.init();
        const lang = state.profile?.lang || 'fr';
        const config = this.model.getAddictionConfig(state) || {};
        this.view.renderConfigModal(lang, config.customTriggers || [], config.activeRules || []);
    }

    closeConfigModal() { if (this.view.configModalEl) this.view.configModalEl.classList.remove('active'); }

    toggleTrigger(trigger) {
        if (this.currentState) {
            const triggers = this.model.toggleTrigger(this.currentState, trigger);
            const lang = this.currentState.profile?.lang || 'fr';
            const config = this.model.getAddictionConfig(this.currentState) || {};
            this.view.renderConfigModal(lang, triggers, config.activeRules || []);
        }
    }

    saveConfig() {
        if (this.currentState && this.view.configModalEl) {
            const checkboxes = this.view.configModalEl.querySelectorAll('input[data-rule]');
            const activeRules = [];
            checkboxes.forEach(cb => { if (cb.checked) activeRules.push(cb.dataset.rule); });
            this.model.ensureAddictionConfig(this.currentState);
            this.currentState.addictionConfigs.alcohol.activeRules = activeRules;
            this.model.storage?.saveState(this.currentState);
            this.closeConfigModal();
            if (typeof showToast === 'function') showToast('Configuration sauvegardée');
        }
    }

    getStats(state) { return this.model.getStats(state); }
    getRecentSlopes(state, days = 7) { return this.model.getRecentSlopes(state, days); }
}
