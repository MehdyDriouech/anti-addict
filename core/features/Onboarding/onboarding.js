/**
 * Onboarding Feature - API publique pour l'onboarding
 */

import { OnboardingController } from './controller/onboarding-controller.js';

// Instance unique du controller
const onboardingController = new OnboardingController();

// API publique
export const Onboarding = {
    show: (state) => onboardingController.show(state),
    hide: () => onboardingController.hide(),
    complete: (state) => onboardingController.complete(state),
    nextStep: () => onboardingController.nextStep(),
    completeWithPin: () => onboardingController.completeWithPin(),
    skipPin: () => onboardingController.skipPin(),
    showDisclaimerModal: (addictionsWithDisclaimer) => onboardingController.showDisclaimerModal(addictionsWithDisclaimer)
};

// Exporter globalement pour compatibilité
if (typeof window !== 'undefined') {
    window.Onboarding = Onboarding;
    window.showOnboarding = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Onboarding.show(state);
    };
    window.hideOnboarding = () => Onboarding.hide();
    window.completeOnboarding = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Onboarding.complete(state);
    };
    window.showDisclaimerModal = (addictionsWithDisclaimer) => Onboarding.showDisclaimerModal(addictionsWithDisclaimer);
}
