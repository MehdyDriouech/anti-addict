/**
 * programs.js - Programmes guidés CBT
 * 
 * Fonctionnalités:
 * - Programmes 14 et 30 jours
 * - Micro-leçons quotidiennes
 * - Exercices CBT interactifs
 * - Urge surfing avec minuteur
 * - Suivi de progression
 */

// ============================================
// STATE LOCAL
// ============================================

let programData = null;
let programModalEl = null;

// ============================================
// CHARGEMENT DES PROGRAMMES
// ============================================

/**
 * Charge un programme depuis les fichiers JSON
 * @param {string} programId - 'program_14' ou 'program_30'
 * @param {string} lang - Langue
 * @returns {Promise<Object>}
 */
async function loadProgram(programId, lang = 'fr') {
    try {
        const duration = programId === 'program_14' ? '14' : '30';
        const response = await fetch(`data/texts/programs_${duration}.${lang}.json`);
        
        if (!response.ok) {
            // Fallback français
            const fallbackResponse = await fetch(`data/texts/programs_${duration}.fr.json`);
            return await fallbackResponse.json();
        }
        
        return await response.json();
    } catch (error) {
        console.error('[Programs] Erreur de chargement:', error);
        return null;
    }
}

// ============================================
// GESTION DES PROGRAMMES
// ============================================

/**
 * Démarre un nouveau programme
 * @param {Object} state - State de l'application
 * @param {string} programId - ID du programme
 */
async function startProgram(state, programId) {
    const lang = state.profile.lang;
    programData = await loadProgram(programId, lang);
    
    if (!programData) {
        console.error('[Programs] Impossible de charger le programme');
        return;
    }
    
    // Enregistrer le programme actif
    state.programs.active = {
        id: programId,
        startDate: Storage.getDateISO(),
        currentDay: 1
    };
    
    Storage.saveState(state);
    
    // Afficher le premier jour
    openDayModal(state, 1);
}

/**
 * Reprend un programme en cours
 * @param {Object} state - State de l'application
 */
