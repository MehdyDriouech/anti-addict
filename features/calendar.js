/**
 * calendar.js - Calendrier sobriété et Timeline
 * 
 * Fonctionnalités:
 * - Calendrier habit tracker (vue mensuelle)
 * - Timeline chronologique des événements
 * - Marquage des jours sobres
 * - Export de la vue
 */

// ============================================
// CONSTANTES
// ============================================

const WEEKDAYS = {
    fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    ar: ['إث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح']
};

const MONTHS = {
    fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
};

// ============================================
// CALENDRIER
// ============================================

let calendarModalEl = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

/**
 * Ouvre le modal calendrier
 */
function openCalendarModal(state) {
    if (!calendarModalEl) {
        calendarModalEl = document.createElement('div');
        calendarModalEl.className = 'modal-overlay';
        calendarModalEl.id = 'calendarModal';
        document.body.appendChild(calendarModalEl);
    }
    
    currentMonth = new Date().getMonth();
    currentYear = new Date().getFullYear();
    
    renderCalendarModal(state);
    calendarModalEl.classList.add('active');
}

/**
 * Ferme le modal
 */
function closeCalendarModal() {
    if (calendarModalEl) {
        calendarModalEl.classList.remove('active');
    }
}

/**
 * Rendu du modal calendrier
 */
function renderCalendarModal(state) {
    const lang = state.profile.lang;
    
    const labels = {
        fr: { title: '📅 Calendrier sobriété', today: 'Aujourd\'hui', streak: 'Streak actuel', timeline: 'Timeline' },
        en: { title: '📅 Sobriety calendar', today: 'Today', streak: 'Current streak', timeline: 'Timeline' },
        ar: { title: '📅 تقويم الصحو', today: 'اليوم', streak: 'السلسلة الحالية', timeline: 'الجدول الزمني' }
    };
    
    const l = labels[lang] || labels.fr;
    const monthName = MONTHS[lang]?.[currentMonth] || MONTHS.fr[currentMonth];
    const streak = Storage.calculateStreak(state);
    
    calendarModalEl.innerHTML = `
        <div class="modal-content calendar-modal">
            <button class="modal-close" onclick="Calendar.close()">×</button>
            
            <h2>${l.title}</h2>
            
            <!-- Stats -->
            <div class="calendar-stats">
                <div class="stat-item">
                    <span class="stat-value">${streak}</span>
                    <span class="stat-label">${l.streak}</span>
                </div>
            </div>
            
            <!-- Navigation mois -->
            <div class="month-nav">
                <button class="btn btn-ghost" onclick="Calendar.prevMonth()">←</button>
                <span class="month-name">${monthName} ${currentYear}</span>
                <button class="btn btn-ghost" onclick="Calendar.nextMonth()">→</button>
            </div>
            
            <!-- Calendrier -->
            <div class="calendar-grid">
                ${renderCalendarGrid(state, lang)}
            </div>
            
            <!-- Légende -->
            <div class="calendar-legend">
                <span class="legend-item"><span class="dot sober"></span> Sobre</span>
                <span class="legend-item"><span class="dot episode"></span> Épisode</span>
                <span class="legend-item"><span class="dot craving"></span> Craving</span>
            </div>
            
            <!-- Bouton timeline -->
            <button class="btn btn-secondary btn-block" onclick="Calendar.close(); Calendar.openTimeline(state);">
                📊 ${l.timeline}
            </button>
        </div>
    `;
}

/**
 * Rendu de la grille du calendrier
 */
function renderCalendarGrid(state, lang) {
    const weekdays = WEEKDAYS[lang] || WEEKDAYS.fr;
    
    // Jours de la semaine
    let html = '<div class="calendar-weekdays">';
    weekdays.forEach(day => {
        html += `<span class="weekday">${day}</span>`;
    });
    html += '</div>';
    
    // Jours du mois
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Premier jour de la semaine (0 = dimanche, on veut lundi = 0)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    
    // Données du mois
    const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const monthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    
    const episodes = state.events.filter(e => 
        e.type === 'episode' && e.date >= monthStart && e.date <= monthEnd
    );
    const cravings = state.events.filter(e => 
        e.type === 'craving' && e.date >= monthStart && e.date <= monthEnd
    );
    const sobrietyDays = state.calendar?.sobrietyDays?.filter(d => 
        d >= monthStart && d <= monthEnd
    ) || [];
    
    const today = Storage.getDateISO();
    
    html += '<div class="calendar-days">';
    
    // Cases vides avant le premier jour
    for (let i = 0; i < startDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateStr === today;
        const hasEpisode = episodes.some(e => e.date === dateStr);
        const hasCraving = cravings.some(e => e.date === dateStr);
        const isSober = sobrietyDays.includes(dateStr);
        const isFuture = dateStr > today;
        
        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (hasEpisode) classes += ' episode';
        else if (hasCraving) classes += ' craving';
        else if (isSober) classes += ' sober';
        if (isFuture) classes += ' future';
        
        html += `
            <div class="${classes}" 
                 onclick="${!isFuture ? `Calendar.toggleDay('${dateStr}')` : ''}"
                 data-date="${dateStr}">
                <span class="day-number">${day}</span>
            </div>
        `;
    }
    
    html += '</div>';
    
    return html;
}

/**
 * Mois précédent
 */
function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendarModal(state);
}

/**
 * Mois suivant
 */
function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendarModal(state);
}

/**
 * Toggle un jour comme sobre
 */
