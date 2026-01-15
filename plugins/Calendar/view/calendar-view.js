/**
 * Calendar View - Rendu HTML
 */

import { WEEKDAYS, MONTHS, LABELS, EVENT_ICONS } from '../data/calendar-data.js';

export class CalendarView {
    constructor(services = {}) {
        this.calendarModalEl = null;
        this.timelineModalEl = null;
        this.dateService = services.dateService || null;
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
        const today = this.dateService?.todayISO() || (typeof Storage !== 'undefined' ? Storage.getDateISO() : new Date().toISOString().split('T')[0]);
        
        let html = '<div class="calendar-weekdays">';
        weekdays.forEach(day => html += `<span class="weekday">${day}</span>`);
        html += '</div><div class="calendar-days">';
        
        for (let i = 0; i < monthData.startDay; i++) html += '<div class="calendar-day empty"></div>';
        
        for (let day = 1; day <= monthData.daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === today;
            const hasEpisode = monthData.episodes.some(e => e.date === dateStr);
            const hasCraving = monthData.cravings.some(e => e.date === dateStr);
            const isClean = monthData.cleanDays.includes(dateStr);
            const isFuture = dateStr > today;
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (hasEpisode) classes += ' episode';
            else if (hasCraving) classes += ' craving';
            else if (isClean) classes += ' clean';
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
                    <span class="legend-item"><span class="dot clean"></span> ${I18n.t('clean_day') || 'Jour réussi'}</span>
                    <span class="legend-item"><span class="dot episode"></span> ${l.episode}</span>
                    <span class="legend-item"><span class="dot craving"></span> ${l.craving}</span>
                </div>
                <button class="btn btn-secondary btn-block" onclick="Calendar.close(); Calendar.openTimeline(state);">📊 ${l.timeline}</button>
            </div>
        `;
    }

    renderTimelineModal(lang, groupedEvents, state = null, selectedAddictionId = null) {
        const l = LABELS[lang] || LABELS.fr;
        
        // Générer le filtre d'addiction
        const addictionFilter = this.renderTimelineAddictionFilter(state, selectedAddictionId, 'onTimelineAddictionChange');
        
        this.timelineModalEl.innerHTML = `
            <div class="modal-content timeline-modal">
                <button class="modal-close" onclick="Calendar.closeTimeline()">×</button>
                <h2>📊 ${l.timeline}</h2>
                
                <!-- Filtre par addiction -->
                ${addictionFilter}
                
                <div class="timeline-container">
                    ${Object.keys(groupedEvents).length === 0 ? `<p class="empty-message">${l.empty}</p>` : 
                        Object.entries(groupedEvents).map(([date, events]) => `
                            <div class="timeline-day">
                                <div class="timeline-date">${this.formatDate(date, lang)}</div>
                                <div class="timeline-events">
                                    ${events.map(e => {
                                        const normalizedAddictionId = this.normalizeAddictionId(e.addictionId);
                                        const addictionName = normalizedAddictionId && typeof I18n !== 'undefined' 
                                            ? I18n.t(`addiction_${normalizedAddictionId}`) 
                                            : '';
                                        const addictionIcon = this.getAddictionIcon(normalizedAddictionId);
                                        return `
                                        <div class="timeline-event ${e.type}">
                                            <span class="event-icon">${EVENT_ICONS[e.type] || '•'}</span>
                                            <span class="event-type">${l[e.type] || e.type}</span>
                                            ${addictionName ? `<span class="event-addiction">${addictionIcon} ${addictionName}</span>` : ''}
                                            <span class="event-time">${this.formatTime(e.ts)}</span>
                                            ${e.intensity ? `<span class="event-intensity">${e.intensity}/10</span>` : ''}
                                        </div>
                                    `;
                                    }).join('')}
                                </div>
                            </div>
                        `).join('')}
                </div>
                <button class="btn btn-secondary btn-block" onclick="Calendar.exportTimeline()">📥 ${l.export}</button>
            </div>
        `;
    }

    /**
     * Normalise un addictionId (peut être string ou objet)
     * @param {string|Object} addictionId - ID de l'addiction
     * @returns {string|null} ID normalisé ou null
     */
    normalizeAddictionId(addictionId) {
        if (!addictionId) return null;
        if (typeof addictionId === 'string') return addictionId;
        if (typeof addictionId === 'object' && addictionId.id) return addictionId.id;
        return String(addictionId);
    }

    /**
     * Génère un filtre d'addiction pour la timeline
     * @param {Object} state - State de l'application
     * @param {string} selectedAddictionId - ID de l'addiction actuellement sélectionnée (null pour tous)
     * @param {string} onAddictionChange - Nom de fonction à appeler lors du changement
     * @returns {string} HTML du filtre
     */
    renderTimelineAddictionFilter(state, selectedAddictionId, onAddictionChange) {
        const activeAddictions = state?.addictions || [];
        
        // Si une seule addiction, ne pas afficher le filtre
        if (activeAddictions.length <= 1) {
            return '';
        }

        const lang = state?.profile?.lang || 'fr';
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

        const filterLabel = {
            fr: 'Filtrer par addiction',
            en: 'Filter by addiction',
            ar: 'تصفية حسب الإدمان'
        }[lang] || 'Filter by addiction';

        const allLabel = {
            fr: 'Toutes',
            en: 'All',
            ar: 'الكل'
        }[lang] || 'All';

        // Option "Toutes"
        const allChip = `
            <button class="chip addiction-chip ${selectedAddictionId === null ? 'active' : ''}" 
                    onclick="${onAddictionChange}(null)"
                    data-addiction-id="all">
                <span class="chip-icon">📋</span>
                <span class="chip-label">${allLabel}</span>
                ${selectedAddictionId === null ? '<span class="chip-check">✓</span>' : ''}
            </button>
        `;

        // Options par addiction
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
            <div class="addiction-filter-container timeline-filter">
                <label class="addiction-filter-label">${filterLabel}</label>
                <div class="addiction-chips">
                    ${allChip}
                    ${addictionChips}
                </div>
            </div>
        `;
    }

    /**
     * Récupère l'icône d'une addiction
     * @param {string} addictionId - ID de l'addiction
     * @returns {string} Icône emoji
     */
    getAddictionIcon(addictionId) {
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
        return icons[addictionId] || '📋';
    }

    renderWidget(lang, streak) {
        const l = LABELS[lang] || LABELS.fr;
        return `<div class="calendar-widget" onclick="Calendar.open(state)"><span class="widget-icon">📅</span><span class="widget-text">${streak} ${l.days}</span></div>`;
    }
}
