/**
 * AntiPorn Controller - Orchestration
 */

import { AntiPornModel } from '../model/antiporn-model.js';
import { AntiPornView } from '../view/antiporn-view.js';

export class AntiPornController {
    constructor(model, view) { this.model = model; this.view = view; }

    // Slope Modal
    openSlopeModal(state) {
        this.model.resetSlopeSteps();
        const modalEl = this.view.getSlopeModal();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closeSlopeModal(); });
            modalEl._hasClickListener = true;
        }
        this.renderSlopeContent(state);
        this.view.showModal(modalEl);
    }

    closeSlopeModal() { this.view.closeSlopeModal(); }

    renderSlopeContent(state) {
        const lang = state.profile.lang;
        const stoppedCount = state.addictionConfigs?.porn?.stoppedSlopes || 0;
        let spiritualCard = null;
        if (state.profile.spiritualEnabled && state.profile.religion !== 'none' && typeof I18n !== 'undefined') {
            const cards = I18n.getSpiritualCards() || [];
            const relevant = cards.filter(c => ['lower_gaze', 'avoid_paths', 'discipline'].includes(c.theme));
            if (relevant.length > 0) spiritualCard = relevant[Math.floor(Math.random() * relevant.length)];
        }
        this.view.renderSlopeContent(lang, stoppedCount, this.model.getCurrentStep(), this.model.getStepsCompleted(), spiritualCard);
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
        const todaySlopes = Utils.getTodayEventsByType(state.events, 'slope');
        if (todaySlopes.length === 0) this.model.logSlope(state);
        
        // Incrémenter le compteur de pentes stoppées
        const count = this.model.incrementStoppedSlopes(state);
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
    openNightModal(state) {
        const modalEl = this.view.getNightModal();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closeNightModal(); });
            modalEl._hasClickListener = true;
        }
        this.renderNightContent(state);
        this.view.showModal(modalEl);
    }

    closeNightModal() { this.view.closeNightModal(); }

    renderNightContent(state) {
        const lang = state.profile.lang;
        const nightRoutine = state.nightRoutine || {};
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthLogs = (nightRoutine.logs || []).filter(log => log.date >= monthStart && log.completed).length;
        const today = Storage.getDateISO();
        const todayLog = (nightRoutine.logs || []).find(log => log.date === today);
        this.view.renderNightContent(lang, nightRoutine, monthLogs, todayLog);
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
    openConfigModal(state) {
        const modalEl = this.view.getConfigModal();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closeConfigModal(); });
            modalEl._hasClickListener = true;
        }
        const customTriggers = state.antiporn?.customTriggers || [];
        const activeRules = state.antiporn?.activeRules || [];
        this.view.renderConfigContent(state.profile.lang, customTriggers, activeRules);
        this.view.showModal(modalEl);
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
}
