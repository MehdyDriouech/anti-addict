/**
 * AddictionBase Controller - Orchestration partagée pour toutes les addictions
 */

import { getServices } from '../../../core/Utils/serviceHelper.js';

export class AddictionBaseController {
    constructor(model, view, slopeSignals, tips, slopeSteps) {
        this.model = model;
        this.view = view;
        this.slopeSignals = slopeSignals;
        this.tips = tips;
        this.slopeSteps = slopeSteps;
        this.currentState = null;
        this.servicesInitialized = false;
    }

    /**
     * Initialise les services (peut être appelé de manière asynchrone)
     * Si le modèle n'a pas encore de services injectés, les injecte
     */
    async initServices() {
        if (this.servicesInitialized) {
            return;
        }

        try {
            const { storage, date } = await getServices(['storage', 'date']);
            
            // Si le modèle n'a pas encore de services, les injecter
            if (this.model && (!this.model.storage || !this.model.dateService)) {
                // Créer un nouveau modèle avec les services injectés
                const ModelClass = this.model.constructor;
                const addictionId = this.model.addictionId;
                this.model = new ModelClass(addictionId, { storage, dateService: date });
            }
            
            this.servicesInitialized = true;
        } catch (error) {
            console.warn('[AddictionBaseController] Erreur lors de l\'initialisation des services:', error);
            // Continuer sans services injectés (fallback vers window.*)
        }
    }

    /**
     * Initialise les modales
     */
    initModals(slopeModalId, configModalId = null) {
        this.view.initModals(slopeModalId, configModalId);
    }

    /**
     * Ouvre la modale de pente glissante
     */
    openSlopeModal(state) {
        // Initialiser window.runtime si nécessaire
        if (!window.runtime) window.runtime = {};
        window.runtime.emergencyActive = true;
        window.runtime.emergencySource = 'slope';
        window.runtime.lastEmergencyEndedAt = null;
        
        this.currentState = state;
        const lang = state.profile?.lang || 'fr';
        const stoppedCount = this.model.getStoppedSlopesCount(state);
        const pluginName = this.view.getPluginName();
        
        this.view.renderSlopeModal(
            lang,
            stoppedCount,
            this.slopeSignals,
            this.slopeSteps,
            this.tips,
            `${pluginName}.closeSlopeModal`,
            `${pluginName}.confirmSlope`,
            `${pluginName}.completeStep`
        );
    }

    /**
     * Ferme la modale de pente
     */
    closeSlopeModal() {
        // Unsetter flags runtime
        if (window.runtime && window.runtime.emergencySource === 'slope') {
            window.runtime.emergencyActive = false;
            window.runtime.emergencySource = null;
            window.runtime.lastEmergencyEndedAt = Date.now();
        }
        
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
     * Complète une étape de la pente
     */
    completeStep(stepKey) {
        const totalSteps = Object.keys(this.slopeSteps).length;
        this.view.completeStep(stepKey, totalSteps, () => {
            // Callback quand toutes les étapes sont complétées
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
                // Unsetter flags runtime
                if (window.runtime && window.runtime.emergencySource === 'slope') {
                    window.runtime.emergencyActive = false;
                    window.runtime.emergencySource = null;
                    window.runtime.lastEmergencyEndedAt = Date.now();
                }
                
                this.closeSlopeModal();
                
                // Afficher un toast de confirmation
                if (typeof UI !== 'undefined' && UI.showToast) {
                    const messages = {
                        fr: `Bravo ! ${count} pentes stoppées au total.`,
                        en: `Well done! ${count} slopes stopped in total.`,
                        ar: `أحسنت! ${count} منحدرات متوقفة في المجموع.`
                    };
                    UI.showToast(messages[lang] || messages.fr, 'success');
                } else if (typeof showToast === 'function') {
                    const messages = {
                        fr: `Bravo ! ${count} pentes stoppées au total.`,
                        en: `Well done! ${count} slopes stopped in total.`,
                        ar: `أحسنت! ${count} منحدرات متوقفة في المجموع.`
                    };
                    showToast(messages[lang] || messages.fr);
                }
            }, 500);
        }
    }

    /**
     * Enregistre une pente
     */
    logSlope(state, signal = null) {
        this.model.logSlope(state, signal);
    }

    /**
     * Récupère les pentes récentes
     */
    getRecentSlopes(state, days = 7) {
        return this.model.getRecentSlopes(state, days);
    }

    /**
     * Récupère les statistiques
     */
    getStats(state, days = 30) {
        return this.model.getStats(state, days);
    }

    /**
     * Récupère des conseils aléatoires
     */
    getRandomTips(lang = 'fr', count = 3) {
        return this.model.getRandomTips(this.tips, lang, count);
    }

    /**
     * Toggle un trigger
     */
    toggleTrigger(trigger) {
        if (this.currentState) {
            return this.model.toggleTrigger(this.currentState, trigger);
        }
        return [];
    }
}
