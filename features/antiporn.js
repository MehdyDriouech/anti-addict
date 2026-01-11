/**
 * antiporn.js - Features anti-porno spécifiques
 * 
 * Fonctionnalités V2:
 * - Bouton "Je suis sur une pente" (slope)
 * - Checklist règles environnement
 * - Déclencheurs personnalisables
 * - Signaux de pente glissante
 * - Conseils contextuels
 * 
 * Fonctionnalités V3 (EXTENSIONS):
 * - Plan Nuit avec checklist obligatoire
 * - Pente avancée 3 étapes obligatoires
 * - Check-in téléphone au lit
 * - Compteur pentes stoppées
 */

// ============================================
// CONSTANTES
// ============================================

// Déclencheurs prédéfinis
const TRIGGERS = {
    alone: { fr: 'Seul à la maison', en: 'Home alone', ar: 'وحيد في المنزل' },
    night: { fr: 'La nuit', en: 'At night', ar: 'في الليل' },
    boredom: { fr: 'Ennui', en: 'Boredom', ar: 'ملل' },
    stress: { fr: 'Stress', en: 'Stress', ar: 'إجهاد' },
    social_scroll: { fr: 'Scroll réseaux sociaux', en: 'Social media scrolling', ar: 'تصفح وسائل التواصل' },
    fatigue: { fr: 'Fatigue', en: 'Fatigue', ar: 'تعب' },
    rejection: { fr: 'Sentiment de rejet', en: 'Feeling rejected', ar: 'شعور بالرفض' },
    anxiety: { fr: 'Anxiété', en: 'Anxiety', ar: 'قلق' }
};

// Signaux de pente glissante
const SLOPE_SIGNALS = {
    soft_images: { fr: 'Images suggestives', en: 'Suggestive images', ar: 'صور إيحائية' },
    endless_scroll: { fr: 'Scroll sans fin', en: 'Endless scrolling', ar: 'تصفح لا نهائي' },
    searching: { fr: 'Recherches ambiguës', en: 'Ambiguous searches', ar: 'بحث غامض' },
    incognito: { fr: 'Mode navigation privée', en: 'Private browsing', ar: 'تصفح خاص' },
    justifying: { fr: 'Justifications internes', en: 'Internal justifications', ar: 'تبريرات داخلية' },
    isolation: { fr: 'S\'isoler', en: 'Isolating yourself', ar: 'العزلة' }
};

// Règles d'environnement
const ENVIRONMENT_RULES = {
    phoneOutBedroom: { 
        fr: 'Téléphone hors de la chambre la nuit',
        en: 'Phone out of bedroom at night',
        ar: 'الهاتف خارج غرفة النوم ليلاً'
    },
    noPhoneBed: { 
        fr: 'Pas de téléphone au lit',
        en: 'No phone in bed',
        ar: 'لا هاتف في السرير'
    },
    blockTriggersList: { 
        fr: 'Applications déclencheurs bloquées',
        en: 'Trigger apps blocked',
        ar: 'التطبيقات المحفزة محظورة'
    },
    screenTimeLimit: { 
        fr: 'Limite de temps d\'écran définie',
        en: 'Screen time limit set',
        ar: 'حد زمني للشاشة محدد'
    },
    accountabilityPartner: { 
        fr: 'Partenaire de responsabilité',
        en: 'Accountability partner',
        ar: 'شريك مسؤولية'
    }
};

// Conseils contextuels
const CONTEXTUAL_TIPS = {
    fr: [
        'Rappelle-toi: ce moment va passer.',
        'Lève-toi et change de pièce.',
        'Appelle ou envoie un message à quelqu\'un.',
        'Bois un verre d\'eau fraîche.',
        'Fais 10 pompes ou squats.',
        'Mets de la musique et bouge.',
        'Sors prendre l\'air, même 2 minutes.',
        'Respire profondément: 4-4-6.'
    ],
    en: [
        'Remember: this moment will pass.',
        'Stand up and change rooms.',
        'Call or text someone.',
        'Drink a glass of cold water.',
        'Do 10 push-ups or squats.',
        'Put on music and move.',
        'Go outside for fresh air, even 2 minutes.',
        'Breathe deeply: 4-4-6.'
    ],
    ar: [
        'تذكر: هذه اللحظة ستمر.',
        'قم وغير الغرفة.',
        'اتصل أو أرسل رسالة لشخص ما.',
        'اشرب كوب ماء بارد.',
        'قم بـ 10 تمارين ضغط.',
        'شغل موسيقى وتحرك.',
        'اخرج للهواء الطلق، حتى لدقيقتين.',
        'تنفس بعمق: 4-4-6.'
    ]
};

