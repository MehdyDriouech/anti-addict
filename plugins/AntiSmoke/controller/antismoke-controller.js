/**
 * AntiSmoke Controller - Orchestration pour l'addiction à la cigarette
 */

import { AntiSmokeModel } from '../model/antismoke-model.js';
import { AntiSmokeView } from '../view/antismoke-view.js';
import { SLOPE_SIGNALS, SLOPE_STEPS, CONTEXTUAL_TIPS } from '../data/antismoke-data.js';

export class AntiSmokeController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.currentState = null;
        this.currentSelectedAddiction = null;
    }

    /**
     * Initialise les modales
     */
    init() {
        // Créer les éléments de modale s'ils n'existent pas
        if (!document.getElementById('antismokeModal')) {
            const modal = document.createElement('div');
            modal.id = 'antismokeModal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }
        if (!document.getElementById('antismokeConfigModal')) {
            const modal = document.createElement('div');
            modal.id = 'antismokeConfigModal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }
        
        this.view.slopeModalEl = document.getElementById('antismokeModal');
        this.view.configModalEl = document.getElementById('antismokeConfigModal');
    }

    /**
     * Ouvre la modale de pente (envie de fumer)
     */
    openSlopeModal(state, selectedAddictionId = null) {
        this.currentState = state;
        this.init();
        
        // Déterminer l'addiction sélectionnée
        if (!selectedAddictionId) {
            selectedAddictionId = state.currentAddiction || state.addictions?.[0]?.id || state.addictions?.[0] || 'cigarette';
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
        if (normalizedAddictionId !== 'cigarette') {
            const pluginNames = {
                'porn': 'AntiPorn',
                'alcohol': 'AntiAlcohol',
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
        
        // Sinon, réinitialiser les étapes et re-rendre avec la nouvelle addiction
        // Les étapes seront réinitialisées dans renderSlopeContent via currentStepIdx et completedSteps
        const lang = this.currentState.profile?.lang || 'fr';
        const stoppedCount = this.model.getStoppedSlopesCount(this.currentState, normalizedAddictionId);
        const tips = this.model.getRandomTips(lang, 3);
        this.view.renderSlopeContent(lang, stoppedCount, tips, this.currentState, normalizedAddictionId);
    }

    /**
     * Ferme la modale de pente
     */
    closeSlopeModal() {
        this.view.closeSlopeModal();
    }

    /**
     * Enregistre un signal spécifique
     */
    logWithSignal(signal) {
        if (this.currentState) {
            this.model.logSlope(this.currentState, signal);
        }
    }

    /**
     * Complète une étape
     */
    completeStep(stepKey) {
        const totalSteps = Object.keys(SLOPE_STEPS).length;
        this.view.completeStep(stepKey, totalSteps, () => {
            // Toutes les étapes complétées
        });
    }

    /**
     * Confirme l'arrêt de la pente
     */
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
                    const messages = {
                        fr: `Bravo ! ${count} envies résistées au total. 🚭`,
                        en: `Well done! ${count} cravings resisted in total. 🚭`,
                        ar: `أحسنت! ${count} رغبات تم مقاومتها. 🚭`
                    };
                    showToast(messages[lang] || messages.fr);
                }
            }, 500);
        }
    }

    /**
     * Ouvre la modale de configuration
     */
    openConfigModal(state) {
        this.currentState = state;
        this.init();
        
        const lang = state.profile?.lang || 'fr';
        const config = this.model.getAddictionConfig(state) || {};
        const customTriggers = config.customTriggers || [];
        const activeRules = config.activeRules || [];
        
        this.view.renderConfigModal(lang, customTriggers, activeRules);
    }

    /**
     * Ferme la modale de configuration
     */
    closeConfigModal() {
        if (this.view.configModalEl) {
            this.view.configModalEl.classList.remove('active');
        }
    }

    /**
     * Toggle un trigger
     */
    toggleTrigger(trigger) {
        if (this.currentState) {
            const triggers = this.model.toggleTrigger(this.currentState, trigger);
            // Re-render les chips
            const lang = this.currentState.profile?.lang || 'fr';
            const config = this.model.getAddictionConfig(this.currentState) || {};
            this.view.renderConfigModal(lang, triggers, config.activeRules || []);
        }
    }

    /**
     * Sauvegarde la configuration
     */
    saveConfig() {
        if (this.currentState && this.view.configModalEl) {
            const checkboxes = this.view.configModalEl.querySelectorAll('input[data-rule]');
            const activeRules = [];
            checkboxes.forEach(cb => {
                if (cb.checked) activeRules.push(cb.dataset.rule);
            });
            
            this.model.ensureAddictionConfig(this.currentState);
            this.currentState.addictionConfigs.cigarette.activeRules = activeRules;
            Storage.saveState(this.currentState);
            
            this.closeConfigModal();
            if (typeof showToast === 'function') {
                showToast('Configuration sauvegardée');
            }
        }
    }

    /**
     * Récupère les statistiques
     */
    getStats(state) {
        return this.model.getStats(state);
    }

    /**
     * Récupère les pentes récentes
     */
    getRecentSlopes(state, days = 7) {
        return this.model.getRecentSlopes(state, days);
    }
}
