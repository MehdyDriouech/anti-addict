/**
 * evening.js - Rituel du soir
 * 
 * Mini-formulaire de 2 minutes:
 * - Exposition aujourd'hui (oui/non)
 * - Qu'est-ce qui a aidé (texte)
 * - Gratitude (1 mot)
 * - Résumé + intention demain
 */

// ============================================
// CONSTANTES
// ============================================

const HELPED_SUGGESTIONS = {
    fr: [
        'Marcher',
        'Respirer',
        'Appeler un ami',
        'Faire du sport',
        'Lire',
        'Méditer',
        'Sortir'
    ],
    en: [
        'Walking',
        'Breathing',
        'Calling a friend',
        'Exercising',
        'Reading',
        'Meditating',
        'Going outside'
    ],
    ar: [
        'المشي',
        'التنفس',
        'الاتصال بصديق',
        'الرياضة',
        'القراءة',
        'التأمل',
        'الخروج'
    ]
};

// ============================================
// FLOW PRINCIPAL
// ============================================

let eveningModalEl = null;
let eveningData = {
    exposed: false,
    helped: '',
    gratitude: ''
};

/**
 * Ouvre le rituel du soir
 * @param {Object} state - State de l'application
 */
function openEveningRitual(state) {
    // Vérifier si déjà fait aujourd'hui
    const existing = Storage.getTodayEveningRitual(state);
    if (existing) {
        eveningData = { ...existing };
    } else {
        eveningData = { exposed: false, helped: '', gratitude: '' };
    }
    
    if (!eveningModalEl) {
        eveningModalEl = document.createElement('div');
        eveningModalEl.className = 'modal-overlay';
        eveningModalEl.id = 'eveningModal';
        document.body.appendChild(eveningModalEl);
    }
    
    renderEveningForm(state);
    eveningModalEl.classList.add('active');
}

/**
 * Ferme le modal
 */
function closeEveningRitual() {
    if (eveningModalEl) {
        eveningModalEl.classList.remove('active');
    }
}

/**
 * Affiche le formulaire du rituel
 */
function renderEveningForm(state) {
    const lang = state.profile.lang;
    
    const labels = {
        fr: {
            title: '🌙 Rituel du soir',
            subtitle: '2 minutes pour clôturer la journée',
            exposed: 'As-tu été exposé à du contenu adulte aujourd\'hui ?',
            yes: 'Oui',
            no: 'Non',
            helped: 'Qu\'est-ce qui t\'a aidé aujourd\'hui ?',
            helpedPlaceholder: 'Ex: marcher, respirer, parler à quelqu\'un...',
            gratitude: 'Un mot de gratitude',
            gratitudePlaceholder: 'Ex: famille, santé, progrès...',
            save: 'Terminer le rituel'
        },
        en: {
            title: '🌙 Evening ritual',
            subtitle: '2 minutes to close the day',
            exposed: 'Were you exposed to adult content today?',
            yes: 'Yes',
            no: 'No',
            helped: 'What helped you today?',
            helpedPlaceholder: 'Ex: walking, breathing, talking to someone...',
            gratitude: 'One word of gratitude',
            gratitudePlaceholder: 'Ex: family, health, progress...',
            save: 'Complete ritual'
        },
        ar: {
            title: '🌙 طقس المساء',
            subtitle: 'دقيقتان لإنهاء اليوم',
            exposed: 'هل تعرضت لمحتوى للبالغين اليوم؟',
            yes: 'نعم',
            no: 'لا',
            helped: 'ما الذي ساعدك اليوم؟',
            helpedPlaceholder: 'مثال: المشي، التنفس، التحدث مع شخص...',
            gratitude: 'كلمة امتنان واحدة',
            gratitudePlaceholder: 'مثال: العائلة، الصحة، التقدم...',
            save: 'إنهاء الطقس'
        }
    };
    
    const l = labels[lang] || labels.fr;
    const suggestions = HELPED_SUGGESTIONS[lang] || HELPED_SUGGESTIONS.fr;
    
    eveningModalEl.innerHTML = `
        <div class="modal-content evening-modal">
            <button class="modal-close" onclick="Evening.close()">×</button>
            
            <div class="evening-header">
                <h2>${l.title}</h2>
                <p class="evening-subtitle">${l.subtitle}</p>
            </div>
            
            <div class="evening-form">
                <!-- Exposition -->
                <div class="form-group">
                    <label>${l.exposed}</label>
                    <div class="btn-group">
                        <button class="btn ${eveningData.exposed ? 'btn-danger' : 'btn-secondary'}" 
                                onclick="Evening.setExposed(true)">
                            ${l.yes}
                        </button>
                        <button class="btn ${!eveningData.exposed ? 'btn-success' : 'btn-secondary'}" 
                                onclick="Evening.setExposed(false)">
                            ${l.no}
                        </button>
                    </div>
                </div>
                
                <!-- Ce qui a aidé -->
                <div class="form-group">
                    <label>${l.helped}</label>
                    <div class="suggestion-chips mini">
                        ${suggestions.map(s => `
                            <button class="chip mini ${eveningData.helped === s ? 'active' : ''}" 
                                    onclick="Evening.setHelped('${s}')">
                                ${s}
                            </button>
                        `).join('')}
                    </div>
                    <input type="text" id="helpedInput" class="input" 
                           placeholder="${l.helpedPlaceholder}" 
                           value="${eveningData.helped}">
                </div>
                
                <!-- Gratitude -->
                <div class="form-group">
                    <label>${l.gratitude}</label>
                    <input type="text" id="gratitudeInput" class="input" 
                           placeholder="${l.gratitudePlaceholder}" 
                           value="${eveningData.gratitude}"
                           maxlength="50">
                </div>
                
                <button class="btn btn-primary btn-large" onclick="Evening.save()">
                    ✓ ${l.save}
                </button>
            </div>
        </div>
    `;
}

