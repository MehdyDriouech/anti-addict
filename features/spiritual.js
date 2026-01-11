/**
 * spiritual.js - Module spirituel avancé
 * 
 * Fonctionnalités:
 * - Playlists par contexte (matin, soir, crise, après rechute)
 * - Compteur dhikr/invocations
 * - Objectifs spirituels quotidiens
 */

// ============================================
// CONSTANTES
// ============================================

// Contextes de playlists
const PLAYLIST_CONTEXTS = {
    morning: { fr: 'Matin', en: 'Morning', ar: 'صباح', emoji: '🌅' },
    evening: { fr: 'Soir', en: 'Evening', ar: 'مساء', emoji: '🌙' },
    crisis: { fr: 'Moment difficile', en: 'Difficult moment', ar: 'لحظة صعبة', emoji: '🆘' },
    afterRelapse: { fr: 'Après rechute', en: 'After relapse', ar: 'بعد الانتكاسة', emoji: '🌱' }
};

// Objectifs spirituels prédéfinis
const PRESET_GOALS = {
    fr: [
        'Lire 10 pages de texte sacré',
        'Prier/méditer 10 minutes',
        'Écouter un rappel spirituel',
        'Faire un acte de charité',
        'Pratiquer la gratitude',
        'Se lever pour la prière de l\'aube'
    ],
    en: [
        'Read 10 pages of sacred text',
        'Pray/meditate 10 minutes',
        'Listen to a spiritual reminder',
        'Do an act of charity',
        'Practice gratitude',
        'Wake up for dawn prayer'
    ],
    ar: [
        'قراءة 10 صفحات من القرآن',
        'صلاة/تأمل 10 دقائق',
        'الاستماع لتذكير روحي',
        'عمل صدقة',
        'ممارسة الامتنان',
        'الاستيقاظ لصلاة الفجر'
    ]
};

// ============================================
// MODAL SPIRITUEL
// ============================================

let spiritualModalEl = null;

/**
 * Ouvre le modal spirituel
 */
function openSpiritualModal(state) {
    if (!state.profile.spiritualEnabled || state.profile.religion === 'none') {
        return;
    }
    
    if (!spiritualModalEl) {
        spiritualModalEl = document.createElement('div');
        spiritualModalEl.className = 'modal-overlay';
        spiritualModalEl.id = 'spiritualModal';
        document.body.appendChild(spiritualModalEl);
    }
    
    renderSpiritualModal(state);
    spiritualModalEl.classList.add('active');
}

/**
 * Ferme le modal
 */
function closeSpiritualModal() {
    if (spiritualModalEl) {
        spiritualModalEl.classList.remove('active');
    }
}

/**
 * Rendu du modal spirituel
 */
