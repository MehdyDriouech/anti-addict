/**
 * sos.js - Module SOS avancé
 * 
 * Fonctionnalités:
 * - Écran SOS plein page avec actions depuis la bibliothèque
 * - Mode low-text (icônes grandes, texte minimal)
 * - Bouton action aléatoire
 * - Playlist crise spirituelle
 * - Accès rapide depuis n'importe où
 */

// ============================================
// CONSTANTES
// ============================================

// Messages d'urgence
const EMERGENCY_MESSAGES = {
    fr: [
        'Ce moment va passer.',
        'Respire. Tu es là, c\'est déjà beaucoup.',
        'Une petite action maintenant peut t\'aider.',
        'Chaque instant où tu prends soin de toi compte.',
        'Tu n\'es pas seul. Prends soin de toi.'
    ],
    en: [
        'This moment will pass.',
        'Breathe. You\'re here, and that\'s already a lot.',
        'One small action now can help you.',
        'Every moment you take care of yourself counts.',
        'You\'re not alone. Take care of yourself.'
    ],
    ar: [
        'هذه اللحظة ستمر.',
        'تنفس. أنت هنا، وهذا كثير.',
        'فعل صغير الآن يمكن أن يساعدك.',
        'كل لحظة تعتني فيها بنفسك مهمة.',
        'لست وحدك. اعتن بنفسك.'
    ]
};

// Actions SOS prioritaires (sous-ensemble des actions)
const PRIORITY_ACTIONS = [
    'leave_room',
    'cold_water',
    'breathing_446',
    'walk_2min',
    'call_friend',
    'pushups'
];

// ============================================
// STATE LOCAL
// ============================================

let sosScreenEl = null;
let sosActive = false;
let lowTextMode = false;

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Active l'écran SOS
 * @param {Object} state - State de l'application
 */
function activateSOS(state) {
    sosActive = true;
    lowTextMode = state.settings?.lowTextMode || false;
    
    if (!sosScreenEl) {
        sosScreenEl = document.createElement('div');
        sosScreenEl.className = 'sos-screen-overlay';
        sosScreenEl.id = 'sosScreen';
        document.body.appendChild(sosScreenEl);
    }
    
    renderSOSScreen(state);
    sosScreenEl.classList.add('active');
    
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
    
    // Logger l'événement SOS
    Storage.addEvent(state, 'craving', 'porn', null, { context: 'sos' });
}

/**
 * Désactive l'écran SOS
 */
function deactivateSOS() {
    sosActive = false;
    
    if (sosScreenEl) {
        sosScreenEl.classList.remove('active');
    }
    
    document.body.style.overflow = '';
    
    if (typeof renderHome === 'function') {
        renderHome();
    }
}

/**
 * Rendu de l'écran SOS
 */
