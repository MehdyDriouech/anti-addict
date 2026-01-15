/**
 * Onboarding View - Rendu HTML pour l'onboarding
 */

export class OnboardingView {
    /**
     * Affiche l'onboarding
     */
    show() {
        const onboarding = document.getElementById('onboarding');
        if (onboarding) {
            onboarding.classList.remove('hidden');
        }
    }

    /**
     * Cache l'onboarding
     */
    hide() {
        const onboarding = document.getElementById('onboarding');
        if (onboarding) {
            onboarding.classList.add('hidden');
        }
    }

    /**
     * Rend le contenu d'onboarding
     * @param {Object} state - State de l'application
     * @param {Function} onLangChange - Callback pour changement de langue
     * @param {Function} onReligionChange - Callback pour changement de religion
     * @param {string} step - Étape actuelle ('mode', 'main', 'pin', ou 'import')
     */
    renderContent(state, onLangChange, onReligionChange, step = 'mode') {
        if (step === 'mode') {
            return this.renderModeSelection(state);
        }
        if (step === 'pin') {
            return this.renderPinStep(state);
        }
        if (step === 'import') {
            return this.renderImportMode(state);
        }
        const container = document.getElementById('onboarding-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="onboarding-icon">🌟</div>
            <h1 class="onboarding-title">${I18n.t('onboarding_welcome')}</h1>
            <p class="onboarding-desc">${I18n.t('onboarding_desc')}</p>
            <div class="onboarding-privacy">
                <span>🔒</span>
                <span>${I18n.t('onboarding_privacy')}</span>
            </div>
            
            <div class="onboarding-form">
                <div class="form-group">
                    <label class="form-label">${I18n.t('language')}</label>
                    <select class="form-select" id="onboard-lang">
                        <option value="fr" ${state.profile.lang === 'fr' ? 'selected' : ''}>Français</option>
                        <option value="en" ${state.profile.lang === 'en' ? 'selected' : ''}>English</option>
                        <option value="ar" ${state.profile.lang === 'ar' ? 'selected' : ''}>العربية</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">${I18n.t('religion')}</label>
                    <select class="form-select" id="onboard-religion">
                        <option value="none" ${state.profile.religion === 'none' ? 'selected' : ''}>${I18n.t('religion_none')}</option>
                        <option value="islam" ${state.profile.religion === 'islam' ? 'selected' : ''}>${I18n.t('religion_islam')}</option>
                        <option value="christianity" ${state.profile.religion === 'christianity' ? 'selected' : ''}>${I18n.t('religion_christianity')}</option>
                        <option value="judaism" ${state.profile.religion === 'judaism' ? 'selected' : ''}>${I18n.t('religion_judaism')}</option>
                        <option value="buddhism" ${state.profile.religion === 'buddhism' ? 'selected' : ''}>${I18n.t('religion_buddhism')}</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">${I18n.t('select_addictions')}</label>
                    <div class="checkbox-group">
                        ${(typeof AddictionsConfig !== 'undefined' && AddictionsConfig.getAllAddictionIds ? AddictionsConfig.getAllAddictionIds() : ['porn', 'cigarette', 'alcohol', 'drugs']).map(id => {
                            const config = typeof AddictionsConfig !== 'undefined' && AddictionsConfig.getAddictionConfig ? AddictionsConfig.getAddictionConfig(id) : null;
                            const hasDisclaimer = config && config.disclaimerKey ? true : false;
                            return `
                                <label class="checkbox-item">
                                    <input type="checkbox" value="${id}" id="onboard-addiction-${id}" 
                                           ${hasDisclaimer ? 'data-disclaimer="' + config.disclaimerKey + '"' : ''}>
                                    <span>${I18n.t('addiction_' + id)}${hasDisclaimer ? ' ⚠️' : ''}</span>
                                </label>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            
            <button class="btn btn-primary btn-lg btn-block" onclick="Onboarding.nextStep()">
                ${I18n.t('continue') || 'Continuer'}
            </button>
        `;
        
        // Écouter le changement de langue
        const langSelect = document.getElementById('onboard-lang');
        if (langSelect) {
            langSelect.addEventListener('change', onLangChange);
        }
        
        // Écouter le changement de religion
        const religionSelect = document.getElementById('onboard-religion');
        if (religionSelect) {
            religionSelect.addEventListener('change', onReligionChange);
        }
    }

    /**
     * Rend l'étape PIN (optionnelle)
     * @param {Object} state - State de l'application
     * @returns {string} HTML
     */
    renderPinStep(state) {
        const lang = state.profile.lang || 'fr';
        const labels = {
            fr: {
                title: 'Sécurité',
                desc: 'Tu peux définir un code PIN pour protéger tes données. Tu pourras le modifier plus tard dans les réglages.',
                pinLabel: 'Code PIN (min. 4 chiffres)',
                confirmLabel: 'Confirmer le code PIN',
                set: 'Définir le PIN',
                skip: 'Passer cette étape',
                pinMismatch: 'Les codes PIN ne correspondent pas',
                pinTooShort: 'Le PIN doit contenir au moins 4 chiffres'
            },
            en: {
                title: 'Security',
                desc: 'You can set a PIN code to protect your data. You can change it later in settings.',
                pinLabel: 'PIN code (min. 4 digits)',
                confirmLabel: 'Confirm PIN code',
                set: 'Set PIN',
                skip: 'Skip this step',
                pinMismatch: 'PIN codes do not match',
                pinTooShort: 'PIN must be at least 4 digits'
            },
            ar: {
                title: 'الأمان',
                desc: 'يمكنك تعيين رمز PIN لحماية بياناتك. يمكنك تغييره لاحقاً في الإعدادات.',
                pinLabel: 'رمز PIN (4 أرقام على الأقل)',
                confirmLabel: 'تأكيد رمز PIN',
                set: 'تعيين PIN',
                skip: 'تخطي هذه الخطوة',
                pinMismatch: 'رموز PIN غير متطابقة',
                pinTooShort: 'يجب أن يحتوي PIN على 4 أرقام على الأقل'
            }
        };
        const l = labels[lang] || labels.fr;

        const container = document.getElementById('onboarding-content');
        if (!container) return '';
        
        container.innerHTML = `
            <div class="onboarding-icon">🔒</div>
            <h1 class="onboarding-title">${l.title}</h1>
            <p class="onboarding-desc">${l.desc}</p>
            
            <div class="onboarding-form">
                <div class="form-group">
                    <label class="form-label">${l.pinLabel}</label>
                    <input type="password" 
                           id="onboard-pin-input" 
                           class="form-input" 
                           inputmode="numeric" 
                           pattern="[0-9]*"
                           maxlength="10"
                           placeholder="1234">
                </div>
                <div class="form-group">
                    <label class="form-label">${l.confirmLabel}</label>
                    <input type="password" 
                           id="onboard-pin-confirm-input" 
                           class="form-input" 
                           inputmode="numeric" 
                           pattern="[0-9]*"
                           maxlength="10"
                           placeholder="1234">
                </div>
                <div id="onboard-pin-error" class="error-message" style="display: none;"></div>
            </div>
            
            <button class="btn btn-primary btn-lg btn-block" onclick="Onboarding.completeWithPin()">
                ${l.set}
            </button>
            <button class="btn btn-ghost btn-block mt-sm" onclick="Onboarding.skipPin()">
                ${l.skip}
            </button>
        `;
        
        return '';
    }

    /**
     * Rend l'écran de sélection de mode
     * @param {Object} state - State de l'application
     */
    renderModeSelection(state) {
        const lang = state.profile.lang || 'fr';
        const container = document.getElementById('onboarding-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="onboarding-icon">🌟</div>
            <h1 class="onboarding-title">${I18n.t('onboarding_mode_selection') || 'Choisissez un mode'}</h1>
            <p class="onboarding-desc">${I18n.t('onboarding_desc') || 'Configure ton espace personnel. Toutes tes données restent sur ton appareil.'}</p>
            
            <div class="onboarding-form" style="margin-top: var(--space-lg);">
                <button class="btn btn-primary btn-lg btn-block" onclick="Onboarding.selectMode('new')" style="margin-bottom: var(--space-md);">
                    <div style="text-align: left;">
                        <div style="font-weight: 600; margin-bottom: var(--space-xs);">${I18n.t('onboarding_mode_new_user') || 'Nouvel utilisateur'}</div>
                        <div style="font-size: 0.9em; opacity: 0.8;">${I18n.t('onboarding_mode_new_user_desc') || 'Créer un nouveau profil'}</div>
                    </div>
                </button>
                
                <button class="btn btn-secondary btn-lg btn-block" onclick="Onboarding.selectMode('import')">
                    <div style="text-align: left;">
                        <div style="font-weight: 600; margin-bottom: var(--space-xs);">${I18n.t('onboarding_mode_import') || 'Importer des données'}</div>
                        <div style="font-size: 0.9em; opacity: 0.8;">${I18n.t('onboarding_mode_import_desc') || 'Restaurer depuis un fichier d\'export'}</div>
                    </div>
                </button>
            </div>
        `;
    }

    /**
     * Rend l'écran d'import de données
     * @param {Object} state - State de l'application
     */
    renderImportMode(state) {
        const lang = state.profile.lang || 'fr';
        const container = document.getElementById('onboarding-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="onboarding-icon">📥</div>
            <h1 class="onboarding-title">${I18n.t('onboarding_mode_import') || 'Importer des données'}</h1>
            <p class="onboarding-desc">${I18n.t('onboarding_mode_import_desc') || 'Restaurer depuis un fichier d\'export'}</p>
            
            <div class="onboarding-form">
                <div class="form-group">
                    <label class="form-label">${I18n.t('onboarding_import_file_label') || 'Fichier d\'import'}</label>
                    <input type="file" 
                           id="onboard-import-file" 
                           class="form-input" 
                           accept=".json"
                           style="padding: var(--space-sm);">
                    <small style="display: block; margin-top: var(--space-xs); color: var(--text-secondary);">
                        ${I18n.t('select_file') || 'Sélectionner un fichier'}
                    </small>
                </div>
                
                <div class="form-group" id="onboard-import-pin-group" style="display: none;">
                    <label class="form-label">${I18n.t('onboarding_import_pin_label') || 'Code PIN du fichier'}</label>
                    <input type="password" 
                           id="onboard-import-pin-input" 
                           class="form-input" 
                           inputmode="numeric" 
                           pattern="[0-9]*"
                           maxlength="10"
                           placeholder="1234">
                    <small style="display: block; margin-top: var(--space-xs); color: var(--text-secondary);">
                        ${I18n.t('onboarding_import_pin_desc') || 'Entrez le code PIN utilisé lors de l\'export'}
                    </small>
                </div>
                
                <div id="onboard-import-error" class="error-message" style="display: none;"></div>
            </div>
            
            <button class="btn btn-primary btn-lg btn-block" onclick="Onboarding.handleImportMode()">
                ${I18n.t('onboarding_import_button') || 'Importer'}
            </button>
            <button class="btn btn-ghost btn-block mt-sm" onclick="Onboarding.selectMode('new')">
                ${I18n.t('back') || 'Retour'}
            </button>
        `;
        
        // Écouter le changement de fichier pour détecter si un PIN est nécessaire
        const fileInput = document.getElementById('onboard-import-file');
        if (fileInput) {
            fileInput.addEventListener('change', async (e) => {
                if (e.target.files && e.target.files[0]) {
                    // Le controller vérifiera si un PIN est nécessaire
                    await Onboarding.checkImportFile(e.target.files[0]);
                }
            });
        }
    }

    /**
     * Affiche le modal de disclaimer
     * @param {Array} addictionsWithDisclaimer - Liste des addictions avec disclaimer
     * @param {string} lang - Langue
     * @returns {Promise<boolean>} Si l'utilisateur a accepté
     */
    async showDisclaimerModal(addictionsWithDisclaimer, lang) {
        return new Promise((resolve) => {
            if (addictionsWithDisclaimer.length === 0) {
                resolve(true);
                return;
            }
            
            const disclaimerTexts = addictionsWithDisclaimer.map(a => {
                const key = a.disclaimerKey;
                return I18n.t(key) || key;
            }).join('\n\n');
            
            const html = `
                <div style="text-align: center; padding: var(--space-md);">
                    <p style="margin-bottom: var(--space-md);">${disclaimerTexts}</p>
                </div>
            `;
            
            if (typeof UI !== 'undefined') {
                UI.showModal(
                    I18n.t('disclaimer_title') || 'Avertissement',
                    html,
                    () => {
                        UI.closeModal('dynamic-modal');
                        resolve(true);
                    },
                    false
                );
                
                // Ajouter un bouton "Refuser"
                const modal = document.getElementById('dynamic-modal');
                if (modal) {
                    const footer = modal.querySelector('.modal-footer');
                    if (footer) {
                        const cancelBtn = footer.querySelector('.btn-secondary');
                        if (cancelBtn) {
                            cancelBtn.onclick = () => {
                                UI.closeModal('dynamic-modal');
                                resolve(false);
                            };
                        }
                    }
                }
            } else {
                resolve(true);
            }
        });
    }
}
