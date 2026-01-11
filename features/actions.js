/**
 * actions.js - Bibliothèque d'actions personnalisées
 * 
 * Fonctionnalités:
 * - CRUD actions personnalisées
 * - Actions prédéfinies
 * - Favoris
 * - Action aléatoire
 * - Intégration avec craving, pente, SOS, règles
 */

// ============================================
// ACTIONS PRÉDÉFINIES
// ============================================

const PREDEFINED_ACTIONS = {
    // Mouvement
    walk_2min: { 
        emoji: '🚶', 
        category: 'movement',
        name: { fr: 'Marcher 2 minutes', en: 'Walk 2 minutes', ar: 'المشي دقيقتين' }
    },
    pushups: { 
        emoji: '💪', 
        category: 'movement',
        name: { fr: 'Faire des pompes', en: 'Do push-ups', ar: 'تمارين الضغط' }
    },
    squats: { 
        emoji: '🦵', 
        category: 'movement',
        name: { fr: 'Faire des squats', en: 'Do squats', ar: 'تمارين القرفصاء' }
    },
    stretch: { 
        emoji: '🧘', 
        category: 'movement',
        name: { fr: 'S\'étirer', en: 'Stretch', ar: 'تمدد' }
    },
    leave_room: { 
        emoji: '🚪', 
        category: 'movement',
        name: { fr: 'Quitter la pièce', en: 'Leave the room', ar: 'غادر الغرفة' }
    },
    
    // Respiration / Calme
    breathing_446: { 
        emoji: '🌬️', 
        category: 'calm',
        name: { fr: 'Respiration 4-4-6', en: 'Breathing 4-4-6', ar: 'تنفس 4-4-6' }
    },
    cold_water: { 
        emoji: '💧', 
        category: 'calm',
        name: { fr: 'Eau froide sur le visage', en: 'Cold water on face', ar: 'ماء بارد على الوجه' }
    },
    drink_water: { 
        emoji: '🥤', 
        category: 'calm',
        name: { fr: 'Boire un verre d\'eau', en: 'Drink water', ar: 'اشرب ماء' }
    },
    shower: { 
        emoji: '🚿', 
        category: 'calm',
        name: { fr: 'Prendre une douche', en: 'Take a shower', ar: 'الاستحمام' }
    },
    
    // Social
    call_friend: { 
        emoji: '📞', 
        category: 'social',
        name: { fr: 'Appeler un ami', en: 'Call a friend', ar: 'اتصل بصديق' }
    },
    text_someone: { 
        emoji: '💬', 
        category: 'social',
        name: { fr: 'Envoyer un message', en: 'Text someone', ar: 'أرسل رسالة' }
    },
    go_public: { 
        emoji: '🏪', 
        category: 'social',
        name: { fr: 'Aller dans un lieu public', en: 'Go to a public place', ar: 'اذهب لمكان عام' }
    },
    
    // Diversion
    read_book: { 
        emoji: '📖', 
        category: 'diversion',
        name: { fr: 'Lire un livre', en: 'Read a book', ar: 'اقرأ كتاباً' }
    },
    play_music: { 
        emoji: '🎵', 
        category: 'diversion',
        name: { fr: 'Écouter de la musique', en: 'Listen to music', ar: 'استمع للموسيقى' }
    },
    hobby: { 
        emoji: '🎨', 
        category: 'diversion',
        name: { fr: 'Pratiquer un hobby', en: 'Practice a hobby', ar: 'مارس هواية' }
    },
    
    // Tech
    close_app: { 
        emoji: '❌', 
        category: 'tech',
        name: { fr: 'Fermer l\'application', en: 'Close the app', ar: 'أغلق التطبيق' }
    },
    phone_out_bedroom: { 
        emoji: '📵', 
        category: 'tech',
        name: { fr: 'Téléphone hors chambre', en: 'Phone out of bedroom', ar: 'الهاتف خارج الغرفة' }
    },
    airplane_mode: { 
        emoji: '✈️', 
        category: 'tech',
        name: { fr: 'Mode avion', en: 'Airplane mode', ar: 'وضع الطيران' }
    },
    
    // Mental
    mental_reset: { 
        emoji: '🧠', 
        category: 'mental',
        name: { fr: 'Reset mental', en: 'Mental reset', ar: 'إعادة ضبط ذهني' }
    },
    gratitude: { 
        emoji: '🙏', 
        category: 'mental',
        name: { fr: 'Penser à 3 gratitudes', en: 'Think of 3 gratitudes', ar: 'فكر في 3 نعم' }
    },
    urge_surf: { 
        emoji: '🌊', 
        category: 'mental',
        name: { fr: 'Urge surfing', en: 'Urge surfing', ar: 'ركوب الموجة' }
    }
};

