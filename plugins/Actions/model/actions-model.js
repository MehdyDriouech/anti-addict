/**
 * Actions Model - Logique métier
 */

import { PREDEFINED_ACTIONS } from '../data/actions-data.js';

export class ActionsModel {
    /**
     * Récupère toutes les actions (prédéfinies + personnalisées)
     * @param {Object} state - State de l'application
     * @param {string} lang - Langue
     * @returns {Array}
     */
    getAllActions(state, lang = 'fr') {
        const actions = [];
        
        // Actions prédéfinies
        Object.entries(PREDEFINED_ACTIONS).forEach(([id, action]) => {
            actions.push({
                id,
                name: action.name[lang] || action.name.fr,
                emoji: action.emoji,
                category: action.category,
                predefined: true,
                favorite: state.sos?.favoriteActions?.includes(id) || false
            });
        });
        
        // Actions personnalisées
        if (state.customActions) {
            state.customActions.forEach(action => {
                actions.push({
                    id: action.id,
                    name: action.name,
                    emoji: action.emoji || '⭐',
                    category: 'custom',
                    predefined: false,
                    favorite: action.favorite || false
                });
            });
        }
        
        return actions;
    }

    /**
     * Récupère les actions favorites
     * @param {Object} state - State de l'application
     * @param {string} lang - Langue
     * @returns {Array}
     */
    getFavoriteActions(state, lang = 'fr') {
        const all = this.getAllActions(state, lang);
        return all.filter(a => a.favorite);
    }

    /**
     * Récupère une action aléatoire
     * @param {Object} state - State de l'application
     * @param {string} lang - Langue
     * @param {boolean} favoritesOnly - Uniquement parmi les favoris
     * @returns {Object|null}
     */
    getRandomAction(state, lang = 'fr', favoritesOnly = false) {
        let pool = favoritesOnly 
            ? this.getFavoriteActions(state, lang)
            : this.getAllActions(state, lang);
        
        if (pool.length === 0) {
            pool = this.getAllActions(state, lang);
        }
        
        if (pool.length === 0) return null;
        
        return pool[Math.floor(Math.random() * pool.length)];
    }

    /**
     * Récupère les actions par catégorie
     * @param {Object} state - State de l'application
     * @param {string} category - Catégorie
     * @param {string} lang - Langue
     * @returns {Array}
     */
    getActionsByCategory(state, category, lang = 'fr') {
        const all = this.getAllActions(state, lang);
        return all.filter(a => a.category === category);
    }

    /**
     * Récupère une action par ID
     * @param {Object} state - State de l'application
     * @param {string} actionId - ID de l'action
     * @param {string} lang - Langue
     * @returns {Object|null}
     */
    getActionById(state, actionId, lang = 'fr') {
        const all = this.getAllActions(state, lang);
        return all.find(a => a.id === actionId) || null;
    }

    /**
     * Toggle le statut favori d'une action
     * @param {Object} state - State de l'application
     * @param {string} actionId - ID de l'action
     * @returns {Object} State modifié
     */
    toggleFavorite(state, actionId) {
        const predefined = PREDEFINED_ACTIONS[actionId];
        
        if (predefined) {
            if (!state.sos.favoriteActions) {
                state.sos.favoriteActions = [];
            }
            
            const index = state.sos.favoriteActions.indexOf(actionId);
            if (index >= 0) {
                state.sos.favoriteActions.splice(index, 1);
            } else {
                state.sos.favoriteActions.push(actionId);
            }
        } else {
            const action = state.customActions.find(a => a.id === actionId);
            if (action) {
                action.favorite = !action.favorite;
            }
        }
        
        Storage.saveState(state);
        return state;
    }

    /**
     * Crée une nouvelle action personnalisée
     * @param {Object} state - State de l'application
     * @param {Object} actionData - { name, emoji }
     * @returns {Object} L'action créée
     */
    createAction(state, actionData) {
        const action = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            name: actionData.name,
            emoji: actionData.emoji || '⭐',
            favorite: false,
            createdAt: Storage.getDateISO()
        };
        
        Storage.addCustomAction(state, action);
        return action;
    }

    /**
     * Supprime une action personnalisée
     * @param {Object} state - State de l'application
     * @param {string} actionId - ID de l'action
     * @returns {boolean} Succès
     */
    deleteAction(state, actionId) {
        if (PREDEFINED_ACTIONS[actionId]) {
            return false;
        }
        
        Storage.deleteCustomAction(state, actionId);
        return true;
    }

    /**
     * Enregistre une action effectuée
     * @param {Object} state - State de l'application
     * @param {string} actionId - ID de l'action
     * @param {string} context - Contexte (sos, craving, slope)
     */
    recordActionDone(state, actionId, context) {
        if (!state.sos.recentActions) {
            state.sos.recentActions = [];
        }
        state.sos.recentActions.unshift({
            actionId,
            context,
            date: Storage.getDateISO(),
            time: new Date().toISOString()
        });
        
        // Garder uniquement les 50 dernières
        state.sos.recentActions = state.sos.recentActions.slice(0, 50);
        
        // Incrémenter les actions positives
        Storage.incrementWins(state, { positiveActions: 1 });
    }
}
