/**
 * intentions.js - Gestion des intentions quotidiennes
 * 
 * Fonctionnalités:
 * - Affichage d'une intention/phrase du jour
 * - Sources: phrases neutres + cartes spirituelles si activées
 * - Historique des intentions vues
 * - Limite 1 nouvelle intention par jour
 */

// ============================================
// INTENTIONS NEUTRES (fallback)
// ============================================

const NEUTRAL_INTENTIONS = {
    fr: [
        { text: "Aujourd'hui, je choisis la paix intérieure.", ref: null },
        { text: "Chaque moment est une nouvelle chance de faire mieux.", ref: null },
        { text: "Je suis plus fort que mes tentations.", ref: null },
        { text: "Un jour à la fois, je construis ma liberté.", ref: null },
        { text: "Ma valeur ne dépend pas de mes erreurs passées.", ref: null },
        { text: "Je mérite une vie épanouie et sereine.", ref: null },
        { text: "Les moments difficiles sont temporaires.", ref: null },
        { text: "Je suis capable de surmonter les obstacles.", ref: null },
        { text: "Chaque petit progrès compte.", ref: null },
        { text: "Je choisis de prendre soin de moi aujourd'hui.", ref: null },
        { text: "Ma force est dans ma persévérance.", ref: null },
        { text: "Je ne suis pas défini par mes moments de faiblesse.", ref: null },
        { text: "Aujourd'hui, je fais un pas de plus vers la liberté.", ref: null },
        { text: "Je suis patient avec moi-même.", ref: null },
        { text: "Chaque journée sans rechute est une victoire.", ref: null }
    ],
    en: [
        { text: "Today, I choose inner peace.", ref: null },
        { text: "Every moment is a new chance to do better.", ref: null },
        { text: "I am stronger than my temptations.", ref: null },
        { text: "One day at a time, I build my freedom.", ref: null },
        { text: "My worth is not defined by my past mistakes.", ref: null },
        { text: "I deserve a fulfilling and peaceful life.", ref: null },
        { text: "Difficult moments are temporary.", ref: null },
        { text: "I am capable of overcoming obstacles.", ref: null },
        { text: "Every small progress counts.", ref: null },
        { text: "I choose to take care of myself today.", ref: null },
        { text: "My strength is in my perseverance.", ref: null },
        { text: "I am not defined by my moments of weakness.", ref: null },
        { text: "Today, I take one more step towards freedom.", ref: null },
        { text: "I am patient with myself.", ref: null },
        { text: "Every day without relapse is a victory.", ref: null }
    ],
    ar: [
        { text: "اليوم، أختار السلام الداخلي.", ref: null },
        { text: "كل لحظة هي فرصة جديدة للتحسن.", ref: null },
        { text: "أنا أقوى من إغراءاتي.", ref: null },
        { text: "يومًا بعد يوم، أبني حريتي.", ref: null },
        { text: "قيمتي لا تحددها أخطائي الماضية.", ref: null },
        { text: "أستحق حياة مليئة بالسكينة.", ref: null },
        { text: "اللحظات الصعبة مؤقتة.", ref: null },
        { text: "أنا قادر على تجاوز العقبات.", ref: null },
        { text: "كل تقدم صغير مهم.", ref: null },
        { text: "أختار أن أعتني بنفسي اليوم.", ref: null },
        { text: "قوتي في مثابرتي.", ref: null },
        { text: "أنا لست معرّفًا بلحظات ضعفي.", ref: null },
        { text: "اليوم، أخطو خطوة أخرى نحو الحرية.", ref: null },
        { text: "أنا صبور مع نفسي.", ref: null },
        { text: "كل يوم بدون انتكاس هو انتصار.", ref: null }
    ]
};

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Vérifie si une nouvelle intention a déjà été montrée aujourd'hui
 * @param {Object} state - State de l'application
 * @returns {boolean}
 */
function hasIntentionToday(state) {
    const today = Utils.todayISO();
    return state.intentions.lastShownDate === today;
}

/**
 * Récupère l'intention du jour (existante ou nouvelle)
 * @param {Object} state - State de l'application
 * @returns {Object|null} { text, ref, source }
 */
function getTodayIntention(state) {
    const today = Utils.todayISO();
    
    // Chercher dans l'historique
    const todayIntention = state.intentions.history.find(i => i.date === today);
    if (todayIntention) {
        return todayIntention;
    }
    
    return null;
}

/**
 * Génère une nouvelle intention aléatoire
 * @param {Object} state - State de l'application
 * @returns {Object} { text, ref, source }
 */
function generateNewIntention(state) {
    const lang = state.profile.lang;
    const spiritualEnabled = state.profile.spiritualEnabled;
    const religion = state.profile.religion;
    
    // Si spiritual activé, essayer de prendre une carte spirituelle
    if (spiritualEnabled && religion !== 'none') {
        const cards = I18n.getSpiritualCards();
        if (cards && cards.length > 0) {
            // Filtrer par thèmes positifs (hope, discipline, patience)
            const positiveCards = cards.filter(c => 
                ['hope', 'discipline', 'patience', 'repentance'].includes(c.theme)
            );
            
            const pool = positiveCards.length > 0 ? positiveCards : cards;
            const randomCard = pool[Math.floor(Math.random() * pool.length)];
            
            return {
                text: randomCard.text,
                ref: randomCard.ref,
                source: 'spiritual'
            };
        }
    }
    
    // Fallback: intentions neutres
    const neutralList = NEUTRAL_INTENTIONS[lang] || NEUTRAL_INTENTIONS.fr;
    const randomIntention = neutralList[Math.floor(Math.random() * neutralList.length)];
    
    return {
        text: randomIntention.text,
        ref: randomIntention.ref,
        source: 'neutral'
    };
}