function toggleDay(dateStr) {
    if (!state.calendar.sobrietyDays) {
        state.calendar.sobrietyDays = [];
    }
    
    const index = state.calendar.sobrietyDays.indexOf(dateStr);
    if (index >= 0) {
        state.calendar.sobrietyDays.splice(index, 1);
    } else {
        state.calendar.sobrietyDays.push(dateStr);
    }
    
    Storage.saveState(state);
    renderCalendarModal(state);
}

// ============================================
// TIMELINE
// ============================================

let timelineModalEl = null;

/**
 * Ouvre le modal timeline
 */
function openTimelineModal(state) {
    if (!timelineModalEl) {
        timelineModalEl = document.createElement('div');
        timelineModalEl.className = 'modal-overlay';
        timelineModalEl.id = 'timelineModal';
        document.body.appendChild(timelineModalEl);
    }
    
    renderTimelineModal(state);
    timelineModalEl.classList.add('active');
}

/**
 * Ferme le modal timeline
 */
function closeTimelineModal() {
    if (timelineModalEl) {
        timelineModalEl.classList.remove('active');
    }
}

/**
 * Rendu du modal timeline
 */
function renderTimelineModal(state) {
    const lang = state.profile.lang;
    
    const labels = {
        fr: {
            title: '📊 Timeline',
            empty: 'Aucun événement',
            craving: 'Craving',
            episode: 'Épisode',
            win: 'Victoire',
            slope: 'Pente',
            export: 'Exporter'
        },
        en: {
            title: '📊 Timeline',
            empty: 'No events',
            craving: 'Craving',
            episode: 'Episode',
            win: 'Win',
            slope: 'Slope',
            export: 'Export'
        },
        ar: {
            title: '📊 الجدول الزمني',
            empty: 'لا أحداث',
            craving: 'رغبة',
            episode: 'حادث',
            win: 'انتصار',
            slope: 'منحدر',
            export: 'تصدير'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    // Récupérer les 50 derniers événements
    const events = [...state.events]
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 50);
    
    // Grouper par date
    const grouped = {};
    events.forEach(event => {
        if (!grouped[event.date]) {
            grouped[event.date] = [];
        }
        grouped[event.date].push(event);
    });
    
    timelineModalEl.innerHTML = `
        <div class="modal-content timeline-modal">
            <button class="modal-close" onclick="Calendar.closeTimeline()">×</button>
            
            <h2>${l.title}</h2>
            
            <div class="timeline-container">
                ${Object.keys(grouped).length === 0 ? `
                    <p class="empty-message">${l.empty}</p>
                ` : Object.entries(grouped).map(([date, dayEvents]) => `
                    <div class="timeline-day">
                        <div class="timeline-date">${formatDate(date, lang)}</div>
                        <div class="timeline-events">
                            ${dayEvents.map(e => `
                                <div class="timeline-event ${e.type}">
                                    <span class="event-icon">${getEventIcon(e.type)}</span>
                                    <span class="event-type">${l[e.type] || e.type}</span>
                                    <span class="event-time">${formatTime(e.ts)}</span>
                                    ${e.intensity ? `<span class="event-intensity">${e.intensity}/10</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <button class="btn btn-secondary btn-block" onclick="Calendar.exportTimeline()">
                📥 ${l.export}
            </button>
        </div>
    `;
}

/**
 * Formate une date
 */
function formatDate(dateStr, lang) {
    const date = new Date(dateStr);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang === 'en' ? 'en-US' : 'fr-FR', options);
}

/**
 * Formate une heure depuis timestamp
 */
function formatTime(ts) {
    const date = new Date(ts);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * Icône d'événement
 */
function getEventIcon(type) {
    const icons = {
        craving: '🔥',
        episode: '💔',
        win: '🏆',
        slope: '⚠️'
    };
    return icons[type] || '•';
}

/**
 * Exporte la timeline en JSON
 */
function exportTimeline() {
    const data = {
        exportDate: Storage.getDateISO(),
        events: state.events,
        sobrietyDays: state.calendar?.sobrietyDays || []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `timeline-${Storage.getDateISO()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    if (typeof showToast === 'function') {
        const lang = state?.profile?.lang || 'fr';
        const messages = {
            fr: 'Timeline exportée',
            en: 'Timeline exported',
            ar: 'تم تصدير الجدول الزمني'
        };
        showToast(messages[lang]);
    }
}

/**
 * Génère le widget calendrier pour la home
 */
function renderCalendarWidget(state) {
    const lang = state.profile.lang;
    const streak = Storage.calculateStreak(state);
    
    const labels = {
        fr: { calendar: 'Calendrier', days: 'jours' },
        en: { calendar: 'Calendar', days: 'days' },
        ar: { calendar: 'التقويم', days: 'أيام' }
    };
    
    const l = labels[lang] || labels.fr;
    
    return `
        <div class="calendar-widget" onclick="Calendar.open(state)">
            <span class="widget-icon">📅</span>
            <span class="widget-text">${streak} ${l.days}</span>
        </div>
    `;
}

// ============================================
// EXPORTS
// ============================================

window.Calendar = {
    // Calendrier
    open: openCalendarModal,
    close: closeCalendarModal,
    prevMonth,
    nextMonth,
    toggleDay,
    
    // Timeline
    openTimeline: openTimelineModal,
    closeTimeline: closeTimelineModal,
    exportTimeline,
    
    // Widget
    renderCalendarWidget,
    
    // Utils
    formatDate,
    formatTime
};
