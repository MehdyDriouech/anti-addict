/**
 * Settings Controller - Orchestration Model/View
 */

import { SettingsModel } from '../model/settings-model.js';
import { SettingsView } from '../view/settings-view.js';
import { PinSettingsModel } from '../model/pin-settings-model.js';
import { PinSettingsView } from '../view/pin-settings-view.js';

export class SettingsController {
    constructor() {
        this.model = new SettingsModel();
        this.view = new SettingsView();
        this.pinModel = new PinSettingsModel();
        this.pinView = new PinSettingsView();
    }

    /**
     * Rend l'écran de réglages
     * @param {Object} state - State de l'application
     */
    async render(state) {
        const getAddictionIcon = (id) => this.model.getAddictionIcon(id);
        const hasPin = await this.pinModel.hasPin();
        const pinEnabled = this.pinModel.isEnabled();
        await this.view.render(state, getAddictionIcon, hasPin, pinEnabled);
    }

    /**
     * Applique un thème
     * @param {string} themeName - Nom du thème
     */
    applyTheme(themeName) {
        this.model.applyTheme(themeName);
    }

    /**
     * Bascule le thème
     * @param {Object} state - State de l'application
     */
    toggleTheme(state) {
        const newTheme = this.model.toggleTheme(state);
        if (Router.getCurrentRoute() === 'settings') {
            this.render(state);
        }
    }

    /**
     * Ouvre le modal de sélection de langue
     * @param {Object} state - State de l'application
     */
    async openLanguageModal(state) {
        const html = `
            <div class="form-group">
                <div class="checkbox-group">
                    <label class="checkbox-item">
                        <input type="radio" name="lang" value="fr" ${state.profile.lang === 'fr' ? 'checked' : ''}>
                        <span>🇫🇷 Français</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="radio" name="lang" value="en" ${state.profile.lang === 'en' ? 'checked' : ''}>
                        <span>🇬🇧 English</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="radio" name="lang" value="ar" ${state.profile.lang === 'ar' ? 'checked' : ''}>
                        <span>🇸🇦 العربية</span>
                    </label>
                </div>
            </div>
        `;
        
        if (typeof UI !== 'undefined') {
            UI.showModal(I18n.t('language'), html, async () => {
                const selected = document.querySelector('input[name="lang"]:checked');
                if (selected) {
                    await this.model.updateLanguage(state, selected.value);
                    if (typeof Init !== 'undefined' && Init.applyTranslations) {
                        Init.applyTranslations();
                    }
                    this.render(state);
                    UI.closeModal('dynamic-modal');
                }
            });
        }
    }

    /**
     * Ouvre le modal de sélection de religion
     * @param {Object} state - State de l'application
     */
    async openReligionModal(state) {
        const html = `
            <div class="form-group">
                <div class="checkbox-group">
                    <label class="checkbox-item">
                        <input type="radio" name="religion" value="none" ${state.profile.religion === 'none' ? 'checked' : ''}>
                        <span>${I18n.t('religion_none')}</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="radio" name="religion" value="islam" ${state.profile.religion === 'islam' ? 'checked' : ''}>
                        <span>☪️ ${I18n.t('religion_islam')}</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="radio" name="religion" value="christianity" ${state.profile.religion === 'christianity' ? 'checked' : ''}>
                        <span>✝️ ${I18n.t('religion_christianity')}</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="radio" name="religion" value="judaism" ${state.profile.religion === 'judaism' ? 'checked' : ''}>
                        <span>✡️ ${I18n.t('religion_judaism')}</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="radio" name="religion" value="buddhism" ${state.profile.religion === 'buddhism' ? 'checked' : ''}>
                        <span>☸️ ${I18n.t('religion_buddhism')}</span>
                    </label>
                </div>
            </div>
        `;
        
        if (typeof UI !== 'undefined') {
            UI.showModal(I18n.t('religion'), html, async () => {
                const selected = document.querySelector('input[name="religion"]:checked');
                if (selected) {
                    await this.model.updateReligion(state, selected.value);
                    this.render(state);
                    UI.closeModal('dynamic-modal');
                }
            });
        }
    }

