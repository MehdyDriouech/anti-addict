/**
 * Actions Plugin - Point d'entrée
 */

import { ActionsModel } from './model/actions-model.js';
import { ActionsView } from './view/actions-view.js';
import { ActionsController } from './controller/actions-controller.js';
import { PREDEFINED_ACTIONS, CATEGORIES } from './data/actions-data.js';

// Créer les instances
const actionsModel = new ActionsModel();
const actionsView = new ActionsView();
const actionsController = new ActionsController(actionsModel, actionsView);

// Exporter l'API publique
const Actions = {
    // Constants
    PREDEFINED_ACTIONS,
    CATEGORIES,
    
    // Getters
    getAllActions: (state, lang) => actionsController.getAllActions(state, lang),
    getFavoriteActions: (state, lang) => actionsController.getFavoriteActions(state, lang),
    getRandomAction: (state, lang, favoritesOnly) => actionsController.getRandomAction(state, lang, favoritesOnly),
    getActionsByCategory: (state, category, lang) => actionsController.getActionsByCategory(state, category, lang),
    getActionById: (state, actionId, lang) => actionsController.getActionById(state, actionId, lang),
    
    // CRUD
    toggleFavorite: (state, actionId) => actionsController.toggleFavorite(state, actionId),
    createAction: (state, actionData) => actionsController.createAction(state, actionData),
    deleteAction: (state, actionId) => actionsController.deleteAction(state, actionId),
    
    // Modal
    open: (state) => actionsController.open(state),
    openActionsModal: (state) => actionsController.open(state),
    close: () => actionsController.close(),
    closeActionsModal: () => actionsController.close(),
    showAddForm: () => actionsController.showAddForm(),
    selectEmoji: (emoji) => actionsController.selectEmoji(emoji),
    saveNewAction: () => actionsController.saveNewAction(),
    toggleFav: (actionId) => actionsController.toggleFav(actionId),
    del: (actionId) => actionsController.del(actionId),
    
    // Selector
    renderActionSelector: (state, context, maxActions) => actionsController.renderActionSelector(state, context, maxActions),
    executeAction: (actionId, context) => actionsController.executeAction(actionId, context),
    executeRandom: (context) => actionsController.executeRandom(context)
};

// Exposer globalement pour compatibilité
window.Actions = Actions;

export default Actions;