function renderSOSScreen(state) {
    const lang = state.profile.lang;
    const isSpiritual = state.profile.spiritualEnabled && state.profile.religion !== 'none';
    
    const labels = {
        fr: {
            title: 'SOS',
            message: 'Tu peux le faire',
            randomAction: 'Action aléatoire',
            breathe: 'Respirer',
            close: 'Je vais mieux',
            lowText: 'Mode minimal',
            spiritual: 'Rappel spirituel'
        },
        en: {
            title: 'SOS',
            message: 'You can do this',
            randomAction: 'Random action',
            breathe: 'Breathe',
            close: 'I\'m better now',
            lowText: 'Minimal mode',
            spiritual: 'Spiritual reminder'
        },
        ar: {
            title: 'طوارئ',
            message: 'يمكنك فعل ذلك',
            randomAction: 'فعل عشوائي',
            breathe: 'تنفس',
            close: 'أنا أفضل الآن',
            lowText: 'وضع مختصر',
            spiritual: 'تذكير روحي'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    // Message aléatoire
    const messages = EMERGENCY_MESSAGES[lang] || EMERGENCY_MESSAGES.fr;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Actions à afficher
    const actionsToShow = getSOSActions(state, lang, lowTextMode ? 4 : 6);
    
    // Carte spirituelle si activée
    let spiritualCard = null;
    if (isSpiritual && typeof I18n !== 'undefined' && I18n.getSpiritualCards) {
        const cards = I18n.getSpiritualCards();
        if (cards && cards.length > 0) {
            spiritualCard = cards[Math.floor(Math.random() * cards.length)];
        }
    }
    
    sosScreenEl.innerHTML = `
        <div class="sos-screen ${lowTextMode ? 'low-text' : ''}">
            <!-- Header -->
            <div class="sos-header">
                <h1 class="sos-title">🆘 ${l.title}</h1>
                <button class="sos-close-btn" onclick="SOS.deactivate()">×</button>
            </div>
            
            <!-- Message principal -->
            <div class="sos-message">
                <p class="sos-main-message">${randomMessage}</p>
            </div>
            
            <!-- Actions rapides -->
            <div class="sos-actions">
                ${actionsToShow.map(action => `
                    <button class="sos-action-btn ${lowTextMode ? 'large' : ''}" 
                            onclick="SOS.executeAction('${action.id}')">
                        <span class="action-emoji">${action.emoji}</span>
                        ${!lowTextMode ? `<span class="action-name">${action.name}</span>` : ''}
                    </button>
                `).join('')}
            </div>
            
            <!-- Action aléatoire -->
            <button class="btn btn-primary btn-large sos-random-btn" onclick="SOS.randomAction()">
                🎲 ${l.randomAction}
            </button>
            
            <!-- Respiration -->
            <button class="btn btn-secondary btn-large sos-breathe-btn" onclick="SOS.startBreathing()">
                🌬️ ${l.breathe}
            </button>
            
            <!-- Carte spirituelle -->
            ${isSpiritual && spiritualCard ? `
                <div class="sos-spiritual-card">
                    <h4>📿 ${l.spiritual}</h4>
                    <p class="card-text">"${spiritualCard.text}"</p>
                    <cite>— ${spiritualCard.ref}</cite>
                </div>
            ` : ''}
            
            <!-- Toggle low-text -->
            <div class="sos-footer">
                <label class="toggle-label small">
                    <input type="checkbox" ${lowTextMode ? 'checked' : ''} 
                           onchange="SOS.toggleLowText()">
                    <span>${l.lowText}</span>
                </label>
            </div>
            
            <!-- Bouton fermer -->
            <button class="btn btn-ghost sos-exit-btn" onclick="SOS.confirmExit()">
                ✓ ${l.close}
            </button>
        </div>
    `;
}

/**
 * Récupère les actions pour le SOS
 */
function getSOSActions(state, lang, count = 6) {
    // D'abord les favoris
    let actions = [];
    
    if (typeof Actions !== 'undefined') {
        const favorites = Actions.getFavoriteActions(state, lang);
        actions = [...favorites];
        
        // Compléter avec des actions prioritaires
        if (actions.length < count) {
            const allActions = Actions.getAllActions(state, lang);
            const priority = allActions.filter(a => 
                PRIORITY_ACTIONS.includes(a.id) && !a.favorite
            );
            actions = [...actions, ...priority];
        }
        
        // Compléter avec des actions aléatoires
        if (actions.length < count) {
            const allActions = Actions.getAllActions(state, lang);
            const remaining = allActions.filter(a => 
                !actions.some(existing => existing.id === a.id)
            ).sort(() => Math.random() - 0.5);
            actions = [...actions, ...remaining];
        }
    }
    
    return actions.slice(0, count);
}

/**
 * Exécute une action depuis le SOS
 */
function executeAction(actionId) {
    if (typeof Actions !== 'undefined') {
        Actions.executeAction(actionId, 'sos');
    }
    
    // Highlight visuel
    const btn = document.querySelector(`[onclick*="${actionId}"]`);
    if (btn) {
        btn.classList.add('executed');
        setTimeout(() => btn.classList.remove('executed'), 1000);
    }
}

/**
 * Action aléatoire
 */
function randomAction() {
    if (typeof Actions !== 'undefined') {
        const action = Actions.getRandomAction(state, state.profile.lang, true);
        if (action) {
            Actions.executeAction(action.id, 'sos');
            
            // Afficher l'action
            if (typeof showToast === 'function') {
                showToast(`${action.emoji} ${action.name}`);
            }
        }
    }
}

/**
 * Démarre l'exercice de respiration
 */
function startBreathing() {
    const lang = state?.profile?.lang || 'fr';
    
    const labels = {
        fr: { inhale: 'Inspire', hold: 'Retiens', exhale: 'Expire', done: 'Terminé !' },
        en: { inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale', done: 'Done!' },
        ar: { inhale: 'استنشق', hold: 'احتفظ', exhale: 'ازفر', done: 'تم!' }
    };
    
    const l = labels[lang] || labels.fr;
    
    // Créer l'overlay de respiration
    const breathingEl = document.createElement('div');
    breathingEl.className = 'breathing-overlay';
    breathingEl.innerHTML = `
        <div class="breathing-container">
            <div class="breathing-circle"></div>
            <p class="breathing-instruction">${l.inhale}</p>
            <p class="breathing-count">4</p>
            <button class="btn btn-ghost" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    sosScreenEl.appendChild(breathingEl);
    
    // Animation de respiration 4-4-6
    let phase = 0;
    let count = 4;
    const phases = [
        { name: l.inhale, duration: 4, scale: 1.5 },
        { name: l.hold, duration: 4, scale: 1.5 },
        { name: l.exhale, duration: 6, scale: 1 }
    ];
    
    const circle = breathingEl.querySelector('.breathing-circle');
    const instruction = breathingEl.querySelector('.breathing-instruction');
    const countEl = breathingEl.querySelector('.breathing-count');
    
    let totalCycles = 0;
    const maxCycles = 3;
    
    const tick = () => {
        if (count > 0) {
            countEl.textContent = count;
            count--;
            setTimeout(tick, 1000);
        } else {
            phase++;
            if (phase >= phases.length) {
                phase = 0;
                totalCycles++;
            }
            
            if (totalCycles >= maxCycles) {
                instruction.textContent = l.done;
                countEl.textContent = '✓';
                circle.style.transform = 'scale(1)';
                
                setTimeout(() => {
                    breathingEl.remove();
                    Storage.incrementWins(state, { positiveActions: 1 });
                }, 2000);
            } else {
                const current = phases[phase];
                instruction.textContent = current.name;
                circle.style.transform = `scale(${current.scale})`;
                count = current.duration;
                countEl.textContent = count;
                count--;
                setTimeout(tick, 1000);
            }
        }
    };
    
    // Démarrer
    circle.style.transform = `scale(${phases[0].scale})`;
    circle.style.transition = `transform ${phases[0].duration}s ease-in-out`;
    tick();
}

/**
 * Toggle le mode low-text
 */
function toggleLowText() {
    lowTextMode = !lowTextMode;
    state.settings.lowTextMode = lowTextMode;
    Storage.saveState(state);
    renderSOSScreen(state);
}

/**
 * Confirme la sortie du mode SOS
 */
function confirmExit() {
    // Incrémenter les cravings résistés
    Storage.incrementWins(state, { resistedCravings: 1, minutesSaved: 15 });
    
    deactivateSOS();
    
    if (typeof showToast === 'function') {
        const lang = state?.profile?.lang || 'fr';
        const messages = {
            fr: 'Bravo ! Tu as résisté 💪',
            en: 'Well done! You resisted 💪',
            ar: 'أحسنت! لقد قاومت 💪'
        };
        showToast(messages[lang]);
    }
}

/**
 * Vérifie si le SOS est actif
 */
function isActive() {
    return sosActive;
}

/**
 * Génère le bouton SOS pour la home
 */
function renderSOSButton(state) {
    const lang = state.profile.lang;
    
    const labels = {
        fr: 'SOS',
        en: 'SOS',
        ar: 'طوارئ'
    };
    
    return `
        <button class="btn btn-danger btn-sos" onclick="SOS.activate(state)">
            🆘 ${labels[lang] || labels.fr}
        </button>
    `;
}

// ============================================
// EXPORTS
// ============================================

window.SOS = {
    // Constantes
    EMERGENCY_MESSAGES,
    PRIORITY_ACTIONS,
    
    // Lifecycle
    activate: activateSOS,
    deactivate: deactivateSOS,
    isActive,
    
    // Actions
    executeAction,
    randomAction,
    startBreathing,
    
    // UI
    toggleLowText,
    confirmExit,
    renderSOSButton
};