    /**
     * Toggle une addiction
     * @param {Object} state - State de l'application
     * @param {string} addictionId - ID de l'addiction
     * @param {boolean} enabled - Activé ou non
     */
    async toggleAddiction(state, addictionId, enabled) {
        const success = await this.model.toggleAddiction(state, addictionId, enabled);
        if (!success) {
            // L'utilisateur a annulé, remettre la checkbox à son état précédent
            const checkbox = document.querySelector(`input[onchange*="toggleAddiction('${addictionId}'"]`);
            if (checkbox) checkbox.checked = !enabled;
            return;
        }
        
        this.render(state);
        
        const lang = state.profile.lang || 'fr';
        const messages = {
            fr: enabled ? 'Addiction activée' : 'Addiction désactivée',
            en: enabled ? 'Addiction enabled' : 'Addiction disabled',
            ar: enabled ? 'تم تفعيل الإدمان' : 'تم تعطيل الإدمان'
        };
        
        if (typeof UI !== 'undefined') {
            UI.showToast(messages[lang] || messages.fr);
        }
    }

    /**
     * Toggle les cartes spirituelles
     * @param {Object} state - State de l'application
     * @param {boolean} enabled - Activé ou non
     */
    async toggleSpiritualCards(state, enabled) {
        state.profile.spiritualEnabled = enabled;
        Storage.saveState(state);
        
        if (enabled && state.profile.religion !== 'none') {
            await I18n.loadSpiritualCards(state.profile.lang, state.profile.religion);
        }
    }

    /**
     * Exporte les données
     * @param {Object} state - State de l'application
     */
    exportData(state) {
        try {
            this.model.exportData(state);
            if (typeof UI !== 'undefined') {
                UI.showToast(I18n.t('export_success'), 'success');
            }
        } catch (error) {
            if (typeof UI !== 'undefined') {
                UI.showToast(I18n.t('import_error'), 'error');
            }
        }
    }

    /**
     * Déclenche le sélecteur de fichier pour l'import
     */
    triggerImport() {
        document.getElementById('import-file').click();
    }

    /**
     * Gère l'import d'un fichier
     * @param {Object} state - State de l'application
     * @param {HTMLInputElement} input - Input file
     */
    async handleImport(state, input) {
        if (!input.files || !input.files[0]) return;
        
        const file = input.files[0];
        const result = await this.model.importData(file);
        
        if (result.valid) {
            // Mettre à jour le state global
            if (typeof window !== 'undefined') {
                window.state = result.state;
            }
            Storage.saveState(result.state);
            await I18n.initI18n(result.state.profile.lang, result.state.profile.religion);
            if (typeof Init !== 'undefined' && Init.applyTranslations) {
                Init.applyTranslations();
            }
            if (typeof UI !== 'undefined') {
                UI.showToast(I18n.t('import_success'), 'success');
            }
            this.render(result.state);
            if (typeof Home !== 'undefined' && Home.render) {
                Home.render(result.state);
            }
        } else {
            if (typeof UI !== 'undefined') {
                UI.showToast(`${I18n.t('import_error')}: ${result.errors.join(', ')}`, 'error');
            }
        }
        
        // Reset l'input
        input.value = '';
    }

