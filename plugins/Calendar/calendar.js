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
    
    openTimeline: (state, selectedAddictionId) => calendarController.openTimeline(state, selectedAddictionId),
    closeTimeline: () => calendarController.closeTimeline(),
    exportTimeline: () => calendarController.exportTimeline(),
    onTimelineAddictionChange: (addictionId, state) => calendarController.onTimelineAddictionChange(addictionId, state),
    
    renderCalendarWidget: (state) => calendarController.renderWidget(state),
    formatDate: (dateStr, lang) => calendarController.formatDate(dateStr, lang),
    formatTime: (ts) => calendarController.formatTime(ts)
};

window.Calendar = Calendar;
window.onTimelineAddictionChange = (addictionId) => {
    const state = typeof window !== 'undefined' ? window.state : null;
    if (state) Calendar.onTimelineAddictionChange(addictionId, state);
};

export default Calendar;
