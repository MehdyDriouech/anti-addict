/**
 * ModalService.js - Service centralisé pour la gestion des modales
 * 
 * Extrait toute la logique DOM des modales des controllers pour améliorer
 * la séparation des responsabilités.
 */

import { MODAL_ID_DYNAMIC, MODAL_DELAY_MS, DEFAULT_AUTO_LOCK_DELAY_MS } from '../Constants/AppConstants.js';

export class ModalService {
    constructor(uiService, i18nService, messageService) {
        this.uiService = uiService;
        this.i18n = i18nService;
        this.messageService = messageService;
    }

    /**
     * Affiche le modal de sélection de langue
     * @param {Object} state - State de l'application
     * @param {Function} onConfirm - Callback avec la langue sélectionnée
     */
    showLanguageModal(state, onConfirm) {
        const currentLang = state.profile.lang || 'fr';
        const html = `
            <div class="form-group">
                <div class="checkbox-group">
                    <label class="checkbox-item">
                        <input type="radio" name="lang" value="fr" ${currentLang === 'fr' ? 'checked' : ''}>
                        <span>🇫🇷 Français</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="radio" name="lang" value="en" ${currentLang === 'en' ? 'checked' : ''}>
                        <span>🇬🇧 English</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="radio" name="lang" value="ar" ${currentLang === 'ar' ? 'checked' : ''}>
                        <span>🇸🇦 العربية</span>
                    </label>
                </div>
            </div>
        `;
        
        this.uiService.showModal(
            this.i18n?.t('language') || 'Langue',
            html,
            async () => {
                const selected = document.querySelector('input[name="lang"]:checked');
                if (selected && onConfirm) {
                    await onConfirm(selected.value);
                }
            },
            false,
            MODAL_ID_DYNAMIC
        );
    }

    /**
     * Affiche le modal de sélection de religion
     * @param {Object} state - State de l'application
     * @param {Function} onConfirm - Callback avec la religion sélectionnée
     */
    showReligionModal(state, onConfirm) {
        const currentReligion = state.profile.religion || 'none';
        const html = `
            <div class="form-group">
                <div class="checkbox-group">
                    <label class="checkbox-item">
                        <input type="radio" name="religion" value="none" ${currentReligion === 'none' ? 'checked' : ''}>
                        <span>${this.i18n?.t('religion_none') || 'Aucune'}</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="radio" name="religion" value="islam" ${currentReligion === 'islam' ? 'checked' : ''}>
                        <span>☪️ ${this.i18n?.t('religion_islam') || 'Islam'}</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="radio" name="religion" value="christianity" ${currentReligion === 'christianity' ? 'checked' : ''}>
                        <span>✝️ ${this.i18n?.t('religion_christianity') || 'Christianisme'}</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="radio" name="religion" value="judaism" ${currentReligion === 'judaism' ? 'checked' : ''}>
                        <span>✡️ ${this.i18n?.t('religion_judaism') || 'Judaïsme'}</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="radio" name="religion" value="buddhism" ${currentReligion === 'buddhism' ? 'checked' : ''}>
                        <span>☸️ ${this.i18n?.t('religion_buddhism') || 'Bouddhisme'}</span>
                    </label>
                </div>
            </div>
        `;
        
        this.uiService.showModal(
            this.i18n?.t('religion') || 'Religion',
            html,
            async () => {
                const selected = document.querySelector('input[name="religion"]:checked');
                if (selected && onConfirm) {
                    await onConfirm(selected.value);
                }
            },
            false,
            MODAL_ID_DYNAMIC
        );
    }

    /**
     * Affiche le modal de sélection du mode de coaching
     * @param {Object} state - State de l'application
     * @param {Object} coachingModes - Objet COACHING_MODES
     * @param {Function} onConfirm - Callback avec le mode sélectionné
     */
    async showCoachingModeModal(state, coachingModes, onConfirm) {
        const currentMode = state.coaching?.mode || 'stability';
        const lang = state.profile.lang || 'fr';
        
        const modes = ['observer', 'stability', 'guided', 'silent'];
        const html = `
            <div class="form-group">
                <div class="checkbox-group">
                    ${modes.map(mode => {
                        const modeData = coachingModes[mode]?.[lang] || coachingModes[mode]?.fr;
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
        
        this.uiService.showModal(
            this.i18n?.t('coaching.mode.title') || 'Mode de coaching',
            html,
            async () => {
                const selected = document.querySelector('input[name="coaching-mode"]:checked');
                if (selected && onConfirm) {
                    await onConfirm(selected.value);
                }
            },
            false,
            MODAL_ID_DYNAMIC
        );
    }

    /**
     * Affiche le modal de sélection du délai de verrouillage automatique
     * @param {Object} state - State de l'application
     * @param {Function} onConfirm - Callback avec le délai sélectionné (en ms)
     */
    showAutoLockDelayModal(state, onConfirm) {
        const lang = state.profile.lang || 'fr';
        const currentDelay = state.settings?.autoLock?.delay || DEFAULT_AUTO_LOCK_DELAY_MS;
        
        const delayOptions = [
            { value: 30000, label: this.i18n?.t('auto_lock_delay_30s') || '30 secondes' },
            { value: 60000, label: this.i18n?.t('auto_lock_delay_1min') || '1 minute' },
            { value: 120000, label: this.i18n?.t('auto_lock_delay_2min') || '2 minutes' },
            { value: 300000, label: this.i18n?.t('auto_lock_delay_5min') || '5 minutes' },
            { value: 600000, label: this.i18n?.t('auto_lock_delay_10min') || '10 minutes' }
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
        
        const saveLabel = lang === 'fr' ? 'Enregistrer' : lang === 'en' ? 'Save' : 'حفظ';
        
        this.uiService.showModal(
            this.i18n?.t('auto_lock_delay') || 'Délai de verrouillage',
            html,
            async () => {
                const selected = document.querySelector('input[name="auto-lock-delay"]:checked');
                if (selected && onConfirm) {
                    const delay = parseInt(selected.value, 10);
                    await onConfirm(delay);
                }
            },
            true,
            MODAL_ID_DYNAMIC,
            saveLabel
        );
    }

    /**
     * Ferme le modal dynamique
     */
    closeDynamicModal() {
        this.uiService.closeModal(MODAL_ID_DYNAMIC);
    }
}