    /**
     * Toggle le verrouillage PIN
     * @param {boolean} enabled - Activé ou non
     */
    async togglePinLock(enabled) {
        const state = window.state;
        if (!state) return;

        if (enabled) {
            // Ouvrir le modal pour définir le PIN si pas encore défini
            const hasPin = await this.pinModel.hasPin();
            if (!hasPin) {
                // Décocher la checkbox
                const checkbox = document.getElementById('toggle-pin');
                if (checkbox) checkbox.checked = false;
                
                // Ouvrir le modal pour définir le PIN
                this.openSetPinModal();
            } else {
                // Activer le verrouillage
                if (window.Security && window.Security.enable) {
                    // Le PIN est déjà défini, on active juste le verrouillage
                    // (on doit déverrouiller d'abord si verrouillé)
                    if (window.Security.isLocked && window.Security.isLocked()) {
                        // Demander le PIN pour déverrouiller
                        this.showUnlockModal();
                    }
                }
            }
        } else {
            // Désactiver le verrouillage (demander confirmation avec PIN)
            this.openDisablePinModal();
        }
    }

    /**
     * Ouvre le modal pour définir un PIN
     */
    async openSetPinModal() {
        const state = window.state;
        if (!state) return;

        const lang = state.profile.lang || 'fr';
        const html = this.pinView.renderSetPinModal(lang);

        const labels = {
            fr: { title: 'Définir un code PIN', set: 'Définir', cancel: 'Annuler' },
            en: { title: 'Set PIN code', set: 'Set', cancel: 'Cancel' },
            ar: { title: 'تعيين رمز PIN', set: 'تعيين', cancel: 'إلغاء' }
        };
        const l = labels[lang] || labels.fr;

        if (typeof UI !== 'undefined') {
            UI.showModal(l.title, html, async () => {
                await this.handleSetPin(lang, state);
            }, false, 'dynamic-modal', l.set);
            
            // Ajouter listener sur Enter pour fermer automatiquement
            setTimeout(() => {
                const pinInput = document.getElementById('pin-input');
                const pinConfirmInput = document.getElementById('pin-confirm-input');
                if (pinConfirmInput) {
                    pinConfirmInput.addEventListener('keypress', async (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            await this.handleSetPin(lang, state);
                        }
                    });
                }
            }, 100);
        }
    }

    /**
     * Gère la définition du PIN
     * @private
     */
    async handleSetPin(lang, state) {
        const pinInput = document.getElementById('pin-input');
        const pinConfirmInput = document.getElementById('pin-confirm-input');
        
        if (!pinInput || !pinConfirmInput) return;

        const pin = pinInput.value.trim();
        const pinConfirm = pinConfirmInput.value.trim();

        this.pinView.hideError();

        // Validation
        const validation = this.pinModel.validatePin(pin);
        if (!validation.valid) {
            this.pinView.showError(validation.error);
            return;
        }

        if (pin !== pinConfirm) {
            const errorMsg = lang === 'fr' ? 'Les codes PIN ne correspondent pas' :
                            lang === 'en' ? 'PIN codes do not match' :
                            'رموز PIN غير متطابقة';
            this.pinView.showError(errorMsg);
            return;
        }

        // Définir le PIN
        const success = await this.pinModel.setPin(pin);
        if (success) {
            if (typeof UI !== 'undefined') {
                UI.closeModal('dynamic-modal');
            }
            const successMsg = lang === 'fr' ? 'Code PIN défini avec succès' :
                             lang === 'en' ? 'PIN code set successfully' :
                             'تم تعيين رمز PIN بنجاح';
            if (typeof UI !== 'undefined') {
                UI.showToast(successMsg, 'success');
            }
            this.render(state);
        } else {
            const errorMsg = lang === 'fr' ? 'Erreur lors de la définition du PIN' :
                            lang === 'en' ? 'Error setting PIN' :
                            'خطأ في تعيين رمز PIN';
            this.pinView.showError(errorMsg);
        }
    }

    /**
     * Ouvre le modal pour modifier le PIN
     */
    async openChangePinModal() {
        const state = window.state;
        if (!state) return;

        const lang = state.profile.lang || 'fr';
        const html = this.pinView.renderChangePinModal(lang);

        const labels = {
            fr: { title: 'Modifier le code PIN', change: 'Modifier', cancel: 'Annuler' },
            en: { title: 'Change PIN code', change: 'Change', cancel: 'Cancel' },
            ar: { title: 'تغيير رمز PIN', change: 'تغيير', cancel: 'إلغاء' }
        };
        const l = labels[lang] || labels.fr;

        if (typeof UI !== 'undefined') {
            UI.showModal(l.title, html, async () => {
                const oldPinInput = document.getElementById('pin-old-input');
                const newPinInput = document.getElementById('pin-new-input');
                const newPinConfirmInput = document.getElementById('pin-new-confirm-input');
                
                if (!oldPinInput || !newPinInput || !newPinConfirmInput) return;

                const oldPin = oldPinInput.value.trim();
                const newPin = newPinInput.value.trim();
                const newPinConfirm = newPinConfirmInput.value.trim();

                this.pinView.hideError();

                // Validation
                const validation = this.pinModel.validatePin(newPin);
                if (!validation.valid) {
                    this.pinView.showError(validation.error);
                    return;
                }

                if (newPin !== newPinConfirm) {
                    const errorMsg = lang === 'fr' ? 'Les nouveaux codes PIN ne correspondent pas' :
                                    lang === 'en' ? 'New PIN codes do not match' :
                                    'رموز PIN الجديدة غير متطابقة';
                    this.pinView.showError(errorMsg);
                    return;
                }

                // Changer le PIN
                const success = await this.pinModel.changePin(oldPin, newPin);
                if (success) {
                    UI.closeModal('dynamic-modal');
                    const successMsg = lang === 'fr' ? 'Code PIN modifié avec succès' :
                                     lang === 'en' ? 'PIN code changed successfully' :
                                     'تم تغيير رمز PIN بنجاح';
                    UI.showToast(successMsg, 'success');
                    this.render(state);
                } else {
                    const errorMsg = lang === 'fr' ? 'Ancien code PIN incorrect' :
                                    lang === 'en' ? 'Wrong old PIN code' :
                                    'رمز PIN القديم غير صحيح';
                    this.pinView.showError(errorMsg);
                }
            }, false, 'dynamic-modal', l.change);
            
            // Ajouter listener sur Enter pour fermer automatiquement
            setTimeout(() => {
                const newPinConfirmInput = document.getElementById('pin-new-confirm-input');
                if (newPinConfirmInput) {
                    newPinConfirmInput.addEventListener('keypress', async (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            await this.handleChangePin(lang, state);
                        }
                    });
                }
            }, 100);
        }
    }

    /**
     * Gère le changement de PIN
     * @private
     */
    async handleChangePin(lang, state) {
        const oldPinInput = document.getElementById('pin-old-input');
        const newPinInput = document.getElementById('pin-new-input');
        const newPinConfirmInput = document.getElementById('pin-new-confirm-input');
        
        if (!oldPinInput || !newPinInput || !newPinConfirmInput) return;

        const oldPin = oldPinInput.value.trim();
        const newPin = newPinInput.value.trim();
        const newPinConfirm = newPinConfirmInput.value.trim();

        this.pinView.hideError();

        // Validation
        const validation = this.pinModel.validatePin(newPin);
        if (!validation.valid) {
            this.pinView.showError(validation.error);
            return;
        }

        if (newPin !== newPinConfirm) {
            const errorMsg = lang === 'fr' ? 'Les nouveaux codes PIN ne correspondent pas' :
                            lang === 'en' ? 'New PIN codes do not match' :
                            'رموز PIN الجديدة غير متطابقة';
            this.pinView.showError(errorMsg);
            return;
        }

        // Changer le PIN
        const success = await this.pinModel.changePin(oldPin, newPin);
        if (success) {
            if (typeof UI !== 'undefined') {
                UI.closeModal('dynamic-modal');
            }
            const successMsg = lang === 'fr' ? 'Code PIN modifié avec succès' :
                             lang === 'en' ? 'PIN code changed successfully' :
                             'تم تغيير رمز PIN بنجاح';
            if (typeof UI !== 'undefined') {
                UI.showToast(successMsg, 'success');
            }
            this.render(state);
        } else {
            const errorMsg = lang === 'fr' ? 'Ancien code PIN incorrect' :
                            lang === 'en' ? 'Wrong old PIN code' :
                            'رمز PIN القديم غير صحيح';
            this.pinView.showError(errorMsg);
        }
    }

    /**
     * Ouvre le modal pour désactiver le PIN
     */
    async openDisablePinModal() {
        const state = window.state;
        if (!state) return;

        const lang = state.profile.lang || 'fr';
        
        const labels = {
            fr: {
                title: 'Désactiver le verrouillage',
                message: 'Pour désactiver le verrouillage, entre ton code PIN actuel',
                pinLabel: 'Code PIN',
                disable: 'Désactiver',
                cancel: 'Annuler',
                wrongPin: 'Code PIN incorrect'
            },
            en: {
                title: 'Disable lock',
                message: 'To disable the lock, enter your current PIN code',
                pinLabel: 'PIN code',
                disable: 'Disable',
                cancel: 'Cancel',
                wrongPin: 'Wrong PIN code'
            },
            ar: {
                title: 'تعطيل القفل',
                message: 'لتعطيل القفل، أدخل رمز PIN الحالي',
                pinLabel: 'رمز PIN',
                disable: 'تعطيل',
                cancel: 'إلغاء',
                wrongPin: 'رمز PIN غير صحيح'
            }
        };
        const l = labels[lang] || labels.fr;

        const html = `
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--space-md);">
                ${l.message}
            </p>
            <div class="form-group">
                <label class="form-label">${l.pinLabel}</label>
                <input type="password" 
                       id="pin-disable-input" 
                       class="form-input" 
                       inputmode="numeric" 
                       pattern="[0-9]*"
                       maxlength="10"
                       placeholder="1234">
            </div>
            <div id="pin-error" class="error-message" style="display: none;"></div>
        `;

        if (typeof UI !== 'undefined') {
            UI.showModal(l.title, html, async () => {
                const pinInput = document.getElementById('pin-disable-input');
                if (!pinInput) return;

                const pin = pinInput.value.trim();
                const errorEl = document.getElementById('pin-error');

                // Désactiver le PIN
                const success = await this.pinModel.disablePin(pin);
                if (success) {
                    UI.closeModal('dynamic-modal');
                    const successMsg = lang === 'fr' ? 'Verrouillage désactivé' :
                                     lang === 'en' ? 'Lock disabled' :
                                     'تم تعطيل القفل';
                    UI.showToast(successMsg, 'success');
                    this.render(state);
                } else {
                    if (errorEl) {
                        errorEl.textContent = l.wrongPin;
                        errorEl.style.display = 'block';
                    }
                }
            }, true, l.cancel);
        }
    }

    /**
     * Affiche le modal de déverrouillage
     */
    showUnlockModal() {
        // Cette fonction sera utilisée par l'icône cadenas
        // Pour l'instant, on utilise la même logique que le déverrouillage normal
    }

    /**
     * Demande confirmation avant d'effacer les données
     * @param {Object} state - State de l'application
     */
    confirmClearData(state) {
        const html = `
            <p style="text-align: center; color: var(--text-secondary);">
                ${I18n.t('clear_confirm')}
            </p>
        `;
        
        if (typeof UI !== 'undefined') {
            UI.showModal(I18n.t('clear_data'), html, () => {
                const newState = this.model.clearData();
                if (typeof window !== 'undefined') {
                    window.state = newState;
                }
                UI.closeModal('dynamic-modal');
                UI.showToast(I18n.t('reset_complete'), 'success');
                if (typeof Onboarding !== 'undefined' && Onboarding.show) {
                    Onboarding.show();
                }
            }, true);
        }
    }
}
