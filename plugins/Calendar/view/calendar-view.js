/**
 * Calendar View - Rendu HTML
 */

import { WEEKDAYS, MONTHS, LABELS, EVENT_ICONS } from '../data/calendar-data.js';

export class CalendarView {
    constructor() {
        this.calendarModalEl = null;
        this.timelineModalEl = null;
    }

    createCalendarModal() {
        if (!this.calendarModalEl) {
            this.calendarModalEl = document.createElement('div');
            this.calendarModalEl.className = 'modal-overlay';
            this.calendarModalEl.id = 'calendarModal';
            document.body.appendChild(this.calendarModalEl);
        }
        return this.calendarModalEl;
    }

    createTimelineModal() {
        if (!this.timelineModalEl) {
            this.timelineModalEl = document.createElement('div');
            this.timelineModalEl.className = 'modal-overlay';
            this.timelineModalEl.id = 'timelineModal';
            document.body.appendChild(this.timelineModalEl);
        }
        return this.timelineModalEl;
    }

    showCalendar() { if (this.calendarModalEl) this.calendarModalEl.classList.add('active'); }
    hideCalendar() { if (this.calendarModalEl) this.calendarModalEl.classList.remove('active'); }
    showTimeline() { if (this.timelineModalEl) this.timelineModalEl.classList.add('active'); }
    hideTimeline() { if (this.timelineModalEl) this.timelineModalEl.classList.remove('active'); }

    formatDate(dateStr, lang) {
        const date = new Date(dateStr);
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang === 'en' ? 'en-US' : 'fr-FR', options);
    }

    formatTime(ts) {
        const date = new Date(ts);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    renderCalendarGrid(lang, monthData, currentYear, currentMonth) {
        const weekdays = WEEKDAYS[lang] || WEEKDAYS.fr;
        const today = Storage.getDateISO();
        
        let html = '<div class="calendar-weekdays">';
        weekdays.forEach(day => html += `<span class="weekday">${day}</span>`);
        html += '</div><div class="calendar-days">';
        
        for (let i = 0; i < monthData.startDay; i++) html += '<div class="calendar-day empty"></div>';
        
        for (let day = 1; day <= monthData.daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === today;
            const hasEpisode = monthData.episodes.some(e => e.date === dateStr);
            const hasCraving = monthData.cravings.some(e => e.date === dateStr);
            const isSober = monthData.sobrietyDays.includes(dateStr);
            const isFuture = dateStr > today;
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (hasEpisode) classes += ' episode';
            else if (hasCraving) classes += ' craving';
            else if (isSober) classes += ' sober';
            if (isFuture) classes += ' future';
            
            html += `<div class="${classes}" onclick="${!isFuture ? `Calendar.toggleDay('${dateStr}')` : ''}" data-date="${dateStr}"><span class="day-number">${day}</span></div>`;
        }
        
        return html + '</div>';
    }

    renderCalendarModal(lang, streak, currentMonth, currentYear, monthData) {
        const l = LABELS[lang] || LABELS.fr;
        const monthName = MONTHS[lang]?.[currentMonth] || MONTHS.fr[currentMonth];
        
        this.calendarModalEl.innerHTML = `
            <div class="modal-content calendar-modal">
                <button class="modal-close" onclick="Calendar.close()">×</button>
                <h2>${l.title}</h2>
                <div class="calendar-stats"><div class="stat-item"><span class="stat-value">${streak}</span><span class="stat-label">${l.streak}</span></div></div>
                <div class="month-nav">
                    <button class="btn btn-ghost" onclick="Calendar.prevMonth()">←</button>
                    <span class="month-name">${monthName} ${currentYear}</span>
                    <button class="btn btn-ghost" onclick="Calendar.nextMonth()">→</button>
                </div>
                <div class="calendar-grid">${this.renderCalendarGrid(lang, monthData, currentYear, currentMonth)}</div>
                <div class="calendar-legend">
                    <span class="legend-item"><span class="dot sober"></span> Sobre</span>
                    <span class="legend-item"><span class="dot episode"></span> Épisode</span>
                    <span class="legend-item"><span class="dot craving"></span> Craving</span>
                </div>
                <button class="btn btn-secondary btn-block" onclick="Calendar.close(); Calendar.openTimeline(state);">📊 ${l.timeline}</button>
            </div>
        `;
    }

    renderTimelineModal(lang, groupedEvents) {
        const l = LABELS[lang] || LABELS.fr;
        
        this.timelineModalEl.innerHTML = `
            <div class="modal-content timeline-modal">
                <button class="modal-close" onclick="Calendar.closeTimeline()">×</button>
                <h2>📊 ${l.timeline}</h2>
                <div class="timeline-container">
                    ${Object.keys(groupedEvents).length === 0 ? `<p class="empty-message">${l.empty}</p>` : 
                        Object.entries(groupedEvents).map(([date, events]) => `
                            <div class="timeline-day">
                                <div class="timeline-date">${this.formatDate(date, lang)}</div>
                                <div class="timeline-events">
                                    ${events.map(e => `
                                        <div class="timeline-event ${e.type}">
                                            <span class="event-icon">${EVENT_ICONS[e.type] || '•'}</span>
                                            <span class="event-type">${l[e.type] || e.type}</span>
                                            <span class="event-time">${this.formatTime(e.ts)}</span>
                                            ${e.intensity ? `<span class="event-intensity">${e.intensity}/10</span>` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                </div>
                <button class="btn btn-secondary btn-block" onclick="Calendar.exportTimeline()">📥 ${l.export}</button>
            </div>
        `;
    }

    renderWidget(lang, streak) {
        const l = LABELS[lang] || LABELS.fr;
        return `<div class="calendar-widget" onclick="Calendar.open(state)"><span class="widget-icon">📅</span><span class="widget-text">${streak} ${l.days}</span></div>`;
    }
}
