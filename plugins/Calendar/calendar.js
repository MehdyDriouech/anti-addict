/**
 * Calendar Plugin - Point d'entrée
 */

import { CalendarModel } from './model/calendar-model.js';
import { CalendarView } from './view/calendar-view.js';
import { CalendarController } from './controller/calendar-controller.js';

const calendarModel = new CalendarModel();
const calendarView = new CalendarView();
const calendarController = new CalendarController(calendarModel, calendarView);

const Calendar = {
    open: (state) => calendarController.open(state),
    close: () => calendarController.close(),
    prevMonth: () => calendarController.prevMonth(),
    nextMonth: () => calendarController.nextMonth(),
    toggleDay: (dateStr) => calendarController.toggleDay(dateStr),
    
    openTimeline: (state) => calendarController.openTimeline(state),
    closeTimeline: () => calendarController.closeTimeline(),
    exportTimeline: () => calendarController.exportTimeline(),
    
    renderCalendarWidget: (state) => calendarController.renderWidget(state),
    formatDate: (dateStr, lang) => calendarController.formatDate(dateStr, lang),
    formatTime: (ts) => calendarController.formatTime(ts)
};

window.Calendar = Calendar;

export default Calendar;
