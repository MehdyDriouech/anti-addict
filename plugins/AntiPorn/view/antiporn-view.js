/**
 * AntiPorn View - Rendu HTML (simplifié)
 */

import { SLOPE_SIGNALS, SLOPE_STEPS, NIGHT_CHECKLIST_ITEMS, TRIGGERS, ENVIRONMENT_RULES } from '../data/antiporn-data.js';
import { AddictionBaseView } from '../../AddictionBase/view/addiction-base-view.js';

export class AntiPornView {
    constructor() {
        this.slopeModalEl = null; this.nightModalEl = null; this.phoneBedModalEl = null; this.configModalEl = null;
        this.baseView = new AddictionBaseView('porn');
    }

    createModal(id) {
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement('div');
            el.className = 'modal-overlay';
            el.id = id;
            document.body.appendChild(el);
        }
        return el;
    }

    showModal(el) { if (el) el.classList.add('active'); }
    hideModal(el) { if (el) el.classList.remove('active'); }

    getSlopeModal() { this.slopeModalEl = this.createModal('slopeModal'); return this.slopeModalEl; }
    getNightModal() { this.nightModalEl = this.createModal('nightModal'); return this.nightModalEl; }
    getPhoneBedModal() { this.phoneBedModalEl = this.createModal('phoneBedModal'); return this.phoneBedModalEl; }
    getConfigModal() { this.configModalEl = this.createModal('configModal'); return this.configModalEl; }

    closeSlopeModal() { this.hideModal(this.slopeModalEl); }
    closeNightModal() { this.hideModal(this.nightModalEl); }
    closePhoneBedModal() { this.hideModal(this.phoneBedModalEl); }
    closeConfigModal() { this.hideModal(this.configModalEl); }

    renderSlopeContent(lang, stoppedCount, slopeStep, slopeStepsCompleted, spiritualCard, state, selectedAddictionId = 'porn') {
        const l = this.getSlopeLabels(lang);
        const stepKeys = Object.keys(SLOPE_STEPS);
        const allCompleted = stepKeys.every(k => slopeStepsCompleted[k]);
        
        // Normaliser selectedAddictionId (peut être string ou objet)
        const normalizedAddictionId = typeof selectedAddictionId === 'string' 
            ? selectedAddictionId 
            : (typeof selectedAddictionId === 'object' && selectedAddictionId.id ? selectedAddictionId.id : String(selectedAddictionId));
        
        // Récupérer les données de l'addiction sélectionnée
        const addictionData = this.getAddictionData(normalizedAddictionId, lang);
        const currentStoppedCount = state.addictionConfigs?.[normalizedAddictionId]?.stoppedSlopes || 0;
        
        // Générer le sélecteur d'addiction avec l'addiction normalisée
        const selectorHtml = this.baseView.renderAddictionSelector(state, normalizedAddictionId, 'AntiPorn.onAddictionChange');
        
        this.slopeModalEl.innerHTML = `
            <div class="modal-content slope-modal slope-advanced">
                <button class="modal-close" onclick="window.AntiPorn.closeSlopeModal()">×</button>
                ${selectorHtml}
                <div class="slope-header">
                    <h2>${l.title}</h2>
                    <p>${l.subtitle}</p>
                    <div class="stopped-counter">
                        <span class="counter-value">${currentStoppedCount}</span>
                        <span class="counter-label">${l.stoppedCount}</span>
                    </div>
                </div>
                
                <div class="slope-signals compact">
                    <label>${l.whatSignal}</label>
                    <div class="signal-chips">
                        ${addictionData.signals.map(([key, label]) => `
                            <button class="chip small" onclick="window.AntiPorn.logWithSignal('${key}')">
                                ${label}
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <div class="slope-steps-container">
                    ${stepKeys.map((stepKey, index) => {
                        const step = SLOPE_STEPS[stepKey];
                        const isCompleted = slopeStepsCompleted[stepKey];
                        const isCurrent = index === slopeStep;
                        const isLocked = index > slopeStep && !allCompleted;
                        
                        return `
                            <div class="slope-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}" data-step="${stepKey}">
                                <div class="step-header">
                                    <span class="step-number">${index + 1}</span>
                                    <span class="step-title">${step[lang] || step.fr}</span>
                                    ${isCompleted ? '<span class="step-check">✓</span>' : ''}
                                </div>
                                <p class="step-desc">${step.desc[lang] || step.desc.fr}</p>
                                ${isCurrent && !isCompleted ? `
                                    <button class="btn btn-primary btn-block step-btn" onclick="window.AntiPorn.completeStep('${stepKey}')">
                                        ${l.done}
                                    </button>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                
                ${allCompleted ? `
                    <div class="slope-completed">
                        <div class="completed-icon">🎉</div>
                        <h3>${l.completed}</h3>
                        ${spiritualCard ? `
                            <div class="spiritual-card slope-card">
                                <p class="card-text">"${spiritualCard.text}"</p>
                                <cite>— ${spiritualCard.ref}</cite>
                            </div>
                        ` : ''}
                        <button class="btn btn-primary btn-large" onclick="window.AntiPorn.confirmSlope()">
                            ${l.close}
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Attacher les event listeners aux chips d'addiction après le rendu
        this.attachAddictionSelectorListeners();
    }

    /**
     * Attache les event listeners aux chips d'addiction du sélecteur
     * pour garantir que les clics fonctionnent même après plusieurs mises à jour du DOM
     * Utilise la délégation d'événements pour plus de robustesse
     */
    attachAddictionSelectorListeners() {
        if (!this.slopeModalEl) return;
        
        // Supprimer l'ancien listener de délégation s'il existe
        if (this._addictionSelectorHandler) {
            this.slopeModalEl.removeEventListener('click', this._addictionSelectorHandler);
        }
        
        // Créer un nouveau handler avec délégation d'événements
        this._addictionSelectorHandler = (e) => {
            const chip = e.target.closest('.addiction-chip');
            if (!chip) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const addictionId = chip.getAttribute('data-addiction-id');
            if (addictionId && window.AntiPorn && window.AntiPorn.onAddictionChange) {
                window.AntiPorn.onAddictionChange(addictionId);
            }
        };
        
        // Attacher le listener au conteneur (délégation d'événements)
        this.slopeModalEl.addEventListener('click', this._addictionSelectorHandler);
    }

    getSlopeLabels(lang) {
        const labels = {
            fr: { title: '⚠️ Pente glissante', subtitle: 'Tu as bien fait de t\'arrêter. Complète les 3 étapes.', whatSignal: 'Quel signal ?', done: 'Fait ✓', completed: 'Pente stoppée ! 💪', close: 'Fermer', stoppedCount: 'pentes stoppées' },
            en: { title: '⚠️ Slippery slope', subtitle: 'You did well to stop. Complete the 3 steps.', whatSignal: 'What signal?', done: 'Done ✓', completed: 'Slope stopped! 💪', close: 'Close', stoppedCount: 'slopes stopped' },
            ar: { title: '⚠️ منحدر زلق', subtitle: 'أحسنت بالتوقف. أكمل الخطوات الـ3.', whatSignal: 'ما الإشارة؟', done: 'تم ✓', completed: 'تم إيقاف المنحدر! 💪', close: 'إغلاق', stoppedCount: 'منحدرات تم إيقافها' }
        };
        return labels[lang] || labels.fr;
    }

    renderNightContent(lang, nightRoutine, monthLogs, todayLog, state = null, selectedAddictionId = 'porn') {
        const l = this.getNightLabels(lang);
        const checklist = nightRoutine.checklist || ['phone_out', 'lights_dim', 'leave_bed'];
        
        // Générer le sélecteur d'addiction si plusieurs addictions sont actives
        const selectorHtml = state && state.addictions && state.addictions.length > 1 
            ? this.baseView.renderAddictionSelector(state, selectedAddictionId, 'AntiPorn.onNightAddictionChange')
            : '';
        
        this.nightModalEl.innerHTML = `
            <div class="modal-content night-modal"><button class="modal-close" onclick="AntiPorn.closeNightModal()">×</button>${selectorHtml}
                <div class="night-header"><h2>${l.title}</h2><p>${l.subtitle}</p></div>
                <div class="night-stats"><span class="stat-value">${monthLogs}</span><span class="stat-label">${l.completed} (${l.stats})</span></div>
                ${todayLog?.completed ? `<div class="night-completed"><span class="completed-icon">✓</span><span>${l.completedTonight}</span></div>` : ''}
                <div class="toggle-row"><label class="toggle-label"><span>${l.enable}</span><input type="checkbox" id="nightEnabled" ${nightRoutine.enabled ? 'checked' : ''} onchange="AntiPorn.toggleNightRoutine()"><span class="toggle-slider"></span></label></div>
                <div class="form-group"><label>${l.hour}</label><input type="time" id="nightHour" class="input" value="${String(nightRoutine.hour || 22).padStart(2, '0')}:00"></div>
                <div class="night-checklist"><h4>${l.checklist}</h4>
                    ${Object.entries(NIGHT_CHECKLIST_ITEMS).map(([key, item]) => `<label class="checklist-item ${checklist.includes(key) ? 'selected' : ''}"><input type="checkbox" data-item="${key}" ${checklist.includes(key) ? 'checked' : ''}><span class="item-emoji">${item.emoji}</span><span class="item-text">${item[lang] || item.fr}</span></label>`).join('')}
                    ${(nightRoutine.customChecklist || []).map((item, idx) => `<label class="checklist-item custom selected"><input type="checkbox" data-custom="${idx}" checked><span class="item-emoji">✨</span><span class="item-text">${item}</span><button class="remove-btn" onclick="AntiPorn.removeCustomNightItem(${idx})">×</button></label>`).join('')}
                    <div class="add-custom-item"><input type="text" id="customNightItem" placeholder="${l.customItem}" maxlength="50"><button class="btn btn-small" onclick="AntiPorn.addCustomNightItem()">${l.addCustom}</button></div>
                </div>
                <button class="btn btn-primary btn-large btn-block" onclick="AntiPorn.saveNightRoutine()">✓ ${l.save}</button>
            </div>`;
    }

    getNightLabels(lang) {
        const labels = {
            fr: { title: '🌙 Routine nuit', subtitle: 'Avant de te coucher, vérifie ces points', hour: 'Heure de rappel', checklist: 'Ma checklist', save: 'Valider ma routine', enable: 'Activer la routine nuit', customItem: 'Ajouter un élément', addCustom: '+ Ajouter', completedTonight: 'Routine complétée ce soir !', stats: 'Ce mois', completed: 'routines complétées' },
            en: { title: '🌙 Night routine', subtitle: 'Before bed, check these points', hour: 'Reminder hour', checklist: 'My checklist', save: 'Validate routine', enable: 'Enable night routine', customItem: 'Add an item', addCustom: '+ Add', completedTonight: 'Routine completed tonight!', stats: 'This month', completed: 'routines completed' },
            ar: { title: '🌙 روتين الليل', subtitle: 'قبل النوم، تحقق من هذه النقاط', hour: 'ساعة التذكير', checklist: 'قائمتي', save: 'تأكيد الروتين', enable: 'تفعيل روتين الليل', customItem: 'إضافة عنصر', addCustom: '+ إضافة', completedTonight: 'الروتين مكتمل الليلة!', stats: 'هذا الشهر', completed: 'روتين مكتمل' }
        };
        return labels[lang] || labels.fr;
    }

    renderPhoneBedContent(lang, stats) {
        const l = { fr: { title: '📱 Téléphone au lit ?', question: 'As-tu ton téléphone au lit ce soir ?', yes: 'Oui', no: 'Non (bravo!)', stats: 'Cette semaine', out: 'hors du lit' }, en: { title: '📱 Phone in bed?', question: 'Do you have your phone in bed tonight?', yes: 'Yes', no: 'No (bravo!)', stats: 'This week', out: 'out of bed' }, ar: { title: '📱 الهاتف في السرير؟', question: 'هل هاتفك معك في السرير الليلة؟', yes: 'نعم', no: 'لا (أحسنت!)', stats: 'هذا الأسبوع', out: 'خارج السرير' } }[lang] || { fr: { title: '📱 Téléphone au lit ?', question: 'As-tu ton téléphone au lit ce soir ?', yes: 'Oui', no: 'Non (bravo!)', stats: 'Cette semaine', out: 'hors du lit' } }.fr;
        
        this.phoneBedModalEl.innerHTML = `<div class="modal-content phone-bed-modal"><button class="modal-close" onclick="AntiPorn.closePhoneBedModal()">×</button><h2>${l.title}</h2><p>${l.question}</p><div class="phone-bed-stats"><span>${l.stats}: ${stats.phoneOut}/${stats.total} ${l.out}</span></div><div class="btn-group"><button class="btn btn-secondary" onclick="AntiPorn.answerPhoneBed(true)">${l.yes}</button><button class="btn btn-success" onclick="AntiPorn.answerPhoneBed(false)">✓ ${l.no}</button></div></div>`;
    }

    renderConfigContent(lang, customTriggers, activeRules, state = null, selectedAddictionId = 'porn') {
        const l = { fr: { title: '⚙️ Configuration', triggers: 'Mes déclencheurs', rules: 'Règles environnement', save: 'Enregistrer' }, en: { title: '⚙️ Configuration', triggers: 'My triggers', rules: 'Environment rules', save: 'Save' }, ar: { title: '⚙️ الإعدادات', triggers: 'محفزاتي', rules: 'قواعد البيئة', save: 'حفظ' } }[lang] || { fr: { title: '⚙️ Configuration', triggers: 'Mes déclencheurs', rules: 'Règles environnement', save: 'Enregistrer' } }.fr;
        
        // Générer le sélecteur d'addiction si plusieurs addictions sont actives
        const selectorHtml = state && state.addictions && state.addictions.length > 1 
            ? this.baseView.renderAddictionSelector(state, selectedAddictionId, 'AntiPorn.onConfigAddictionChange')
            : '';
        
        this.configModalEl.innerHTML = `<div class="modal-content config-modal"><button class="modal-close" onclick="AntiPorn.closeConfigModal()">×</button>${selectorHtml}<h2>${l.title}</h2>
            <div class="config-section"><h4>${l.triggers}</h4><div class="trigger-chips">${Object.entries(TRIGGERS).map(([key, labels]) => `<button class="chip ${customTriggers.includes(key) ? 'active' : ''}" onclick="AntiPorn.toggleTrigger('${key}')">${labels[lang] || labels.fr}</button>`).join('')}</div></div>
            <div class="config-section"><h4>${l.rules}</h4><div class="rules-list">${Object.entries(ENVIRONMENT_RULES).map(([key, labels]) => `<label class="rule-item"><input type="checkbox" data-rule="${key}" ${activeRules.includes(key) ? 'checked' : ''}><span>${labels[lang] || labels.fr}</span></label>`).join('')}</div></div>
            <button class="btn btn-primary btn-block" onclick="AntiPorn.saveConfig()">✓ ${l.save}</button>
        </div>`;
    }

    renderEnvironmentChecklist(lang, activeRules) {
        return Object.entries(ENVIRONMENT_RULES).filter(([key]) => activeRules.includes(key)).map(([key, labels]) => `<div class="env-rule"><span class="rule-icon">✓</span><span class="rule-text">${labels[lang] || labels.fr}</span></div>`).join('');
    }

    renderNightButton(lang) {
        const labels = { fr: 'Routine nuit', en: 'Night routine', ar: 'روتين الليل' };
        return `<button class="btn btn-secondary night-btn" onclick="AntiPorn.openNightModal(state)">🌙 ${labels[lang] || labels.fr}</button>`;
    }

    /**
     * Met à jour le compteur de pentes stoppées dans la modale
     * @param {number} count - Nouveau compteur
     * @param {string} lang - Langue
     */
    updateStoppedCount(count, lang) {
        if (!this.slopeModalEl) return;
        const counterValue = this.slopeModalEl.querySelector('.counter-value');
        if (counterValue) {
            counterValue.textContent = count;
        }
    }

    /**
     * Récupère les données (signaux, conseils) d'une addiction spécifique
     * @param {string} addictionId - ID de l'addiction
     * @param {string} lang - Langue
     * @returns {Object} Données de l'addiction
     */
    getAddictionData(addictionId, lang) {
        // Si c'est porn, utiliser les données locales
        if (addictionId === 'porn') {
            return this.getSlopeData(lang);
        }

        // Pour les autres addictions, utiliser le plugin correspondant
        const pluginNames = {
            'cigarette': 'AntiSmoke',
            'alcohol': 'AntiAlcohol',
            'drugs': 'AntiDrugs',
            'social_media': 'AntiSocialMedia',
            'gaming': 'AntiGaming',
            'food': 'AntiFood',
            'shopping': 'AntiShopping'
        };

        const pluginName = pluginNames[addictionId];
        if (pluginName && typeof window[pluginName] !== 'undefined' && window[pluginName].getSlopeData) {
            return window[pluginName].getSlopeData(lang);
        }

        // Fallback vers les données de porn
        return this.getSlopeData(lang);
    }

    /**
     * Récupère les données de pente pour l'addiction porn
     * @param {string} lang - Langue
     * @returns {Object} Données de pente
     */
    getSlopeData(lang) {
        return {
            signals: Object.entries(SLOPE_SIGNALS).slice(0, 4).map(([key, labels]) => [key, labels[lang] || labels.fr]),
            steps: SLOPE_STEPS,
            tips: []
        };
    }
}
