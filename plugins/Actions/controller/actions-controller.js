/**
 * Actions Controller - Orchestration Model/View
 */

import { ActionsModel } from '../model/actions-model.js';
import { ActionsView } from '../view/actions-view.js';
import { LABELS } from '../data/actions-data.js';

export class ActionsController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    /**
     * Ouvre le modal des actions
     * @param {Object} state - State de l'application
     */
    open(state) {
        const modalEl = this.view.createModalElement();
        
        // Ajouter l'event listener pour fermer sur clic overlay
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => {
                if (e.target === modalEl) {
                    this.close();
                }
            });
            modalEl._hasClickListener = true;
        }
        
        this.renderModal(state);
        this.view.show();
    }

    /**
     * Ferme le modal
     */
    close() {
        this.view.hide();
    }

    /**
     * Rendu du modal
     * @param {Object} state - State
     */
    renderModal(state) {
        const lang = state.profile.lang;
        const allActions = this.model.getAllActions(state, lang);
        const favorites = this.model.getFavoriteActions(state, lang);
        
        const getActionsByCategory = (catId) => this.model.getActionsByCategory(state, catId, lang);
        
        this.view.renderModal(state, allActions, favorites, getActionsByCategory);
    }

    /**
     * Affiche le formulaire d'ajout
     */
    showAddForm() {
        const state = typeof window !== 'undefined' ? window.state : null;
        const lang = state?.profile?.lang || 'fr';
        this.view.renderAddForm(lang);
    }

    /**
     * Sélectionne un emoji
     * @param {string} emoji
     */
    selectEmoji(emoji) {
        this.view.updateEmojiSelection(emoji);
    }

    /**
     * Sauvegarde une nouvelle action
     */
    saveNewAction() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const name = document.getElementById('actionName')?.value?.trim();
        const emoji = document.getElementById('actionEmoji')?.value || '⭐';
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        
        if (!name) {
            alert(l.nameRequired);
            return;
        }
        
        this.model.createAction(state, { name, emoji });
        this.open(state);
        
        if (typeof showToast === 'function') {
            showToast(l.added);
        }
    }

    /**
     * Toggle favori depuis l'UI
     * @param {string} actionId
     */
    toggleFav(actionId) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        this.model.toggleFavorite(state, actionId);
        this.renderModal(state);
    }

    /**
     * Supprime une action depuis l'UI
     * @param {string} actionId
     */
    del(actionId) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        
        if (confirm(l.confirmDelete)) {
            this.model.deleteAction(state, actionId);
            this.renderModal(state);
        }
    }

    /**
     * Exécute une action
     * @param {string} actionId
     * @param {string} context
     */
    executeAction(actionId, context) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const lang = state.profile.lang;
        const action = this.model.getActionById(state, actionId, lang);
        if (!action) return;
        
        this.model.recordActionDone(state, actionId, context);
        
        if (typeof showToast === 'function') {
            const l = LABELS[lang] || LABELS.fr;
            showToast(`${action.emoji} ${l.actionDone}`);
        }
    }

    /**
     * Exécute une action aléatoire
     * @param {string} context
     */
    executeRandom(context) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const lang = state.profile.lang;
        const action = this.model.getRandomAction(state, lang, true);
        
        if (action) {
            this.executeAction(action.id, context);
            
            if (typeof showToast === 'function') {
                showToast(`${action.emoji} ${action.name}`);
            }
        }
    }

    /**
     * Génère le sélecteur d'actions
     * @param {Object} state - State
     * @param {string} context - Contexte
     * @param {number} maxActions - Nombre max
     * @returns {string} HTML
     */
    renderActionSelector(state, context = 'sos', maxActions = 6) {
        const lang = state.profile.lang;
        const favorites = this.model.getFavoriteActions(state, lang);
        
        let actionsToShow = [...favorites];
        
        if (actionsToShow.length < maxActions) {
            const all = this.model.getAllActions(state, lang).filter(a => !a.favorite);
            const shuffled = all.sort(() => Math.random() - 0.5);
            actionsToShow = [...actionsToShow, ...shuffled.slice(0, maxActions - actionsToShow.length)];
        }
        
        actionsToShow = actionsToShow.slice(0, maxActions);
        
        return this.view.renderActionSelector(actionsToShow, context, lang);
    }

    // Méthodes déléguées au model pour l'API publique
    getAllActions(state, lang) {
        return this.model.getAllActions(state, lang);
    }

    getFavoriteActions(state, lang) {
        return this.model.getFavoriteActions(state, lang);
    }

    getRandomAction(state, lang, favoritesOnly) {
        return this.model.getRandomAction(state, lang, favoritesOnly);
    }

    getActionsByCategory(state, category, lang) {
        return this.model.getActionsByCategory(state, category, lang);
    }

    getActionById(state, actionId, lang) {
        return this.model.getActionById(state, actionId, lang);
    }

    toggleFavorite(state, actionId) {
        return this.model.toggleFavorite(state, actionId);
    }

    createAction(state, actionData) {
        return this.model.createAction(state, actionData);
    }

    deleteAction(state, actionId) {
        return this.model.deleteAction(state, actionId);
    }
}
