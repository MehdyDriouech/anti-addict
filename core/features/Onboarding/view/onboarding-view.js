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
     */
    renderContent(state, onLangChange, onReligionChange) {
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
            
            <button class="btn btn-primary btn-lg btn-block" onclick="Onboarding.complete()">
                ${I18n.t('start')}
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
