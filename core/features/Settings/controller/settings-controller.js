/**
 * Settings Controller - Orchestration Model/View
 */

import { SettingsModel } from '../model/settings-model.js';
import { SettingsView } from '../view/settings-view.js';
import { PinSettingsModel } from '../model/pin-settings-model.js';
import { PinSettingsView } from '../view/pin-settings-view.js';
import { getServices } from '../../../Utils/serviceHelper.js';

export class SettingsController {
    constructor() {
        this.model = new SettingsModel();
        this.view = new SettingsView();
        this.pinModel = new PinSettingsModel();
        this.pinView = new PinSettingsView();
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
            const { storage, security, i18n } = await getServices(['storage', 'security', 'i18n']);
            
            if (this.model && (!this.model.storage || !this.model.i18n)) {
                this.model = new SettingsModel({ storage, i18n });
            }
            
            if (this.pinModel && !this.pinModel.security) {
                this.pinModel = new PinSettingsModel({ security });
            }
            
            this.servicesInitialized = true;
        } catch (error) {
            console.warn('[SettingsController] Erreur lors de l\'initialisation des services:', error);
        }
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
     * Ouvre le modal de sélection du mode de coaching
     * @param {Object} state - State de l'application
     */
    async openCoachingModeModal(state) {
        // Importer COACHING_MODES dynamiquement
        let COACHING_MODES = null;
        try {
            const coachingData = await import('../../plugins/Coaching/data/coaching-data.js');
            COACHING_MODES = coachingData.COACHING_MODES;
        } catch (error) {
            console.warn('[Settings] Impossible de charger COACHING_MODES:', error);
        }
        
        if (!COACHING_MODES) {
            // Fallback si import échoue
            COACHING_MODES = {
                observer: {
                    fr: { name: 'Observer', description: 'Peu d\'interventions, surtout rétrospectif' },
                    en: { name: 'Observer', description: 'Few interventions, mostly retrospective' },
                    ar: { name: 'مراقب', description: 'تدخلات قليلة، معظمها استرجاعي' }
                },
                stability: {
                    fr: { name: 'Stabilité', description: 'Un ancrage à la fois, transitions prioritaires' },
                    en: { name: 'Stability', description: 'One anchor at a time, transitions priority' },
                    ar: { name: 'الاستقرار', description: 'مرساة واحدة في كل مرة، الأولوية للتحولات' }
                },
                guided: {
                    fr: { name: 'Guidé', description: 'Plus de feedback, propositions plus fréquentes' },
                    en: { name: 'Guided', description: 'More feedback, more frequent suggestions' },
                    ar: { name: 'موجه', description: 'مزيد من التعليقات، اقتراحات أكثر تكرارًا' }
                },
                silent: {
                    fr: { name: 'Silencieux', description: 'Coaching quasi invisible. Uniquement si forte instabilité détectée' },
                    en: { name: 'Silent', description: 'Almost invisible coaching. Only if high instability detected' },
                    ar: { name: 'صامت', description: 'تدريب شبه غير مرئي. فقط في حالة اكتشاف عدم استقرار شديد' }
                }
            };
        }
        
        const currentMode = state.coaching?.mode || 'stability';
        const lang = state.profile.lang || 'fr';
        
        const modes = ['observer', 'stability', 'guided', 'silent'];
        const html = `
            <div class="form-group">
                <div class="checkbox-group">
                    ${modes.map(mode => {
                        const modeData = COACHING_MODES[mode]?.[lang] || COACHING_MODES[mode]?.fr;
                        const isSelected = mode === currentMode;
                        return `
                            <label class="checkbox-item">
                                <input type="radio" name="coaching-mode" value="${mode}" ${isSelected ? 'checked' : ''}>
                                <div>
                                    <div style="font-weight: 500;">${modeData?.name || mode}</div>
                                    <div style="font-size: 0.9em; color: var(--text-secondary); margin-top: 0.25em;">
                                        ${modeData?.description || ''}
                                    </div>
                                </div>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        if (typeof UI !== 'undefined') {
            UI.showModal(I18n.t('coaching.mode.title') || 'Mode de coaching', html, async () => {
                const selected = document.querySelector('input[name="coaching-mode"]:checked');
                if (selected) {
                    const newMode = selected.value;
                    if (typeof Coaching !== 'undefined' && Coaching.changeCoachingMode) {
                        await Coaching.changeCoachingMode(state, newMode);
                        // Mettre à jour l'affichage dans Settings
                        const modeValueEl = document.getElementById('coaching-mode-value');
                        if (modeValueEl) {
                            const modeData = COACHING_MODES[newMode]?.[lang] || COACHING_MODES[newMode]?.fr;
                            modeValueEl.textContent = modeData?.name || newMode;
                        }
                        this.render(state);
                        UI.closeModal('dynamic-modal');
                        
                        const lang = state.profile.lang || 'fr';
                        const messages = {
                            fr: 'Mode de coaching modifié',
                            en: 'Coaching mode changed',
                            ar: 'تم تغيير وضع التدريب'
                        };
                        UI.showToast(messages[lang] || messages.fr, 'success');
                    }
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
        this.model.storage?.saveState(state);
        
        if (enabled && state.profile.religion !== 'none') {
            await I18n.loadSpiritualCards(state.profile.lang, state.profile.religion);
        }
    }

    /**
     * Exporte les données
     * @param {Object} state - State de l'application
     */
    async exportData(state) {
        try {
            await this.model.exportData(state);
            if (typeof UI !== 'undefined') {
                UI.showToast(I18n.t('export_success'), 'success');
            }
        } catch (error) {
            console.error('[SettingsController] Erreur export:', error);
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
        
        // Vérifier si le fichier est chiffré et nécessite un PIN
        if (result.needsPassword) {
            // Afficher la modale pour demander le PIN
            await this.showPasswordModal(result.encryptedData, state, input);
            return;
        }
        
        if (result.valid) {
            // Mettre à jour le state global
            if (typeof window !== 'undefined') {
                window.state = result.state;
            }
            Storage.saveState(result.state);
            await (this.model.i18n?.initI18n || (typeof I18n !== 'undefined' ? I18n.initI18n : () => {}))(result.state.profile.lang, result.state.profile.religion);
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
     * Affiche une modale pour demander le PIN pour déchiffrer les données
     * @param {Object} encryptedData - Données chiffrées
     * @param {Object} state - State de l'application
     * @param {HTMLInputElement} input - Input file (pour reset après import)
     */
    async showPasswordModal(encryptedData, state, input) {
        const lang = state.profile.lang || 'fr';
        
        const html = `
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--space-md);">
                ${I18n.t('import_password_prompt')}
            </p>
            <div class="form-group">
                <label class="form-label">${I18n.t('import_password_placeholder')}</label>
                <input type="password" 
                       id="import-pin-input" 
                       class="form-input" 
                       inputmode="numeric" 
                       pattern="[0-9]*"
                       maxlength="10"
                       placeholder="1234"
                       autofocus>
            </div>
            <div id="import-pin-error" class="error-message" style="display: none;"></div>
        `;
        
        const labels = {
            fr: { title: I18n.t('import_password_required'), validate: 'Valider', cancel: 'Annuler' },
            en: { title: I18n.t('import_password_required'), validate: 'Validate', cancel: 'Cancel' },
            ar: { title: I18n.t('import_password_required'), validate: 'التحقق', cancel: 'إلغاء' }
        };
        const l = labels[lang] || labels.fr;
        
        if (typeof UI !== 'undefined') {
            UI.showModal(l.title, html, async () => {
                const pinInput = document.getElementById('import-pin-input');
                const errorEl = document.getElementById('import-pin-error');
                
                if (!pinInput) return;
                
                const pin = pinInput.value.trim();
                
                // Masquer l'erreur précédente
                if (errorEl) {
                    errorEl.style.display = 'none';
                }
                
                if (!pin) {
                    if (errorEl) {
                        errorEl.textContent = I18n.t('import_password_placeholder') + ' requis';
                        errorEl.style.display = 'block';
                    }
                    return;
                }
                
                // Déchiffrer et importer
                const decryptResult = await this.model.decryptAndImportData(encryptedData, pin);
                
                if (decryptResult.valid) {
                    // Succès : fermer la modale et importer
                    UI.closeModal('dynamic-modal');
                    
                    // Mettre à jour le state global
                    if (typeof window !== 'undefined') {
                        window.state = decryptResult.state;
                    }
                    Storage.saveState(decryptResult.state);
                    await I18n.initI18n(decryptResult.state.profile.lang, decryptResult.state.profile.religion);
                    if (typeof Init !== 'undefined' && Init.applyTranslations) {
                        Init.applyTranslations();
                    }
                    if (typeof UI !== 'undefined') {
                        UI.showToast(I18n.t('import_success'), 'success');
                    }
                    this.render(decryptResult.state);
                    if (typeof Home !== 'undefined' && Home.render) {
                        Home.render(decryptResult.state);
                    }
                    
                    // Reset l'input
                    if (input) input.value = '';
                } else {
                    // Erreur : afficher le message
                    if (errorEl) {
                        const errorMsg = decryptResult.errors && decryptResult.errors.length > 0 
                            ? decryptResult.errors[0] 
                            : I18n.t('import_password_incorrect');
                        errorEl.textContent = errorMsg;
                        errorEl.style.display = 'block';
                    }
                    
                    // Si c'est une erreur de PIN, permettre une nouvelle tentative
                    if (decryptResult.needsPassword) {
                        // Garder la modale ouverte, vider le champ
                        pinInput.value = '';
                        pinInput.focus();
                    }
                }
            }, true, 'dynamic-modal', l.validate);
            
            // Focus sur l'input après ouverture de la modale
            setTimeout(() => {
                const pinInput = document.getElementById('import-pin-input');
                if (pinInput) {
                    pinInput.focus();
                    // Permettre Enter pour valider
                    pinInput.addEventListener('keypress', async (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const validateBtn = document.querySelector('.modal-footer .btn-primary');
                            if (validateBtn) validateBtn.click();
                        }
                    });
                }
            }, 100);
        }
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
                if (this.pinModel.security?.enable) {
                    // Le PIN est déjà défini, on active juste le verrouillage
                    // (on doit déverrouiller d'abord si verrouillé)
                    if (this.pinModel.security.isLocked && this.pinModel.isLocked()) {
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

    /**
     * Active/désactive le verrouillage automatique
     * @param {Object} state - State de l'application
     * @param {boolean} enabled - Activé ou non
     */
    async toggleAutoLock(state, enabled) {
        const success = await this.model.toggleAutoLock(state, enabled);
        
        if (!success && enabled) {
            // Échec : probablement PIN non défini
            const checkbox = document.getElementById('toggle-auto-lock');
            if (checkbox) checkbox.checked = false;
            
            if (typeof UI !== 'undefined') {
                const lang = state.profile.lang || 'fr';
                const msg = lang === 'fr' ? 'Active d\'abord le verrouillage PIN dans les réglages' :
                           lang === 'en' ? 'Enable PIN lock in settings first' :
                           'قم بتفعيل قفل PIN في الإعدادات أولاً';
                UI.showToast(msg, 'info');
            }
            return;
        }
        
        this.render(state);
        
        if (typeof UI !== 'undefined') {
            const lang = state.profile.lang || 'fr';
            const msg = enabled 
                ? (lang === 'fr' ? 'Verrouillage automatique activé' :
                   lang === 'en' ? 'Auto-lock enabled' :
                   'تم تفعيل القفل التلقائي')
                : (lang === 'fr' ? 'Verrouillage automatique désactivé' :
                   lang === 'en' ? 'Auto-lock disabled' :
                   'تم تعطيل القفل التلقائي');
            UI.showToast(msg, 'success');
        }
    }

    /**
     * Active/désactive le verrouillage automatique au changement d'onglet
     * @param {Object} state - State de l'application
     * @param {boolean} enabled - Activé ou non
     */
    async toggleAutoLockOnTabBlur(state, enabled) {
        const success = await this.model.toggleAutoLockOnTabBlur(state, enabled);
        
        if (!success && enabled) {
            // Échec : probablement PIN non défini
            const checkbox = document.getElementById('toggle-auto-lock-tab-blur');
            if (checkbox) checkbox.checked = false;
            
            if (typeof UI !== 'undefined') {
                const lang = state.profile.lang || 'fr';
                const msg = lang === 'fr' ? 'Active d\'abord le verrouillage PIN dans les réglages' :
                           lang === 'en' ? 'Enable PIN lock in settings first' :
                           'قم بتفعيل قفل PIN في الإعدادات أولاً';
                UI.showToast(msg, 'info');
            }
            return;
        }
        
        this.render(state);
        
        if (typeof UI !== 'undefined') {
            const lang = state.profile.lang || 'fr';
            const msg = enabled 
                ? (lang === 'fr' ? 'Verrouillage au changement d\'onglet activé' :
                   lang === 'en' ? 'Lock on tab change enabled' :
                   'تم تفعيل القفل عند تغيير علامة التبويب')
                : (lang === 'fr' ? 'Verrouillage au changement d\'onglet désactivé' :
                   lang === 'en' ? 'Lock on tab change disabled' :
                   'تم تعطيل القفل عند تغيير علامة التبويب');
            UI.showToast(msg, 'success');
        }
    }

    /**
     * Ouvre le modal pour choisir le délai de verrouillage automatique
     * @param {Object} state - State de l'application
     */
    openAutoLockDelayModal(state) {
        const lang = state.profile.lang || 'fr';
        const currentDelay = state.settings?.autoLock?.delay || 60000;
        
        const delayOptions = [
            { value: 30000, label: I18n.t('auto_lock_delay_30s') },
            { value: 60000, label: I18n.t('auto_lock_delay_1min') },
            { value: 120000, label: I18n.t('auto_lock_delay_2min') },
            { value: 300000, label: I18n.t('auto_lock_delay_5min') },
            { value: 600000, label: I18n.t('auto_lock_delay_10min') }
        ];
        
        const html = `
            <div class="form-group">
                <div class="checkbox-group">
                    ${delayOptions.map(option => `
                        <label class="checkbox-item">
                            <input type="radio" name="auto-lock-delay" value="${option.value}" ${currentDelay === option.value ? 'checked' : ''}>
                            <span>${option.label}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
        
        const labels = {
            fr: { title: I18n.t('auto_lock_delay'), save: 'Enregistrer', cancel: 'Annuler' },
            en: { title: I18n.t('auto_lock_delay'), save: 'Save', cancel: 'Cancel' },
            ar: { title: I18n.t('auto_lock_delay'), save: 'حفظ', cancel: 'إلغاء' }
        };
        const l = labels[lang] || labels.fr;
        
        if (typeof UI !== 'undefined') {
            UI.showModal(l.title, html, async () => {
                const selected = document.querySelector('input[name="auto-lock-delay"]:checked');
                if (selected) {
                    const delay = parseInt(selected.value, 10);
                    await this.model.updateAutoLockDelay(state, delay);
                    UI.closeModal('dynamic-modal');
                    this.render(state);
                    
                    const successMsg = lang === 'fr' ? 'Délai mis à jour' :
                                     lang === 'en' ? 'Delay updated' :
                                     'تم تحديث التأخير';
                    UI.showToast(successMsg, 'success');
                }
            }, true, 'dynamic-modal', l.save);
        }
    }
}
