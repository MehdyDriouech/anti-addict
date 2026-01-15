/**
 * AntiPorn Controller - Orchestration
 */

import { AntiPornModel } from '../model/antiporn-model.js';
import { AntiPornView } from '../view/antiporn-view.js';

export class AntiPornController {
    constructor(model, view) { 
        this.model = model; 
        this.view = view;
        this.currentSelectedAddiction = null;
    }

    // Slope Modal
    openSlopeModal(state, selectedAddictionId = null) {
        this.model.resetSlopeSteps();
        const modalEl = this.view.getSlopeModal();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closeSlopeModal(); });
            modalEl._hasClickListener = true;
        }
        
        // Déterminer l'addiction sélectionnée
        if (!selectedAddictionId) {
            selectedAddictionId = state.currentAddiction || state.addictions?.[0]?.id || state.addictions?.[0] || 'porn';
        }
        this.currentSelectedAddiction = selectedAddictionId;
        
        this.renderSlopeContent(state, selectedAddictionId);
        this.view.showModal(modalEl);
    }

    closeSlopeModal() { 
        this.currentSelectedAddiction = null;
        this.view.closeSlopeModal(); 
    }

    /**
     * Gère le changement d'addiction dans le sélecteur
     * @param {string} addictionId - ID de la nouvelle addiction sélectionnée
     */
    onAddictionChange(addictionId) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        // Normaliser addictionId (peut être string ou objet)
        const normalizedAddictionId = typeof addictionId === 'string' 
            ? addictionId 
            : (typeof addictionId === 'object' && addictionId.id ? addictionId.id : String(addictionId));
        
        // Si on change vers la même addiction, ne rien faire
        if (normalizedAddictionId === this.currentSelectedAddiction) {
            return;
        }
        
        // Si l'addiction change vers une autre (pas 'porn'), fermer la modale AntiPorn et ouvrir celle du plugin correspondant
        if (normalizedAddictionId !== 'porn') {
            const pluginNames = {
                'cigarette': 'AntiSmoke',
                'alcohol': 'AntiAlcohol',
                'drugs': 'AntiDrugs',
                'social_media': 'AntiSocialMedia',
                'gaming': 'AntiGaming',
                'food': 'AntiFood',
                'shopping': 'AntiShopping',
                'gambling': 'AntiGambling'
            };
            const pluginName = pluginNames[normalizedAddictionId];
            if (pluginName && typeof window[pluginName] !== 'undefined' && window[pluginName].openSlopeModal) {
                this.closeSlopeModal();
                window[pluginName].openSlopeModal(state, normalizedAddictionId);
                return;
            }
        }
        
        // Sinon, réinitialiser les étapes et re-rendre avec les données de porn
        this.model.resetSlopeSteps();
        this.currentSelectedAddiction = normalizedAddictionId;
        state.currentAddiction = normalizedAddictionId;
        
        // Re-rendre tout le contenu de la modale avec la nouvelle addiction
        this.renderSlopeContent(state, normalizedAddictionId);
    }

    renderSlopeContent(state, selectedAddictionId = null) {
        if (!selectedAddictionId) {
            selectedAddictionId = this.currentSelectedAddiction || state.currentAddiction || state.addictions?.[0]?.id || state.addictions?.[0] || 'porn';
        }
        
        // Normaliser selectedAddictionId (peut être string ou objet)
        const normalizedAddictionId = typeof selectedAddictionId === 'string' 
            ? selectedAddictionId 
            : (typeof selectedAddictionId === 'object' && selectedAddictionId.id ? selectedAddictionId.id : String(selectedAddictionId));
        
        const lang = state.profile.lang;
        const stoppedCount = state.addictionConfigs?.[normalizedAddictionId]?.stoppedSlopes || 0;
        let spiritualCard = null;
        if (state.profile.spiritualEnabled && state.profile.religion !== 'none' && typeof I18n !== 'undefined') {
            const cards = I18n.getSpiritualCards(normalizedAddictionId) || [];
            const relevant = cards.filter(c => ['lower_gaze', 'avoid_paths', 'discipline'].includes(c.theme));
            if (relevant.length > 0) spiritualCard = relevant[Math.floor(Math.random() * relevant.length)];
        }
        this.view.renderSlopeContent(lang, stoppedCount, this.model.getCurrentStep(), this.model.getStepsCompleted(), spiritualCard, state, normalizedAddictionId);
    }

    completeStep(stepKey) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        this.model.completeStep(stepKey, state);
        this.renderSlopeContent(state);
    }

    logWithSignal(signal) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        this.model.logSlope(state, signal);
        if (typeof showToast === 'function') {
            const lang = state.profile.lang;
            const msgs = { fr: 'Signal enregistré', en: 'Signal logged', ar: 'تم تسجيل الإشارة' };
            showToast(msgs[lang] || msgs.fr);
        }
    }

    confirmSlope() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        // Utiliser l'addiction sélectionnée ou celle par défaut
        const selectedAddictionId = this.currentSelectedAddiction || state.currentAddiction || state.addictions?.[0]?.id || state.addictions?.[0] || 'porn';
        
        const todaySlopes = Utils.getTodayEventsByType(state.events, 'slope');
        if (todaySlopes.length === 0) {
            // Utiliser le plugin correspondant pour logger la pente
            const pluginName = this.getPluginNameForAddiction(selectedAddictionId);
            if (pluginName && typeof window[pluginName] !== 'undefined' && window[pluginName].logSlope) {
                window[pluginName].logSlope(state);
            } else {
                this.model.logSlope(state);
            }
        }
        
        // Incrémenter le compteur de pentes stoppées pour l'addiction sélectionnée
        const count = this.incrementStoppedSlopesForAddiction(state, selectedAddictionId);
        const lang = state.profile?.lang || 'fr';
        
        // Mettre à jour l'affichage du compteur avant de fermer
        this.view.updateStoppedCount(count, lang);
        
        // Attendre un peu pour que l'utilisateur voie la mise à jour
        setTimeout(() => {
            this.closeSlopeModal();
            if (typeof renderHome === 'function') renderHome();
            
            // Afficher un toast de confirmation
            if (typeof UI !== 'undefined' && UI.showToast) {
                const messages = {
                    fr: `Bravo ! ${count} pentes stoppées au total.`,
                    en: `Well done! ${count} slopes stopped in total.`,
                    ar: `أحسنت! ${count} منحدرات متوقفة في المجموع.`
                };
                UI.showToast(messages[lang] || messages.fr, 'success');
            } else if (typeof showToast === 'function') {
                const messages = {
                    fr: `Bravo ! ${count} pentes stoppées au total.`,
                    en: `Well done! ${count} slopes stopped in total.`,
                    ar: `أحسنت! ${count} منحدرات متوقفة في المجموع.`
                };
                showToast(messages[lang] || messages.fr);
            }
        }, 500);
    }

    // Night Modal
    openNightModal(state, selectedAddictionId = null) {
        const modalEl = this.view.getNightModal();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closeNightModal(); });
            modalEl._hasClickListener = true;
        }
        
        // Déterminer l'addiction sélectionnée
        if (!selectedAddictionId) {
            selectedAddictionId = state.currentAddiction || state.addictions?.[0]?.id || state.addictions?.[0] || 'porn';
        }
        this.currentSelectedAddiction = selectedAddictionId;
        
        this.renderNightContent(state, selectedAddictionId);
        this.view.showModal(modalEl);
    }

    /**
     * Gère le changement d'addiction dans le sélecteur du rituel du soir
     * @param {string} addictionId - ID de la nouvelle addiction sélectionnée
     */
    onNightAddictionChange(addictionId) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        // Le rituel du soir est principalement pour porn, mais on peut changer l'addiction pour l'affichage
        this.currentSelectedAddiction = addictionId;
        state.currentAddiction = addictionId;
        this.renderNightContent(state, addictionId);
    }

    closeNightModal() { this.view.closeNightModal(); }

    renderNightContent(state, selectedAddictionId = null) {
        if (!selectedAddictionId) {
            selectedAddictionId = this.currentSelectedAddiction || state.currentAddiction || state.addictions?.[0]?.id || state.addictions?.[0] || 'porn';
        }
        
        const lang = state.profile.lang;
        const nightRoutine = state.nightRoutine || {};
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthLogs = (nightRoutine.logs || []).filter(log => log.date >= monthStart && log.completed).length;
        const today = Storage.getDateISO();
        const todayLog = (nightRoutine.logs || []).find(log => log.date === today);
        this.view.renderNightContent(lang, nightRoutine, monthLogs, todayLog, state, selectedAddictionId);
    }

    toggleNightRoutine() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        const enabled = document.getElementById('nightEnabled')?.checked || false;
        this.model.toggleNightRoutine(state, enabled);
    }

    addCustomNightItem() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        const input = document.getElementById('customNightItem');
        const text = input?.value?.trim();
        if (!text) return;
        this.model.addCustomNightItem(state, text);
        this.renderNightContent(state);
    }

    removeCustomNightItem(index) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        this.model.removeCustomNightItem(state, index);
        this.renderNightContent(state);
    }

    saveNightRoutine() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        const checklist = [];
        document.querySelectorAll('[data-item]:checked').forEach(cb => checklist.push(cb.dataset.item));
        const hourInput = document.getElementById('nightHour');
        const hour = hourInput ? parseInt(hourInput.value.split(':')[0], 10) : 22;
        this.model.saveNightRoutine(state, checklist, hour);
        const lang = state.profile.lang;
        if (typeof showToast === 'function') showToast({ fr: 'Routine enregistrée !', en: 'Routine saved!', ar: 'تم حفظ الروتين!' }[lang] || 'Routine enregistrée !');
        this.closeNightModal();
    }

    // Phone Bed
    openPhoneBedModal(state) {
        const modalEl = this.view.getPhoneBedModal();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closePhoneBedModal(); });
            modalEl._hasClickListener = true;
        }
        const stats = this.model.getPhoneBedStats(state);
        this.view.renderPhoneBedContent(state.profile.lang, stats);
        this.view.showModal(modalEl);
    }

    closePhoneBedModal() { this.view.closePhoneBedModal(); }

    answerPhoneBed(phoneInBed) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        this.model.answerPhoneBed(state, phoneInBed);
        this.closePhoneBedModal();
        const lang = state.profile.lang;
        if (!phoneInBed && typeof showToast === 'function') showToast({ fr: 'Bravo ! 🎉', en: 'Well done! 🎉', ar: 'أحسنت! 🎉' }[lang] || 'Bravo ! 🎉');
    }

    getPhoneBedStats(state) { return this.model.getPhoneBedStats(state); }

    // Config
    openConfigModal(state, selectedAddictionId = null) {
        const modalEl = this.view.getConfigModal();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closeConfigModal(); });
            modalEl._hasClickListener = true;
        }
        
        // Déterminer l'addiction sélectionnée
        if (!selectedAddictionId) {
            selectedAddictionId = state.currentAddiction || state.addictions?.[0]?.id || state.addictions?.[0] || 'porn';
        }
        this.currentSelectedAddiction = selectedAddictionId;
        
        const customTriggers = state.antiporn?.customTriggers || [];
        const activeRules = state.antiporn?.activeRules || [];
        this.view.renderConfigContent(state.profile.lang, customTriggers, activeRules, state, selectedAddictionId);
        this.view.showModal(modalEl);
    }

    /**
     * Gère le changement d'addiction dans le sélecteur de configuration
     * @param {string} addictionId - ID de la nouvelle addiction sélectionnée
     */
    onConfigAddictionChange(addictionId) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        // Si l'addiction change vers une autre, ouvrir la modale de config du plugin correspondant
        if (addictionId !== 'porn') {
            const pluginNames = {
                'cigarette': 'AntiSmoke',
                'alcohol': 'AntiAlcohol',
                'drugs': 'AntiDrugs',
                'social_media': 'AntiSocialMedia',
                'gaming': 'AntiGaming',
                'food': 'AntiFood',
                'shopping': 'AntiShopping',
                'gambling': 'AntiGambling'
            };
            const pluginName = pluginNames[addictionId];
            if (pluginName && typeof window[pluginName] !== 'undefined' && window[pluginName].openConfigModal) {
                this.closeConfigModal();
                window[pluginName].openConfigModal(state, addictionId);
                return;
            }
        }
        
        // Sinon, re-rendre avec la nouvelle addiction
        this.currentSelectedAddiction = addictionId;
        state.currentAddiction = addictionId;
        const customTriggers = state.antiporn?.customTriggers || [];
        const activeRules = state.antiporn?.activeRules || [];
        this.view.renderConfigContent(state.profile.lang, customTriggers, activeRules, state, addictionId);
    }

    closeConfigModal() { this.view.closeConfigModal(); }

    toggleTrigger(trigger) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        this.model.toggleTrigger(state, trigger);
        const customTriggers = state.antiporn?.customTriggers || [];
        const activeRules = state.antiporn?.activeRules || [];
        this.view.renderConfigContent(state.profile.lang, customTriggers, activeRules);
    }

    saveConfig() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        const triggers = state.antiporn?.customTriggers || [];
        const rules = [];
        document.querySelectorAll('[data-rule]:checked').forEach(cb => rules.push(cb.dataset.rule));
        this.model.saveConfig(state, triggers, rules);
        this.closeConfigModal();
        const lang = state.profile.lang;
        if (typeof showToast === 'function') showToast({ fr: 'Configuration enregistrée', en: 'Configuration saved', ar: 'تم حفظ الإعدادات' }[lang] || 'Configuration enregistrée');
    }

    // Helpers
    logSlope(state, signal) { return this.model.logSlope(state, signal); }
    getRecentSlopes(state, days) { return this.model.getRecentSlopes(state, days); }
    isNightRoutineTime(state) { return this.model.isNightRoutineTime(state); }
    renderEnvironmentChecklist(state) { return this.view.renderEnvironmentChecklist(state.profile.lang, state.antiporn?.activeRules || []); }
    getRandomTips(lang, count) { return this.model.getRandomTips(lang, count); }
    renderNightButton(state) { return this.model.isNightRoutineTime(state) ? this.view.renderNightButton(state.profile.lang) : ''; }

    /**
     * Récupère le nom du plugin pour une addiction donnée
     * @param {string} addictionId - ID de l'addiction
     * @returns {string} Nom du plugin
     */
    getPluginNameForAddiction(addictionId) {
        const names = {
            'porn': 'AntiPorn',
            'cigarette': 'AntiSmoke',
            'alcohol': 'AntiAlcohol',
            'drugs': 'AntiDrugs',
            'social_media': 'AntiSocialMedia',
            'gaming': 'AntiGaming',
            'food': 'AntiFood',
            'shopping': 'AntiShopping',
            'gambling': 'AntiGambling'
        };
        return names[addictionId] || null;
    }

    /**
     * Incrémente le compteur de pentes stoppées pour une addiction spécifique
     * @param {Object} state - State de l'application
     * @param {string} addictionId - ID de l'addiction
     * @returns {number} Nouveau compteur
     */
    incrementStoppedSlopesForAddiction(state, addictionId) {
        if (addictionId === 'porn') {
            return this.model.incrementStoppedSlopes(state);
        }

        // Pour les autres addictions, utiliser le plugin correspondant
        const pluginName = this.getPluginNameForAddiction(addictionId);
        if (pluginName && typeof window[pluginName] !== 'undefined') {
            // Essayer d'appeler incrementStoppedSlopes sur le modèle du plugin
            const plugin = window[pluginName];
            if (plugin.model && typeof plugin.model.incrementStoppedSlopes === 'function') {
                return plugin.model.incrementStoppedSlopes(state);
            }
        }

        // Fallback : incrémenter manuellement
        if (!state.addictionConfigs) state.addictionConfigs = {};
        if (!state.addictionConfigs[addictionId]) state.addictionConfigs[addictionId] = {};
        if (!state.addictionConfigs[addictionId].stoppedSlopes) state.addictionConfigs[addictionId].stoppedSlopes = 0;
        state.addictionConfigs[addictionId].stoppedSlopes++;
        if (typeof Storage !== 'undefined') Storage.saveState(state);
        return state.addictionConfigs[addictionId].stoppedSlopes;
    }
}