async function resumeProgram(state) {
    if (!state.programs.active) return;
    
    const lang = state.profile.lang;
    programData = await loadProgram(state.programs.active.id, lang);
    
    if (!programData) return;
    
    // Calculer le jour actuel
    const startDate = new Date(state.programs.active.startDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = Math.min(daysSinceStart, programData.meta.duration);
    
    // Mettre à jour le jour courant
    state.programs.active.currentDay = currentDay;
    Storage.saveState(state);
    
    openDayModal(state, currentDay);
}

/**
 * Termine un programme
 * @param {Object} state - State de l'application
 */
function completeProgram(state) {
    if (!state.programs.active) return;
    
    // Ajouter à l'historique
    state.programs.history.push({
        id: state.programs.active.id,
        startDate: state.programs.active.startDate,
        endDate: Storage.getDateISO(),
        completed: true
    });
    
    state.programs.active = null;
    Storage.saveState(state);
    
    closeModal();
    
    if (typeof showToast === 'function') {
        const lang = state?.profile?.lang || 'fr';
        const messages = {
            fr: '🎉 Programme terminé ! Félicitations !',
            en: '🎉 Program completed! Congratulations!',
            ar: '🎉 البرنامج مكتمل! مبارك!'
        };
        showToast(messages[lang]);
    }
}

/**
 * Abandonne un programme
 * @param {Object} state - State de l'application
 */
function abandonProgram(state) {
    if (!state.programs.active) return;
    
    state.programs.history.push({
        id: state.programs.active.id,
        startDate: state.programs.active.startDate,
        endDate: Storage.getDateISO(),
        completed: false
    });
    
    state.programs.active = null;
    Storage.saveState(state);
    
    closeModal();
}

// ============================================
// MODAL JOUR
// ============================================

/**
 * Ouvre le modal d'un jour de programme
 * @param {Object} state - State de l'application
 * @param {number} day - Numéro du jour
 */
function openDayModal(state, day) {
    if (!programData) return;
    
    if (!programModalEl) {
        programModalEl = document.createElement('div');
        programModalEl.className = 'modal-overlay';
        programModalEl.id = 'programModal';
        document.body.appendChild(programModalEl);
    }
    
    renderDayContent(state, day);
    programModalEl.classList.add('active');
}

/**
 * Ferme le modal
 */
function closeModal() {
    if (programModalEl) {
        programModalEl.classList.remove('active');
    }
}

/**
 * Rendu du contenu d'un jour
 */
function renderDayContent(state, day) {
    const lang = state.profile.lang;
    const dayData = programData.days[day.toString()];
    const progress = state.programs.dayProgress[state.programs.active.id] || {};
    const isCompleted = progress[day]?.completed;
    
    const labels = {
        fr: {
            day: 'Jour',
            of: 'sur',
            lesson: 'Leçon',
            exercise: 'Exercice',
            complete: 'Marquer comme fait',
            next: 'Jour suivant',
            prev: 'Jour précédent',
            finished: 'Programme terminé !',
            saved: 'Réponse enregistrée'
        },
        en: {
            day: 'Day',
            of: 'of',
            lesson: 'Lesson',
            exercise: 'Exercise',
            complete: 'Mark as done',
            next: 'Next day',
            prev: 'Previous day',
            finished: 'Program completed!',
            saved: 'Response saved'
        },
        ar: {
            day: 'يوم',
            of: 'من',
            lesson: 'درس',
            exercise: 'تمرين',
            complete: 'وضع علامة مكتمل',
            next: 'اليوم التالي',
            prev: 'اليوم السابق',
            finished: 'البرنامج مكتمل!',
            saved: 'تم حفظ الإجابة'
        }
    };
    
    const l = labels[lang] || labels.fr;
    const totalDays = programData.meta.duration;
    
    programModalEl.innerHTML = `
        <div class="modal-content program-modal">
            <button class="modal-close" onclick="Programs.close()">×</button>
            
            <!-- Header avec progression -->
            <div class="program-header">
                <div class="program-progress">
                    <span class="progress-text">${l.day} ${day} ${l.of} ${totalDays}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(day / totalDays) * 100}%"></div>
                    </div>
                </div>
                <h2 class="day-title">${dayData.title}</h2>
                ${isCompleted ? '<span class="completed-badge">✓</span>' : ''}
            </div>
            
            <!-- Leçon -->
            <div class="program-section lesson-section">
                <h3>📚 ${l.lesson}</h3>
                <p class="lesson-text">${dayData.lesson}</p>
            </div>
            
            <!-- Exercice -->
            <div class="program-section exercise-section">
                <h3>✏️ ${l.exercise}</h3>
                ${renderExercise(dayData.exercise, progress[day]?.exerciseData, lang)}
            </div>
            
            <!-- Actions -->
            <div class="program-actions">
                ${day > 1 ? `
                    <button class="btn btn-ghost" onclick="Programs.goToDay(${day - 1})">
                        ← ${l.prev}
                    </button>
                ` : '<div></div>'}
                
                ${!isCompleted ? `
                    <button class="btn btn-primary" onclick="Programs.completeDay(${day})">
                        ✓ ${l.complete}
                    </button>
                ` : day < totalDays ? `
                    <button class="btn btn-primary" onclick="Programs.goToDay(${day + 1})">
                        ${l.next} →
                    </button>
                ` : `
                    <button class="btn btn-primary" onclick="Programs.finish()">
                        🎉 ${l.finished}
                    </button>
                `}
            </div>
        </div>
    `;
}

/**
 * Rendu d'un exercice selon son type
 */
function renderExercise(exercise, savedData, lang) {
    if (!exercise) return '';
    
    const savedValues = savedData || {};
    
    switch (exercise.type) {
        case 'reflection':
        case 'values':
        case 'emotions':
        case 'alternatives':
        case 'plan':
        case 'social':
        case 'environment':
        case 'vision':
        case 'commitment':
            return renderTextExercise(exercise, savedValues);
            
        case 'if_then':
            return renderIfThenExercise(exercise, savedValues, lang);
            
        case 'cognitive':
            return renderCognitiveExercise(exercise, savedValues, lang);
            
        case 'gratitude':
            return renderGratitudeExercise(exercise, savedValues, lang);
            
        case 'urge_surfing':
            return renderUrgeSurfingExercise(exercise, lang);
            
        default:
            return renderTextExercise(exercise, savedValues);
    }
}

/**
 * Exercice texte simple
 */
function renderTextExercise(exercise, savedValues) {
    const fields = exercise.fields || ['response'];
    
    return `
        <p class="exercise-prompt">${exercise.prompt}</p>
        ${fields.map(field => `
            <textarea class="input exercise-textarea" 
                      data-field="${field}" 
                      placeholder="${field}"
                      rows="3">${savedValues[field] || ''}</textarea>
        `).join('')}
    `;
}

/**
 * Exercice si-alors
 */
function renderIfThenExercise(exercise, savedValues, lang) {
    const labels = {
        fr: { if: 'Si...', then: 'Alors...', example: 'Exemple' },
        en: { if: 'If...', then: 'Then...', example: 'Example' },
        ar: { if: 'إذا...', then: 'إذن...', example: 'مثال' }
    };
    const l = labels[lang] || labels.fr;
    
    return `
        <p class="exercise-prompt">${exercise.prompt}</p>
        ${exercise.example ? `<p class="exercise-example"><em>${l.example}: ${exercise.example}</em></p>` : ''}
        <div class="if-then-form">
            <div class="form-group">
                <label>${l.if}</label>
                <input type="text" class="input" data-field="if_condition" 
                       value="${savedValues.if_condition || ''}" placeholder="${l.if}">
            </div>
            <div class="form-group">
                <label>${l.then}</label>
                <input type="text" class="input" data-field="then_action" 
                       value="${savedValues.then_action || ''}" placeholder="${l.then}">
            </div>
        </div>
    `;
}

/**
 * Exercice restructuration cognitive
 */
function renderCognitiveExercise(exercise, savedValues, lang) {
    const labels = {
        fr: { thought: 'Pensée automatique', realistic: 'Pensée réaliste' },
        en: { thought: 'Automatic thought', realistic: 'Realistic thought' },
        ar: { thought: 'فكرة تلقائية', realistic: 'فكرة واقعية' }
    };
    const l = labels[lang] || labels.fr;
    
    return `
        <p class="exercise-prompt">${exercise.prompt}</p>
        <div class="cognitive-form">
            <div class="form-group">
                <label>❌ ${l.thought}</label>
                <textarea class="input" data-field="automatic_thought" rows="2"
                          placeholder="${l.thought}">${savedValues.automatic_thought || ''}</textarea>
            </div>
            <div class="arrow">↓</div>
            <div class="form-group">
                <label>✓ ${l.realistic}</label>
                <textarea class="input" data-field="realistic_thought" rows="2"
                          placeholder="${l.realistic}">${savedValues.realistic_thought || ''}</textarea>
            </div>
        </div>
    `;
}

/**
 * Exercice gratitude
 */
function renderGratitudeExercise(exercise, savedValues, lang) {
    const fields = exercise.fields || ['gratitude1', 'gratitude2', 'gratitude3'];
    
    return `
        <p class="exercise-prompt">${exercise.prompt}</p>
        <div class="gratitude-list">
            ${fields.map((field, index) => `
                <div class="gratitude-item">
                    <span class="gratitude-number">${index + 1}.</span>
                    <input type="text" class="input" data-field="${field}"
                           value="${savedValues[field] || ''}" placeholder="...">
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Exercice urge surfing
 */
function renderUrgeSurfingExercise(exercise, lang) {
    const labels = {
        fr: { start: 'Commencer l\'exercice', seconds: 'secondes' },
        en: { start: 'Start exercise', seconds: 'seconds' },
        ar: { start: 'ابدأ التمرين', seconds: 'ثواني' }
    };
    const l = labels[lang] || labels.fr;
    const timer = exercise.timer || 90;
    
    return `
        <p class="exercise-prompt">${exercise.prompt}</p>
        <div class="urge-surfing-container">
            <div class="timer-display" id="urgeSurfingTimer">${timer}</div>
            <p class="timer-label">${l.seconds}</p>
            <button class="btn btn-primary" onclick="Programs.startUrgeSurfing(${timer})" id="urgeSurfingBtn">
                ▶ ${l.start}
            </button>
        </div>
    `;
}

/**
 * Démarre l'exercice d'urge surfing
 */
function startUrgeSurfing(duration) {
    const timerEl = document.getElementById('urgeSurfingTimer');
    const btnEl = document.getElementById('urgeSurfingBtn');
    
    if (!timerEl || !btnEl) return;
    
    btnEl.disabled = true;
    btnEl.textContent = '...';
    
    let remaining = duration;
    
    const interval = setInterval(() => {
        remaining--;
        timerEl.textContent = remaining;
        
        if (remaining <= 0) {
            clearInterval(interval);
            timerEl.textContent = '✓';
            btnEl.disabled = false;
            
            const lang = state?.profile?.lang || 'fr';
            const messages = {
                fr: 'Exercice terminé !',
                en: 'Exercise completed!',
                ar: 'التمرين مكتمل!'
            };
            btnEl.textContent = messages[lang];
            
            // Enregistrer comme action positive
            Storage.incrementWins(state, { positiveActions: 1 });
        }
    }, 1000);
}

/**
 * Complète un jour et sauvegarde les réponses
 */
function completeDay(day) {
    const programId = state.programs.active.id;
    
    // Récupérer les réponses
    const exerciseData = {};
    document.querySelectorAll('[data-field]').forEach(input => {
        exerciseData[input.dataset.field] = input.value;
    });
    
    // Sauvegarder
    Storage.saveProgramDayProgress(state, programId, day, {
        completed: true,
        exerciseData
    });
    
    // Feedback
    if (typeof showToast === 'function') {
        const lang = state?.profile?.lang || 'fr';
        const messages = {
            fr: 'Jour complété ✓',
            en: 'Day completed ✓',
            ar: 'اليوم مكتمل ✓'
        };
        showToast(messages[lang]);
    }
    
    // Rafraîchir l'affichage
    renderDayContent(state, day);
}

/**
 * Navigue vers un jour spécifique
 */
function goToDay(day) {
    renderDayContent(state, day);
}

/**
 * Termine le programme
 */
function finish() {
    completeProgram(state);
}

// ============================================
// MODAL SÉLECTION PROGRAMME
// ============================================

let selectModalEl = null;

/**
 * Ouvre le modal de sélection de programme
 */
function openSelectModal(state) {
    if (!selectModalEl) {
        selectModalEl = document.createElement('div');
        selectModalEl.className = 'modal-overlay';
        selectModalEl.id = 'programSelectModal';
        document.body.appendChild(selectModalEl);
    }
    
    renderSelectModal(state);
    selectModalEl.classList.add('active');
}

/**
 * Ferme le modal de sélection
 */
function closeSelectModal() {
    if (selectModalEl) {
        selectModalEl.classList.remove('active');
    }
}

/**
 * Rendu du modal de sélection
 */
function renderSelectModal(state) {
    const lang = state.profile.lang;
    const hasActive = !!state.programs.active;
    
    const labels = {
        fr: {
            title: '📚 Programmes guidés',
            subtitle: 'Choisis ton parcours',
            program14: 'Programme 14 jours',
            program14Desc: 'Un premier pas vers la liberté. Idéal pour commencer.',
            program30: 'Programme 30 jours',
            program30Desc: 'Un programme complet pour ancrer de nouvelles habitudes.',
            start: 'Commencer',
            resume: 'Continuer',
            activeProgram: 'Programme en cours',
            day: 'Jour'
        },
        en: {
            title: '📚 Guided programs',
            subtitle: 'Choose your path',
            program14: '14-Day Program',
            program14Desc: 'A first step toward freedom. Ideal for beginners.',
            program30: '30-Day Program',
            program30Desc: 'A complete program to anchor new habits.',
            start: 'Start',
            resume: 'Continue',
            activeProgram: 'Active program',
            day: 'Day'
        },
        ar: {
            title: '📚 البرامج الموجهة',
            subtitle: 'اختر مسارك',
            program14: 'برنامج 14 يوم',
            program14Desc: 'خطوة أولى نحو الحرية. مثالي للبداية.',
            program30: 'برنامج 30 يوم',
            program30Desc: 'برنامج كامل لترسيخ عادات جديدة.',
            start: 'ابدأ',
            resume: 'استمر',
            activeProgram: 'برنامج نشط',
            day: 'يوم'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    selectModalEl.innerHTML = `
        <div class="modal-content program-select-modal">
            <button class="modal-close" onclick="Programs.closeSelect()">×</button>
            
            <h2>${l.title}</h2>
            <p>${l.subtitle}</p>
            
            ${hasActive ? `
                <div class="active-program-card">
                    <span class="badge">${l.activeProgram}</span>
                    <h4>${state.programs.active.id === 'program_14' ? l.program14 : l.program30}</h4>
                    <p>${l.day} ${state.programs.active.currentDay}</p>
                    <button class="btn btn-primary" onclick="Programs.closeSelect(); Programs.resume(state);">
                        ${l.resume} →
                    </button>
                </div>
            ` : ''}
            
            <div class="program-cards">
                <div class="program-card ${hasActive ? 'disabled' : ''}" 
                     onclick="${hasActive ? '' : 'Programs.closeSelect(); Programs.start(state, \"program_14\");'}">
                    <div class="program-icon">📖</div>
                    <h3>${l.program14}</h3>
                    <p>${l.program14Desc}</p>
                    <span class="program-duration">14 ${lang === 'ar' ? 'يوم' : 'days'}</span>
                </div>
                
                <div class="program-card ${hasActive ? 'disabled' : ''}"
                     onclick="${hasActive ? '' : 'Programs.closeSelect(); Programs.start(state, \"program_30\");'}">
                    <div class="program-icon">📚</div>
                    <h3>${l.program30}</h3>
                    <p>${l.program30Desc}</p>
                    <span class="program-duration">30 ${lang === 'ar' ? 'يوم' : 'days'}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Génère le widget programme pour la home
 */
function renderProgramWidget(state) {
    const lang = state.profile.lang;
    const hasActive = !!state.programs.active;
    
    const labels = {
        fr: { programs: 'Programmes', day: 'Jour', continue: 'Continuer' },
        en: { programs: 'Programs', day: 'Day', continue: 'Continue' },
        ar: { programs: 'البرامج', day: 'يوم', continue: 'استمر' }
    };
    
    const l = labels[lang] || labels.fr;
    
    if (hasActive) {
        return `
            <div class="program-widget active" onclick="Programs.resume(state)">
                <span class="widget-icon">📖</span>
                <span class="widget-text">${l.day} ${state.programs.active.currentDay}</span>
                <span class="widget-action">${l.continue} →</span>
            </div>
        `;
    }
    
    return `
        <button class="btn btn-secondary program-widget-btn" onclick="Programs.openSelect(state)">
            📚 ${l.programs}
        </button>
    `;
}

// ============================================
// EXPORTS
// ============================================

window.Programs = {
    // Chargement
    loadProgram,
    
    // Gestion programme
    start: startProgram,
    resume: resumeProgram,
    complete: completeProgram,
    abandon: abandonProgram,
    
    // Modal jour
    openDay: openDayModal,
    close: closeModal,
    completeDay,
    goToDay,
    finish,
    
    // Exercices
    startUrgeSurfing,
    
    // Modal sélection
    openSelect: openSelectModal,
    closeSelect: closeSelectModal,
    
    // Widget
    renderProgramWidget
};