// V3: Checklist routine nuit prédéfinie
const NIGHT_CHECKLIST_ITEMS = {
    phone_out: { fr: 'Téléphone hors chambre', en: 'Phone out of room', ar: 'الهاتف خارج الغرفة', emoji: '📵' },
    lights_dim: { fr: 'Lumières tamisées', en: 'Lights dimmed', ar: 'أضواء خافتة', emoji: '💡' },
    leave_bed: { fr: 'Si craving: quitter le lit', en: 'If craving: leave bed', ar: 'إذا رغبة: غادر السرير', emoji: '🛏️' },
    no_screens: { fr: 'Pas d\'écrans 30min avant', en: 'No screens 30min before', ar: 'لا شاشات 30 دقيقة قبل', emoji: '📺' },
    prayer: { fr: 'Prière/méditation', en: 'Prayer/meditation', ar: 'صلاة/تأمل', emoji: '🙏' },
    door_open: { fr: 'Porte ouverte', en: 'Door open', ar: 'الباب مفتوح', emoji: '🚪' }
};

// V3: Étapes obligatoires de la pente avancée
const SLOPE_STEPS = {
    leave: { 
        fr: '🚪 Quitter l\'endroit', 
        en: '🚪 Leave the place', 
        ar: '🚪 غادر المكان',
        desc: {
            fr: 'Lève-toi et change de pièce immédiatement.',
            en: 'Stand up and change rooms immediately.',
            ar: 'قم وغير الغرفة فوراً.'
        }
    },
    water: { 
        fr: '💧 Boire de l\'eau', 
        en: '💧 Drink water', 
        ar: '💧 اشرب ماء',
        desc: {
            fr: 'Un verre d\'eau fraîche pour couper le cycle.',
            en: 'A glass of cold water to break the cycle.',
            ar: 'كوب ماء بارد لكسر الدورة.'
        }
    },
    move: { 
        fr: '🏃 Bouger le corps', 
        en: '🏃 Move your body', 
        ar: '🏃 حرك جسمك',
        desc: {
            fr: '10 pompes, squats, ou marche 2 minutes.',
            en: '10 push-ups, squats, or walk 2 minutes.',
            ar: '10 تمارين ضغط، قرفصاء، أو امش دقيقتين.'
        }
    }
};

// ============================================
// GESTION DES PENTES
// ============================================

/**
 * Enregistre un signal de pente glissante
 * @param {Object} state - State de l'application
 * @param {string} signal - Signal identifié (optionnel)
 * @returns {Object} State modifié
 */
function logSlope(state, signal = null) {
    const meta = signal ? { signal } : {};
    Storage.addEvent(state, 'slope', 'porn', null, meta);
    return state;
}

/**
 * Récupère les pentes des N derniers jours
 * @param {Object} state - State de l'application
 * @param {number} days - Nombre de jours
 * @returns {Array}
 */
function getRecentSlopes(state, days = 7) {
    const startDate = Utils.daysAgoISO(days - 1);
    return state.events.filter(e => 
        e.type === 'slope' && 
        e.date >= startDate
    );
}

// ============================================
// V3: MODAL PENTE AVANCÉE (3 ÉTAPES)
// ============================================

let slopeModalEl = null;
let slopeStep = 0;
let slopeStepsCompleted = {};

/**
 * Ouvre le modal "Je suis sur une pente" (version avancée)
 * @param {Object} state - State de l'application
 */
function openSlopeModal(state) {
    if (!slopeModalEl) {
        slopeModalEl = document.createElement('div');
        slopeModalEl.className = 'modal-overlay';
        slopeModalEl.id = 'slopeModal';
        document.body.appendChild(slopeModalEl);
    }
    
    // Reset des étapes
    slopeStep = 0;
    slopeStepsCompleted = { leave: false, water: false, move: false };
    
    renderSlopeContent(state);
    slopeModalEl.classList.add('active');
}

/**
 * Ferme le modal pente
 */
function closeSlopeModal() {
    if (slopeModalEl) {
        slopeModalEl.classList.remove('active');
    }
}

