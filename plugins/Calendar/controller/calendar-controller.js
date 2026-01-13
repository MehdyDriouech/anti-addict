/**
 * Calendar Controller - Orchestration
 */

import { CalendarModel } from '../model/calendar-model.js';
import { CalendarView } from '../view/calendar-view.js';
import { LABELS } from '../data/calendar-data.js';

export class CalendarController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
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
        const streak = Storage.calculateStreak(state);
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

    openTimeline(state) {
        const modalEl = this.view.createTimelineModal();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => { if (e.target === modalEl) this.closeTimeline(); });
            modalEl._hasClickListener = true;
        }
        const lang = state.profile.lang;
        const groupedEvents = this.model.getGroupedEvents(state);
        this.view.renderTimelineModal(lang, groupedEvents);
        this.view.showTimeline();
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
        link.download = `timeline-${Storage.getDateISO()}.json`;
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
        const streak = Storage.calculateStreak(state);
        return this.view.renderWidget(lang, streak);
    }

    formatDate(dateStr, lang) { return this.view.formatDate(dateStr, lang); }
    formatTime(ts) { return this.view.formatTime(ts); }
}
