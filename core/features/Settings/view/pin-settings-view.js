/**
 * PinSettingsView - Vue pour les réglages PIN
 */

export class PinSettingsView {
    /**
     * Rend la section PIN dans les réglages
     * @param {boolean} hasPin - Si un PIN est défini
     * @param {boolean} isEnabled - Si le verrouillage est activé
     * @param {string} lang - Langue
     * @returns {string} HTML
     */
    renderSection(hasPin, isEnabled, lang) {
        const labels = {
            fr: {
                title: 'Sécurité',
                pinEnabled: 'Verrouillage par code PIN',
                pinEnabledDesc: 'Protège tes données avec un code PIN',
                setPin: 'Définir un code PIN',
                changePin: 'Modifier le code PIN',
                disablePin: 'Désactiver le verrouillage'
            },
            en: {
                title: 'Security',
                pinEnabled: 'PIN lock',
                pinEnabledDesc: 'Protect your data with a PIN code',
                setPin: 'Set PIN code',
                changePin: 'Change PIN code',
                disablePin: 'Disable lock'
            },
            ar: {
                title: 'الأمان',
                pinEnabled: 'قفل برمز PIN',
                pinEnabledDesc: 'احمِ بياناتك برمز PIN',
                setPin: 'تعيين رمز PIN',
                changePin: 'تغيير رمز PIN',
                disablePin: 'تعطيل القفل'
            }
        };

        const l = labels[lang] || labels.fr;

        return `
            <div class="settings-section">
                <div class="settings-title">🔒 ${l.title}</div>
                <div class="settings-list">
                    <div class="settings-item">
                        <div class="settings-item-left">
                            <div class="settings-item-icon">🔒</div>
                            <div class="settings-item-text">
                                <span class="settings-item-title">${l.pinEnabled}</span>
                                <span class="settings-item-value">${l.pinEnabledDesc}</span>
                            </div>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" id="toggle-pin" 
                                   ${isEnabled ? 'checked' : ''}
                                   onchange="Settings.togglePinLock(this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    ${hasPin ? `
                        <div class="settings-item" onclick="Settings.openChangePinModal()">
                            <div class="settings-item-left">
                                <div class="settings-item-icon">🔑</div>
                                <div class="settings-item-text">
                                    <span class="settings-item-title">${l.changePin}</span>
                                </div>
                            </div>
                            <div class="settings-item-right">›</div>
                        </div>
                    ` : `
                        <div class="settings-item" onclick="Settings.openSetPinModal()">
                            <div class="settings-item-left">
                                <div class="settings-item-icon">🔑</div>
                                <div class="settings-item-text">
                                    <span class="settings-item-title">${l.setPin}</span>
                                </div>
                            </div>
                            <div class="settings-item-right">›</div>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    /**
     * Rend le modal pour définir un PIN
     * @param {string} lang - Langue
     * @returns {string} HTML
     */
    renderSetPinModal(lang) {
        const labels = {
            fr: {
                title: 'Définir un code PIN',
                pinLabel: 'Code PIN (min. 4 chiffres)',
                confirmLabel: 'Confirmer le code PIN',
                set: 'Définir',
                cancel: 'Annuler',
                pinMismatch: 'Les codes PIN ne correspondent pas',
                pinTooShort: 'Le PIN doit contenir au moins 4 chiffres'
            },
            en: {
                title: 'Set PIN code',
                pinLabel: 'PIN code (min. 4 digits)',
                confirmLabel: 'Confirm PIN code',
                set: 'Set',
                cancel: 'Cancel',
                pinMismatch: 'PIN codes do not match',
                pinTooShort: 'PIN must be at least 4 digits'
            },
            ar: {
                title: 'تعيين رمز PIN',
                pinLabel: 'رمز PIN (4 أرقام على الأقل)',
                confirmLabel: 'تأكيد رمز PIN',
                set: 'تعيين',
                cancel: 'إلغاء',
                pinMismatch: 'رموز PIN غير متطابقة',
                pinTooShort: 'يجب أن يحتوي PIN على 4 أرقام على الأقل'
            }
        };

        const l = labels[lang] || labels.fr;

        return `
            <div class="form-group">
                <label class="form-label">${l.pinLabel}</label>
                <input type="password" 
                       id="pin-input" 
                       class="form-input" 
                       inputmode="numeric" 
                       pattern="[0-9]*"
                       maxlength="10"
                       placeholder="1234">
            </div>
            <div class="form-group">
                <label class="form-label">${l.confirmLabel}</label>
                <input type="password" 
                       id="pin-confirm-input" 
                       class="form-input" 
                       inputmode="numeric" 
                       pattern="[0-9]*"
                       maxlength="10"
                       placeholder="1234">
            </div>
            <div id="pin-error" class="error-message" style="display: none;"></div>
        `;
    }

    /**
     * Rend le modal pour modifier le PIN
     * @param {string} lang - Langue
     * @returns {string} HTML
     */
    renderChangePinModal(lang) {
        const labels = {
            fr: {
                title: 'Modifier le code PIN',
                oldPinLabel: 'Ancien code PIN',
                newPinLabel: 'Nouveau code PIN (min. 4 chiffres)',
                confirmLabel: 'Confirmer le nouveau code PIN',
                change: 'Modifier',
                cancel: 'Annuler',
                wrongOldPin: 'Ancien code PIN incorrect',
                pinMismatch: 'Les nouveaux codes PIN ne correspondent pas',
                pinTooShort: 'Le PIN doit contenir au moins 4 chiffres'
            },
            en: {
                title: 'Change PIN code',
                oldPinLabel: 'Old PIN code',
                newPinLabel: 'New PIN code (min. 4 digits)',
                confirmLabel: 'Confirm new PIN code',
                change: 'Change',
                cancel: 'Cancel',
                wrongOldPin: 'Wrong old PIN code',
                pinMismatch: 'New PIN codes do not match',
                pinTooShort: 'PIN must be at least 4 digits'
            },
            ar: {
                title: 'تغيير رمز PIN',
                oldPinLabel: 'رمز PIN القديم',
                newPinLabel: 'رمز PIN الجديد (4 أرقام على الأقل)',
                confirmLabel: 'تأكيد رمز PIN الجديد',
                change: 'تغيير',
                cancel: 'إلغاء',
                wrongOldPin: 'رمز PIN القديم غير صحيح',
                pinMismatch: 'رموز PIN الجديدة غير متطابقة',
                pinTooShort: 'يجب أن يحتوي PIN على 4 أرقام على الأقل'
            }
        };

        const l = labels[lang] || labels.fr;

        return `
            <div class="form-group">
                <label class="form-label">${l.oldPinLabel}</label>
                <input type="password" 
                       id="pin-old-input" 
                       class="form-input" 
                       inputmode="numeric" 
                       pattern="[0-9]*"
                       maxlength="10"
                       placeholder="1234">
            </div>
            <div class="form-group">
                <label class="form-label">${l.newPinLabel}</label>
                <input type="password" 
                       id="pin-new-input" 
                       class="form-input" 
                       inputmode="numeric" 
                       pattern="[0-9]*"
                       maxlength="10"
                       placeholder="1234">
            </div>
            <div class="form-group">
                <label class="form-label">${l.confirmLabel}</label>
                <input type="password" 
                       id="pin-new-confirm-input" 
                       class="form-input" 
                       inputmode="numeric" 
                       pattern="[0-9]*"
                       maxlength="10"
                       placeholder="1234">
            </div>
            <div id="pin-error" class="error-message" style="display: none;"></div>
        `;
    }

    /**
     * Affiche une erreur dans le modal
     * @param {string} message - Message d'erreur
     */
    showError(message) {
        const errorEl = document.getElementById('pin-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    /**
     * Cache l'erreur
     */
    hideError() {
        const errorEl = document.getElementById('pin-error');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }
}