function renderSpiritualModal(state) {
    const lang = state.profile.lang;
    const spiritual = state.spiritual || {};
    
    const labels = {
        fr: {
            title: '📿 Espace spirituel',
            dhikr: 'Compteur dhikr',
            goals: 'Objectifs du jour',
            playlists: 'Cartes spirituelles',
            reset: 'Réinitialiser',
            addGoal: 'Ajouter un objectif',
            complete: 'Marquer comme fait'
        },
        en: {
            title: '📿 Spiritual space',
            dhikr: 'Dhikr counter',
            goals: 'Today\'s goals',
            playlists: 'Spiritual cards',
            reset: 'Reset',
            addGoal: 'Add a goal',
            complete: 'Mark as done'
        },
        ar: {
            title: '📿 المساحة الروحية',
            dhikr: 'عداد الذكر',
            goals: 'أهداف اليوم',
            playlists: 'البطاقات الروحية',
            reset: 'إعادة تعيين',
            addGoal: 'إضافة هدف',
            complete: 'وضع علامة مكتمل'
        }
    };
    
    const l = labels[lang] || labels.fr;
    const todayGoals = getTodayGoals(state);
    
    spiritualModalEl.innerHTML = `
        <div class="modal-content spiritual-modal">
            <button class="modal-close" onclick="Spiritual.close()">×</button>
            
            <h2>${l.title}</h2>
            
            <!-- Compteur Dhikr -->
            <div class="spiritual-section dhikr-section">
                <h3>🧿 ${l.dhikr}</h3>
                <div class="dhikr-counter">
                    <button class="dhikr-btn" onclick="Spiritual.decrementDhikr()">−</button>
                    <span class="dhikr-value" id="dhikrValue">${spiritual.dhikrCount || 0}</span>
                    <button class="dhikr-btn primary" onclick="Spiritual.incrementDhikr()">+</button>
                </div>
                <button class="btn btn-ghost btn-small" onclick="Spiritual.resetDhikr()">
                    ${l.reset}
                </button>
            </div>
            
            <!-- Objectifs du jour -->
            <div class="spiritual-section goals-section">
                <h3>🎯 ${l.goals}</h3>
                <div class="goals-list">
                    ${todayGoals.length === 0 ? `
                        <p class="empty-message">Aucun objectif pour aujourd'hui</p>
                    ` : todayGoals.map((goal, idx) => `
                        <div class="goal-item ${goal.completed ? 'completed' : ''}"
                             onclick="Spiritual.toggleGoal(${idx})">
                            <span class="goal-check">${goal.completed ? '✓' : '○'}</span>
                            <span class="goal-text">${goal.text}</span>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Ajouter un objectif -->
                <div class="add-goal-form">
                    <select id="presetGoal" class="input">
                        <option value="">${l.addGoal}...</option>
                        ${(PRESET_GOALS[lang] || PRESET_GOALS.fr).map((g, i) => `
                            <option value="${i}">${g}</option>
                        `).join('')}
                    </select>
                    <button class="btn btn-small btn-primary" onclick="Spiritual.addPresetGoal()">+</button>
                </div>
            </div>
            
            <!-- Cartes spirituelles par contexte -->
            <div class="spiritual-section playlists-section">
                <h3>🃏 ${l.playlists}</h3>
                <div class="playlist-buttons">
                    ${Object.entries(PLAYLIST_CONTEXTS).map(([ctx, info]) => `
                        <button class="btn btn-secondary playlist-btn" 
                                onclick="Spiritual.showPlaylist('${ctx}')">
                            ${info.emoji} ${info[lang] || info.fr}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// ============================================
// DHIKR
// ============================================

/**
 * Incrémente le compteur dhikr
 */
function incrementDhikr() {
    Storage.incrementDhikr(state, 1);
    updateDhikrDisplay();
}

/**
 * Décrémente le compteur dhikr
 */
function decrementDhikr() {
    if (state.spiritual.dhikrCount > 0) {
        state.spiritual.dhikrCount--;
        Storage.saveState(state);
        updateDhikrDisplay();
    }
}

/**
 * Réinitialise le compteur dhikr
 */
function resetDhikr() {
    state.spiritual.dhikrCount = 0;
    Storage.saveState(state);
    updateDhikrDisplay();
}

/**
 * Met à jour l'affichage du compteur
 */
function updateDhikrDisplay() {
    const el = document.getElementById('dhikrValue');
    if (el) {
        el.textContent = state.spiritual.dhikrCount || 0;
    }
}

// ============================================
// OBJECTIFS
// ============================================

/**
 * Récupère les objectifs du jour
 */
function getTodayGoals(state) {
    const today = Storage.getDateISO();
    return (state.spiritual?.dailyGoals || []).filter(g => g.date === today);
}

/**
 * Ajoute un objectif prédéfini
 */
function addPresetGoal() {
    const select = document.getElementById('presetGoal');
    const index = select?.value;
    
    if (index === '' || index === null) return;
    
    const lang = state.profile.lang;
    const presets = PRESET_GOALS[lang] || PRESET_GOALS.fr;
    const text = presets[parseInt(index, 10)];
    
    if (text) {
        Storage.addSpiritualGoal(state, { text, completed: false });
        renderSpiritualModal(state);
    }
}

/**
 * Toggle un objectif
 */
function toggleGoal(index) {
    const today = Storage.getDateISO();
    const todayGoals = state.spiritual.dailyGoals.filter(g => g.date === today);
    
    if (todayGoals[index]) {
        todayGoals[index].completed = !todayGoals[index].completed;
        Storage.saveState(state);
        renderSpiritualModal(state);
        
        if (todayGoals[index].completed) {
            Storage.incrementWins(state, { positiveActions: 1 });
        }
    }
}

// ============================================
// PLAYLISTS (CARTES)
// ============================================

let playlistModalEl = null;

/**
 * Affiche une playlist de cartes spirituelles
 */
function showPlaylist(context) {
    if (!playlistModalEl) {
        playlistModalEl = document.createElement('div');
        playlistModalEl.className = 'modal-overlay';
        playlistModalEl.id = 'playlistModal';
        document.body.appendChild(playlistModalEl);
    }
    
    renderPlaylistModal(state, context);
    playlistModalEl.classList.add('active');
}

/**
 * Ferme le modal playlist
 */
function closePlaylistModal() {
    if (playlistModalEl) {
        playlistModalEl.classList.remove('active');
    }
}

/**
 * Rendu du modal playlist
 */
function renderPlaylistModal(state, context) {
    const lang = state.profile.lang;
    const contextInfo = PLAYLIST_CONTEXTS[context];
    
    // Récupérer les cartes spirituelles
    let cards = [];
    if (typeof I18n !== 'undefined' && I18n.getSpiritualCards) {
        cards = I18n.getSpiritualCards() || [];
    }
    
    // Filtrer par thème selon le contexte
    const themeFilters = {
        morning: ['discipline', 'intention', 'gratitude'],
        evening: ['gratitude', 'reflection', 'peace'],
        crisis: ['lower_gaze', 'avoid_paths', 'patience', 'struggle'],
        afterRelapse: ['mercy', 'repentance', 'hope', 'forgiveness']
    };
    
    const themes = themeFilters[context] || [];
    const filteredCards = cards.filter(c => themes.includes(c.theme) || themes.length === 0);
    
    // Mélanger et prendre 3-5 cartes
    const shuffled = filteredCards.sort(() => Math.random() - 0.5).slice(0, 5);
    
    const labels = {
        fr: { next: 'Autre carte', back: 'Retour' },
        en: { next: 'Another card', back: 'Back' },
        ar: { next: 'بطاقة أخرى', back: 'رجوع' }
    };
    
    const l = labels[lang] || labels.fr;
    
    playlistModalEl.innerHTML = `
        <div class="modal-content playlist-modal">
            <button class="modal-close" onclick="Spiritual.closePlaylist()">×</button>
            
            <h2>${contextInfo.emoji} ${contextInfo[lang] || contextInfo.fr}</h2>
            
            <div class="spiritual-cards-carousel">
                ${shuffled.length === 0 ? `
                    <p class="empty-message">Aucune carte disponible</p>
                ` : shuffled.map((card, idx) => `
                    <div class="spiritual-card ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                        <p class="card-text">"${card.text}"</p>
                        <cite class="card-ref">— ${card.ref}</cite>
                    </div>
                `).join('')}
            </div>
            
            ${shuffled.length > 1 ? `
                <button class="btn btn-secondary" onclick="Spiritual.nextCard()">
                    ${l.next} →
                </button>
            ` : ''}
            
            <button class="btn btn-ghost" onclick="Spiritual.closePlaylist(); Spiritual.open(state);">
                ← ${l.back}
            </button>
        </div>
    `;
}

/**
 * Affiche la carte suivante
 */
function nextCard() {
    const cards = document.querySelectorAll('.spiritual-cards-carousel .spiritual-card');
    if (cards.length <= 1) return;
    
    let activeIndex = 0;
    cards.forEach((card, idx) => {
        if (card.classList.contains('active')) {
            activeIndex = idx;
            card.classList.remove('active');
        }
    });
    
    const nextIndex = (activeIndex + 1) % cards.length;
    cards[nextIndex].classList.add('active');
}

// ============================================
// WIDGET
// ============================================

/**
 * Génère le widget spirituel pour la home
 */
function renderSpiritualWidget(state) {
    if (!state.profile.spiritualEnabled || state.profile.religion === 'none') {
        return '';
    }
    
    const lang = state.profile.lang;
    const dhikr = state.spiritual?.dhikrCount || 0;
    
    const labels = {
        fr: { spiritual: 'Spirituel' },
        en: { spiritual: 'Spiritual' },
        ar: { spiritual: 'روحي' }
    };
    
    const l = labels[lang] || labels.fr;
    
    return `
        <button class="btn btn-secondary spiritual-widget-btn" onclick="Spiritual.open(state)">
            📿 ${l.spiritual} ${dhikr > 0 ? `(${dhikr})` : ''}
        </button>
    `;
}

/**
 * Récupère une carte spirituelle aléatoire
 */
function getRandomCard(state, themes = []) {
    if (!state.profile.spiritualEnabled || state.profile.religion === 'none') {
        return null;
    }
    
    let cards = [];
    if (typeof I18n !== 'undefined' && I18n.getSpiritualCards) {
        cards = I18n.getSpiritualCards() || [];
    }
    
    if (themes.length > 0) {
        cards = cards.filter(c => themes.includes(c.theme));
    }
    
    if (cards.length === 0) return null;
    
    return cards[Math.floor(Math.random() * cards.length)];
}

// ============================================
// EXPORTS
// ============================================

window.Spiritual = {
    // Constantes
    PLAYLIST_CONTEXTS,
    PRESET_GOALS,
    
    // Modal principal
    open: openSpiritualModal,
    close: closeSpiritualModal,
    
    // Dhikr
    incrementDhikr,
    decrementDhikr,
    resetDhikr,
    
    // Objectifs
    getTodayGoals,
    addPresetGoal,
    toggleGoal,
    
    // Playlists
    showPlaylist,
    closePlaylist: closePlaylistModal,
    nextCard,
    
    // Widget
    renderSpiritualWidget,
    getRandomCard
};