/**
 * Rendu du contenu du modal pente (version avancée avec 3 étapes)
 */
function renderSlopeContent(state) {
    const lang = state.profile.lang;
    const isSpiritual = state.profile.spiritualEnabled && state.profile.religion !== 'none';
    
    const labels = {
        fr: {
            title: '⚠️ Pente glissante',
            subtitle: 'Tu as bien fait de t\'arrêter. Complète les 3 étapes.',
            whatSignal: 'Quel signal ?',
            step: 'Étape',
            of: 'sur',
            done: 'Fait ✓',
            next: 'Suivant →',
            completed: 'Pente stoppée ! 💪',
            close: 'Fermer',
            stoppedCount: 'pentes stoppées',
            skipWarning: 'Tu ne peux pas sauter d\'étape.'
        },
        en: {
            title: '⚠️ Slippery slope',
            subtitle: 'You did well to stop. Complete the 3 steps.',
            whatSignal: 'What signal?',
            step: 'Step',
            of: 'of',
            done: 'Done ✓',
            next: 'Next →',
            completed: 'Slope stopped! 💪',
            close: 'Close',
            stoppedCount: 'slopes stopped',
            skipWarning: 'You cannot skip a step.'
        },
        ar: {
            title: '⚠️ منحدر زلق',
            subtitle: 'أحسنت بالتوقف. أكمل الخطوات الـ3.',
            whatSignal: 'ما الإشارة؟',
            step: 'خطوة',
            of: 'من',
            done: 'تم ✓',
            next: 'التالي →',
            completed: 'تم إيقاف المنحدر! 💪',
            close: 'إغلاق',
            stoppedCount: 'منحدرات تم إيقافها',
            skipWarning: 'لا يمكنك تخطي خطوة.'
        }
    };
    
    const l = labels[lang] || labels.fr;
    const stepKeys = Object.keys(SLOPE_STEPS);
    const allCompleted = stepKeys.every(k => slopeStepsCompleted[k]);
    const stoppedCount = state.antiporn?.stoppedSlopes || 0;
    
    // Carte spirituelle si activée
    let spiritualCard = null;
    if (isSpiritual && typeof I18n !== 'undefined' && I18n.getSpiritualCards) {
        const cards = I18n.getSpiritualCards();
        const relevantCards = cards.filter(c => 
            ['lower_gaze', 'avoid_paths', 'discipline'].includes(c.theme)
        );
        if (relevantCards.length > 0) {
            spiritualCard = relevantCards[Math.floor(Math.random() * relevantCards.length)];
        }
    }
    
    slopeModalEl.innerHTML = `
        <div class="modal-content slope-modal slope-advanced">
            <button class="modal-close" onclick="AntiPorn.closeSlopeModal()">×</button>
            
            <div class="slope-header">
                <h2>${l.title}</h2>
                <p>${l.subtitle}</p>
                <div class="stopped-counter">
                    <span class="counter-value">${stoppedCount}</span>
                    <span class="counter-label">${l.stoppedCount}</span>
                </div>
            </div>
            
            <!-- Signaux (optionnel, réduit) -->
            <div class="slope-signals compact">
                <label>${l.whatSignal}</label>
                <div class="signal-chips">
                    ${Object.entries(SLOPE_SIGNALS).slice(0, 4).map(([key, labels]) => `
                        <button class="chip small" onclick="AntiPorn.logWithSignal('${key}')">
                            ${labels[lang] || labels.fr}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <!-- 3 étapes obligatoires -->
            <div class="slope-steps-container">
                ${stepKeys.map((stepKey, index) => {
                    const step = SLOPE_STEPS[stepKey];
                    const isCompleted = slopeStepsCompleted[stepKey];
                    const isCurrent = index === slopeStep;
                    const isLocked = index > slopeStep && !allCompleted;
                    
                    return `
                        <div class="slope-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}"
                             data-step="${stepKey}">
                            <div class="step-header">
                                <span class="step-number">${index + 1}</span>
                                <span class="step-title">${step[lang] || step.fr}</span>
                                ${isCompleted ? '<span class="step-check">✓</span>' : ''}
                            </div>
                            <p class="step-desc">${step.desc[lang] || step.desc.fr}</p>
                            ${isCurrent && !isCompleted ? `
                                <button class="btn btn-primary btn-block step-btn" 
                                        onclick="AntiPorn.completeStep('${stepKey}')">
                                    ${l.done}
                                </button>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            
            ${allCompleted ? `
                <div class="slope-completed">
                    <div class="completed-icon">🎉</div>
                    <h3>${l.completed}</h3>
                    
                    ${spiritualCard ? `
                        <div class="spiritual-card slope-card">
                            <p class="card-text">"${spiritualCard.text}"</p>
                            <cite>— ${spiritualCard.ref}</cite>
                        </div>
                    ` : ''}
                    
                    <button class="btn btn-primary btn-large" onclick="AntiPorn.confirmSlope()">
                        ${l.close}
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Complète une étape de la pente
 */
function completeStep(stepKey) {
    slopeStepsCompleted[stepKey] = true;
    slopeStep++;
    
    const stepKeys = Object.keys(SLOPE_STEPS);
    const allCompleted = stepKeys.every(k => slopeStepsCompleted[k]);
    
    // Si toutes les étapes sont complétées, incrémenter le compteur
    if (allCompleted) {
        Storage.incrementStoppedSlopes(state);
        logSlope(state, 'completed_steps');
    }
    
    renderSlopeContent(state);
}

/**
 * Enregistre la pente avec un signal spécifique
 */
function logWithSignal(signal) {
    logSlope(state, signal);
    
    // Feedback visuel
    const chips = document.querySelectorAll('.signal-chips .chip');
    chips.forEach(chip => chip.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    if (typeof showToast === 'function') {
        const lang = state?.profile?.lang || 'fr';
        const messages = {
            fr: 'Signal enregistré',
            en: 'Signal logged',
            ar: 'تم تسجيل الإشارة'
        };
        showToast(messages[lang] || messages.fr);
    }
}

/**
 * Confirme et ferme
 */
function confirmSlope() {
    // S'assurer qu'au moins une pente est loguée
    const todaySlopes = Utils.getTodayEventsByType(state.events, 'slope');
    if (todaySlopes.length === 0) {
        logSlope(state);
    }
    
    closeSlopeModal();
    
    if (typeof renderHome === 'function') {
        renderHome();
    }
}

// ============================================
// V3: PLAN NUIT
// ============================================

let nightModalEl = null;

/**
 * Ouvre le modal de routine nuit
 * @param {Object} state - State de l'application
 */
function openNightModal(state) {
    if (!nightModalEl) {
        nightModalEl = document.createElement('div');
        nightModalEl.className = 'modal-overlay';
        nightModalEl.id = 'nightModal';
        document.body.appendChild(nightModalEl);
    }
    
    renderNightContent(state);
    nightModalEl.classList.add('active');
}

/**
 * Ferme le modal nuit
 */
function closeNightModal() {
    if (nightModalEl) {
        nightModalEl.classList.remove('active');
    }
}

/**
 * Rendu du modal routine nuit
 */
function renderNightContent(state) {
    const lang = state.profile.lang;
    const nightRoutine = state.nightRoutine || {};
    const checklist = nightRoutine.checklist || ['phone_out', 'lights_dim', 'leave_bed'];
    
    const labels = {
        fr: {
            title: '🌙 Routine nuit',
            subtitle: 'Avant de te coucher, vérifie ces points',
            hour: 'Heure de rappel',
            checklist: 'Ma checklist',
            save: 'Valider ma routine',
            enable: 'Activer la routine nuit',
            customItem: 'Ajouter un élément',
            addCustom: '+ Ajouter',
            completedTonight: 'Routine complétée ce soir !',
            stats: 'Ce mois',
            completed: 'routines complétées'
        },
        en: {
            title: '🌙 Night routine',
            subtitle: 'Before bed, check these points',
            hour: 'Reminder hour',
            checklist: 'My checklist',
            save: 'Validate routine',
            enable: 'Enable night routine',
            customItem: 'Add an item',
            addCustom: '+ Add',
            completedTonight: 'Routine completed tonight!',
            stats: 'This month',
            completed: 'routines completed'
        },
        ar: {
            title: '🌙 روتين الليل',
            subtitle: 'قبل النوم، تحقق من هذه النقاط',
            hour: 'ساعة التذكير',
            checklist: 'قائمتي',
            save: 'تأكيد الروتين',
            enable: 'تفعيل روتين الليل',
            customItem: 'إضافة عنصر',
            addCustom: '+ إضافة',
            completedTonight: 'الروتين مكتمل الليلة!',
            stats: 'هذا الشهر',
            completed: 'روتين مكتمل'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    // Compter les routines complétées ce mois
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthLogs = (nightRoutine.logs || []).filter(log => log.date >= monthStart && log.completed);
    
    // Vérifier si déjà complété aujourd'hui
    const today = Storage.getDateISO();
    const todayLog = (nightRoutine.logs || []).find(log => log.date === today);
    
    nightModalEl.innerHTML = `
        <div class="modal-content night-modal">
            <button class="modal-close" onclick="AntiPorn.closeNightModal()">×</button>
            
            <div class="night-header">
                <h2>${l.title}</h2>
                <p>${l.subtitle}</p>
            </div>
            
            <!-- Stats -->
            <div class="night-stats">
                <span class="stat-value">${monthLogs.length}</span>
                <span class="stat-label">${l.completed} (${l.stats})</span>
            </div>
            
            ${todayLog?.completed ? `
                <div class="night-completed">
                    <span class="completed-icon">✓</span>
                    <span>${l.completedTonight}</span>
                </div>
            ` : ''}
            
            <!-- Toggle activation -->
            <div class="toggle-row">
                <label class="toggle-label">
                    <span>${l.enable}</span>
                    <input type="checkbox" id="nightEnabled" 
                           ${nightRoutine.enabled ? 'checked' : ''}
                           onchange="AntiPorn.toggleNightRoutine()">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <!-- Heure -->
            <div class="form-group">
                <label>${l.hour}</label>
                <input type="time" id="nightHour" class="input" 
                       value="${String(nightRoutine.hour || 22).padStart(2, '0')}:00">
            </div>
            
            <!-- Checklist -->
            <div class="night-checklist">
                <h4>${l.checklist}</h4>
                
                ${Object.entries(NIGHT_CHECKLIST_ITEMS).map(([key, item]) => `
                    <label class="checklist-item ${checklist.includes(key) ? 'selected' : ''}">
                        <input type="checkbox" data-item="${key}" 
                               ${checklist.includes(key) ? 'checked' : ''}>
                        <span class="item-emoji">${item.emoji}</span>
                        <span class="item-text">${item[lang] || item.fr}</span>
                    </label>
                `).join('')}
                
                <!-- Items personnalisés -->
                ${(nightRoutine.customChecklist || []).map((item, idx) => `
                    <label class="checklist-item custom selected">
                        <input type="checkbox" data-custom="${idx}" checked>
                        <span class="item-emoji">✨</span>
                        <span class="item-text">${item}</span>
                        <button class="remove-btn" onclick="AntiPorn.removeCustomNightItem(${idx})">×</button>
                    </label>
                `).join('')}
                
                <!-- Ajouter un item -->
                <div class="add-custom-item">
                    <input type="text" id="customNightItem" placeholder="${l.customItem}" maxlength="50">
                    <button class="btn btn-small" onclick="AntiPorn.addCustomNightItem()">${l.addCustom}</button>
                </div>
            </div>
            
            <!-- Valider -->
            <button class="btn btn-primary btn-large btn-block" onclick="AntiPorn.saveNightRoutine()">
                ✓ ${l.save}
            </button>
        </div>
    `;
}

/**
 * Toggle l'activation de la routine nuit
 */
function toggleNightRoutine() {
    const enabled = document.getElementById('nightEnabled')?.checked || false;
    state.nightRoutine.enabled = enabled;
    Storage.saveState(state);
}

/**
 * Ajoute un item personnalisé
 */
function addCustomNightItem() {
    const input = document.getElementById('customNightItem');
    const text = input?.value?.trim();
    
    if (!text) return;
    
    if (!state.nightRoutine.customChecklist) {
        state.nightRoutine.customChecklist = [];
    }
    
    state.nightRoutine.customChecklist.push(text);
    Storage.saveState(state);
    renderNightContent(state);
}

/**
 * Supprime un item personnalisé
 */
function removeCustomNightItem(index) {
    if (state.nightRoutine.customChecklist) {
        state.nightRoutine.customChecklist.splice(index, 1);
        Storage.saveState(state);
        renderNightContent(state);
    }
}

/**
 * Sauvegarde la routine nuit
 */
function saveNightRoutine() {
    // Récupérer les items sélectionnés
    const checklist = [];
    document.querySelectorAll('[data-item]').forEach(cb => {
        if (cb.checked) {
            checklist.push(cb.dataset.item);
        }
    });
    
    // Récupérer l'heure
    const hourInput = document.getElementById('nightHour');
    const hour = hourInput ? parseInt(hourInput.value.split(':')[0], 10) : 22;
    
    // Mettre à jour la config
    state.nightRoutine.checklist = checklist;
    state.nightRoutine.hour = hour;
    
    // Logger comme routine complétée
    Storage.addNightRoutineLog(state, { 
        checklist, 
        completed: true 
    });
    
    Storage.saveState(state);
    closeNightModal();
    
    if (typeof showToast === 'function') {
        const lang = state?.profile?.lang || 'fr';
        const messages = {
            fr: 'Routine nuit enregistrée ✓',
            en: 'Night routine saved ✓',
            ar: 'تم حفظ روتين الليل ✓'
        };
        showToast(messages[lang]);
    }
    
    if (typeof renderHome === 'function') {
        renderHome();
    }
}

/**
 * Vérifie si c'est l'heure de la routine nuit
 * @param {Object} state - State de l'application
 * @returns {boolean}
 */
function isNightRoutineTime(state) {
    if (!state.nightRoutine?.enabled) return false;
    
    const now = new Date();
    const hour = now.getHours();
    const routineHour = state.nightRoutine.hour || 22;
    
    return hour >= routineHour || hour < 5;
}

// ============================================
// V3: CHECK-IN TÉLÉPHONE AU LIT
// ============================================

let phoneBedModalEl = null;

/**
 * Ouvre le modal check-in téléphone au lit
 * @param {Object} state - State de l'application
 */
function openPhoneBedModal(state) {
    if (!phoneBedModalEl) {
        phoneBedModalEl = document.createElement('div');
        phoneBedModalEl.className = 'modal-overlay';
        phoneBedModalEl.id = 'phoneBedModal';
        document.body.appendChild(phoneBedModalEl);
    }
    
    renderPhoneBedContent(state);
    phoneBedModalEl.classList.add('active');
}

/**
 * Ferme le modal
 */
function closePhoneBedModal() {
    if (phoneBedModalEl) {
        phoneBedModalEl.classList.remove('active');
    }
}

/**
 * Rendu du modal check-in téléphone
 */
function renderPhoneBedContent(state) {
    const lang = state.profile.lang;
    
    const labels = {
        fr: {
            title: '📱 Check-in rapide',
            question: 'Ton téléphone est-il dans la chambre ?',
            yes: 'Oui',
            no: 'Non',
            tip: 'Le téléphone au lit est corrélé à 70% des rechutes nocturnes.'
        },
        en: {
            title: '📱 Quick check-in',
            question: 'Is your phone in the bedroom?',
            yes: 'Yes',
            no: 'No',
            tip: 'Phone in bed is correlated with 70% of nighttime relapses.'
        },
        ar: {
            title: '📱 تسجيل سريع',
            question: 'هل هاتفك في غرفة النوم؟',
            yes: 'نعم',
            no: 'لا',
            tip: 'الهاتف في السرير مرتبط بـ70% من الانتكاسات الليلية.'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    phoneBedModalEl.innerHTML = `
        <div class="modal-content phone-bed-modal">
            <button class="modal-close" onclick="AntiPorn.closePhoneBedModal()">×</button>
            
            <h2>${l.title}</h2>
            <p class="question">${l.question}</p>
            
            <div class="phone-bed-buttons">
                <button class="btn btn-danger btn-large" onclick="AntiPorn.answerPhoneBed(true)">
                    ${l.yes}
                </button>
                <button class="btn btn-success btn-large" onclick="AntiPorn.answerPhoneBed(false)">
                    ${l.no} ✓
                </button>
            </div>
            
            <p class="tip">${l.tip}</p>
        </div>
    `;
}

/**
 * Réponse au check-in téléphone
 */
function answerPhoneBed(phoneInBed) {
    Storage.addPhoneBedCheckin(state, phoneInBed);
    closePhoneBedModal();
    
    if (typeof showToast === 'function') {
        const lang = state?.profile?.lang || 'fr';
        if (!phoneInBed) {
            const messages = {
                fr: 'Bravo ! Continue comme ça 💪',
                en: 'Great! Keep it up 💪',
                ar: 'أحسنت! استمر 💪'
            };
            showToast(messages[lang]);
        } else {
            const messages = {
                fr: 'Pense à sortir le téléphone demain soir',
                en: 'Try to put the phone out tomorrow night',
                ar: 'حاول إخراج الهاتف غداً مساءً'
            };
            showToast(messages[lang]);
        }
    }
}

/**
 * Calcule le % de nuits sans téléphone au lit (7 derniers jours)
 * @param {Object} state - State de l'application
 * @returns {number} Pourcentage
 */
function getPhoneBedStats(state) {
    const checkins = state.antiporn?.phoneBedCheckins || [];
    const last7Days = Utils.daysAgoISO(6);
    const recent = checkins.filter(c => c.date >= last7Days);
    
    if (recent.length === 0) return null;
    
    const withoutPhone = recent.filter(c => !c.phoneInBed).length;
    return Math.round((withoutPhone / recent.length) * 100);
}

// ============================================
// MODAL CONFIGURATION
// ============================================

let configModalEl = null;

/**
 * Ouvre le modal de configuration anti-porno
 * @param {Object} state - State de l'application
 */
function openConfigModal(state) {
    if (!configModalEl) {
        configModalEl = document.createElement('div');
        configModalEl.className = 'modal-overlay';
        configModalEl.id = 'antipornConfigModal';
        document.body.appendChild(configModalEl);
    }
    
    renderConfigContent(state);
    configModalEl.classList.add('active');
}

/**
 * Ferme le modal config
 */
function closeConfigModal() {
    if (configModalEl) {
        configModalEl.classList.remove('active');
    }
}

/**
 * Rendu de la configuration
 */
function renderConfigContent(state) {
    const lang = state.profile.lang;
    const antiporn = state.antiporn || {};
    const triggers = antiporn.triggers || [];
    const envRules = antiporn.environmentRules || {};
    
    const labels = {
        fr: {
            title: '⚙️ Configuration anti-porno',
            triggers: 'Mes déclencheurs',
            triggersDesc: 'Sélectionne les situations qui te mettent à risque',
            envRules: 'Règles d\'environnement',
            envRulesDesc: 'Checklist de sécurité',
            nightSection: 'Routine nuit',
            save: 'Enregistrer'
        },
        en: {
            title: '⚙️ Anti-porn configuration',
            triggers: 'My triggers',
            triggersDesc: 'Select situations that put you at risk',
            envRules: 'Environment rules',
            envRulesDesc: 'Safety checklist',
            nightSection: 'Night routine',
            save: 'Save'
        },
        ar: {
            title: '⚙️ إعدادات مكافحة الإباحية',
            triggers: 'محفزاتي',
            triggersDesc: 'حدد المواقف التي تعرضك للخطر',
            envRules: 'قواعد البيئة',
            envRulesDesc: 'قائمة الأمان',
            nightSection: 'روتين الليل',
            save: 'حفظ'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    configModalEl.innerHTML = `
        <div class="modal-content config-modal">
            <button class="modal-close" onclick="AntiPorn.closeConfigModal()">×</button>
            
            <h2>${l.title}</h2>
            
            <div class="config-section">
                <h4>${l.triggers}</h4>
                <p class="config-desc">${l.triggersDesc}</p>
                <div class="trigger-chips" id="triggerChips">
                    ${Object.entries(TRIGGERS).map(([key, labels]) => `
                        <button class="chip ${triggers.includes(key) ? 'active' : ''}" 
                                data-trigger="${key}"
                                onclick="AntiPorn.toggleTrigger('${key}')">
                            ${labels[lang] || labels.fr}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div class="config-section">
                <h4>${l.envRules}</h4>
                <p class="config-desc">${l.envRulesDesc}</p>
                <div class="env-rules-list">
                    ${Object.entries(ENVIRONMENT_RULES).map(([key, labels]) => `
                        <label class="checkbox-label">
                            <input type="checkbox" data-rule="${key}" 
                                   ${envRules[key] ? 'checked' : ''}>
                            ${labels[lang] || labels.fr}
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <!-- Lien vers routine nuit -->
            <div class="config-section">
                <button class="btn btn-secondary btn-block" onclick="AntiPorn.closeConfigModal(); AntiPorn.openNightModal(state);">
                    🌙 ${l.nightSection}
                </button>
            </div>
            
            <button class="btn btn-primary btn-large" onclick="AntiPorn.saveConfig()">
                ✓ ${l.save}
            </button>
        </div>
    `;
}

/**
 * Toggle un déclencheur
 */
function toggleTrigger(key) {
    const chip = document.querySelector(`[data-trigger="${key}"]`);
    if (chip) {
        chip.classList.toggle('active');
    }
}

/**
 * Sauvegarde la configuration
 */
function saveConfig() {
    // Récupérer les triggers sélectionnés
    const triggers = [];
    document.querySelectorAll('#triggerChips .chip.active').forEach(chip => {
        triggers.push(chip.dataset.trigger);
    });
    
    // Récupérer les règles d'environnement
    const environmentRules = {};
    document.querySelectorAll('[data-rule]').forEach(cb => {
        environmentRules[cb.dataset.rule] = cb.checked;
    });
    
    // Mettre à jour le state
    state.antiporn = {
        ...state.antiporn,
        triggers,
        environmentRules
    };
    
    Storage.saveState(state);
    closeConfigModal();
    
    if (typeof showToast === 'function') {
        const lang = state?.profile?.lang || 'fr';
        const messages = {
            fr: 'Configuration sauvegardée',
            en: 'Configuration saved',
            ar: 'تم حفظ الإعدادات'
        };
        showToast(messages[lang] || messages.fr);
    }
}

// ============================================
// RENDU RÉSUMÉ
// ============================================

/**
 * Génère le HTML pour le résumé des règles d'environnement (checklist)
 * @param {Object} state - State de l'application
 * @returns {string} HTML
 */
function renderEnvironmentChecklist(state) {
    const lang = state.profile.lang;
    const envRules = state.antiporn?.environmentRules || {};
    
    const activeRules = Object.entries(ENVIRONMENT_RULES)
        .filter(([key]) => envRules[key])
        .map(([key, labels]) => labels[lang] || labels.fr);
    
    if (activeRules.length === 0) {
        return '';
    }
    
    const labels = {
        fr: { title: 'Règles actives' },
        en: { title: 'Active rules' },
        ar: { title: 'القواعد النشطة' }
    };
    
    const l = labels[lang] || labels.fr;
    
    return `
        <div class="env-checklist-summary">
            <h4>✓ ${l.title}</h4>
            <ul>
                ${activeRules.map(rule => `<li>${rule}</li>`).join('')}
            </ul>
        </div>
    `;
}

/**
 * Récupère des conseils contextuels aléatoires
 * @param {string} lang - Langue
 * @param {number} count - Nombre de conseils
 * @returns {Array}
 */
function getRandomTips(lang = 'fr', count = 3) {
    const tips = CONTEXTUAL_TIPS[lang] || CONTEXTUAL_TIPS.fr;
    return tips.sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * Génère le HTML du bouton nuit pour la home
 * @param {Object} state - State de l'application
 * @returns {string} HTML
 */
function renderNightButton(state) {
    const lang = state.profile.lang;
    const isNight = isNightRoutineTime(state);
    
    if (!isNight) return '';
    
    const labels = {
        fr: 'Routine nuit',
        en: 'Night routine',
        ar: 'روتين الليل'
    };
    
    return `
        <button class="btn btn-secondary night-btn" onclick="AntiPorn.openNightModal(state)">
            🌙 ${labels[lang] || labels.fr}
        </button>
    `;
}

// ============================================
// EXPORTS
// ============================================

window.AntiPorn = {
    // Constantes
    TRIGGERS,
    SLOPE_SIGNALS,
    ENVIRONMENT_RULES,
    CONTEXTUAL_TIPS,
    NIGHT_CHECKLIST_ITEMS,
    SLOPE_STEPS,
    
    // Pentes
    logSlope,
    getRecentSlopes,
    
    // Modal pente avancée
    openSlopeModal,
    closeSlopeModal,
    logWithSignal,
    confirmSlope,
    completeStep,
    
    // V3: Modal nuit
    openNightModal,
    closeNightModal,
    toggleNightRoutine,
    addCustomNightItem,
    removeCustomNightItem,
    saveNightRoutine,
    isNightRoutineTime,
    
    // V3: Check-in téléphone
    openPhoneBedModal,
    closePhoneBedModal,
    answerPhoneBed,
    getPhoneBedStats,
    
    // Modal config
    openConfigModal,
    closeConfigModal,
    toggleTrigger,
    saveConfig,
    
    // Helpers
    renderEnvironmentChecklist,
    getRandomTips,
    renderNightButton
};
