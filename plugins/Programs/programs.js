/**
 * Programs Plugin - Point d'entrée
 */

import { ProgramsModel } from './model/programs-model.js';
import { ProgramsView } from './view/programs-view.js';
import { ProgramsController } from './controller/programs-controller.js';

const programsModel = new ProgramsModel();
const programsView = new ProgramsView();
const programsController = new ProgramsController(programsModel, programsView);

const Programs = {
    setState: (state) => programsController.setState(state),
    loadProgram: (programId, lang) => programsController.loadProgram(programId, lang),
    start: (stateOrId, programId) => programsController.startProgram(stateOrId, programId),
    resume: (state) => programsController.resumeProgram(state),
    complete: (state) => programsController.completeProgram(state),
    abandon: (state) => programsController.abandonProgram(state),
    switchProgram: (programId) => programsController.switchProgram(programId),
    openDay: (state, day) => programsController.openDayModal(state, day),
    close: () => programsController.closeModal(),
    completeDay: (day) => programsController.completeDay(day),
    goToDay: (day) => programsController.goToDay(day),
    finish: () => programsController.finish(),
    startUrgeSurfing: (duration) => programsController.startUrgeSurfing(duration),
    openSelect: (state) => programsController.openSelectModal(state),
    closeSelect: () => programsController.closeSelectModal(),
    renderProgramWidget: (state) => programsController.renderWidget(state)
};

window.Programs = Programs;
export default Programs;
