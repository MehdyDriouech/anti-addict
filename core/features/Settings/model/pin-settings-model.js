/**
 * PinSettingsModel - Logique métier pour la gestion du PIN
 */

export class PinSettingsModel {
    /**
     * Vérifie si un PIN est défini
     * @returns {Promise<boolean>}
     */
    async hasPin() {
        if (window.Security && window.Security.hasPin) {
            return await window.Security.hasPin();
        }
        return false;
    }

    /**
     * Vérifie si le verrouillage est activé
     * @returns {boolean}
     */
    isEnabled() {
        if (window.Security && window.Security.isEnabled) {
            return window.Security.isEnabled();
        }
        return false;
    }

    /**
     * Vérifie si l'application est verrouillée
     * @returns {boolean}
     */
    isLocked() {
        if (window.Security && window.Security.isLocked) {
            return window.Security.isLocked();
        }
        return false;
    }

    /**
     * Définit un nouveau PIN
     * @param {string} pin - Nouveau PIN
     * @returns {Promise<boolean>}
     */
    async setPin(pin) {
        if (!pin || pin.length < 4) {
            return false;
        }

        if (window.Security && window.Security.enable) {
            return await window.Security.enable(pin);
        }
        return false;
    }

    /**
     * Change le PIN
     * @param {string} oldPin - Ancien PIN
     * @param {string} newPin - Nouveau PIN
     * @returns {Promise<boolean>}
     */
    async changePin(oldPin, newPin) {
        if (!newPin || newPin.length < 4) {
            return false;
        }

        if (window.Security && window.Security.changePin) {
            return await window.Security.changePin(oldPin, newPin);
        }
        return false;
    }

    /**
     * Désactive le PIN
     * @param {string} pin - PIN actuel pour confirmation
     * @returns {Promise<boolean>}
     */
    async disablePin(pin) {
        if (window.Security && window.Security.disable) {
            return await window.Security.disable(pin);
        }
        return false;
    }

    /**
     * Valide un PIN (format)
     * @param {string} pin - PIN à valider
     * @returns {Object} { valid: boolean, error: string|null }
     */
    validatePin(pin) {
        if (!pin || pin.length === 0) {
            return { valid: false, error: 'PIN requis' };
        }
        if (pin.length < 4) {
            return { valid: false, error: 'Le PIN doit contenir au moins 4 caractères' };
        }
        if (!/^\d+$/.test(pin)) {
            return { valid: false, error: 'Le PIN doit contenir uniquement des chiffres' };
        }
        return { valid: true, error: null };
    }
}
