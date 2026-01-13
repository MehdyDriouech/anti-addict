/**
 * Actions View - Rendu HTML
 */

import { CATEGORIES, LABELS, EMOJI_OPTIONS } from '../data/actions-data.js';

export class ActionsView {
    constructor() {
        this.modalEl = null;
    }

    /**
     * Crée l'élément modal
     * @returns {HTMLElement}
     */
    createModalElement() {
        if (!this.modalEl) {
            this.modalEl = document.createElement('div');
            this.modalEl.className = 'modal-overlay';
            this.modalEl.id = 'actionsModal';
            document.body.appendChild(this.modalEl);
        }
        return this.modalEl;
    }

    /**
     * Récupère l'élément modal
     * @returns {HTMLElement}
     */
    getModalElement() {
        return this.modalEl;
    }

    /**
     * Affiche le modal
     */
    show() {
        if (this.modalEl) {
            this.modalEl.classList.add('active');
        }
    }

    /**
     * Cache le modal
     */
    hide() {
        if (this.modalEl) {
            this.modalEl.classList.remove('active');
        }
    }

    /**
     * Rendu du modal actions
     * @param {Object} state - State
     * @param {Array} allActions - Toutes les actions
     * @param {Array} favorites - Actions favorites
     * @param {Function} getActionsByCategory - Fonction pour filtrer par catégorie
     */
    renderModal(state, allActions, favorites, getActionsByCategory) {
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        
        this.modalEl.innerHTML = `
            <div class="modal-content actions-modal">
                <button class="modal-close" onclick="Actions.close()">×</button>
                
                <div class="actions-header">
                    <h2>${l.title}</h2>
                    <p>${l.subtitle}</p>
                </div>
                
                <!-- Bouton ajouter -->
                <button class="btn btn-secondary btn-block" onclick="Actions.showAddForm()">
                    ➕ ${l.addNew}
                </button>
                
                <!-- Favoris -->
                <div class="actions-section">
                    <h3>⭐ ${l.favorites}</h3>
                    ${favorites.length === 0 ? `
                        <p class="empty-message">${l.noFavorites}</p>
                    ` : `
                        <div class="actions-grid">
                            ${favorites.map(a => this.renderActionCard(a, lang, true)).join('')}
                        </div>
                    `}
                </div>
                
                <!-- Par catégorie -->
                ${Object.entries(CATEGORIES).map(([catId, cat]) => {
                    const catActions = getActionsByCategory(catId);
                    if (catActions.length === 0) return '';
                    
                    return `
                        <div class="actions-section">
                            <h3>${cat.emoji} ${cat[lang] || cat.fr}</h3>
                            <div class="actions-grid">
                                ${catActions.map(a => this.renderActionCard(a, lang, false)).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Rendu d'une carte action
     * @param {Object} action - Action
     * @param {string} lang - Langue
     * @param {boolean} showDelete - Afficher bouton supprimer
     * @returns {string} HTML
     */
    renderActionCard(action, lang, showDelete = false) {
        const favClass = action.favorite ? 'favorite' : '';
        const customClass = action.predefined ? '' : 'custom';
        
        return `
            <div class="action-card ${favClass} ${customClass}" data-action-id="${action.id}">
                <span class="action-emoji">${action.emoji}</span>
                <span class="action-name">${action.name}</span>
                <div class="action-buttons">
                    <button class="action-fav-btn" onclick="Actions.toggleFav('${action.id}')">
                        ${action.favorite ? '⭐' : '☆'}
                    </button>
                    ${!action.predefined ? `
                        <button class="action-del-btn" onclick="Actions.del('${action.id}')">🗑️</button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Rendu du formulaire d'ajout
     * @param {string} lang - Langue
     */
    renderAddForm(lang) {
        const l = LABELS[lang] || LABELS.fr;
        
        const modalContent = this.modalEl.querySelector('.modal-content');
        modalContent.innerHTML = `
            <button class="modal-close" onclick="Actions.close()">×</button>
            
            <div class="add-action-form">
                <button class="btn btn-ghost" onclick="Actions.open(state)">← ${l.back}</button>
                <h3>${l.newAction}</h3>
                
                <div class="form-group">
                    <label>${l.name}</label>
                    <input type="text" id="actionName" class="input" placeholder="${l.name}" maxlength="50">
                </div>
                
                <div class="form-group">
                    <label>${l.emoji}</label>
                    <div class="emoji-picker">
                        ${EMOJI_OPTIONS.map(e => `
                            <button type="button" class="emoji-option" onclick="Actions.selectEmoji('${e}')">${e}</button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="actionEmoji" value="⭐">
                </div>
                
                <button class="btn btn-primary btn-block" onclick="Actions.saveNewAction()">
                    ${l.save}
                </button>
            </div>
        `;
    }

    /**
     * Met à jour la sélection d'emoji
     * @param {string} emoji - Emoji sélectionné
     */
    updateEmojiSelection(emoji) {
        document.getElementById('actionEmoji').value = emoji;
        document.querySelectorAll('.emoji-option').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.textContent === emoji) {
                btn.classList.add('selected');
            }
        });
    }

    /**
     * Génère le HTML pour un sélecteur d'actions
     * @param {Array} actionsToShow - Actions à afficher
     * @param {string} context - Contexte
     * @param {string} lang - Langue
     * @returns {string} HTML
     */
    renderActionSelector(actionsToShow, context, lang) {
        const l = LABELS[lang] || LABELS.fr;
        
        return `
            <div class="action-selector" data-context="${context}">
                <div class="action-selector-grid">
                    ${actionsToShow.map(a => `
                        <button class="action-selector-btn" onclick="Actions.executeAction('${a.id}', '${context}')">
                            <span class="action-emoji">${a.emoji}</span>
                            <span class="action-name">${a.name}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="action-selector-footer">
                    <button class="btn btn-secondary btn-small" onclick="Actions.executeRandom('${context}')">
                        🎲 ${l.randomAction}
                    </button>
                    <button class="btn btn-ghost btn-small" onclick="Actions.open(state)">
                        ${l.more}
                    </button>
                </div>
            </div>
        `;
    }
}
