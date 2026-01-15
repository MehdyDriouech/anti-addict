/**
 * FormService.js - Service pour l'extraction et la validation de formulaires
 * 
 * Centralise l'extraction de données de formulaires et réduit la duplication
 * dans les controllers.
 */

export class FormService {
    /**
     * Extrait les données du formulaire PIN
     * @param {Object} options - Options { oldPinId?, newPinId?, confirmPinId? }
     * @returns {Object} { pin, pinConfirm, oldPin, newPin, newPinConfirm }
     */
    extractPinFormData(options = {}) {
        const {
            pinId = 'pin-input',
            pinConfirmId = 'pin-confirm-input',
            oldPinId = 'pin-old-input',
            newPinId = 'pin-new-input',
            newPinConfirmId = 'pin-new-confirm-input'
        } = options;

        const pinInput = document.getElementById(pinId);
        const pinConfirmInput = document.getElementById(pinConfirmId);
        const oldPinInput = document.getElementById(oldPinId);
        const newPinInput = document.getElementById(newPinId);
        const newPinConfirmInput = document.getElementById(newPinConfirmId);

        return {
            pin: pinInput?.value?.trim() || '',
            pinConfirm: pinConfirmInput?.value?.trim() || '',
            oldPin: oldPinInput?.value?.trim() || '',
            newPin: newPinInput?.value?.trim() || '',
            newPinConfirm: newPinConfirmInput?.value?.trim() || '',
            elements: {
                pinInput,
                pinConfirmInput,
                oldPinInput,
                newPinInput,
                newPinConfirmInput
            }
        };
    }

    /**
     * Vérifie si tous les éléments requis sont présents
     * @param {Object} formData - Données du formulaire
     * @param {Array<string>} requiredFields - Champs requis
     * @returns {boolean}
     */
    validateFormElements(formData, requiredFields = []) {
        for (const field of requiredFields) {
            if (!formData.elements[field] || !formData[field]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Extrait la sélection de langue
     * @returns {string|null} Langue sélectionnée
     */
    extractLanguageSelection() {
        const selected = document.querySelector('input[name="lang"]:checked');
        return selected?.value || null;
    }

    /**
     * Extrait la sélection de religion
     * @returns {string|null} Religion sélectionnée
     */
    extractReligionSelection() {
        const selected = document.querySelector('input[name="religion"]:checked');
        return selected?.value || null;
    }

    /**
     * Extrait la sélection du mode de coaching
     * @returns {string|null} Mode de coaching sélectionné
     */
    extractCoachingModeSelection() {
        const selected = document.querySelector('input[name="coaching-mode"]:checked');
        return selected?.value || null;
    }

    /**
     * Extrait la sélection du délai de verrouillage automatique
     * @returns {number|null} Délai en millisecondes
     */
    extractAutoLockDelaySelection() {
        const selected = document.querySelector('input[name="auto-lock-delay"]:checked');
        if (!selected) return null;
        return parseInt(selected.value, 10);
    }

    /**
     * Extrait les checkboxes cochées pour un groupe
     * @param {string} selector - Sélecteur CSS
     * @param {string} dataAttribute - Attribut data à extraire
     * @returns {Array<string>} Valeurs des checkboxes cochées
     */
    extractCheckedValues(selector, dataAttribute = null) {
        const checked = document.querySelectorAll(`${selector}:checked`);
        if (dataAttribute) {
            return Array.from(checked).map(el => el.dataset[dataAttribute]);
        }
        return Array.from(checked).map(el => el.value);
    }

    /**
     * Réinitialise un formulaire
     * @param {string|HTMLElement} form - Formulaire ou ID du formulaire
     */
    resetForm(form) {
        const formElement = typeof form === 'string' 
            ? document.getElementById(form) 
            : form;
        
        if (formElement && formElement.reset) {
            formElement.reset();
        } else if (formElement) {
            // Reset manuel pour les inputs
            const inputs = formElement.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
        }
    }
}

// Instance singleton par défaut
const instance = new FormService();
export default instance;
