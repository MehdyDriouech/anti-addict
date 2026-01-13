/**
 * Onboarding Controller - Orchestration Model/View
 */

import { OnboardingModel } from '../model/onboarding-model.js';
import { OnboardingView } from '../view/onboarding-view.js';

export class OnboardingController {
    constructor() {
        this.model = new OnboardingModel();
        this.view = new OnboardingView();
    }

    /**
     * Affiche l'onboarding
     * @param {Object} state - State de l'application
     */
    show(state) {
        this.view.show();
        this.view.renderContent(
            state,
            async (e) => {
                state.profile.lang = e.target.value;
                state.profile.rtl = e.target.value === 'ar';
                await I18n.initI18n(state.profile.lang, state.profile.religion);
                if (typeof Init !== 'undefined' && Init.applyTranslations) {
                    Init.applyTranslations();
                }
                this.view.renderContent(state, this.onLangChange.bind(this), this.onReligionChange.bind(this));
            },
            async (e) => {
                state.profile.religion = e.target.value;
                state.profile.spiritualEnabled = e.target.value !== 'none';
                await I18n.loadSpiritualCards(state.profile.lang, state.profile.religion);
            }
        );
    }

    /**
     * Callback pour changement de langue
     * @param {Event} e - Événement
     */
    async onLangChange(e) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        state.profile.lang = e.target.value;
        state.profile.rtl = e.target.value === 'ar';
        await I18n.initI18n(state.profile.lang, state.profile.religion);
        if (typeof Init !== 'undefined' && Init.applyTranslations) {
            Init.applyTranslations();
        }
        this.view.renderContent(state, this.onLangChange.bind(this), this.onReligionChange.bind(this));
    }

    /**
     * Callback pour changement de religion
     * @param {Event} e - Événement
     */
    async onReligionChange(e) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        state.profile.religion = e.target.value;
        state.profile.spiritualEnabled = e.target.value !== 'none';
        await I18n.loadSpiritualCards(state.profile.lang, state.profile.religion);
    }

    /**
     * Cache l'onboarding
     */
    hide() {
        this.view.hide();
    }

    /**
     * Complète l'onboarding
     * @param {Object} state - State de l'application
     */
    async complete(state) {
        try {
            const langSelect = document.getElementById('onboard-lang');
            const religionSelect = document.getElementById('onboard-religion');
            
            if (!langSelect || !religionSelect) {
                throw new Error('Les éléments de formulaire ne sont pas trouvés');
            }
            
            // Récupérer les addictions sélectionnées
            const selectedAddictions = Array.from(document.querySelectorAll('#onboarding-content input[type="checkbox"]:checked'))
                .map(cb => cb.value);
            
            if (selectedAddictions.length === 0) {
                if (typeof UI !== 'undefined') {
                    UI.showToast('Veuillez sélectionner au moins une addiction', 'warning');
                }
                return;
            }
            
            // Vérifier les disclaimers
            const addictionsWithDisclaimer = this.model.getAddictionsWithDisclaimer(selectedAddictions);
            if (addictionsWithDisclaimer.length > 0) {
                const proceed = await this.view.showDisclaimerModal(addictionsWithDisclaimer, state.profile.lang);
                if (!proceed) {
                    return;
                }
            }
            
            // Compléter l'onboarding
            const success = await this.model.completeOnboarding(
                state,
                selectedAddictions,
                langSelect.value,
                religionSelect.value
            );
            
            if (!success) {
                throw new Error('Erreur lors de la sauvegarde');
            }
            
            // Masquer l'onboarding
            this.hide();
            
            // Appliquer les traductions
            if (typeof Init !== 'undefined' && Init.applyTranslations) {
                Init.applyTranslations();
            }
            
            // Afficher l'accueil
            Router.navigateTo('home');
            if (typeof Home !== 'undefined' && Home.render) {
                Home.render(state);
            }
            
            if (typeof UI !== 'undefined') {
                UI.showToast(I18n.t('welcome_back'), 'success');
            }
        } catch (error) {
            console.error('[Onboarding] Erreur lors de la complétion:', error);
            if (typeof UI !== 'undefined') {
                UI.showToast('Une erreur est survenue. Veuillez réessayer.', 'error');
            }
        }
    }

    /**
     * Affiche le modal de disclaimer (méthode publique)
     * @param {Array} addictionsWithDisclaimer - Liste des addictions avec disclaimer
     * @returns {Promise<boolean>}
     */
    async showDisclaimerModal(addictionsWithDisclaimer) {
        const state = typeof window !== 'undefined' ? window.state : null;
        const lang = state ? state.profile.lang : 'fr';
        return await this.view.showDisclaimerModal(addictionsWithDisclaimer, lang);
    }
}
