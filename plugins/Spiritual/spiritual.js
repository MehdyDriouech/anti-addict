/**
 * Spiritual Plugin - Point d'entrée
 */

import { SpiritualModel } from './model/spiritual-model.js';
import { SpiritualView } from './view/spiritual-view.js';
import { SpiritualController } from './controller/spiritual-controller.js';
import { PLAYLIST_CONTEXTS, PRESET_GOALS } from './data/spiritual-data.js';

const spiritualModel = new SpiritualModel();
const spiritualView = new SpiritualView();
const spiritualController = new SpiritualController(spiritualModel, spiritualView);

const Spiritual = {
    PLAYLIST_CONTEXTS, PRESET_GOALS,
    open: (state) => spiritualController.open(state),
    close: () => spiritualController.close(),
    incrementDhikr: () => spiritualController.incrementDhikr(),
    decrementDhikr: () => spiritualController.decrementDhikr(),
    resetDhikr: () => spiritualController.resetDhikr(),
    getTodayGoals: (state) => spiritualController.getTodayGoals(state),
    addPresetGoal: () => spiritualController.addPresetGoal(),
    toggleGoal: (index) => spiritualController.toggleGoal(index),
    showPlaylist: (context) => spiritualController.showPlaylist(context),
    closePlaylist: () => spiritualController.closePlaylist(),
    nextCard: () => spiritualController.nextCard(),
    renderSpiritualWidget: (state) => spiritualController.renderWidget(state),
    getRandomCard: (state, themes) => spiritualController.getRandomCard(state, themes)
};

window.Spiritual = Spiritual;
export default Spiritual;
