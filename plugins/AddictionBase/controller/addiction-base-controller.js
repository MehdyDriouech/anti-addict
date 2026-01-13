/**
 * AddictionBase Controller - Orchestration partagée pour toutes les addictions
 */

export class AddictionBaseController {
    constructor(model, view, slopeSignals, tips, slopeSteps) {
        this.model = model;
        this.view = view;
        this.slopeSignals = slopeSignals;
        this.tips = tips;
        this.slopeSteps = slopeSteps;
        this.currentState = null;
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