/**
 * Définit l'exposition
 */
function setExposed(value) {
    eveningData.exposed = value;
    renderEveningForm(state);
}

/**
 * Définit ce qui a aidé
 */
function setHelped(value) {
    eveningData.helped = value;
    const input = document.getElementById('helpedInput');
    if (input) input.value = value;
}

/**
 * Sauvegarde le rituel et affiche le résumé
 */
function save() {
    // Récupérer les valeurs des inputs
    const helpedInput = document.getElementById('helpedInput');
    const gratitudeInput = document.getElementById('gratitudeInput');
    
    eveningData.helped = helpedInput?.value || eveningData.helped;
    eveningData.gratitude = gratitudeInput?.value || '';
    
    // Sauvegarder
    Storage.addEveningRitual(state, eveningData);
    
    // Afficher le résumé
    renderSummary(state);
}

/**
 * Affiche le résumé après le rituel
 */
function renderSummary(state) {
    const lang = state.profile.lang;
    
    const labels = {
        fr: {
            title: 'Rituel terminé !',
            summary: 'Résumé de ta journée',
            exposed: 'Exposition',
            exposedYes: 'Oui - demain sera différent',
            exposedNo: 'Non - bravo !',
            helped: 'Ce qui a aidé',
            gratitude: 'Gratitude',
            tomorrow: 'Intention pour demain',
            close: 'Fermer',
            goodNight: 'Bonne nuit 🌙'
        },
        en: {
            title: 'Ritual complete!',
            summary: 'Summary of your day',
            exposed: 'Exposure',
            exposedYes: 'Yes - tomorrow will be different',
            exposedNo: 'No - well done!',
            helped: 'What helped',
            gratitude: 'Gratitude',
            tomorrow: 'Intention for tomorrow',
            close: 'Close',
            goodNight: 'Good night 🌙'
        },
        ar: {
            title: 'اكتمل الطقس!',
            summary: 'ملخص يومك',
            exposed: 'التعرض',
            exposedYes: 'نعم - غدًا سيكون مختلفًا',
            exposedNo: 'لا - أحسنت!',
            helped: 'ما ساعد',
            gratitude: 'الامتنان',
            tomorrow: 'نية الغد',
            close: 'إغلاق',
            goodNight: 'تصبح على خير 🌙'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    // Générer une intention pour demain
    const tomorrowIntention = Intentions.generateNewIntention(state);
    
    const modalContent = eveningModalEl.querySelector('.modal-content');
    modalContent.innerHTML = `
        <button class="modal-close" onclick="Evening.close()">×</button>
        
        <div class="evening-summary">
            <div class="summary-icon">✨</div>
            <h2>${l.title}</h2>
            
            <div class="summary-card">
                <h4>${l.summary}</h4>
                
                <div class="summary-item">
                    <span class="summary-label">${l.exposed}:</span>
                    <span class="summary-value ${eveningData.exposed ? 'negative' : 'positive'}">
                        ${eveningData.exposed ? l.exposedYes : l.exposedNo}
                    </span>
                </div>
                
                ${eveningData.helped ? `
                    <div class="summary-item">
                        <span class="summary-label">${l.helped}:</span>
                        <span class="summary-value">${eveningData.helped}</span>
                    </div>
                ` : ''}
                
                ${eveningData.gratitude ? `
                    <div class="summary-item">
                        <span class="summary-label">${l.gratitude}:</span>
                        <span class="summary-value highlight">${eveningData.gratitude}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="tomorrow-intention">
                <h4>💡 ${l.tomorrow}</h4>
                <blockquote>
                    "${tomorrowIntention.text}"
                    ${tomorrowIntention.ref ? `<cite>— ${tomorrowIntention.ref}</cite>` : ''}
                </blockquote>
            </div>
            
            <button class="btn btn-primary btn-large" onclick="Evening.close()">
                ${l.goodNight}
            </button>
        </div>
    `;
}

/**
 * Vérifie si le rituel du soir est fait aujourd'hui
 * @param {Object} state - State de l'application
 * @returns {boolean}
 */
function hasCompletedToday(state) {
    return Storage.getTodayEveningRitual(state) !== null;
}

/**
 * Récupère les rituels des N derniers jours
 * @param {Object} state - State de l'application
 * @param {number} days - Nombre de jours
 * @returns {Array}
 */
function getRecentRituals(state, days = 7) {
    return state.eveningRituals
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, days);
}

/**
 * Calcule les stats des rituels
 * @param {Object} state - State de l'application
 * @param {number} days - Nombre de jours
 * @returns {Object}
 */
function getRitualStats(state, days = 7) {
    const rituals = getRecentRituals(state, days);
    const completed = rituals.length;
    const exposureDays = rituals.filter(r => r.exposed).length;
    const cleanDays = completed - exposureDays;
    
    return {
        completed,
        exposureDays,
        cleanDays,
        completionRate: days > 0 ? Math.round((completed / days) * 100) : 0
    };
}

// ============================================
// EXPORTS
// ============================================

window.Evening = {
    // Data
    HELPED_SUGGESTIONS,
    
    // Flow
    openEveningRitual,
    closeEveningRitual,
    close: closeEveningRitual,
    
    // Form
    setExposed,
    setHelped,
    save,
    
    // Helpers
    hasCompletedToday,
    getRecentRituals,
    getRitualStats
};
