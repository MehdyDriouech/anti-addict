/**
 * Calendar Model - Logique métier
 */

export class CalendarModel {
    constructor() {
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
    }

    resetToCurrentMonth() {
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
    }

    prevMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
    }

    getCurrentMonth() { return this.currentMonth; }
    getCurrentYear() { return this.currentYear; }

    getMonthData(state) {
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;
        
        const monthStart = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-01`;
        const monthEnd = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
        
        // Migration : si sobrietyDays existe mais pas cleanDays, migrer
        if (state.calendar?.sobrietyDays && !state.calendar.cleanDays) {
            state.calendar.cleanDays = [...state.calendar.sobrietyDays];
        }
        
        return {
            daysInMonth,
            startDay,
            monthStart,
            monthEnd,
            episodes: state.events.filter(e => e.type === 'episode' && e.date >= monthStart && e.date <= monthEnd),
            cravings: state.events.filter(e => e.type === 'craving' && e.date >= monthStart && e.date <= monthEnd),
            cleanDays: state.calendar?.cleanDays?.filter(d => d >= monthStart && d <= monthEnd) || []
        };
    }

    toggleDay(state, dateStr) {
        // Migration : si sobrietyDays existe mais pas cleanDays, migrer
        if (state.calendar?.sobrietyDays && !state.calendar.cleanDays) {
            state.calendar.cleanDays = [...state.calendar.sobrietyDays];
            delete state.calendar.sobrietyDays;
        }
        
        if (!state.calendar.cleanDays) state.calendar.cleanDays = [];
        
        const index = state.calendar.cleanDays.indexOf(dateStr);
        if (index >= 0) {
            state.calendar.cleanDays.splice(index, 1);
        } else {
            state.calendar.cleanDays.push(dateStr);
        }
        Storage.saveState(state);
    }

    getGroupedEvents(state, limit = 50, addictionId = null) {
        let events = [...state.events];
        
        // Filtrer par addiction si spécifié
        if (addictionId) {
            events = events.filter(event => event.addictionId === addictionId);
        }
        
        events = events.sort((a, b) => b.ts - a.ts).slice(0, limit);
        const grouped = {};
        events.forEach(event => {
            if (!grouped[event.date]) grouped[event.date] = [];
            grouped[event.date].push(event);
        });
        return grouped;
    }

    exportData(state) {
        // Migration : si sobrietyDays existe mais pas cleanDays, migrer
        if (state.calendar?.sobrietyDays && !state.calendar.cleanDays) {
            state.calendar.cleanDays = [...state.calendar.sobrietyDays];
        }
        
        return {
            exportDate: Storage.getDateISO(),
            events: state.events,
            cleanDays: state.calendar?.cleanDays || []
        };
    }
}
