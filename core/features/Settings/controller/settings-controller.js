/**
 * Settings Controller - Orchestration Model/View
 */

import { SettingsModel } from '../model/settings-model.js';
import { SettingsView } from '../view/settings-view.js';

export class SettingsController {
    constructor() {
        this.model = new SettingsModel();
        this.view = new SettingsView();
    }

    /**
     * Rend l'écran de réglages
     * @param {Object} state - State de l'application
     */
    render(state) {
        const getAddictionIcon = (id) => this.model.getAddictionIcon(id);
        this.view.render(state, getAddictionIcon);
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
