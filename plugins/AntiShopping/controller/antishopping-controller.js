/**
 * AntiShopping Controller - Orchestration pour l'addiction aux achats compulsifs
 */

import { AntiShoppingModel } from '../model/antishopping-model.js';
import { AntiShoppingView } from '../view/antishopping-view.js';
import { SLOPE_STEPS } from '../data/antishopping-data.js';

export class AntiShoppingController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.currentState = null;
        this.currentSelectedAddiction = null;
    }

    init() {
        if (!document.getElementById('antishoppingModal')) {
            const modal = document.createElement('div');
            modal.id = 'antishoppingModal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }
        if (!document.getElementById('antishoppingConfigModal')) {
            const modal = document.createElement('div');
            modal.id = 'antishoppingConfigModal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }
        this.view.slopeModalEl = document.getElementById('antishoppingModal');
        this.view.configModalEl = document.getElementById('antishoppingConfigModal');
    }

    openSlopeModal(state, selectedAddictionId = null) {
        this.currentState = state;
        this.init();
        
        // Déterminer l'addiction sélectionnée
        if (!selectedAddictionId) {
            selectedAddictionId = state.currentAddiction || state.addictions?.[0]?.id || state.addictions?.[0] || 'shopping';
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
        if (normalizedAddictionId !== 'shopping') {
            const pluginNames = {
                'porn': 'AntiPorn',
                'cigarette': 'AntiSmoke',
                'alcohol': 'AntiAlcohol',
                'drugs': 'AntiDrugs',
                'social_media': 'AntiSocialMedia',
                'gaming': 'AntiGaming',
                'food': 'AntiFood'
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
    logWithSignal(signal) { if (this.currentState) this.model.logSlope(this.currentState, signal); }
    completeStep(stepKey) { this.view.completeStep(stepKey, Object.keys(SLOPE_STEPS).length, () => {}); }

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
                    const messages = { fr: `Bravo ! ${count} achats évités. 💰`, en: `Well done! ${count} purchases avoided. 💰`, ar: `أحسنت! ${count} مشتريات تم تجنبها. 💰` };
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
            this.currentState.addictionConfigs.shopping.activeRules = activeRules;
            Storage.saveState(this.currentState);
            this.closeConfigModal();
            if (typeof showToast === 'function') showToast('Configuration sauvegardée');
        }
    }

    getStats(state) { return this.model.getStats(state); }
    getRecentSlopes(state, days = 7) { return this.model.getRecentSlopes(state, days); }
}
