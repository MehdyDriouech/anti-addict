/**
 * Settings Controller - Orchestration Model/View
 */

import { SettingsModel } from '../model/settings-model.js';
import { SettingsView } from '../view/settings-view.js';
import { PinSettingsModel } from '../model/pin-settings-model.js';
import { PinSettingsView } from '../view/pin-settings-view.js';
import { getServices } from '../../../Utils/serviceHelper.js';
import { ROUTE_SETTINGS, MODAL_ID_DYNAMIC, MODAL_DELAY_MS } from '../../../Constants/AppConstants.js';
import { FormService } from '../../../Services/FormService.js';
import { MessageService } from '../../../Services/MessageService.js';

export class SettingsController {
    constructor(services = {}) {
        // Services injectés
        this.uiService = services.ui || null;
        this.i18nService = services.i18n || null;
        this.messageService = services.message || null;
        this.modalService = services.modal || null;
        this.formService = services.form || null;
        this.errorHandler = services.errorHandler || null;
        this.storageService = services.storage || null;
        this.securityService = services.security || null;
        
        // Models et Views - créer avec fallbacks si services non disponibles
        // Les services seront réinjectés dans initServices()
        this.model = new SettingsModel({ 
            storage: this.storageService || (typeof window !== 'undefined' ? window.Storage : null), 
            i18n: this.i18nService || (typeof window !== 'undefined' ? window.I18n : null)
        });
        this.view = new SettingsView();
        this.pinModel = new PinSettingsModel({ 
            security: this.securityService || (typeof window !== 'undefined' ? window.Security : null)
        });
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
            const services = await getServices([
                'storage', 'security', 'i18n', 'ui', 'message', 
                'modal', 'form', 'errorHandler'
            ]);
            
            // Injecter les services
            this.storageService = services.storage || this.storageService;
            this.securityService = services.security || this.securityService;
            this.i18nService = services.i18n || this.i18nService;
            this.uiService = services.ui || this.uiService;
            this.messageService = services.message || this.messageService;
            this.modalService = services.modal || this.modalService;
            this.formService = services.form || this.formService;
            this.errorHandler = services.errorHandler || this.errorHandler;
            
            // Réinitialiser les modèles avec les services injectés
            if (this.storageService || this.i18nService) {
                this.model = new SettingsModel({ 
                    storage: this.storageService, 
                    i18n: this.i18nService 
                });
            }
            
            if (this.securityService) {
                this.pinModel = new PinSettingsModel({ 
                    security: this.securityService 
                });
            }
            
            this.servicesInitialized = true;
        } catch (error) {
            if (this.errorHandler) {
                this.errorHandler.handleSilently(error, 'SettingsController');
            } else {
                console.warn('[SettingsController] Erreur lors de l\'initialisation des services:', error);
            }
        }
    }

    /**
     * Obtient le service UI avec fallback vers window.UI
     * @private
     * @returns {Object|null} Service UI ou null si aucun disponible
     */
    _getUIService() {
        if (this.uiService) {
            return this.uiService;
        }
        // Fallback vers window.UI
        if (typeof window !== 'undefined' && window.UI) {
            return window.UI;
        }
        return null;
    }

    /**
     * Obtient le service FormService avec fallback vers instance locale
     * @private
     * @returns {FormService} Service FormService (toujours disponible car stateless)
     */
    _getFormService() {
        if (this.formService) {
            return this.formService;
        }
        // FormService est stateless, créer une instance locale si nécessaire
        // Utiliser un cache pour éviter de créer plusieurs instances
        if (!this._formServiceFallback) {
            this._formServiceFallback = new FormService();
        }
        return this._formServiceFallback;
    }

    /**
     * Obtient le service MessageService avec fallback
     * @private
     * @returns {MessageService|null} Service MessageService ou null si i18n non disponible
     */
    _getMessageService() {
        if (this.messageService) {
            return this.messageService;
        }
        // MessageService nécessite i18n, créer avec fallback
        const i18n = this.i18nService || (typeof window !== 'undefined' ? window.I18n : null);
        if (i18n) {
            // Utiliser un cache pour éviter de créer plusieurs instances
            if (!this._messageServiceFallback) {
                this._messageServiceFallback = new MessageService(i18n);
            }
            return this._messageServiceFallback;
        }
        // Si i18n n'est pas disponible, retourner null
        // Les méthodes devront utiliser des messages en dur comme fallback
        return null;
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
    async toggleTheme(state) {
        const newTheme = this.model.toggleTheme(state);
        // Vérifier la route actuelle via le router service ou window.Router
        const router = await getServices(['router']).then(s => s.router).catch(() => null);
        const currentRoute = router?.getCurrentRoute?.() || 
                           (typeof window !== 'undefined' && window.Router?.getCurrentRoute?.()) || 
                           null;
        
        if (currentRoute === ROUTE_SETTINGS) {
            await this.render(state);
        }
    }

    /**
     * Ouvre le modal de sélection de langue
     * @param {Object} state - State de l'application
     */
    async openLanguageModal(state) {
        if (!this.modalService) {
            await this.initServices();
        }
        
        this.modalService.showLanguageModal(state, async (selectedLang) => {
            await this.model.updateLanguage(state, selectedLang);
            
            // Appliquer les traductions si Init est disponible
            if (typeof window !== 'undefined' && window.Init?.applyTranslations) {
                window.Init.applyTranslations();
            }
            
            await this.render(state);
            this.modalService.closeDynamicModal();
        });
    }

    /**
     * Ouvre le modal de sélection du mode de coaching
     * @param {Object} state - State de l'application
     */
    async openCoachingModeModal(state) {
        if (!this.modalService) {
            await this.initServices();
        }
        
        // Importer COACHING_MODES dynamiquement
        let COACHING_MODES = null;
        try {
            const coachingData = await import('../../plugins/Coaching/data/coaching-data.js');
            COACHING_MODES = coachingData.COACHING_MODES;
        } catch (error) {
            if (this.errorHandler) {
                this.errorHandler.handleSilently(error, 'SettingsController');
            }
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
        
        this.modalService.showCoachingModeModal(state, COACHING_MODES, async (newMode) => {
            if (typeof window !== 'undefined' && window.Coaching?.changeCoachingMode) {
                await window.Coaching.changeCoachingMode(state, newMode);
                
                // Mettre à jour l'affichage dans Settings
                const modeValueEl = document.getElementById('coaching-mode-value');
                if (modeValueEl) {
                    const lang = state.profile.lang || 'fr';
                    const modeData = COACHING_MODES[newMode]?.[lang] || COACHING_MODES[newMode]?.fr;
                    modeValueEl.textContent = modeData?.name || newMode;
                }
                
                await this.render(state);
                this.modalService.closeDynamicModal();
                
                const lang = state.profile.lang || 'fr';
                const message = this.messageService?.getToastMessage(lang, 'coachingModeChanged') || 
                               (lang === 'fr' ? 'Mode de coaching modifié' : 
                                lang === 'en' ? 'Coaching mode changed' : 'تم تغيير وضع التدريب');
                this.uiService?.showToast(message, 'success');
            }
        });
    }

    /**
     * Ouvre le modal de sélection de religion
     * @param {Object} state - State de l'application
     */
    async openReligionModal(state) {
        if (!this.modalService) {
            await this.initServices();
        }
        
        this.modalService.showReligionModal(state, async (selectedReligion) => {
            await this.model.updateReligion(state, selectedReligion);
            await this.render(state);
            this.modalService.closeDynamicModal();
        });
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
        
        await this.render(state);
        
        const lang = state.profile.lang || 'fr';
        const messageKey = enabled ? 'addictionEnabled' : 'addictionDisabled';
        const message = this.messageService?.getToastMessage(lang, messageKey) || 
                       (enabled ? 
                        (lang === 'fr' ? 'Addiction activée' : lang === 'en' ? 'Addiction enabled' : 'تم تفعيل الإدمان') :
                        (lang === 'fr' ? 'Addiction désactivée' : lang === 'en' ? 'Addiction disabled' : 'تم تعطيل الإدمان'));
        
        this.uiService?.showToast(message);
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
            const i18n = this.i18nService || (typeof window !== 'undefined' ? window.I18n : null);
            if (i18n?.loadSpiritualCards) {
                await i18n.loadSpiritualCards(state.profile.lang, state.profile.religion);
            }
        }
    }

    /**
     * Exporte les données
     * @param {Object} state - State de l'application
     */
    async exportData(state) {
        try {
            await this.model.exportData(state);
            const lang = state.profile.lang || 'fr';
            const message = this.i18nService?.t('export_success') || 
                           (lang === 'fr' ? 'Export réussi' : lang === 'en' ? 'Export successful' : 'تم التصدير بنجاح');
            this.uiService?.showToast(message, 'success');
        } catch (error) {
            if (this.errorHandler) {
                const lang = state.profile.lang || 'fr';
                const userMessage = this.i18nService?.t('import_error') || 
                                   (lang === 'fr' ? 'Erreur lors de l\'export' : lang === 'en' ? 'Export error' : 'خطأ في التصدير');
                this.errorHandler.handleWithUserMessage(error, 'SettingsController', userMessage);
            } else {
                console.error('[SettingsController] Erreur export:', error);
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
            
            // Utiliser le service storage ou window.Storage
            const storage = this.storageService || (typeof window !== 'undefined' ? window.Storage : null);
            if (storage?.saveState) {
                storage.saveState(result.state);
            }
            
            // Initialiser i18n
            const i18n = this.i18nService || (typeof window !== 'undefined' ? window.I18n : null);
            if (i18n?.initI18n) {
                await i18n.initI18n(result.state.profile.lang, result.state.profile.religion);
            }
            
            // Appliquer les traductions
            if (typeof window !== 'undefined' && window.Init?.applyTranslations) {
                window.Init.applyTranslations();
            }
            
            const lang = result.state.profile.lang || 'fr';
            const message = i18n?.t('import_success') || 
                           (lang === 'fr' ? 'Import réussi' : lang === 'en' ? 'Import successful' : 'تم الاستيراد بنجاح');
            this.uiService?.showToast(message, 'success');
            
            await this.render(result.state);
            
            if (typeof window !== 'undefined' && window.Home?.render) {
                window.Home.render(result.state);
            }
        } else {
            const lang = state.profile.lang || 'fr';
            const errorMessage = i18n?.t('import_error') || 
                                (lang === 'fr' ? 'Erreur lors de l\'import' : lang === 'en' ? 'Import error' : 'خطأ في الاستيراد');
            const fullMessage = `${errorMessage}: ${result.errors.join(', ')}`;
            this.uiService?.showToast(fullMessage, 'error');
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
        if (!this.uiService) {
            await this.initServices();
        }
        
        const ui = this._getUIService();
        if (!ui) {
            console.error('[SettingsController] UI service not available');
            return;
        }
        
        const lang = state.profile.lang || 'fr';
        const i18n = this.i18nService || (typeof window !== 'undefined' ? window.I18n : null);
        
        const html = `
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--space-md);">
                ${i18n?.t('import_password_prompt') || 'Entrez votre code PIN pour déchiffrer les données'}
            </p>
            <div class="form-group">
                <label class="form-label">${i18n?.t('import_password_placeholder') || 'Code PIN'}</label>
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
        
        const title = i18n?.t('import_password_required') || 
                     (lang === 'fr' ? 'Code PIN requis' : lang === 'en' ? 'PIN required' : 'رمز PIN مطلوب');
        const validateLabel = lang === 'fr' ? 'Valider' : lang === 'en' ? 'Validate' : 'التحقق';
        
        ui.showModal(title, html, async () => {
            await this.handlePasswordModalSubmit(encryptedData, state, input, lang);
        }, true, MODAL_ID_DYNAMIC, validateLabel);
        
        // Focus sur l'input après ouverture de la modale
        setTimeout(() => {
            const pinInput = document.getElementById('import-pin-input');
            if (pinInput) {
                pinInput.focus();
                pinInput.addEventListener('keypress', async (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        await this.handlePasswordModalSubmit(encryptedData, state, input, lang);
                    }
                });
            }
        }, MODAL_DELAY_MS);
    }

    /**
     * Gère la soumission du formulaire de PIN pour l'import
     * @private
     */
    async handlePasswordModalSubmit(encryptedData, state, input, lang) {
        const pinInput = document.getElementById('import-pin-input');
        const errorEl = document.getElementById('import-pin-error');
        
        if (!pinInput) return;
        
        const pin = pinInput.value.trim();
        const i18n = this.i18nService || (typeof window !== 'undefined' ? window.I18n : null);
        
        // Masquer l'erreur précédente
        if (errorEl) {
            errorEl.style.display = 'none';
        }
        
        if (!pin) {
            if (errorEl) {
                const placeholder = i18n?.t('import_password_placeholder') || 'Code PIN';
                errorEl.textContent = `${placeholder} requis`;
                errorEl.style.display = 'block';
            }
            return;
        }
        
        // Déchiffrer et importer
        const decryptResult = await this.model.decryptAndImportData(encryptedData, pin);
        
        if (decryptResult.valid) {
            await this.handleSuccessfulImport(decryptResult.state, input);
        } else {
            this.handleFailedImport(decryptResult, pinInput, errorEl, i18n);
        }
    }

    /**
     * Gère un import réussi
     * @private
     */
    async handleSuccessfulImport(newState, input) {
        // Mettre à jour le state global
        if (typeof window !== 'undefined') {
            window.state = newState;
        }
        
        // Sauvegarder
        const storage = this.storageService || (typeof window !== 'undefined' ? window.Storage : null);
        if (storage?.saveState) {
            storage.saveState(newState);
        }
        
        // Initialiser i18n
        const i18n = this.i18nService || (typeof window !== 'undefined' ? window.I18n : null);
        if (i18n?.initI18n) {
            await i18n.initI18n(newState.profile.lang, newState.profile.religion);
        }
        
        // Appliquer les traductions
        if (typeof window !== 'undefined' && window.Init?.applyTranslations) {
            window.Init.applyTranslations();
        }
        
        // Afficher message de succès
        const lang = newState.profile.lang || 'fr';
        const message = i18n?.t('import_success') || 
                       (lang === 'fr' ? 'Import réussi' : lang === 'en' ? 'Import successful' : 'تم الاستيراد بنجاح');
        this.uiService?.showToast(message, 'success');
        
        // Fermer modal et re-render
        this.uiService?.closeModal(MODAL_ID_DYNAMIC);
        await this.render(newState);
        
        if (typeof window !== 'undefined' && window.Home?.render) {
            window.Home.render(newState);
        }
        
        // Reset l'input
        if (input) input.value = '';
    }

    /**
     * Gère un import échoué
     * @private
     */
    handleFailedImport(decryptResult, pinInput, errorEl, i18n) {
        if (errorEl) {
            const errorMsg = decryptResult.errors && decryptResult.errors.length > 0 
                ? decryptResult.errors[0] 
                : (i18n?.t('import_password_incorrect') || 'Code PIN incorrect');
            errorEl.textContent = errorMsg;
            errorEl.style.display = 'block';
        }
        
        // Si c'est une erreur de PIN, permettre une nouvelle tentative
        if (decryptResult.needsPassword) {
            pinInput.value = '';
            pinInput.focus();
        }
    }

    /**
     * Toggle le verrouillage PIN
     * @param {boolean} enabled - Activé ou non
     */
    async togglePinLock(enabled) {
        const state = typeof window !== 'undefined' ? window.state : null;
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
        if (!this.uiService) {
            await this.initServices();
        }
        
        const ui = this._getUIService();
        if (!ui) {
            console.error('[SettingsController] UI service not available');
            return;
        }
        
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;

        const lang = state.profile.lang || 'fr';
        const html = this.pinView.renderSetPinModal(lang);

        const labels = {
            fr: { title: 'Définir un code PIN', set: 'Définir' },
            en: { title: 'Set PIN code', set: 'Set' },
            ar: { title: 'تعيين رمز PIN', set: 'تعيين' }
        };
        const l = labels[lang] || labels.fr;

        ui.showModal(l.title, html, async () => {
            await this.handleSetPin(lang, state);
        }, false, MODAL_ID_DYNAMIC, l.set);
        
        // Ajouter listener sur Enter
        setTimeout(() => {
            const pinConfirmInput = document.getElementById('pin-confirm-input');
            if (pinConfirmInput) {
                pinConfirmInput.addEventListener('keypress', async (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        await this.handleSetPin(lang, state);
                    }
                });
            }
        }, MODAL_DELAY_MS);
    }

    /**
     * Gère la définition du PIN
     * @private
     */
    async handleSetPin(lang, state) {
        if (!this.formService) {
            await this.initServices();
        }
        
        // Obtenir le service avec fallback
        const formService = this._getFormService();
        const messageService = this._getMessageService();
        
        const formData = formService.extractPinFormData({
            pinId: 'pin-input',
            pinConfirmId: 'pin-confirm-input'
        });
        
        if (!formData.elements.pinInput || !formData.elements.pinConfirmInput) {
            return;
        }

        this.pinView.hideError();

        // Validation
        const validation = this.pinModel.validatePin(formData.pin);
        if (!validation.valid) {
            this.pinView.showError(validation.error);
            return;
        }

        if (formData.pin !== formData.pinConfirm) {
            const errorMsg = messageService?.getPinMessage(lang, 'set', 'mismatch') ||
                           (lang === 'fr' ? 'Les codes PIN ne correspondent pas' :
                            lang === 'en' ? 'PIN codes do not match' :
                            'رموز PIN غير متطابقة');
            this.pinView.showError(errorMsg);
            return;
        }

        // Définir le PIN
        const success = await this.pinModel.setPin(formData.pin);
        if (success) {
            const ui = this._getUIService();
            if (ui) {
                ui.closeModal(MODAL_ID_DYNAMIC);
                const successMsg = messageService?.getPinMessage(lang, 'set', 'success') ||
                                 (lang === 'fr' ? 'Code PIN défini avec succès' :
                                  lang === 'en' ? 'PIN code set successfully' :
                                  'تم تعيين رمز PIN بنجاح');
                ui.showToast(successMsg, 'success');
            }
            await this.render(state);
        } else {
            const errorMsg = messageService?.getPinMessage(lang, 'set', 'error') ||
                           (lang === 'fr' ? 'Erreur lors de la définition du PIN' :
                            lang === 'en' ? 'Error setting PIN' :
                            'خطأ في تعيين رمز PIN');
            this.pinView.showError(errorMsg);
        }
    }

    /**
     * Ouvre le modal pour modifier le PIN
     */
    async openChangePinModal() {
        if (!this.uiService) {
            await this.initServices();
        }
        
        const ui = this._getUIService();
        if (!ui) {
            console.error('[SettingsController] UI service not available');
            return;
        }
        
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;

        const lang = state.profile.lang || 'fr';
        const html = this.pinView.renderChangePinModal(lang);

        const labels = {
            fr: { title: 'Modifier le code PIN', change: 'Modifier' },
            en: { title: 'Change PIN code', change: 'Change' },
            ar: { title: 'تغيير رمز PIN', change: 'تغيير' }
        };
        const l = labels[lang] || labels.fr;

        ui.showModal(l.title, html, async () => {
            await this.handleChangePin(lang, state);
        }, false, MODAL_ID_DYNAMIC, l.change);
        
        // Ajouter listener sur Enter
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
        }, MODAL_DELAY_MS);
    }

    /**
     * Gère le changement de PIN
     * @private
     */
    async handleChangePin(lang, state) {
        if (!this.formService) {
            await this.initServices();
        }
        
        // Obtenir les services avec fallback
        const formService = this._getFormService();
        const messageService = this._getMessageService();
        
        const formData = formService.extractPinFormData({
            oldPinId: 'pin-old-input',
            newPinId: 'pin-new-input',
            newPinConfirmId: 'pin-new-confirm-input'
        });
        
        if (!formData.elements.oldPinInput || !formData.elements.newPinInput || !formData.elements.newPinConfirmInput) {
            return;
        }

        this.pinView.hideError();

        // Validation
        const validation = this.pinModel.validatePin(formData.newPin);
        if (!validation.valid) {
            this.pinView.showError(validation.error);
            return;
        }

        if (formData.newPin !== formData.newPinConfirm) {
            const errorMsg = messageService?.getPinMessage(lang, 'change', 'mismatchNew') ||
                           (lang === 'fr' ? 'Les nouveaux codes PIN ne correspondent pas' :
                            lang === 'en' ? 'New PIN codes do not match' :
                            'رموز PIN الجديدة غير متطابقة');
            this.pinView.showError(errorMsg);
            return;
        }

        // Changer le PIN
        const success = await this.pinModel.changePin(formData.oldPin, formData.newPin);
        if (success) {
            const ui = this._getUIService();
            if (ui) {
                ui.closeModal(MODAL_ID_DYNAMIC);
                const successMsg = messageService?.getPinMessage(lang, 'change', 'success') ||
                                 (lang === 'fr' ? 'Code PIN modifié avec succès' :
                                  lang === 'en' ? 'PIN code changed successfully' :
                                  'تم تغيير رمز PIN بنجاح');
                ui.showToast(successMsg, 'success');
            }
            await this.render(state);
        } else {
            const errorMsg = messageService?.getPinMessage(lang, 'change', 'error') ||
                           (lang === 'fr' ? 'Ancien code PIN incorrect' :
                            lang === 'en' ? 'Wrong old PIN code' :
                            'رمز PIN القديم غير صحيح');
            this.pinView.showError(errorMsg);
        }
    }

    /**
     * Ouvre le modal pour désactiver le PIN
     */
    async openDisablePinModal() {
        if (!this.uiService) {
            await this.initServices();
        }
        
        const ui = this._getUIService();
        if (!ui) {
            console.error('[SettingsController] UI service not available');
            return;
        }
        
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;

        const lang = state.profile.lang || 'fr';
        
        const labels = {
            fr: {
                title: 'Désactiver le verrouillage',
                message: 'Pour désactiver le verrouillage, entre ton code PIN actuel',
                pinLabel: 'Code PIN',
                disable: 'Désactiver'
            },
            en: {
                title: 'Disable lock',
                message: 'To disable the lock, enter your current PIN code',
                pinLabel: 'PIN code',
                disable: 'Disable'
            },
            ar: {
                title: 'تعطيل القفل',
                message: 'لتعطيل القفل، أدخل رمز PIN الحالي',
                pinLabel: 'رمز PIN',
                disable: 'تعطيل'
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

        ui.showModal(l.title, html, async () => {
            await this.handleDisablePin(lang, state);
        }, true, MODAL_ID_DYNAMIC, l.disable);
    }

    /**
     * Gère la désactivation du PIN
     * @private
     */
    async handleDisablePin(lang, state) {
        const pinInput = document.getElementById('pin-disable-input');
        if (!pinInput) return;

        const pin = pinInput.value.trim();
        const errorEl = document.getElementById('pin-error');

        // Obtenir les services avec fallback
        const messageService = this._getMessageService();
        const ui = this._getUIService();

        // Désactiver le PIN
        const success = await this.pinModel.disablePin(pin);
        if (success) {
            if (ui) {
                ui.closeModal(MODAL_ID_DYNAMIC);
                const successMsg = messageService?.getPinMessage(lang, 'disable', 'success') ||
                                 (lang === 'fr' ? 'Verrouillage désactivé' :
                                  lang === 'en' ? 'Lock disabled' :
                                  'تم تعطيل القفل');
                ui.showToast(successMsg, 'success');
            }
            await this.render(state);
        } else {
            if (errorEl) {
                const wrongPinMsg = messageService?.getPinMessage(lang, 'disable', 'error') ||
                                  (lang === 'fr' ? 'Code PIN incorrect' :
                                   lang === 'en' ? 'Wrong PIN code' :
                                   'رمز PIN غير صحيح');
                errorEl.textContent = wrongPinMsg;
                errorEl.style.display = 'block';
            }
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
    async confirmClearData(state) {
        if (!this.uiService) {
            await this.initServices();
        }
        
        const ui = this._getUIService();
        if (!ui) {
            console.error('[SettingsController] UI service not available');
            return;
        }
        
        const i18n = this.i18nService || (typeof window !== 'undefined' ? window.I18n : null);
        const html = `
            <p style="text-align: center; color: var(--text-secondary);">
                ${i18n?.t('clear_confirm') || 'Êtes-vous sûr de vouloir effacer toutes les données ?'}
            </p>
        `;
        
        ui.showModal(
            i18n?.t('clear_data') || 'Effacer les données',
            html,
            async () => {
                const newState = this.model.clearData();
                if (typeof window !== 'undefined') {
                    window.state = newState;
                }
                ui.closeModal(MODAL_ID_DYNAMIC);
                
                const lang = newState.profile.lang || 'fr';
                const message = i18n?.t('reset_complete') || 
                               (lang === 'fr' ? 'Réinitialisation terminée' :
                                lang === 'en' ? 'Reset complete' : 'اكتملت إعادة التعيين');
                ui.showToast(message, 'success');
                
                // Rediriger vers l'onboarding avec le nouveau state
                if (typeof window !== 'undefined' && window.Onboarding?.show) {
                    window.Onboarding.show(newState);
                }
            },
            true,
            MODAL_ID_DYNAMIC
        );
    }

    /**
     * Active/désactive le verrouillage automatique
     * @param {Object} state - State de l'application
     * @param {boolean} enabled - Activé ou non
     */
    async toggleAutoLock(state, enabled) {
        if (!this.uiService || !this.messageService) {
            await this.initServices();
        }
        
        const success = await this.model.toggleAutoLock(state, enabled, this.securityService);
        
        if (!success && enabled) {
            // Échec : probablement PIN non défini
            const checkbox = document.getElementById('toggle-auto-lock');
            if (checkbox) checkbox.checked = false;
            
            const lang = state.profile.lang || 'fr';
            const msg = this.messageService?.getToastMessage(lang, 'autoLockPinRequired') ||
                       (lang === 'fr' ? 'Active d\'abord le verrouillage PIN dans les réglages' :
                        lang === 'en' ? 'Enable PIN lock in settings first' :
                        'قم بتفعيل قفل PIN في الإعدادات أولاً');
            this.uiService?.showToast(msg, 'info');
            return;
        }
        
        await this.render(state);
        
        const lang = state.profile.lang || 'fr';
        const messageKey = enabled ? 'autoLockEnabled' : 'autoLockDisabled';
        const msg = this.messageService?.getToastMessage(lang, messageKey) ||
                   (enabled ? 
                    (lang === 'fr' ? 'Verrouillage automatique activé' :
                     lang === 'en' ? 'Auto-lock enabled' :
                     'تم تفعيل القفل التلقائي') :
                    (lang === 'fr' ? 'Verrouillage automatique désactivé' :
                     lang === 'en' ? 'Auto-lock disabled' :
                     'تم تعطيل القفل التلقائي'));
        this.uiService?.showToast(msg, 'success');
    }

    /**
     * Active/désactive le verrouillage automatique au changement d'onglet
     * @param {Object} state - State de l'application
     * @param {boolean} enabled - Activé ou non
     */
    async toggleAutoLockOnTabBlur(state, enabled) {
        if (!this.uiService || !this.messageService) {
            await this.initServices();
        }
        
        const success = await this.model.toggleAutoLockOnTabBlur(state, enabled, this.securityService);
        
        if (!success && enabled) {
            // Échec : probablement PIN non défini
            const checkbox = document.getElementById('toggle-auto-lock-tab-blur');
            if (checkbox) checkbox.checked = false;
            
            const lang = state.profile.lang || 'fr';
            const msg = this.messageService?.getToastMessage(lang, 'autoLockPinRequired') ||
                       (lang === 'fr' ? 'Active d\'abord le verrouillage PIN dans les réglages' :
                        lang === 'en' ? 'Enable PIN lock in settings first' :
                        'قم بتفعيل قفل PIN في الإعدادات أولاً');
            this.uiService?.showToast(msg, 'info');
            return;
        }
        
        await this.render(state);
        
        const lang = state.profile.lang || 'fr';
        const messageKey = enabled ? 'autoLockTabBlurEnabled' : 'autoLockTabBlurDisabled';
        const msg = this.messageService?.getToastMessage(lang, messageKey) ||
                   (enabled ? 
                    (lang === 'fr' ? 'Verrouillage au changement d\'onglet activé' :
                     lang === 'en' ? 'Lock on tab change enabled' :
                     'تم تفعيل القفل عند تغيير علامة التبويب') :
                    (lang === 'fr' ? 'Verrouillage au changement d\'onglet désactivé' :
                     lang === 'en' ? 'Lock on tab change disabled' :
                     'تم تعطيل القفل عند تغيير علامة التبويب'));
        this.uiService?.showToast(msg, 'success');
    }

    /**
     * Ouvre le modal pour choisir le délai de verrouillage automatique
     * @param {Object} state - State de l'application
     */
    async openAutoLockDelayModal(state) {
        if (!this.modalService || !this.messageService) {
            await this.initServices();
        }
        
        const modalService = this.modalService;
        if (!modalService) {
            console.error('[SettingsController] ModalService not available');
            return;
        }
        
        const messageService = this._getMessageService();
        const ui = this._getUIService();
        
        modalService.showAutoLockDelayModal(state, async (delay) => {
            await this.model.updateAutoLockDelay(state, delay);
            modalService.closeDynamicModal();
            await this.render(state);
            
            const lang = state.profile.lang || 'fr';
            const successMsg = messageService?.getToastMessage(lang, 'delayUpdated') ||
                             (lang === 'fr' ? 'Délai mis à jour' :
                              lang === 'en' ? 'Delay updated' :
                              'تم تحديث التأخير');
            if (ui) {
                ui.showToast(successMsg, 'success');
            }
        });
    }
}
