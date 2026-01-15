/**
 * Calendar Controller - Orchestration
 */

import { CalendarModel } from '../model/calendar-model.js';
import { CalendarView } from '../view/calendar-view.js';
import { LABELS } from '../data/calendar-data.js';
import { getServices } from '../../../core/Utils/serviceHelper.js';

export class CalendarController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.selectedTimelineAddictionId = null; // Addiction sélectionnée pour le filtre timeline
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
            const { storage, date } = await getServices(['storage', 'date']);
            
            if (this.model && (!this.model.storage || !this.model.dateService)) {
                this.model = new CalendarModel({ storage, dateService: date });
            }
            
            // Injecter aussi dans la vue si nécessaire
            if (this.view && !this.view.dateService) {
                this.view.dateService = date;
            }
            
            this.servicesInitialized = true;
        } catch (error) {
            console.warn('[CalendarController] Erreur lors de l\'initialisation des services:', error);
        }
    }

    open(state) {
        this.model.resetToCurrentMonth();
        const modalEl = this.view.createCalendarModal();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.close(); });
            modalEl._hasClickListener = true;
        }
        this.renderCalendar(state);
        this.view.showCalendar();
    }

    close() { this.view.hideCalendar(); }

    renderCalendar(state) {
        const lang = state.profile.lang;
        const streak = this.model.storage?.calculateStreak(state) || (typeof Storage !== 'undefined' ? Storage.calculateStreak(state) : 0);
        const monthData = this.model.getMonthData(state);
        this.view.renderCalendarModal(lang, streak, this.model.getCurrentMonth(), this.model.getCurrentYear(), monthData);
    }

    prevMonth() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        this.model.prevMonth();
        this.renderCalendar(state);
    }

    nextMonth() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        this.model.nextMonth();
        this.renderCalendar(state);
    }

    toggleDay(dateStr) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        this.model.toggleDay(state, dateStr);
        this.renderCalendar(state);
    }

    openTimeline(state, selectedAddictionId = null) {
        this.selectedTimelineAddictionId = selectedAddictionId || null;
        const modalEl = this.view.createTimelineModal();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closeTimeline(); });
            modalEl._hasClickListener = true;
        }
        const lang = state.profile.lang;
        const groupedEvents = this.model.getGroupedEvents(state, 50, this.selectedTimelineAddictionId);
        this.view.renderTimelineModal(lang, groupedEvents, state, this.selectedTimelineAddictionId);
        this.view.showTimeline();
    }

    /**
     * Gère le changement d'addiction dans le filtre timeline
     * @param {string} addictionId - ID de l'addiction sélectionnée (null pour tous)
     * @param {Object} state - State de l'application
     */
    onTimelineAddictionChange(addictionId, state) {
        this.selectedTimelineAddictionId = addictionId || null;
        const lang = state.profile.lang;
        const groupedEvents = this.model.getGroupedEvents(state, 50, this.selectedTimelineAddictionId);
        this.view.renderTimelineModal(lang, groupedEvents, state, this.selectedTimelineAddictionId);
    }

    closeTimeline() { this.view.hideTimeline(); }

    exportTimeline() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const data = this.model.exportData(state);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `timeline-${this.model.getDateISO()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        if (typeof showToast === 'function') showToast(l.exported);
    }

    renderWidget(state) {
        const lang = state.profile.lang;
        const streak = this.model.storage?.calculateStreak(state) || (typeof Storage !== 'undefined' ? Storage.calculateStreak(state) : 0);
        return this.view.renderWidget(lang, streak);
    }

    formatDate(dateStr, lang) { return this.view.formatDate(dateStr, lang); }
    formatTime(ts) { return this.view.formatTime(ts); }
}
