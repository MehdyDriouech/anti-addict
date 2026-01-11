/**
 * relapse.js - Mode "Après rechute"
 * 
 * Flow empathique et constructif:
 * 1. Message de soutien "On repart maintenant"
 * 2. 3 questions rapides: Quand, Déclencheur, Changement
 * 3. Affichage carte hope/repentance
 * 4. Option de créer une règle si-alors
 */

// ============================================
// DÉCLENCHEURS PRÉDÉFINIS
// ============================================

const TRIGGER_TAGS = {
    alone: { fr: 'Seul', en: 'Alone', ar: 'وحيد' },
    night: { fr: 'La nuit', en: 'At night', ar: 'في الليل' },
    boredom: { fr: 'Ennui', en: 'Boredom', ar: 'ملل' },
    stress: { fr: 'Stress', en: 'Stress', ar: 'إجهاد' },
    social_scroll: { fr: 'Scroll réseaux', en: 'Social scrolling', ar: 'تصفح الشبكات' },
    sadness: { fr: 'Tristesse', en: 'Sadness', ar: 'حزن' },
    phone_bed: { fr: 'Téléphone au lit', en: 'Phone in bed', ar: 'الهاتف في السرير' },
    exposure: { fr: 'Exposition accidentelle', en: 'Accidental exposure', ar: 'تعرض عرضي' },
    fatigue: { fr: 'Fatigue', en: 'Fatigue', ar: 'تعب' },
    other: { fr: 'Autre', en: 'Other', ar: 'آخر' }
};

// Suggestions de changements
const CHANGE_SUGGESTIONS = {
    fr: [
        'Téléphone hors de la chambre ce soir',
        'Pas de téléphone au lit',
        'Marcher 2 min au premier craving',
        'Appeler quelqu\'un si seul le soir',
        'Définir une heure de coucher',
        'Bloquer les applications déclencheurs',
        'Préparer une activité de remplacement'
    ],
    en: [
        'Phone out of bedroom tonight',
        'No phone in bed',
        'Walk 2 min at first craving',
        'Call someone if alone at night',
        'Set a bedtime',
        'Block trigger apps',
        'Prepare a replacement activity'
    ],
    ar: [
        'الهاتف خارج الغرفة الليلة',
        'لا هاتف في السرير',
        'المشي دقيقتين عند أول رغبة',
        'الاتصال بشخص إذا كنت وحيدًا',
        'تحديد وقت للنوم',
        'حظر التطبيقات المحفزة',
        'إعداد نشاط بديل'
    ]
};

// ============================================
// FLOW PRINCIPAL
// ============================================

let relapseModalEl = null;
let relapseData = {
    when: 'now',
    trigger: null,
    change: ''
};

/**
 * Ouvre le mode après rechute
 * @param {Object} state - State de l'application
 */
function openRelapseMode(state) {
    relapseData = { when: 'now', trigger: null, change: '' };
    
    if (!relapseModalEl) {
        relapseModalEl = document.createElement('div');
        relapseModalEl.className = 'modal-overlay';
        relapseModalEl.id = 'relapseModal';
        document.body.appendChild(relapseModalEl);
    }
    
    renderStep1(state);
    relapseModalEl.classList.add('active');
}

/**
 * Ferme le mode après rechute
 */
function closeRelapseMode() {
    if (relapseModalEl) {
        relapseModalEl.classList.remove('active');
    }
}

/**
 * Étape 1: Message de soutien
 */