/**
 * Définit l'intention du jour
 * @param {Object} state - State de l'application
 * @param {boolean} force - Forcer même si une intention existe déjà
 * @returns {Object} L'intention définie
 */
function setTodayIntention(state, force = false) {
    // Vérifier si déjà définie
    if (!force && hasIntentionToday(state)) {
        return getTodayIntention(state);
    }
    
    // Générer et sauvegarder
    const intention = generateNewIntention(state);
    Storage.addIntention(state, intention);
    
    return intention;
}

/**
 * Récupère l'historique des intentions (derniers N jours)
 * @param {Object} state - State de l'application
 * @param {number} count - Nombre d'intentions à récupérer
 * @returns {Array}
 */
function getIntentionsHistory(state, count = 7) {
    return state.intentions.history
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, count);
}

/**
 * Génère le HTML pour afficher l'intention du jour (UX #5: Actionnable)
 * @param {Object} state - State de l'application
 * @returns {string} HTML
 */
function renderIntentionBlock(state) {
    const lang = state.profile.lang;
    let intention = getTodayIntention(state);
    
    // Si pas d'intention, en générer une
    if (!intention) {
        intention = setTodayIntention(state);
    }
    
    // Vérifier si l'utilisateur s'est engagé aujourd'hui
    const today = Utils.todayISO();
    const isEngaged = intention.engaged === true;
    
    const labels = {
        fr: {
            title: 'Intention du jour',
            engage: 'Je m\'y engage',
            engaged: '✓ Engagé',
            remind: 'Rappeler ce soir',
            change: 'Changer'
        },
        en: {
            title: 'Daily intention',
            engage: 'I commit to this',
            engaged: '✓ Committed',
            remind: 'Remind tonight',
            change: 'Change'
        },
        ar: {
            title: 'نية اليوم',
            engage: 'ألتزم بهذا',
            engaged: '✓ ملتزم',
            remind: 'ذكرني الليلة',
            change: 'تغيير'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    return `
        <div class="focus-widget intention-focus">
            <div class="focus-header">
                <span class="focus-icon">💡</span>
                <span class="focus-title">${l.title}</span>
            </div>
            <div class="focus-content">
                <p class="focus-text">"${intention.text}"</p>
                ${intention.ref ? `<p class="focus-ref">— ${intention.ref}</p>` : ''}
            </div>
            <!-- UX #5: Actions pour l'intention -->
            <div class="focus-actions">
                <button class="intention-engage-btn ${isEngaged ? 'engaged' : ''}" 
                        onclick="Intentions.toggleEngagement()" 
                        ${isEngaged ? 'disabled' : ''}>
                    <span class="checkmark">${isEngaged ? '✓' : '☐'}</span>
                    ${isEngaged ? l.engaged : l.engage}
                </button>
                <button class="intention-secondary-btn" onclick="Intentions.onNewIntention()" title="${l.change}">
                    🔄
                </button>
            </div>
        </div>
    `;
}

/**
 * UX #5: Toggle l'engagement sur l'intention du jour
 */
function toggleEngagement() {
    const today = Utils.todayISO();
    const intention = state.intentions.history.find(i => i.date === today);
    
    if (intention) {
        intention.engaged = true;
        Storage.saveState(state);
        
        // Feedback positif
        if (typeof showToast === 'function') {
            const messages = {
                fr: 'Bravo ! Tu as pris un engagement 💪',
                en: 'Great! You made a commitment 💪',
                ar: 'رائع! لقد التزمت 💪'
            };
            showToast(messages[state.profile.lang] || messages.fr, 'success');
        }
        
        // Re-render
        if (typeof renderHome === 'function') {
            renderHome();
        }
    }
}

/**
 * Handler pour le bouton "Nouvelle intention"
 */
function onNewIntention() {
    const lang = state?.profile?.lang || 'fr';
    
    const messages = {
        fr: 'Tu as déjà une intention pour aujourd\'hui. En générer une nouvelle ?',
        en: 'You already have an intention for today. Generate a new one?',
        ar: 'لديك نية لهذا اليوم. هل تريد إنشاء واحدة جديدة؟'
    };
    
    if (hasIntentionToday(state)) {
        if (!confirm(messages[lang] || messages.fr)) {
            return;
        }
    }
    
    setTodayIntention(state, true);
    
    // Re-render Home (appel via app.js global)
    if (typeof renderHome === 'function') {
        renderHome();
    }
}

// ============================================
// EXPORTS
// ============================================

window.Intentions = {
    hasIntentionToday,
    getTodayIntention,
    generateNewIntention,
    setTodayIntention,
    getIntentionsHistory,
    renderIntentionBlock,
    onNewIntention,
    toggleEngagement,
    NEUTRAL_INTENTIONS
};