const CATEGORIES = {
    movement: { fr: 'Mouvement', en: 'Movement', ar: 'حركة', emoji: '🏃' },
    calm: { fr: 'Calme', en: 'Calm', ar: 'هدوء', emoji: '😌' },
    social: { fr: 'Social', en: 'Social', ar: 'اجتماعي', emoji: '👥' },
    diversion: { fr: 'Diversion', en: 'Diversion', ar: 'تشتيت', emoji: '🎮' },
    tech: { fr: 'Tech', en: 'Tech', ar: 'تقنية', emoji: '📱' },
    mental: { fr: 'Mental', en: 'Mental', ar: 'ذهني', emoji: '🧠' },
    custom: { fr: 'Personnalisé', en: 'Custom', ar: 'مخصص', emoji: '✨' }
};

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Récupère toutes les actions (prédéfinies + personnalisées)
 * @param {Object} state - State de l'application
 * @param {string} lang - Langue
 * @returns {Array} Liste d'actions formatées
 */
function getAllActions(state, lang = 'fr') {
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
function getFavoriteActions(state, lang = 'fr') {
    const all = getAllActions(state, lang);
    return all.filter(a => a.favorite);
}

/**
 * Récupère une action aléatoire
 * @param {Object} state - State de l'application
 * @param {string} lang - Langue
 * @param {boolean} favoritesOnly - Uniquement parmi les favoris
 * @returns {Object|null}
 */
function getRandomAction(state, lang = 'fr', favoritesOnly = false) {
    let pool = favoritesOnly 
        ? getFavoriteActions(state, lang)
        : getAllActions(state, lang);
    
    if (pool.length === 0) {
        pool = getAllActions(state, lang);
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
function getActionsByCategory(state, category, lang = 'fr') {
    const all = getAllActions(state, lang);
    return all.filter(a => a.category === category);
}

/**
 * Récupère une action par ID
 * @param {Object} state - State de l'application
 * @param {string} actionId - ID de l'action
 * @param {string} lang - Langue
 * @returns {Object|null}
 */
function getActionById(state, actionId, lang = 'fr') {
    const all = getAllActions(state, lang);
    return all.find(a => a.id === actionId) || null;
}

/**
 * Toggle le statut favori d'une action
 * @param {Object} state - State de l'application
 * @param {string} actionId - ID de l'action
 * @returns {Object} State modifié
 */
function toggleFavorite(state, actionId) {
    // Vérifier si c'est une action prédéfinie ou personnalisée
    const predefined = PREDEFINED_ACTIONS[actionId];
    
    if (predefined) {
        // Gérer via sos.favoriteActions
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
        // Action personnalisée
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
function createAction(state, actionData) {
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
function deleteAction(state, actionId) {
    // Ne pas permettre de supprimer les actions prédéfinies
    if (PREDEFINED_ACTIONS[actionId]) {
        return false;
    }
    
    Storage.deleteCustomAction(state, actionId);
    return true;
}

// ============================================
// MODAL ACTIONS
// ============================================

let actionsModalEl = null;

/**
 * Ouvre le modal de gestion des actions
 * @param {Object} state - State de l'application
 */
function openActionsModal(state) {
    if (!actionsModalEl) {
        actionsModalEl = document.createElement('div');
        actionsModalEl.className = 'modal-overlay';
        actionsModalEl.id = 'actionsModal';
        document.body.appendChild(actionsModalEl);
    }
    
    renderActionsModal(state);
    actionsModalEl.classList.add('active');
}

/**
 * Ferme le modal
 */
function closeActionsModal() {
    if (actionsModalEl) {
        actionsModalEl.classList.remove('active');
    }
}

/**
 * Rendu du modal actions
 */
function renderActionsModal(state) {
    const lang = state.profile.lang;
    const allActions = getAllActions(state, lang);
    
    const labels = {
        fr: {
            title: '📚 Ma bibliothèque d\'actions',
            subtitle: 'Ce qui marche pour moi',
            addNew: 'Ajouter une action',
            favorites: 'Favoris',
            all: 'Toutes',
            noFavorites: 'Aucun favori. Appuie sur ⭐ pour ajouter.',
            delete: 'Supprimer',
            name: 'Nom de l\'action',
            emoji: 'Emoji',
            save: 'Enregistrer'
        },
        en: {
            title: '📚 My action library',
            subtitle: 'What works for me',
            addNew: 'Add an action',
            favorites: 'Favorites',
            all: 'All',
            noFavorites: 'No favorites. Tap ⭐ to add.',
            delete: 'Delete',
            name: 'Action name',
            emoji: 'Emoji',
            save: 'Save'
        },
        ar: {
            title: '📚 مكتبة أفعالي',
            subtitle: 'ما يناسبني',
            addNew: 'إضافة فعل',
            favorites: 'المفضلة',
            all: 'الكل',
            noFavorites: 'لا مفضلات. اضغط ⭐ للإضافة.',
            delete: 'حذف',
            name: 'اسم الفعل',
            emoji: 'إيموجي',
            save: 'حفظ'
        }
    };
    
    const l = labels[lang] || labels.fr;
    const favorites = getFavoriteActions(state, lang);
    
    actionsModalEl.innerHTML = `
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
                        ${favorites.map(a => renderActionCard(a, lang, true)).join('')}
                    </div>
                `}
            </div>
            
            <!-- Par catégorie -->
            ${Object.entries(CATEGORIES).map(([catId, cat]) => {
                const catActions = getActionsByCategory(state, catId, lang);
                if (catActions.length === 0) return '';
                
                return `
                    <div class="actions-section">
                        <h3>${cat.emoji} ${cat[lang] || cat.fr}</h3>
                        <div class="actions-grid">
                            ${catActions.map(a => renderActionCard(a, lang, false)).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Rendu d'une carte action
 */
function renderActionCard(action, lang, showDelete = false) {
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
 * Affiche le formulaire d'ajout
 */
function showAddForm() {
    const lang = state?.profile?.lang || 'fr';
    
    const labels = {
        fr: { title: 'Nouvelle action', name: 'Nom', emoji: 'Emoji', save: 'Enregistrer', back: 'Retour' },
        en: { title: 'New action', name: 'Name', emoji: 'Emoji', save: 'Save', back: 'Back' },
        ar: { title: 'فعل جديد', name: 'الاسم', emoji: 'إيموجي', save: 'حفظ', back: 'رجوع' }
    };
    
    const l = labels[lang] || labels.fr;
    
    const emojiOptions = ['💪', '🚶', '📞', '🧘', '🎵', '📖', '🏃', '🌊', '⭐', '🌟', '💫', '🔥', '✨', '🎯'];
    
    const modalContent = actionsModalEl.querySelector('.modal-content');
    modalContent.innerHTML = `
        <button class="modal-close" onclick="Actions.close()">×</button>
        
        <div class="add-action-form">
            <button class="btn btn-ghost" onclick="Actions.openActionsModal(state)">← ${l.back}</button>
            <h3>${l.title}</h3>
            
            <div class="form-group">
                <label>${l.name}</label>
                <input type="text" id="actionName" class="input" placeholder="${l.name}" maxlength="50">
            </div>
            
            <div class="form-group">
                <label>${l.emoji}</label>
                <div class="emoji-picker">
                    ${emojiOptions.map(e => `
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
 * Sélectionne un emoji
 */
function selectEmoji(emoji) {
    document.getElementById('actionEmoji').value = emoji;
    document.querySelectorAll('.emoji-option').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent === emoji) {
            btn.classList.add('selected');
        }
    });
}

/**
 * Sauvegarde une nouvelle action
 */
function saveNewAction() {
    const name = document.getElementById('actionName')?.value?.trim();
    const emoji = document.getElementById('actionEmoji')?.value || '⭐';
    
    if (!name) {
        alert(state?.profile?.lang === 'ar' ? 'الاسم مطلوب' : 
              state?.profile?.lang === 'en' ? 'Name required' : 'Nom requis');
        return;
    }
    
    createAction(state, { name, emoji });
    openActionsModal(state);
    
    if (typeof showToast === 'function') {
        showToast(state?.profile?.lang === 'ar' ? 'تم الإضافة' : 
                  state?.profile?.lang === 'en' ? 'Added' : 'Ajouté');
    }
}

/**
 * Toggle favori depuis l'UI
 */
function toggleFav(actionId) {
    toggleFavorite(state, actionId);
    renderActionsModal(state);
}

/**
 * Supprime une action depuis l'UI
 */
function del(actionId) {
    const lang = state?.profile?.lang || 'fr';
    const confirmMsg = {
        fr: 'Supprimer cette action ?',
        en: 'Delete this action?',
        ar: 'حذف هذا الفعل؟'
    };
    
    if (confirm(confirmMsg[lang])) {
        deleteAction(state, actionId);
        renderActionsModal(state);
    }
}

// ============================================
// SÉLECTEUR D'ACTIONS (pour SOS, craving, etc.)
// ============================================

/**
 * Génère le HTML pour un sélecteur d'actions
 * @param {Object} state - State de l'application
 * @param {string} context - Contexte (sos, craving, slope)
 * @param {number} maxActions - Nombre max d'actions à afficher
 * @returns {string} HTML
 */
function renderActionSelector(state, context = 'sos', maxActions = 6) {
    const lang = state.profile.lang;
    const favorites = getFavoriteActions(state, lang);
    
    // Priorité aux favoris, puis actions aléatoires
    let actionsToShow = [...favorites];
    
    if (actionsToShow.length < maxActions) {
        const all = getAllActions(state, lang).filter(a => !a.favorite);
        const shuffled = all.sort(() => Math.random() - 0.5);
        actionsToShow = [...actionsToShow, ...shuffled.slice(0, maxActions - actionsToShow.length)];
    }
    
    actionsToShow = actionsToShow.slice(0, maxActions);
    
    const labels = {
        fr: { randomAction: 'Action aléatoire', more: 'Plus d\'actions' },
        en: { randomAction: 'Random action', more: 'More actions' },
        ar: { randomAction: 'فعل عشوائي', more: 'المزيد من الأفعال' }
    };
    
    const l = labels[lang] || labels.fr;
    
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
                <button class="btn btn-ghost btn-small" onclick="Actions.openActionsModal(state)">
                    ${l.more}
                </button>
            </div>
        </div>
    `;
}

/**
 * Exécute une action (marque comme faite)
 */
function executeAction(actionId, context) {
    const action = getActionById(state, actionId, state?.profile?.lang || 'fr');
    if (!action) return;
    
    // Ajouter aux actions récentes
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
    
    // Feedback visuel
    if (typeof showToast === 'function') {
        const lang = state?.profile?.lang || 'fr';
        const messages = {
            fr: `${action.emoji} Action faite !`,
            en: `${action.emoji} Action done!`,
            ar: `${action.emoji} تم الفعل!`
        };
        showToast(messages[lang]);
    }
}

/**
 * Exécute une action aléatoire
 */
function executeRandom(context) {
    const action = getRandomAction(state, state?.profile?.lang || 'fr', true);
    if (action) {
        executeAction(action.id, context);
        
        // Afficher l'action suggérée
        if (typeof showToast === 'function') {
            const lang = state?.profile?.lang || 'fr';
            showToast(`${action.emoji} ${action.name}`);
        }
    }
}

// ============================================
// EXPORTS
// ============================================

window.Actions = {
    // Constants
    PREDEFINED_ACTIONS,
    CATEGORIES,
    
    // Getters
    getAllActions,
    getFavoriteActions,
    getRandomAction,
    getActionsByCategory,
    getActionById,
    
    // CRUD
    toggleFavorite,
    createAction,
    deleteAction,
    
    // Modal
    openActionsModal,
    closeActionsModal,
    close: closeActionsModal,
    showAddForm,
    selectEmoji,
    saveNewAction,
    toggleFav,
    del,
    
    // Selector
    renderActionSelector,
    executeAction,
    executeRandom
};
