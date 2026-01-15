/**
 * PinSettingsModel - Logique métier pour la gestion du PIN
 */

export class PinSettingsModel {
    constructor(services = {}) {
        this.security = services.security || (typeof window !== 'undefined' ? window.Security : null);
    }

    /**
     * Vérifie si un PIN est défini
     * @returns {Promise<boolean>}
     */
    async hasPin() {
        if (this.security?.hasPin) {
            return await this.security.hasPin();
        }
        return false;
    }

    /**
     * Vérifie si le verrouillage est activé
     * @returns {boolean}
     */
    isEnabled() {
        if (this.security?.isEnabled) {
            return this.security.isEnabled();
        }
        return false;
    }

    /**
     * Vérifie si l'application est verrouillée
     * @returns {boolean}
     */
    isLocked() {
        if (this.security?.isLocked) {
            return this.security.isLocked();
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

        if (this.security?.enable) {
            return await this.security.enable(pin);
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

        if (this.security?.changePin) {
            return await this.security.changePin(oldPin, newPin);
        }
        return false;
    }

    /**
     * Désactive le PIN
     * @param {string} pin - PIN actuel pour confirmation
     * @returns {Promise<boolean>}
     */
    async disablePin(pin) {
        if (this.security?.disable) {
            return await this.security.disable(pin);
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
