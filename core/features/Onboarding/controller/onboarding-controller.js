/**
 * Onboarding Controller - Orchestration Model/View
 */

import { OnboardingModel } from '../model/onboarding-model.js';
import { OnboardingView } from '../view/onboarding-view.js';
import { getServices } from '../../../Utils/serviceHelper.js';

export class OnboardingController {
    constructor() {
        this.model = new OnboardingModel();
        this.view = new OnboardingView();
        this.currentStep = 'main'; // 'main' ou 'pin'
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
            const { storage, i18n } = await getServices(['storage', 'i18n']);
            
            if (this.model && (!this.model.storage || !this.model.i18n)) {
                this.model = new OnboardingModel({ storage, i18n });
            }
            
            this.servicesInitialized = true;
        } catch (error) {
            console.warn('[OnboardingController] Erreur lors de l\'initialisation des services:', error);
        }
    }

    /**
     * Affiche l'onboarding
     * @param {Object} state - State de l'application
     */
    show(state) {
        this.currentStep = 'main';
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
                this.view.renderContent(state, this.onLangChange.bind(this), this.onReligionChange.bind(this), this.currentStep);
            },
            async (e) => {
                state.profile.religion = e.target.value;
                state.profile.spiritualEnabled = e.target.value !== 'none';
                await I18n.loadSpiritualCards(state.profile.lang, state.profile.religion);
            },
            this.currentStep
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
        this.view.renderContent(state, this.onLangChange.bind(this), this.onReligionChange.bind(this), this.currentStep);
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
     * Passe à l'étape suivante (PIN)
     */
    async nextStep() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;

        // Valider les addictions sélectionnées
        const selectedAddictions = Array.from(document.querySelectorAll('#onboarding-content input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        
        if (selectedAddictions.length === 0) {
            if (typeof UI !== 'undefined') {
                const lang = state.profile.lang || 'fr';
                const msg = lang === 'fr' ? 'Veuillez sélectionner au moins une addiction' :
                           lang === 'en' ? 'Please select at least one addiction' :
                           'يرجى اختيار إدمان واحد على الأقل';
                UI.showToast(msg, 'warning');
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

        // Sauvegarder les données principales
        const langSelect = document.getElementById('onboard-lang');
        const religionSelect = document.getElementById('onboard-religion');
        
        if (langSelect && religionSelect) {
            state.profile.lang = langSelect.value;
            state.profile.religion = religionSelect.value;
            state.profile.spiritualEnabled = religionSelect.value !== 'none';
            state.profile.rtl = langSelect.value === 'ar';
        }

        // Configurer les addictions
        const config = typeof AddictionsConfig !== 'undefined' && AddictionsConfig.getAddictionConfig ? AddictionsConfig.getAddictionConfig : null;
        state.addictions = selectedAddictions.map(id => {
            const addictionConfig = config ? config(id) : null;
            const goal = addictionConfig && addictionConfig.defaultGoal ? addictionConfig.defaultGoal : 'abstinence';
            return { id, goal };
        });

        this.model.storage?.saveState(state);
        await I18n.initI18n(state.profile.lang, state.profile.religion);

        // Passer à l'étape PIN
        this.currentStep = 'pin';
        this.view.renderContent(state, null, null, this.currentStep);
    }

    /**
     * Complète l'onboarding avec PIN
     */
    async completeWithPin() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;

        const pinInput = document.getElementById('onboard-pin-input');
        const pinConfirmInput = document.getElementById('onboard-pin-confirm-input');
        const errorEl = document.getElementById('onboard-pin-error');

        if (!pinInput || !pinConfirmInput) return;

        const pin = pinInput.value.trim();
        const pinConfirm = pinConfirmInput.value.trim();
        const lang = state.profile.lang || 'fr';

        // Validation
        if (!pin || pin.length < 4) {
            const errorMsg = lang === 'fr' ? 'Le PIN doit contenir au moins 4 chiffres' :
                           lang === 'en' ? 'PIN must be at least 4 digits' :
                           'يجب أن يحتوي PIN على 4 أرقام على الأقل';
            if (errorEl) {
                errorEl.textContent = errorMsg;
                errorEl.style.display = 'block';
            }
            return;
        }

        if (!/^\d+$/.test(pin)) {
            const errorMsg = lang === 'fr' ? 'Le PIN doit contenir uniquement des chiffres' :
                           lang === 'en' ? 'PIN must contain only digits' :
                           'يجب أن يحتوي PIN على أرقام فقط';
            if (errorEl) {
                errorEl.textContent = errorMsg;
                errorEl.style.display = 'block';
            }
            return;
        }

        if (pin !== pinConfirm) {
            const errorMsg = lang === 'fr' ? 'Les codes PIN ne correspondent pas' :
                           lang === 'en' ? 'PIN codes do not match' :
                           'رموز PIN غير متطابقة';
            if (errorEl) {
                errorEl.textContent = errorMsg;
                errorEl.style.display = 'block';
            }
            return;
        }

        // Définir le PIN
        if (window.Security && window.Security.enable) {
            const success = await window.Security.enable(pin);
            if (!success) {
                const errorMsg = lang === 'fr' ? 'Erreur lors de la définition du PIN' :
                               lang === 'en' ? 'Error setting PIN' :
                               'خطأ في تعيين رمز PIN';
                if (errorEl) {
                    errorEl.textContent = errorMsg;
                    errorEl.style.display = 'block';
                }
                return;
            }
        }

        // Finaliser l'onboarding
        await this.finalizeOnboarding(state);
    }

    /**
     * Passe l'étape PIN
     */
    async skipPin() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        await this.finalizeOnboarding(state);
    }

    /**
     * Finalise l'onboarding
     * @private
     */
    async finalizeOnboarding(state) {
        // Marquer l'onboarding comme complété
        const success = await this.model.completeOnboarding(
            state,
            state.addictions.map(a => a.id),
            state.profile.lang,
            state.profile.religion
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
    }

    /**
     * Complète l'onboarding (ancienne méthode, gardée pour compatibilité)
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