function renderStep1(state) {
    const lang = state.profile.lang;
    
    const labels = {
        fr: {
            title: 'On repart maintenant',
            message: 'Tu as fait une erreur, mais tu es ici. C\'est ce qui compte.',
            message2: 'Répondons ensemble à 3 questions rapides pour apprendre de ce moment.',
            continue: 'Continuer'
        },
        en: {
            title: 'Let\'s start again',
            message: 'You made a mistake, but you\'re here. That\'s what matters.',
            message2: 'Let\'s answer 3 quick questions to learn from this moment.',
            continue: 'Continue'
        },
        ar: {
            title: 'لنبدأ من جديد',
            message: 'لقد أخطأت، لكنك هنا. هذا ما يهم.',
            message2: 'دعنا نجيب على 3 أسئلة سريعة للتعلم من هذه اللحظة.',
            continue: 'متابعة'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    relapseModalEl.innerHTML = `
        <div class="modal-content relapse-modal">
            <button class="modal-close" onclick="Relapse.close()">×</button>
            
            <div class="relapse-step relapse-step-1">
                <div class="relapse-icon">🌅</div>
                <h2>${l.title}</h2>
                <p class="relapse-message">${l.message}</p>
                <p class="relapse-message-secondary">${l.message2}</p>
                
                <button class="btn btn-primary btn-large" onclick="Relapse.goStep2()">
                    ${l.continue} →
                </button>
            </div>
        </div>
    `;
}

/**
 * Étape 2: Quand + Déclencheur
 */
function goStep2() {
    const lang = state.profile.lang;
    
    const labels = {
        fr: {
            when: 'Quand était-ce ?',
            now: 'Maintenant',
            today: 'Plus tôt aujourd\'hui',
            trigger: 'Quel était le déclencheur principal ?',
            next: 'Suivant'
        },
        en: {
            when: 'When was it?',
            now: 'Now',
            today: 'Earlier today',
            trigger: 'What was the main trigger?',
            next: 'Next'
        },
        ar: {
            when: 'متى حدث ذلك؟',
            now: 'الآن',
            today: 'في وقت سابق اليوم',
            trigger: 'ما كان السبب الرئيسي؟',
            next: 'التالي'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    const modalContent = relapseModalEl.querySelector('.modal-content');
    modalContent.innerHTML = `
        <button class="modal-close" onclick="Relapse.close()">×</button>
        
        <div class="relapse-step relapse-step-2">
            <div class="form-group">
                <label>${l.when}</label>
                <div class="btn-group">
                    <button class="btn ${relapseData.when === 'now' ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="Relapse.setWhen('now')">
                        ${l.now}
                    </button>
                    <button class="btn ${relapseData.when === 'today' ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="Relapse.setWhen('today')">
                        ${l.today}
                    </button>
                </div>
            </div>
            
            <div class="form-group">
                <label>${l.trigger}</label>
                <div class="trigger-chips">
                    ${Object.entries(TRIGGER_TAGS).map(([key, labels]) => `
                        <button class="chip ${relapseData.trigger === key ? 'active' : ''}" 
                                onclick="Relapse.setTrigger('${key}')">
                            ${labels[lang] || labels.fr}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <button class="btn btn-primary btn-large" onclick="Relapse.goStep3()" 
                    ${!relapseData.trigger ? 'disabled' : ''}>
                ${l.next} →
            </button>
        </div>
    `;
}

/**
 * Définit le "quand"
 */
function setWhen(value) {
    relapseData.when = value;
    goStep2(); // Re-render
}

/**
 * Définit le déclencheur
 */
function setTrigger(value) {
    relapseData.trigger = value;
    goStep2(); // Re-render
}

/**
 * Étape 3: Changement + Carte + Créer règle
 */
function goStep3() {
    const lang = state.profile.lang;
    
    const labels = {
        fr: {
            change: 'Quel petit changement pour demain ?',
            placeholder: 'Ou écris le tien...',
            finish: 'Terminer',
            createRule: 'Créer une règle à partir de ça'
        },
        en: {
            change: 'What small change for tomorrow?',
            placeholder: 'Or write your own...',
            finish: 'Finish',
            createRule: 'Create a rule from this'
        },
        ar: {
            change: 'ما التغيير الصغير لغد؟',
            placeholder: 'أو اكتب ما تريد...',
            finish: 'إنهاء',
            createRule: 'إنشاء قاعدة من هذا'
        }
    };
    
    const l = labels[lang] || labels.fr;
    const suggestions = CHANGE_SUGGESTIONS[lang] || CHANGE_SUGGESTIONS.fr;
    
    // Récupérer une carte spirituelle hope/repentance
    let spiritualCard = null;
    if (state.profile.spiritualEnabled && state.profile.religion !== 'none') {
        const cards = I18n.getSpiritualCards();
        const hopeCards = cards.filter(c => ['hope', 'repentance'].includes(c.theme));
        if (hopeCards.length > 0) {
            spiritualCard = hopeCards[Math.floor(Math.random() * hopeCards.length)];
        }
    }
    
    const modalContent = relapseModalEl.querySelector('.modal-content');
    modalContent.innerHTML = `
        <button class="modal-close" onclick="Relapse.close()">×</button>
        
        <div class="relapse-step relapse-step-3">
            ${spiritualCard ? `
                <div class="spiritual-card relapse-card">
                    <p class="card-text">"${spiritualCard.text}"</p>
                    <cite>— ${spiritualCard.ref}</cite>
                </div>
            ` : ''}
            
            <div class="form-group">
                <label>${l.change}</label>
                <div class="suggestion-chips">
                    ${suggestions.slice(0, 4).map((s, i) => `
                        <button class="chip suggestion-chip" onclick="Relapse.selectSuggestion(${i})">
                            ${s}
                        </button>
                    `).join('')}
                </div>
                <input type="text" id="changeInput" class="input" 
                       placeholder="${l.placeholder}" value="${relapseData.change}">
            </div>
            
            <div class="relapse-actions">
                <button class="btn btn-primary btn-large" onclick="Relapse.finish()">
                    ✓ ${l.finish}
                </button>
                
                <button class="btn btn-secondary" onclick="Relapse.createRuleFromRelapse()">
                    📋 ${l.createRule}
                </button>
            </div>
        </div>
    `;
}

/**
 * Sélectionne une suggestion
 */
function selectSuggestion(index) {
    const lang = state.profile.lang;
    const suggestions = CHANGE_SUGGESTIONS[lang] || CHANGE_SUGGESTIONS.fr;
    relapseData.change = suggestions[index];
    
    const input = document.getElementById('changeInput');
    if (input) input.value = relapseData.change;
}

/**
 * Termine le flow et enregistre l'épisode
 */
function finish() {
    const changeInput = document.getElementById('changeInput');
    relapseData.change = changeInput?.value || '';
    
    // Enregistrer l'épisode avec les métadonnées
    Storage.addEvent(state, 'episode', 'porn', null, {
        when: relapseData.when,
        trigger: relapseData.trigger,
        change: relapseData.change
    });
    
    closeRelapseMode();
    
    // Toast de confirmation
    if (typeof showToast === 'function') {
        const lang = state.profile.lang;
        const messages = {
            fr: 'Enregistré. Demain est un nouveau jour.',
            en: 'Recorded. Tomorrow is a new day.',
            ar: 'تم التسجيل. غدًا يوم جديد.'
        };
        showToast(messages[lang] || messages.fr);
    }
    
    // Re-render Home
    if (typeof renderHome === 'function') {
        renderHome();
    }
}

/**
 * Crée une règle si-alors à partir du déclencheur
 */
function createRuleFromRelapse() {
    const trigger = relapseData.trigger;
    if (!trigger) return;
    
    const lang = state.profile.lang;
    
    // Mapper le trigger vers une condition
    const conditionMap = {
        alone: { alone: true },
        night: { timeRange: 'night' },
        phone_bed: { inBedWithPhone: true },
        stress: { stressAbove: 7 },
        exposure: { exposed: true },
        boredom: { triggerTag: 'boredom' },
        social_scroll: { triggerTag: 'social_scroll' }
    };
    
    const condition = conditionMap[trigger] || { triggerTag: trigger };
    
    // Actions par défaut
    const actionIds = ['leave_room', 'breathing_446', 'walk_2min'];
    
    // Créer la règle
    IfThen.createCustomRule({
        name: TRIGGER_TAGS[trigger]?.[lang] || trigger,
        if: condition,
        then: { actionIds }
    }, state);
    
    // Feedback
    if (typeof showToast === 'function') {
        const messages = {
            fr: 'Règle créée !',
            en: 'Rule created!',
            ar: 'تم إنشاء القاعدة!'
        };
        showToast(messages[lang] || messages.fr);
    }
    
    closeRelapseMode();
    
    // Ouvrir le modal des règles pour voir/modifier
    IfThen.openRulesModal();
}

// ============================================
// EXPORTS
// ============================================

window.Relapse = {
    // Data
    TRIGGER_TAGS,
    CHANGE_SUGGESTIONS,
    
    // Flow
    openRelapseMode,
    closeRelapseMode,
    close: closeRelapseMode,
    
    // Steps
    goStep2,
    goStep3,
    setWhen,
    setTrigger,
    selectSuggestion,
    finish,
    createRuleFromRelapse
};
