/**
 * Craving View - Rendu HTML pour le protocole de craving
 */

export class CravingView {
    /**
     * Rend l'écran de craving
     * @param {Object} state - State de l'application
     * @param {Array} suggestedActions - Actions suggérées
     * @param {string} lang - Langue
     * @param {string} selectedAddictionId - ID de l'addiction sélectionnée (optionnel)
     */
    render(state, suggestedActions, lang, selectedAddictionId = null) {
        const screen = document.getElementById('screen-craving');
        if (!screen) return;
        
        const labels = {
            fr: { suggestedActions: 'Actions suggérées', hadEpisode: 'J\'ai eu un épisode', selectAddiction: 'Pour quelle addiction ?' },
            en: { suggestedActions: 'Suggested actions', hadEpisode: 'I had an episode', selectAddiction: 'For which addiction?' },
            ar: { suggestedActions: 'إجراءات مقترحة', hadEpisode: 'حدث لي انتكاس', selectAddiction: 'لأي إدمان؟' }
        };
        const l = labels[lang] || labels.fr;
        
        // Générer le sélecteur d'addiction si plusieurs addictions actives
        const activeAddictions = state.addictions || [];
        const addictionSelector = this.renderAddictionSelector(state, selectedAddictionId || (activeAddictions[0]?.id || null), 'onCravingAddictionChange');
        
        screen.innerHTML = `
            <div class="protocol-container">
                <!-- Sélecteur d'addiction -->
                ${addictionSelector}
                
                <!-- Header -->
                <div class="protocol-header">
                    <h1 class="protocol-title">${I18n.t('protocol_title')}</h1>
                    <p class="protocol-subtitle">${I18n.t('protocol_subtitle')}</p>
                </div>
                
                <!-- Progress Bar -->
                <div class="protocol-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" id="protocol-progress-bar" style="width: 0%"></div>
                    </div>
                    <div class="progress-text">
                        <span id="protocol-time">0</span> / 90s
                    </div>
                </div>
                
                <!-- Steps -->
                <div class="protocol-steps" id="protocol-steps">
                    <div class="protocol-step" data-step="1">
                        <div class="protocol-step-number">1</div>
                        <div class="protocol-step-text">${I18n.t('protocol_step1')}</div>
                    </div>
                    <div class="protocol-step" data-step="2">
                        <div class="protocol-step-number">2</div>
                        <div class="protocol-step-text">${I18n.t('protocol_step2')}</div>
                    </div>
                    <div class="protocol-step" data-step="3">
                        <div class="protocol-step-number">3</div>
                        <div class="protocol-step-text">${I18n.t('protocol_step3')}</div>
                    </div>
                    <div class="protocol-step" data-step="4">
                        <div class="protocol-step-number">4</div>
                        <div class="protocol-step-text">${I18n.t('protocol_step4')}</div>
                    </div>
                    <div class="protocol-step" data-step="5">
                        <div class="protocol-step-number">5</div>
                        <div class="protocol-step-text">${I18n.t('protocol_step5')}</div>
                    </div>
                </div>
                
                <!-- Action Button -->
                <button class="protocol-action-btn" id="protocol-action-btn" onclick="confirmProtocolStep()">
                    ${I18n.t('protocol_moved')}
                </button>
                
                <!-- Suggested Actions -->
                ${suggestedActions.length > 0 ? `
                    <div class="suggested-actions">
                        <h4>${l.suggestedActions}</h4>
                        <div class="action-chips">
                            ${suggestedActions.map(a => `
                                <span class="chip action-chip" onclick="markActionDone(this)">${a.label}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Breathing Section -->
                <div class="breathing-section">
                    <h3 class="breathing-title">${I18n.t('breathing_title')}</h3>
                    <div class="breathing-circle-container">
                        <div class="breathing-circle" id="breathing-circle">
                            <div class="breathing-label" id="breathing-label">${I18n.t('breathing_inhale')}</div>
                            <div class="breathing-count" id="breathing-count">4</div>
                        </div>
                    </div>
                    <div class="breathing-total" id="breathing-total">60s</div>
                </div>
                
                <!-- Intensity Section -->
                <div class="intensity-section">
                    <h3 class="intensity-title">${I18n.t('how_feel_now')}</h3>
                    <div class="intensity-label">${I18n.t('intensity_label')}</div>
                    <div class="intensity-slider-container">
                        <input type="range" class="intensity-slider" id="intensity-slider" 
                               min="1" max="5" value="3" oninput="updateIntensity(this.value)">
                    </div>
                    <div class="intensity-labels">
                        <span>1 - ${I18n.t('intensity_very_low')}</span>
                        <span>5 - ${I18n.t('intensity_very_high')}</span>
                    </div>
                    <div class="intensity-value" id="intensity-value">3</div>
                </div>
                
                <!-- Encouragement Button -->
                <button class="encouragement-btn" id="encouragement-btn" onclick="showEncouragement()">
                    ${I18n.t('show_encouragement')}
                </button>
                
                <!-- Encouragement Card (hidden initially) -->
                <div id="encouragement-container"></div>
                
                <!-- Bottom buttons -->
                <div class="protocol-bottom-buttons">
                    <button class="back-to-calm-btn" onclick="finishProtocol()">
                        ✓ ${I18n.t('back_to_calm')}
                    </button>
                    <button class="btn btn-danger btn-small" onclick="openRelapseFromCraving()">
                        ${l.hadEpisode}
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Met à jour la barre de progression
     * @param {number} seconds - Secondes écoulées
     */
    updateProgress(seconds) {
        const progressBar = document.getElementById('protocol-progress-bar');
        const timeDisplay = document.getElementById('protocol-time');
        
        if (progressBar) {
            const percentage = Math.min((seconds / 90) * 100, 100);
            progressBar.style.width = `${percentage}%`;
        }
        
        if (timeDisplay) {
            timeDisplay.textContent = seconds;
        }
    }

    /**
     * Met à jour l'état des étapes
     * @param {number} seconds - Secondes écoulées
     */
    updateSteps(seconds) {
        const steps = document.querySelectorAll('.protocol-step');
        const currentStep = Math.min(Math.floor(seconds / 18) + 1, 5);
        
        steps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum < currentStep) {
                step.classList.add('completed');
            } else if (stepNum === currentStep) {
                step.classList.add('active');
            }
        });
    }

    /**
     * Marque toutes les étapes comme complétées
     */
    markAllStepsCompleted() {
        const steps = document.querySelectorAll('.protocol-step');
        steps.forEach(step => {
            step.classList.remove('active');
            step.classList.add('completed');
        });
    }

    /**
     * Met à jour l'affichage de la respiration
     * @param {Object} breathingState - État de la respiration
     */
    updateBreathingDisplay(breathingState) {
        const circle = document.getElementById('breathing-circle');
        const label = document.getElementById('breathing-label');
        const count = document.getElementById('breathing-count');
        const total = document.getElementById('breathing-total');
        
        if (label) {
            switch (breathingState.phase) {
                case 'inhale':
                    label.textContent = I18n.t('breathing_inhale');
                    break;
                case 'hold':
                    label.textContent = I18n.t('breathing_hold');
                    break;
                case 'exhale':
                    label.textContent = I18n.t('breathing_exhale');
                    break;
            }
        }
        
        if (count) {
            count.textContent = breathingState.count;
        }
        
        if (total) {
            total.textContent = `${breathingState.totalSeconds}s`;
        }
        
        if (circle) {
            circle.classList.remove('inhale', 'hold', 'exhale');
            circle.classList.add(breathingState.phase);
        }
    }

    /**
     * Met à jour l'intensité
     * @param {number} value - Valeur de l'intensité
     */
    updateIntensity(value) {
        const display = document.getElementById('intensity-value');
        if (display) {
            display.textContent = value;
        }
    }

    /**
     * Affiche un texte d'encouragement
     * @param {Object} state - State de l'application
     */
    showEncouragement(state) {
        const container = document.getElementById('encouragement-container');
        const btn = document.getElementById('encouragement-btn');
        
        if (btn) {
            btn.style.display = 'none';
        }
        
        let encouragementText = '';
        let encouragementRef = '';
        
        if (state.profile.spiritualEnabled && state.profile.religion !== 'none') {
            const card = I18n.getSpiritualCard({ theme: 'hope' });
            if (card) {
                encouragementText = card.text;
                encouragementRef = card.ref;
            }
        }
        
        if (!encouragementText) {
            const messages = [
                { text: I18n.t('you_are_stronger'), ref: '' },
                { text: I18n.t('this_will_pass'), ref: '' },
                { text: I18n.t('keep_going'), ref: '' },
                { text: I18n.t('one_step_at_time'), ref: '' },
                { text: I18n.t('breathe_slowly'), ref: '' }
            ];
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];
            encouragementText = randomMsg.text;
            encouragementRef = randomMsg.ref;
        }
        
        if (container) {
            container.innerHTML = `
                <div class="encouragement-card">
                    <p class="encouragement-text">"${encouragementText}"</p>
                    ${encouragementRef ? `<div class="encouragement-ref">${encouragementRef}</div>` : ''}
                </div>
            `;
        }
    }

    /**
     * Confirme une étape du protocole
     */
    confirmStep() {
        const btn = document.getElementById('protocol-action-btn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '✓ ' + I18n.t('done');
            btn.style.background = 'var(--success-bg)';
            btn.style.borderColor = 'var(--success)';
            btn.style.color = 'var(--success)';
        }
        this.markAllStepsCompleted();
    }

    /**
     * Génère un sélecteur d'addiction pour l'écran craving
     * @param {Object} state - State de l'application
     * @param {string} selectedAddictionId - ID de l'addiction actuellement sélectionnée
     * @param {string} onAddictionChange - Nom de fonction à appeler lors du changement
     * @returns {string} HTML du sélecteur
     */
    renderAddictionSelector(state, selectedAddictionId, onAddictionChange) {
        const activeAddictions = state.addictions || [];
        
        // Si une seule addiction, ne pas afficher le sélecteur
        if (activeAddictions.length <= 1) {
            return '';
        }

        const lang = state.profile?.lang || 'fr';
        const icons = {
            porn: '🔞',
            cigarette: '🚬',
            alcohol: '🍷',
            drugs: '💊',
            social_media: '📱',
            gaming: '🎮',
            food: '🍔',
            shopping: '🛒'
        };

        const selectorLabel = {
            fr: 'Pour quelle addiction ?',
            en: 'For which addiction?',
            ar: 'لأي إدمان؟'
        }[lang] || 'For which addiction?';

        // Si 3+ addictions, utiliser un dropdown
        if (activeAddictions.length >= 3) {
            const optionsHtml = activeAddictions.map(addiction => {
                const addictionId = typeof addiction === 'string' ? addiction : addiction.id;
                const icon = icons[addictionId] || '📋';
                const name = typeof I18n !== 'undefined' ? I18n.t(`addiction_${addictionId}`) : addictionId;
                const isSelected = addictionId === selectedAddictionId;
                return `<option value="${addictionId}" ${isSelected ? 'selected' : ''}>${icon} ${name}</option>`;
            }).join('');

            return `
                <div class="addiction-selector-container craving-selector">
                    <label class="addiction-selector-label" for="craving-addiction-selector-dropdown">${selectorLabel}</label>
                    <select id="craving-addiction-selector-dropdown" class="addiction-selector-dropdown" onchange="${onAddictionChange}(this.value)">
                        ${optionsHtml}
                    </select>
                </div>
            `;
        }

        // Sinon (2 addictions), utiliser les chips
        const addictionChips = activeAddictions.map(addiction => {
            const addictionId = typeof addiction === 'string' ? addiction : addiction.id;
            const icon = icons[addictionId] || '📋';
            const name = typeof I18n !== 'undefined' ? I18n.t(`addiction_${addictionId}`) : addictionId;
            const isSelected = addictionId === selectedAddictionId;
            
            return `
                <button class="chip addiction-chip ${isSelected ? 'active' : ''}" 
                        onclick="${onAddictionChange}('${addictionId}')"
                        data-addiction-id="${addictionId}">
                    <span class="chip-icon">${icon}</span>
                    <span class="chip-label">${name}</span>
                    ${isSelected ? '<span class="chip-check">✓</span>' : ''}
                </button>
            `;
        }).join('');

        return `
            <div class="addiction-selector-container craving-selector">
                <label class="addiction-selector-label">${selectorLabel}</label>
                <div class="addiction-chips">${addictionChips}</div>
            </div>
        `;
    }
}
