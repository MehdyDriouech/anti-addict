/**
 * Coaching Plugin - Point d'entrée
 */

import { CoachingModel } from './model/coaching-model.js';
import { CoachingView } from './view/coaching-view.js';
import { CoachingController } from './controller/coaching-controller.js';
import { CORRELATION_THRESHOLDS, DAY_PERIODS } from './data/coaching-data.js';

const coachingModel = new CoachingModel();
const coachingView = new CoachingView();
const coachingController = new CoachingController(coachingModel, coachingView);

const Coaching = {
    CORRELATION_THRESHOLDS, DAY_PERIODS,
    computeWeeklyInsights: (state) => coachingController.computeWeeklyInsights(state),
    computeTopTriggers: (events, count) => coachingController.computeTopTriggers(events, count),
    computeRiskHours: (events) => coachingController.computeRiskHours(events),
    findCorrelations: (state, startDate) => coachingController.findCorrelations(state, startDate),
    suggestRules: (state, events) => coachingController.suggestRules(state, events),
    openInsights: (state) => coachingController.openInsights(state),
    closeInsights: () => coachingController.closeInsights(),
    addSuggestedRule: (trigger) => coachingController.addSuggestedRule(trigger),
    isWeeklyInsightAvailable: (state) => coachingController.isWeeklyInsightAvailable(state),
    renderInsightsWidget: (state) => coachingController.renderWidget(state)
};

window.Coaching = Coaching;
export default Coaching;
