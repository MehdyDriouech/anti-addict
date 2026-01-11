/**
 * app.js - Logique principale de l'application Revenir V3
 * 
 * Gère:
 * - Initialisation de l'app
 * - Rendu des écrans (Home, Craving, Check-in, Settings, History)
 * - Intégration des features V2 (Intentions, Wins, Rules, Relapse, Evening, Heatmap, Experiments, AntiPorn)
 * - Intégration des features V3 (SOS avancé, Coaching, Programmes, Journal, Calendrier, Spirituel avancé)
 * - Timer pour l'écran Craving
 * - Gestion des événements UI
 * - Check-in rapide 1-swipe
 * - Modals et toasts
 */

// ============================================
// STATE GLOBAL
// ============================================
let state = null;
let timerInterval = null;
let timerSeconds = 600; // 10 minutes
let timerRunning = false;

// Protocol 90 seconds state
let protocolInterval = null;
let protocolSeconds = 0;
let protocolRunning = false;
let protocolCompleted = false;

// Breathing state
let breathingInterval = null;
let breathingPhase = 'inhale'; // inhale, hold, exhale
let breathingCount = 4;
let breathingCycle = 0;
let breathingTotalSeconds = 60;
let breathingRunning = false;

// Current intensity
let currentIntensity = 3;

// V3: Quick check-in state
let quickCheckinVisible = false;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Point d'entrée principal de l'application
 */
async function initApp() {
    console.log('[App] Initialisation...');
    
    // Charger le state depuis localStorage
    state = Storage.loadState();
    
    // Initialiser le state pour les modules qui en ont besoin
    if (typeof Programs !== 'undefined' && Programs.setState) {
        Programs.setState(state);
    }
    
    // Initialiser i18n avec la langue du profil
    await I18n.initI18n(state.profile.lang, state.profile.religion);
    
    // Vérifier si c'est la première utilisation (onboarding)
    if (state.addictions.length === 0) {
        showOnboarding();
    } else {
        hideOnboarding();
    }
    
    // Configurer les routes
    setupRoutes();
    
    // Initialiser le router
    Router.init();
    
    // Appliquer les traductions à l'UI statique
    applyTranslations();
    
    // Écouter les événements globaux
    setupEventListeners();
    
    // Appliquer le thème sauvegardé
    applyTheme(state.settings.theme || 'dark');
    
    console.log('[App] Initialisé avec succès');
}

/**
 * Configure les callbacks pour chaque route
 */
function setupRoutes() {
    Router.onRoute('home', renderHome);
    Router.onRoute('craving', renderCraving);
    Router.onRoute('checkin', renderCheckin);
    Router.onRoute('settings', renderSettings);
    Router.onRoute('history', renderHistory);
    Router.onRoute('dashboard', renderDashboard);
}

/**
 * Configure les écouteurs d'événements globaux
 */
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = link.getAttribute('data-route');
            Router.navigateTo(route);
        });
    });
    
    // Fermer les modals en cliquant à l'extérieur
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        });
    });
}

// ============================================
// TRANSLATIONS
// ============================================

/**
 * Applique les traductions à tous les éléments avec data-i18n
 */
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = I18n.t(key);
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = I18n.t(key);
    });
    
    // Mettre à jour le titre de l'app
    document.title = I18n.t('app_name');
}

// ============================================
// ONBOARDING
// ============================================

/**
 * Affiche l'écran d'onboarding
 */
function showOnboarding() {
    const onboarding = document.getElementById('onboarding');
    if (onboarding) {
        onboarding.classList.remove('hidden');
        renderOnboardingContent();
    }
}

/**
 * Cache l'écran d'onboarding
 */
function hideOnboarding() {
    const onboarding = document.getElementById('onboarding');
    if (onboarding) {
        onboarding.classList.add('hidden');
    }
}

/**
 * Rendu du contenu d'onboarding
 */
function renderOnboardingContent() {
    const container = document.getElementById('onboarding-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="onboarding-icon">🌟</div>
        <h1 class="onboarding-title">${I18n.t('onboarding_welcome')}</h1>
        <p class="onboarding-desc">${I18n.t('onboarding_desc')}</p>
        <div class="onboarding-privacy">
            <span>🔒</span>
            <span>${I18n.t('onboarding_privacy')}</span>
        </div>
        
        <div class="onboarding-form">
            <div class="form-group">
                <label class="form-label">${I18n.t('language')}</label>
                <select class="form-select" id="onboard-lang">
                    <option value="fr" ${state.profile.lang === 'fr' ? 'selected' : ''}>Français</option>
                    <option value="en" ${state.profile.lang === 'en' ? 'selected' : ''}>English</option>
                    <option value="ar" ${state.profile.lang === 'ar' ? 'selected' : ''}>العربية</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">${I18n.t('religion')}</label>
                <select class="form-select" id="onboard-religion">
                    <option value="none" ${state.profile.religion === 'none' ? 'selected' : ''}>${I18n.t('religion_none')}</option>
                    <option value="islam" ${state.profile.religion === 'islam' ? 'selected' : ''}>${I18n.t('religion_islam')}</option>
                    <option value="christianity" ${state.profile.religion === 'christianity' ? 'selected' : ''}>${I18n.t('religion_christianity')}</option>
                    <option value="judaism" ${state.profile.religion === 'judaism' ? 'selected' : ''}>${I18n.t('religion_judaism')}</option>
                    <option value="buddhism" ${state.profile.religion === 'buddhism' ? 'selected' : ''}>${I18n.t('religion_buddhism')}</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">${I18n.t('select_addictions')}</label>
                <div class="checkbox-group">
                    ${(typeof AddictionsConfig !== 'undefined' && AddictionsConfig.getAllAddictionIds ? AddictionsConfig.getAllAddictionIds() : ['porn', 'cigarette', 'alcohol', 'drugs']).map(id => {
                        const config = typeof AddictionsConfig !== 'undefined' && AddictionsConfig.getAddictionConfig ? AddictionsConfig.getAddictionConfig(id) : null;
                        const hasDisclaimer = config && config.disclaimerKey ? true : false;
                        return `
                            <label class="checkbox-item">
                                <input type="checkbox" value="${id}" id="onboard-addiction-${id}" 
                                       ${hasDisclaimer ? 'data-disclaimer="' + config.disclaimerKey + '"' : ''}>
                                <span>${I18n.t('addiction_' + id)}${hasDisclaimer ? ' ⚠️' : ''}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
        
        <button class="btn btn-primary btn-lg btn-block" onclick="completeOnboarding()">
            ${I18n.t('start')}
        </button>
    `;
    
    // Écouter le changement de langue
    document.getElementById('onboard-lang').addEventListener('change', async (e) => {
        state.profile.lang = e.target.value;
        state.profile.rtl = e.target.value === 'ar';
        await I18n.initI18n(state.profile.lang, state.profile.religion);
        applyTranslations();
        renderOnboardingContent();
    });
    
    // Écouter le changement de religion
    document.getElementById('onboard-religion').addEventListener('change', async (e) => {
        state.profile.religion = e.target.value;
        state.profile.spiritualEnabled = e.target.value !== 'none';
        await I18n.loadSpiritualCards(state.profile.lang, state.profile.religion);
    });
}

/**
 * Termine l'onboarding et sauvegarde les préférences
 */
async function completeOnboarding() {
    // Récupérer les addictions sélectionnées
    const addictions = [];
    const addictionsWithDisclaimer = [];
    
    const allAddictionIds = typeof AddictionsConfig !== 'undefined' && AddictionsConfig.getAllAddictionIds ? AddictionsConfig.getAllAddictionIds() : ['porn', 'cigarette', 'alcohol', 'drugs'];
    
    allAddictionIds.forEach(id => {
        const checkbox = document.getElementById(`onboard-addiction-${id}`);
        if (checkbox && checkbox.checked) {
            const config = typeof AddictionsConfig !== 'undefined' && AddictionsConfig.getAddictionConfig ? AddictionsConfig.getAddictionConfig(id) : null;
            const goal = config && config.defaultGoal ? config.defaultGoal : 'abstinence';
            addictions.push({ id, goal });
            
            // Vérifier si un disclaimer est nécessaire
            if (config && config.disclaimerKey) {
                addictionsWithDisclaimer.push({ id, disclaimerKey: config.disclaimerKey });
            }
        }
    });
    
    if (addictions.length === 0) {
        showToast(I18n.t('no_addiction_selected'), 'warning');
        return;
    }
    
    // Si des addictions nécessitent un disclaimer, afficher le modal
    if (addictionsWithDisclaimer.length > 0) {
        const proceed = await showDisclaimerModal(addictionsWithDisclaimer);
        if (!proceed) {
            return; // L'utilisateur a annulé
        }
    }
    
    // Mettre à jour le state
    state.addictions = addictions;
    state.profile.lang = document.getElementById('onboard-lang').value;
    state.profile.religion = document.getElementById('onboard-religion').value;
    state.profile.spiritualEnabled = state.profile.religion !== 'none';
    state.profile.rtl = state.profile.lang === 'ar';
    
    // Sauvegarder
    Storage.saveState(state);
    
    // Recharger i18n
    await I18n.initI18n(state.profile.lang, state.profile.religion);
    applyTranslations();
    
    // Masquer l'onboarding
    hideOnboarding();
    
    // Afficher l'accueil
    Router.navigateTo('home');
    renderHome();
    
    showToast(I18n.t('welcome_back'), 'success');
}

/**
 * Affiche un modal de disclaimer pour les addictions nécessitant un avertissement
 * @param {Array} addictionsWithDisclaimer - Liste des addictions avec disclaimer
 * @returns {Promise<boolean>} true si l'utilisateur confirme, false s'il annule
 */
function showDisclaimerModal(addictionsWithDisclaimer) {
    return new Promise((resolve) => {
        const lang = state.profile.lang || 'fr';
        const disclaimerTexts = addictionsWithDisclaimer.map(item => I18n.t(item.disclaimerKey)).join('\n\n');
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'disclaimer-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="closeDisclaimerModal(false)">×</button>
                <h2>${I18n.t('important_notice') || 'Avis important'}</h2>
                <div class="modal-body">
                    <p style="color: var(--warning); margin-bottom: var(--space-lg);">⚠️ ${disclaimerTexts}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeDisclaimerModal(false)">
                        ${I18n.t('disclaimer_cancel')}
                    </button>
                    <button class="btn btn-primary" onclick="closeDisclaimerModal(true)">
                        ${I18n.t('disclaimer_understand')} - ${I18n.t('disclaimer_continue')}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        window.closeDisclaimerModal = function(confirmed) {
            document.body.removeChild(modal);
            delete window.closeDisclaimerModal;
            resolve(confirmed);
        };
    });
}

// ============================================
// RENDER: HOME (V2 - avec nouvelles features)
// ============================================

/**
 * Rendu du dashboard de progression HUMANISÉ (UX #4)
 * Transforme les stats en feedback humain motivant
 */
function renderProgressDashboard(state) {
    const streak = Storage.calculateStreak(state);
    const todayCravings = Storage.countTodayCravings(state);
    const resistedCount = state.wins?.resistedCravings || 0;
    const lang = state.profile.lang;
    
    // Messages humanisés selon les stats
    const getStreakMessage = (s, lang) => {
        if (s === 0) return { fr: 'Chaque jour est un nouveau départ', en: 'Every day is a fresh start', ar: 'كل يوم بداية جديدة' }[lang];
        if (s === 1) return { fr: 'Premier jour réussi !', en: 'First day done!', ar: 'اليوم الأول نجح!' }[lang];
        if (s <= 7) return { fr: `${s} jours de force 💪`, en: `${s} days of strength 💪`, ar: `${s} أيام قوة 💪` }[lang];
        return { fr: `${s} jours, tu construis ta liberté`, en: `${s} days, building freedom`, ar: `${s} أيام، تبني حريتك` }[lang];
    };
    
    const getReesistedMessage = (r, lang) => {
        if (r === 0) return { fr: 'Reste vigilant', en: 'Stay vigilant', ar: 'ابقَ يقظاً' }[lang];
        if (r === 1) return { fr: 'Tu as tenu 1 fois 💪', en: 'You held on once 💪', ar: 'صمدت مرة 💪' }[lang];
        return { fr: `${r} victoires silencieuses`, en: `${r} silent victories`, ar: `${r} انتصارات صامتة` }[lang];
    };
    
    const labels = {
        fr: { streak: 'Série', resisted: 'Résistés', days: 'j' },
        en: { streak: 'Streak', resisted: 'Resisted', days: 'd' },
        ar: { streak: 'سلسلة', resisted: 'مقاومة', days: 'ي' }
    };
    const l = labels[lang] || labels.fr;

    const streakHighlight = streak > 0 ? 'highlight' : '';
    const resistedHighlight = resistedCount > 0 ? 'highlight' : '';

    return `
        <div class="progress-dashboard humanized">
            <div class="progress-grid">
                <div class="progress-item ${streakHighlight}">
                    <span class="progress-value">${streak}${l.days}</span>
                    <span class="progress-label">🔥 ${l.streak}</span>
                    <span class="progress-message">${getStreakMessage(streak, lang)}</span>
                </div>
                <div class="progress-item ${resistedHighlight}">
                    <span class="progress-value">${resistedCount}</span>
                    <span class="progress-label">🛡️ ${l.resisted}</span>
                    <span class="progress-message">${getReesistedMessage(resistedCount, lang)}</span>
                </div>
                ${typeof Wins !== 'undefined' ? Wins.renderWinsCompact(state) : ''}
            </div>
        </div>
    `;
}

/**
 * Helper pour les labels de la home (UX amélioré)
 */
function getHomeLabels(lang) {
    const labels = {
        fr: {
            slopeNow: '⚠️ Je suis sur une pente',
            slopeNowShort: 'Pente',
            eveningRitual: '🌙 Rituel du soir',
            eveningRitualShort: 'Rituel',
            hadEpisode: 'J\'ai eu un épisode',
            viewHeatmap: 'Heatmap',
            viewExperiments: 'Expériences',
            configAntiporn: 'Config',
            help: 'Aide',
            sosButton: 'SOS',
            programs: 'Programmes',
            journal: 'Journal',
            calendar: 'Calendrier',
            coaching: 'Coaching',
            spiritual: 'Spirituel',
            spiritualShort: 'Spirituel',
            nightPlan: 'Plan nuit',
            nightPlanShort: 'Nuit',
            howDoYouFeel: 'Comment te sens-tu ?',
            feeling_good: '😊 Bien',
            feeling_ok: '😐 Moyen',
            feeling_bad: '😞 Pas bien',
            // UX #2: Séparation état/action
            needHelp: '🆘 J\'ai besoin d\'aide',
            // UX #10: Validation émotionnelle
            validationMessages: [
                'Venir ici est déjà un pas.',
                'Un pas à la fois.',
                'Tu fais de ton mieux, et c\'est suffisant.',
                'Chaque instant où tu prends soin de toi compte.'
            ],
            // UX #2: Micro-interaction après "Pas bien"
            helpSuggestionTitle: 'Besoin d\'un coup de main ?',
            goToSOS: 'Oui, SOS',
            goToCraving: 'Craving',
            imOkay: 'Ça va aller',
            // UX #7: Insight fallback
            insightFallback: 'Continue d\'utiliser l\'app pour débloquer tes insights personnalisés.',
            insightFallbackEmoji: '📊',
            // UX #8: Heatmap simplifié
            riskPeriodSimple: 'Période à risque détectée'
        },
        en: {
            slopeNow: '⚠️ I\'m on a slope',
            slopeNowShort: 'Slope',
            eveningRitual: '🌙 Evening ritual',
            eveningRitualShort: 'Ritual',
            hadEpisode: 'I had an episode',
            viewHeatmap: 'Heatmap',
            viewExperiments: 'Experiments',
            configAntiporn: 'Config',
            help: 'Help',
            sosButton: 'SOS',
            programs: 'Programs',
            journal: 'Journal',
            calendar: 'Calendar',
            coaching: 'Coaching',
            spiritual: 'Spiritual',
            spiritualShort: 'Spirit',
            nightPlan: 'Night plan',
            nightPlanShort: 'Night',
            howDoYouFeel: 'How do you feel?',
            feeling_good: '😊 Good',
            feeling_ok: '😐 Okay',
            feeling_bad: '😞 Not well',
            needHelp: '🆘 I need help',
            validationMessages: [
                'Coming here is already a victory.',
                'One step at a time.',
                'You\'re doing your best, and that matters.',
                'Every effort counts, even the smallest ones.'
            ],
            helpSuggestionTitle: 'Need a hand?',
            goToSOS: 'Yes, SOS',
            goToCraving: 'Craving',
            imOkay: 'I\'m okay',
            insightFallback: 'Keep using the app to unlock your personalized insights.',
            insightFallbackEmoji: '📊',
            riskPeriodSimple: 'Risk period detected'
        },
        ar: {
            slopeNow: '⚠️ أنا على منحدر',
            slopeNowShort: 'منحدر',
            eveningRitual: '🌙 طقس المساء',
            eveningRitualShort: 'طقس',
            hadEpisode: 'حدث لي انتكاس',
            viewHeatmap: 'خريطة الحرارة',
            viewExperiments: 'التجارب',
            configAntiporn: 'إعدادات',
            help: 'مساعدة',
            sosButton: 'طوارئ',
            programs: 'برامج',
            journal: 'يوميات',
            calendar: 'تقويم',
            coaching: 'تدريب',
            spiritual: 'روحاني',
            spiritualShort: 'روحي',
            nightPlan: 'خطة الليل',
            nightPlanShort: 'ليل',
            howDoYouFeel: 'كيف تشعر؟',
            feeling_good: '😊 جيد',
            feeling_ok: '😐 عادي',
            feeling_bad: '😞 سيء',
            needHelp: '🆘 أحتاج مساعدة',
            validationMessages: [
                'المجيء إلى هنا هو بالفعل انتصار.',
                'خطوة واحدة في كل مرة.',
                'أنت تفعل أفضل ما لديك، وهذا مهم.',
                'كل جهد يُحسب، حتى الأصغر منها.'
            ],
            helpSuggestionTitle: 'تحتاج مساعدة؟',
            goToSOS: 'نعم، طوارئ',
            goToCraving: 'رغبة',
            imOkay: 'أنا بخير',
            insightFallback: 'استمر في استخدام التطبيق لفتح رؤاك الشخصية.',
            insightFallbackEmoji: '📊',
            riskPeriodSimple: 'تم اكتشاف فترة خطر'
        }
    };
    return labels[lang] || labels.fr;
}

/**
 * UX #10: Retourne un message de validation aléatoire
 */
function getRandomValidationMessage(lang) {
    const l = getHomeLabels(lang);
    const messages = l.validationMessages || [];
    return messages[Math.floor(Math.random() * messages.length)] || '';
}

/**
 * Label pour le bouton menu outils
 */
function getToolsMenuLabel(lang) {
    const labels = {
        fr: 'Mes outils',
        en: 'My tools',
        ar: 'أدواتي'
    };
    return labels[lang] || labels.fr;
}

/**
 * Labels pour le drawer outils
 */
function getToolsDrawerLabels(lang) {
    return {
        fr: {
            title: 'Mes outils',
            urgence: 'Urgence',
            accompagnement: 'Accompagnement',
            suivi: 'Suivi',
            config: 'Configuration'
        },
        en: {
            title: 'My tools',
            urgence: 'Emergency',
            accompagnement: 'Support',
            suivi: 'Tracking',
            config: 'Settings'
        },
        ar: {
            title: 'أدواتي',
            urgence: 'طوارئ',
            accompagnement: 'دعم',
            suivi: 'متابعة',
            config: 'إعدادات'
        }
    }[lang] || {
        title: 'Mes outils',
        urgence: 'Urgence',
        accompagnement: 'Accompagnement',
        suivi: 'Suivi',
        config: 'Configuration'
    };
}

/**
 * Ouvre le drawer des outils
 */
function openToolsDrawer() {
    // Supprimer l'ancien si existe
    const existing = document.getElementById('toolsDrawerOverlay');
    if (existing) existing.remove();
    
    const lang = state.profile.lang;
    const l = getHomeLabels(lang);
    const dl = getToolsDrawerLabels(lang);
    
    const overlay = document.createElement('div');
    overlay.id = 'toolsDrawerOverlay';
    overlay.className = 'tools-drawer-overlay';
    overlay.innerHTML = `
        <div class="tools-drawer">
            <div class="tools-drawer-handle" onclick="closeToolsDrawer()"></div>
            <div class="tools-drawer-header">
                <h3 class="tools-drawer-title">🧰 ${dl.title}</h3>
                <button class="tools-drawer-close" onclick="closeToolsDrawer()">×</button>
            </div>
            <div class="tools-drawer-content">
                <!-- Section URGENCE -->
                <div class="tools-section">
                    <div class="tools-section-title">🚨 ${dl.urgence}</div>
                    <div class="tool-grid">
                        <button class="tool-card priority-urgent" onclick="closeToolsDrawer(); typeof AntiPorn !== 'undefined' && AntiPorn.openAdvancedSlopeModal(state)">
                            <span class="tool-icon">⚠️</span>
                            <span class="tool-label">${l.slopeNowShort}</span>
                        </button>
                    </div>
                </div>
                
                <!-- Section ACCOMPAGNEMENT -->
                <div class="tools-section">
                    <div class="tools-section-title">💜 ${dl.accompagnement}</div>
                    <div class="tool-grid">
                        <button class="tool-card priority-support" onclick="closeToolsDrawer(); typeof Evening !== 'undefined' && Evening.openEveningRitual(state)">
                            <span class="tool-icon">🌙</span>
                            <span class="tool-label">${l.eveningRitualShort}</span>
                        </button>
                        <button class="tool-card priority-support" onclick="closeToolsDrawer(); typeof Programs !== 'undefined' && Programs.openSelect(state)">
                            <span class="tool-icon">📚</span>
                            <span class="tool-label">${l.programs}</span>
                        </button>
                        ${state.profile.spiritualEnabled ? `
                            <button class="tool-card priority-support" onclick="closeToolsDrawer(); typeof Spiritual !== 'undefined' && Spiritual.open(state)">
                                <span class="tool-icon">🤲</span>
                                <span class="tool-label">${l.spiritualShort}</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Section SUIVI -->
                <div class="tools-section">
                    <div class="tools-section-title">📈 ${dl.suivi}</div>
                    <div class="tool-grid">
                        <button class="tool-card priority-tracking" onclick="closeToolsDrawer(); Router.navigateTo('dashboard')">
                            <span class="tool-icon">📊</span>
                            <span class="tool-label">${dl.title || 'Dashboard'}</span>
                        </button>
                        <button class="tool-card priority-tracking" onclick="closeToolsDrawer(); typeof Journal !== 'undefined' && Journal.openJournalModal(state)">
                            <span class="tool-icon">📝</span>
                            <span class="tool-label">${l.journal}</span>
                        </button>
                        <button class="tool-card priority-tracking" onclick="closeToolsDrawer(); typeof Calendar !== 'undefined' && Calendar.open(state)">
                            <span class="tool-icon">📅</span>
                            <span class="tool-label">${l.calendar}</span>
                        </button>
                        <button class="tool-card priority-tracking" onclick="closeToolsDrawer(); typeof Heatmap !== 'undefined' && Heatmap.openHeatmapModal(state)">
                            <span class="tool-icon">📊</span>
                            <span class="tool-label">${l.viewHeatmap}</span>
                        </button>
                        <button class="tool-card priority-tracking" onclick="closeToolsDrawer(); typeof Experiments !== 'undefined' && Experiments.openExperimentsModal(state)">
                            <span class="tool-icon">🧪</span>
                            <span class="tool-label">${l.viewExperiments}</span>
                        </button>
                    </div>
                </div>
                
                <!-- Section CONFIG -->
                <div class="tools-section">
                    <div class="tools-section-title">⚙️ ${dl.config}</div>
                    <div class="tool-grid">
                        <button class="tool-card priority-config" onclick="closeToolsDrawer(); typeof AntiPorn !== 'undefined' && AntiPorn.openConfigModal(state)">
                            <span class="tool-icon">⚙️</span>
                            <span class="tool-label">${l.configAntiporn}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Fermer en cliquant sur l'overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeToolsDrawer();
        }
    });
    
    // Activer l'animation après insertion
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });
}

/**
 * Ferme le drawer des outils
 */
function closeToolsDrawer() {
    const overlay = document.getElementById('toolsDrawerOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
}

/**
 * Rendu de l'écran d'accueil - VERSION UX AMÉLIORÉE
 * 
 * Améliorations UX intégrées:
 * #1 - Hiérarchie visuelle avec 3 niveaux
 * #2 - Séparation état émotionnel / action
 * #3 - Bouton SOS flottant (FAB)
 * #6 - Grille différenciée (urgence/suivi/config)
 * #7 - Insight avec fallback
 * #10 - Validation émotionnelle persistante
 */
function renderHome() {
    const screen = document.getElementById('screen-home');
    if (!screen) return;
    
    const lang = state.profile.lang;
    const l = getHomeLabels(lang);
    
    // V3: Check if coaching insights are available
    const weeklyInsights = typeof Coaching !== 'undefined' ? Coaching.computeWeeklyInsights(state) : null;
    const hasProgram = state.programs?.active !== null;
    const hasInsights = weeklyInsights && weeklyInsights.topTriggers && weeklyInsights.topTriggers.length > 0;
    
    // UX #10: Message de validation aléatoire
    const validationMessage = getRandomValidationMessage(lang);
    
    screen.innerHTML = `
        <div class="home-layout">
            <!-- UX #10: Bannière de validation émotionnelle -->
            <div class="validation-banner">
                <p><span class="emoji">💜</span>${validationMessage}</p>
            </div>

            <!-- Zone 1 : État émotionnel (UX #2: séparé de l'action) -->
            <div class="quick-checkin-bar" id="quickCheckinBar">
                <span class="quick-checkin-label">${l.howDoYouFeel}</span>
                <div class="quick-checkin-buttons">
                    <button class="quick-btn" onclick="handleMoodSelection('good', 9, 2)">${l.feeling_good}</button>
                    <button class="quick-btn" onclick="handleMoodSelection('ok', 6, 4)">${l.feeling_ok}</button>
                    <button class="quick-btn" onclick="handleMoodSelection('bad', 3, 7)">${l.feeling_bad}</button>
                </div>
                <!-- UX #2: Bouton d'aide séparé -->
                <button class="crisis-action-btn" onclick="activateCrisisMode()">
                    ${l.needHelp}
                </button>
                <!-- UX #2: Zone de suggestion d'aide (apparaît après "Pas bien") -->
                <div id="helpSuggestionZone"></div>
            </div>

            <!-- Zone 2 : CTAs principaux (UX #1: Niveau 1 - Action critique) -->
            <div class="hero-actions cta-zone">
                <div class="cta-dual">
                    <button class="cta-main" onclick="Router.navigateTo('craving')">
                        <div class="cta-icon">🔥</div>
                        <div class="cta-title">${I18n.t('craving_now')}</div>
                        <div class="cta-subtitle">${I18n.t('craving_subtitle')}</div>
                    </button>
                </div>
            </div>

            <!-- Zone 3 : Dashboard de Progression (UX #4: Stats humanisées) -->
            ${renderProgressDashboard(state)}

            <!-- Zone 4 : Focus du Jour (UX #5: Intention actionnable) -->
            ${hasProgram ? renderActiveProgramWidget(state) : (typeof Intentions !== 'undefined' ? Intentions.renderIntentionBlock(state) : '')}

            <!-- Zone 5 : Bouton Menu Outils (Burger Menu) -->
            <button class="burger-menu-btn" onclick="openToolsDrawer()">
                <span class="burger-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
                <span>${getToolsMenuLabel(lang)}</span>
            </button>

            <!-- Zone 6 : Actions secondaires -->
            <div class="bottom-actions">
                <button class="btn btn-danger btn-block" onclick="typeof Relapse !== 'undefined' && Relapse.openRelapseMode(state)">
                    😔 ${l.hadEpisode}
                </button>
                <button class="btn btn-ghost btn-small mt-md" onclick="showHelpModal()">
                    ❓ ${l.help}
                </button>
            </div>
        </div>
    `;
    
    // UX #3: Ajouter le bouton SOS flottant
    renderSOSFab();
}

/**
 * UX #3: Rendu du bouton SOS flottant (FAB)
 */
function renderSOSFab() {
    // Supprimer l'ancien si existe
    const existing = document.getElementById('sosFab');
    if (existing) existing.remove();
    
    const fab = document.createElement('button');
    fab.id = 'sosFab';
    fab.className = 'sos-fab';
    fab.innerHTML = '🆘';
    fab.title = 'SOS';
    fab.onclick = () => {
        if (typeof SOS !== 'undefined') {
            SOS.activate(state);
        } else {
            Router.navigateTo('craving');
        }
    };
    
    document.body.appendChild(fab);
}

/**
 * UX #7: Rendu du fallback insight
 */
function renderInsightFallback(lang) {
    const l = getHomeLabels(lang);
    
    return `
        <div class="coaching-widget empty-state">
            <div class="insight-empty-message">
                <span class="emoji">${l.insightFallbackEmoji}</span>
                ${l.insightFallback}
            </div>
        </div>
    `;
}

/**
 * UX #2: Gestion de la sélection d'humeur avec micro-interaction
 */
function handleMoodSelection(mood, moodValue, stressValue) {
    // Enregistrer le check-in
    submitQuickCheckin(moodValue, stressValue);
    
    // UX #2: Si "bad", montrer suggestion d'aide
    if (mood === 'bad') {
        showHelpSuggestion();
    }
    
    // UX #1: Si mood mauvais, activer le mode focus
    if (moodValue <= 3 || stressValue >= 7) {
        document.body.classList.add('focus-mode');
    } else {
        document.body.classList.remove('focus-mode');
    }
}

/**
 * UX #2: Affiche la suggestion d'aide après "Pas bien"
 */
function showHelpSuggestion() {
    const zone = document.getElementById('helpSuggestionZone');
    if (!zone) return;
    
    const lang = state.profile.lang;
    const l = getHomeLabels(lang);
    
    zone.innerHTML = `
        <div class="help-suggestion">
            <p>${l.helpSuggestionTitle}</p>
            <div class="help-actions">
                <button class="help-btn primary" onclick="activateCrisisMode()">${l.goToSOS}</button>
                <button class="help-btn secondary" onclick="Router.navigateTo('craving')">${l.goToCraving}</button>
                <button class="help-btn secondary" onclick="dismissHelpSuggestion()">${l.imOkay}</button>
            </div>
        </div>
    `;
}

/**
 * Ferme la suggestion d'aide
 */
function dismissHelpSuggestion() {
    const zone = document.getElementById('helpSuggestionZone');
    if (zone) zone.innerHTML = '';
    document.body.classList.remove('focus-mode');
}

/**
 * UX #2 & #3: Active le mode crise (SOS + focus mode)
 */
function activateCrisisMode() {
    document.body.classList.add('crisis-mode', 'focus-mode');
    
    if (typeof SOS !== 'undefined') {
        SOS.activate(state);
    } else {
        Router.navigateTo('craving');
    }
}

/**
 * V3: Submit quick check-in (1-swipe)
 */
function submitQuickCheckin(mood, stress) {
    const checkinData = {
        mood: mood,
        stress: stress,
        craving: stress > 7 ? 8 : stress > 4 ? 5 : 2,
        solitude: 5,
        exposure: false,
        notes: '',
        quickCheckin: true
    };
    
    Storage.addCheckin(state, checkinData);
    showToast(I18n.t('checkin_saved') || 'Enregistré', 'success');
    
    // If crisis, suggest SOS
    if (mood <= 2 || stress >= 8) {
        setTimeout(() => {
            if (typeof SOS !== 'undefined') {
                SOS.openSOSModal(state);
            } else {
                Router.navigateTo('craving');
            }
        }, 500);
    }
    
    // Refresh home
    renderHome();
}

/**
 * V3: Render active program widget
 */
function renderActiveProgramWidget(state) {
    const program = state.programs?.active;
    if (!program) return '';
    
    const lang = state.profile.lang;
    const labels = {
        fr: { activeProgram: 'Programme en cours', day: 'Jour', continueProgram: 'Continuer la leçon' },
        en: { activeProgram: 'Active program', day: 'Day', continueProgram: 'Continue lesson' },
        ar: { activeProgram: 'البرنامج النشط', day: 'اليوم', continueProgram: 'متابعة الدرس' }
    };
    const l = labels[lang] || labels.fr;
    
    const programName = program.id === 'program_14' ? 
        (lang === 'ar' ? 'برنامج 14 يوم' : (lang === 'en' ? '14-Day Program' : 'Programme 14 jours')) :
        (lang === 'ar' ? 'برنامج 30 يوم' : (lang === 'en' ? '30-Day Program' : 'Programme 30 jours'));
    
    return `
        <div class="focus-widget program-focus">
            <div class="focus-header">
                <span class="focus-icon">📚</span>
                <span class="focus-title">${programName}</span>
                <span class="focus-badge">${l.day} ${program.currentDay}</span>
            </div>
            <div class="focus-content">
                <p class="focus-subtitle">${l.activeProgram}</p>
            </div>
            <button class="focus-cta" onclick="typeof Programs !== 'undefined' && Programs.openSelect(state)">
                ${l.continueProgram} →
            </button>
        </div>
    `;
}

/**
 * V3: Render coaching widget
 */
function renderCoachingWidget(insights, lang) {
    const labels = {
        fr: { coachingInsight: 'Insight de la semaine', topTrigger: 'Déclencheur principal', riskyTime: 'Moment risqué' },
        en: { coachingInsight: 'Weekly insight', topTrigger: 'Top trigger', riskyTime: 'Risky time' },
        ar: { coachingInsight: 'رؤية الأسبوع', topTrigger: 'المحفز الأساسي', riskyTime: 'وقت خطر' }
    };
    const l = labels[lang] || labels.fr;
    
    const topTriggerObj = insights.topTriggers && insights.topTriggers[0];
    const topTrigger = topTriggerObj ? topTriggerObj.trigger : '-';
    const riskyHourObj = insights.riskHours && insights.riskHours[0];
    const riskyHour = riskyHourObj ? `${riskyHourObj.hour}h` : '-';
    
    return `
        <div class="card coaching-widget">
            <div class="coaching-header">
                <span class="coaching-icon">🧠</span>
                <span class="coaching-title">${l.coachingInsight}</span>
            </div>
            <div class="coaching-insights">
                <div class="insight-item">
                    <span class="insight-label">${l.topTrigger}:</span>
                    <span class="insight-value">${topTrigger}</span>
                </div>
                <div class="insight-item">
                    <span class="insight-label">${l.riskyTime}:</span>
                    <span class="insight-value">${riskyHour}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Affiche le modal d'aide
 */
function showHelpModal() {
    const lang = state.profile.lang;
    
    const messages = {
        fr: {
            title: 'Besoin d\'aide ?',
            content: `
                <p>Si tu traverses un moment difficile, tu n'es pas seul.</p>
                <ul>
                    <li>Parle à un proche de confiance</li>
                    <li>Contacte un professionnel de santé</li>
                    <li>Numéro d'écoute : 0 800 235 236 (Fil Santé Jeunes)</li>
                </ul>
                <p>Cette application est un outil d'accompagnement, pas un substitut à un suivi professionnel.</p>
            `
        },
        en: {
            title: 'Need help?',
            content: `
                <p>If you're going through a difficult time, you're not alone.</p>
                <ul>
                    <li>Talk to a trusted person</li>
                    <li>Contact a health professional</li>
                    <li>Seek support from a helpline in your area</li>
                </ul>
                <p>This app is a support tool, not a substitute for professional care.</p>
            `
        },
        ar: {
            title: 'تحتاج مساعدة؟',
            content: `
                <p>إذا كنت تمر بوقت صعب، فأنت لست وحدك.</p>
                <ul>
                    <li>تحدث مع شخص تثق به</li>
                    <li>تواصل مع متخصص صحي</li>
                    <li>ابحث عن خط مساعدة في منطقتك</li>
                </ul>
                <p>هذا التطبيق أداة دعم، وليس بديلاً عن الرعاية المهنية.</p>
            `
        }
    };
    
    const m = messages[lang] || messages.fr;
    
    showModal(m.title, m.content, () => {
        closeModal('dynamic-modal');
    });
}

// ============================================
// RENDER: CRAVING (V2 - avec suggestions contextuelles)
// ============================================

/**
 * Rendu de l'écran Craving - Protocole 90 secondes avec suggestions V2
 */
function renderCraving() {
    const screen = document.getElementById('screen-craving');
    if (!screen) return;
    
    const lang = state.profile.lang;
    
    // Réinitialiser les états du protocole
    resetProtocolState();
    
    // Récupérer les suggestions d'actions depuis les règles matchées
    const context = {
        timeRange: Utils.getTimeBucket(new Date().getHours()),
        triggers: state.antiporn?.triggers || []
    };
    const matchedRules = IfThen.findMatchingRules(state, context);
    const suggestedActions = IfThen.getActionsFromRules(matchedRules, lang);
    
    // Labels
    const labels = {
        fr: { suggestedActions: 'Actions suggérées', hadEpisode: 'J\'ai eu un épisode' },
        en: { suggestedActions: 'Suggested actions', hadEpisode: 'I had an episode' },
        ar: { suggestedActions: 'إجراءات مقترحة', hadEpisode: 'حدث لي انتكاس' }
    };
    const l = labels[lang] || labels.fr;
    
    screen.innerHTML = `
        <div class="protocol-container">
            <!-- Header -->
            <div class="protocol-header">
                <h1 class="protocol-title">${I18n.t('protocol_title')}</h1>
                <p class="protocol-subtitle">${I18n.t('protocol_subtitle')}</p>
            </div>
            
            <!-- Progress Bar -->
            <div class="protocol-progress">
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" id="protocol-progress-bar" style="width: 0%"></div>
                </div>
                <div class="progress-text">
                    <span id="protocol-time">0</span> / 90s
                </div>
            </div>
            
            <!-- Steps -->
            <div class="protocol-steps" id="protocol-steps">
                <div class="protocol-step" data-step="1">
                    <div class="protocol-step-number">1</div>
                    <div class="protocol-step-text">${I18n.t('protocol_step1')}</div>
                </div>
                <div class="protocol-step" data-step="2">
                    <div class="protocol-step-number">2</div>
                    <div class="protocol-step-text">${I18n.t('protocol_step2')}</div>
                </div>
                <div class="protocol-step" data-step="3">
                    <div class="protocol-step-number">3</div>
                    <div class="protocol-step-text">${I18n.t('protocol_step3')}</div>
                </div>
                <div class="protocol-step" data-step="4">
                    <div class="protocol-step-number">4</div>
                    <div class="protocol-step-text">${I18n.t('protocol_step4')}</div>
                </div>
                <div class="protocol-step" data-step="5">
                    <div class="protocol-step-number">5</div>
                    <div class="protocol-step-text">${I18n.t('protocol_step5')}</div>
                </div>
            </div>
            
            <!-- Action Button -->
            <button class="protocol-action-btn" id="protocol-action-btn" onclick="confirmProtocolStep()">
                ${I18n.t('protocol_moved')}
            </button>
            
            <!-- Suggested Actions (V2) -->
            ${suggestedActions.length > 0 ? `
                <div class="suggested-actions">
                    <h4>${l.suggestedActions}</h4>
                    <div class="action-chips">
                        ${suggestedActions.map(a => `
                            <span class="chip action-chip" onclick="markActionDone(this)">${a.label}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Breathing Section -->
            <div class="breathing-section">
                <h3 class="breathing-title">${I18n.t('breathing_title')}</h3>
                <div class="breathing-circle-container">
                    <div class="breathing-circle" id="breathing-circle">
                        <div class="breathing-label" id="breathing-label">${I18n.t('breathing_inhale')}</div>
                        <div class="breathing-count" id="breathing-count">4</div>
                    </div>
                </div>
                <div class="breathing-total" id="breathing-total">60s</div>
            </div>
            
            <!-- Intensity Section -->
            <div class="intensity-section">
                <h3 class="intensity-title">${I18n.t('how_feel_now')}</h3>
                <div class="intensity-label">${I18n.t('intensity_label')}</div>
                <div class="intensity-slider-container">
                    <input type="range" class="intensity-slider" id="intensity-slider" 
                           min="1" max="5" value="3" oninput="updateIntensity(this.value)">
                </div>
                <div class="intensity-labels">
                    <span>1 - ${I18n.t('intensity_very_low')}</span>
                    <span>5 - ${I18n.t('intensity_very_high')}</span>
                </div>
                <div class="intensity-value" id="intensity-value">3</div>
            </div>
            
            <!-- Encouragement Button -->
            <button class="encouragement-btn" id="encouragement-btn" onclick="showEncouragement()">
                ${I18n.t('show_encouragement')}
            </button>
            
            <!-- Encouragement Card (hidden initially) -->
            <div id="encouragement-container"></div>
            
            <!-- Bottom buttons -->
            <div class="protocol-bottom-buttons">
                <button class="back-to-calm-btn" onclick="finishProtocol()">
                    ✓ ${I18n.t('back_to_calm')}
                </button>
                <button class="btn btn-danger btn-small" onclick="openRelapseFromCraving()">
                    ${l.hadEpisode}
                </button>
            </div>
        </div>
    `;
    
    // Logger automatiquement le craving
    const primaryAddiction = state.addictions[0]?.id || 'general';
    Storage.addEvent(state, 'craving', primaryAddiction);
    
    // Démarrer le protocole automatiquement
    startProtocol();
}

/**
 * Marque une action comme faite
 */
function markActionDone(chip) {
    chip.classList.toggle('done');
    if (chip.classList.contains('done')) {
        chip.innerHTML = '✓ ' + chip.textContent;
    }
}

/**
 * Ouvre le mode relapse depuis l'écran craving
 */
function openRelapseFromCraving() {
    // Arrêter le protocole
    if (protocolInterval) {
        clearInterval(protocolInterval);
        protocolInterval = null;
    }
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }
    
    // Ouvrir le mode relapse
    Relapse.openRelapseMode(state);
}

/**
 * Réinitialise l'état du protocole
 */
function resetProtocolState() {
    if (protocolInterval) {
        clearInterval(protocolInterval);
        protocolInterval = null;
    }
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }
    
    protocolSeconds = 0;
    protocolRunning = false;
    protocolCompleted = false;
    breathingPhase = 'inhale';
    breathingCount = 4;
    breathingCycle = 0;
    breathingTotalSeconds = 60;
    breathingRunning = false;
    currentIntensity = 3;
}

/**
 * Démarre le protocole 90 secondes
 */
function startProtocol() {
    protocolRunning = true;
    
    // Timer principal du protocole
    protocolInterval = setInterval(() => {
        protocolSeconds++;
        updateProtocolProgress();
        updateProtocolSteps();
        
        if (protocolSeconds >= 90) {
            protocolCompleted = true;
            clearInterval(protocolInterval);
            protocolInterval = null;
            markAllStepsCompleted();
        }
    }, 1000);
    
    // Démarrer la respiration guidée
    startBreathing();
}

/**
 * Met à jour la barre de progression
 */
function updateProtocolProgress() {
    const progressBar = document.getElementById('protocol-progress-bar');
    const timeDisplay = document.getElementById('protocol-time');
    
    if (progressBar) {
        const percentage = Math.min((protocolSeconds / 90) * 100, 100);
        progressBar.style.width = `${percentage}%`;
    }
    
    if (timeDisplay) {
        timeDisplay.textContent = protocolSeconds;
    }
}

/**
 * Met à jour l'état des étapes en fonction du temps
 */
function updateProtocolSteps() {
    const steps = document.querySelectorAll('.protocol-step');
    
    // Marquer les étapes comme actives selon le temps
    // Chaque étape représente environ 18 secondes
    const currentStep = Math.min(Math.floor(protocolSeconds / 18) + 1, 5);
    
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNum < currentStep) {
            step.classList.add('completed');
        } else if (stepNum === currentStep) {
            step.classList.add('active');
        }
    });
}

/**
 * Marque toutes les étapes comme complétées
 */
function markAllStepsCompleted() {
    const steps = document.querySelectorAll('.protocol-step');
    steps.forEach(step => {
        step.classList.remove('active');
        step.classList.add('completed');
    });
}

/**
 * Confirme une étape du protocole (bouton "J'ai bougé")
 */
function confirmProtocolStep() {
    const btn = document.getElementById('protocol-action-btn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = '✓ ' + I18n.t('done');
        btn.style.background = 'var(--success-bg)';
        btn.style.borderColor = 'var(--success)';
        btn.style.color = 'var(--success)';
    }
    
    // Marquer toutes les étapes jusqu'à maintenant comme complétées
    markAllStepsCompleted();
}

/**
 * Démarre la respiration guidée
 */
function startBreathing() {
    breathingRunning = true;
    breathingPhase = 'inhale';
    breathingCount = 4;
    
    updateBreathingDisplay();
    
    breathingInterval = setInterval(() => {
        breathingCount--;
        breathingTotalSeconds--;
        
        if (breathingCount <= 0) {
            // Passer à la phase suivante
            switch (breathingPhase) {
                case 'inhale':
                    breathingPhase = 'hold';
                    breathingCount = 4;
                    break;
                case 'hold':
                    breathingPhase = 'exhale';
                    breathingCount = 6;
                    break;
                case 'exhale':
                    breathingPhase = 'inhale';
                    breathingCount = 4;
                    breathingCycle++;
                    break;
            }
        }
        
        updateBreathingDisplay();
        
        if (breathingTotalSeconds <= 0) {
            clearInterval(breathingInterval);
            breathingInterval = null;
            breathingRunning = false;
        }
    }, 1000);
}

/**
 * Met à jour l'affichage de la respiration
 */
function updateBreathingDisplay() {
    const circle = document.getElementById('breathing-circle');
    const label = document.getElementById('breathing-label');
    const count = document.getElementById('breathing-count');
    const total = document.getElementById('breathing-total');
    
    if (label) {
        switch (breathingPhase) {
            case 'inhale':
                label.textContent = I18n.t('breathing_inhale');
                break;
            case 'hold':
                label.textContent = I18n.t('breathing_hold');
                break;
            case 'exhale':
                label.textContent = I18n.t('breathing_exhale');
                break;
        }
    }
    
    if (count) {
        count.textContent = breathingCount;
    }
    
    if (total) {
        total.textContent = `${breathingTotalSeconds}s`;
    }
    
    if (circle) {
        circle.classList.remove('inhale', 'hold', 'exhale');
        circle.classList.add(breathingPhase);
    }
}

/**
 * Met à jour l'intensité
 */
function updateIntensity(value) {
    currentIntensity = parseInt(value);
    const display = document.getElementById('intensity-value');
    if (display) {
        display.textContent = value;
    }
}

/**
 * Affiche un texte d'encouragement
 */
function showEncouragement() {
    const container = document.getElementById('encouragement-container');
    const btn = document.getElementById('encouragement-btn');
    
    // Masquer le bouton après clic
    if (btn) {
        btn.style.display = 'none';
    }
    
    // Obtenir un texte d'encouragement (carte spirituelle ou message générique)
    let encouragementText = '';
    let encouragementRef = '';
    
    if (state.profile.spiritualEnabled && state.profile.religion !== 'none') {
        const card = I18n.getSpiritualCard({ theme: 'hope' });
        if (card) {
            encouragementText = card.text;
            encouragementRef = card.ref;
        }
    }
    
    // Fallback sur des messages génériques
    if (!encouragementText) {
        const messages = [
            { text: I18n.t('you_are_stronger'), ref: '' },
            { text: I18n.t('this_will_pass'), ref: '' },
            { text: I18n.t('keep_going'), ref: '' },
            { text: I18n.t('one_step_at_time'), ref: '' },
            { text: I18n.t('breathe_slowly'), ref: '' }
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        encouragementText = randomMsg.text;
        encouragementRef = randomMsg.ref;
    }
    
    if (container) {
        container.innerHTML = `
            <div class="encouragement-card">
                <p class="encouragement-text">"${encouragementText}"</p>
                ${encouragementRef ? `<div class="encouragement-ref">${encouragementRef}</div>` : ''}
            </div>
        `;
    }
}

/**
 * Termine le protocole et retourne à l'accueil
 */
function finishProtocol() {
    // Nettoyer les timers
    if (protocolInterval) {
        clearInterval(protocolInterval);
        protocolInterval = null;
    }
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }
    
    // Compter les actions faites
    const actionsDone = document.querySelectorAll('.action-chip.done').length;
    
    // Enregistrer une victoire avec l'intensité
    const primaryAddiction = state.addictions[0]?.id || 'general';
    Storage.addEvent(state, 'win', primaryAddiction, currentIntensity);
    
    // Incrémenter les victoires invisibles (V2)
    Wins.recordWin(state, actionsDone > 0);
    
    // Message de succès
    showToast(I18n.t('protocol_complete'), 'success');
    
    // Retourner à l'accueil
    Router.navigateTo('home');
}

// ============================================
// RENDER: CHECK-IN
// ============================================

/**
 * Rendu de l'écran Check-in
 */
function renderCheckin() {
    const screen = document.getElementById('screen-checkin');
    if (!screen) return;
    
    // Récupérer le check-in du jour s'il existe
    const today = Storage.getDateISO();
    const existingCheckin = state.checkins.find(c => c.date === today) || {
        mood: 5,
        stress: 5,
        craving: 5,
        solitude: 5,
        exposure: false,
        notes: ''
    };
    
    screen.innerHTML = `
        <button class="btn btn-ghost mb-lg" onclick="Router.navigateTo('home')">
            <span>←</span>
            <span>${I18n.t('back')}</span>
        </button>
        
        <div class="mb-lg">
            <h2>${I18n.t('checkin_title')}</h2>
            <p class="text-secondary">${I18n.t('checkin_subtitle')}</p>
        </div>
        
        <form id="checkin-form" onsubmit="submitCheckin(event)">
            <div class="form-group">
                <label class="form-label">${I18n.t('mood')} 😊</label>
                <div class="range-container">
                    <span>0</span>
                    <input type="range" class="form-range" id="checkin-mood" 
                           min="0" max="10" value="${existingCheckin.mood}" 
                           oninput="updateRangeValue(this)">
                    <span>10</span>
                    <span class="range-value">${existingCheckin.mood}</span>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">${I18n.t('stress')} 😰</label>
                <div class="range-container">
                    <span>0</span>
                    <input type="range" class="form-range" id="checkin-stress" 
                           min="0" max="10" value="${existingCheckin.stress}"
                           oninput="updateRangeValue(this)">
                    <span>10</span>
                    <span class="range-value">${existingCheckin.stress}</span>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">${I18n.t('craving')} 🔥</label>
                <div class="range-container">
                    <span>0</span>
                    <input type="range" class="form-range" id="checkin-craving" 
                           min="0" max="10" value="${existingCheckin.craving}"
                           oninput="updateRangeValue(this)">
                    <span>10</span>
                    <span class="range-value">${existingCheckin.craving}</span>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">${I18n.t('solitude')} 😔</label>
                <div class="range-container">
                    <span>0</span>
                    <input type="range" class="form-range" id="checkin-solitude" 
                           min="0" max="10" value="${existingCheckin.solitude || 5}"
                           oninput="updateRangeValue(this)">
                    <span>10</span>
                    <span class="range-value">${existingCheckin.solitude || 5}</span>
                </div>
            </div>
            
            <div class="form-group">
                <div class="toggle-container">
                    <div class="toggle-label">
                        <span class="toggle-title">${I18n.t('exposure')}</span>
                        <span class="toggle-desc">${I18n.t('exposure_desc')}</span>
                    </div>
                    <label class="toggle">
                        <input type="checkbox" id="checkin-exposure" ${existingCheckin.exposure ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">${I18n.t('notes')}</label>
                <textarea class="form-textarea" id="checkin-notes" 
                          placeholder="${I18n.t('notes_placeholder')}">${existingCheckin.notes || ''}</textarea>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block btn-lg">
                <span>✓</span>
                <span>${I18n.t('save')}</span>
            </button>
        </form>
    `;
}

/**
 * Met à jour l'affichage de la valeur du range
 */
function updateRangeValue(input) {
    const container = input.closest('.range-container');
    const valueDisplay = container.querySelector('.range-value');
    if (valueDisplay) {
        valueDisplay.textContent = input.value;
    }
}

/**
 * Soumet le formulaire de check-in
 */
function submitCheckin(event) {
    event.preventDefault();
    
    const checkinData = {
        mood: parseInt(document.getElementById('checkin-mood').value),
        stress: parseInt(document.getElementById('checkin-stress').value),
        craving: parseInt(document.getElementById('checkin-craving').value),
        solitude: parseInt(document.getElementById('checkin-solitude').value),
        exposure: document.getElementById('checkin-exposure').checked,
        notes: document.getElementById('checkin-notes').value.trim()
    };
    
    Storage.addCheckin(state, checkinData);
    showToast(I18n.t('checkin_saved'), 'success');
    Router.navigateTo('home');
}

// ============================================
// RENDER: HISTORY
// ============================================

/**
 * Rendu de l'écran Historique
 */
function renderHistory() {
    const screen = document.getElementById('screen-history');
    if (!screen) return;
    
    const recentCheckins = Storage.getRecentCheckins(state, 7);
    
    let historyHTML = '';
    if (recentCheckins.length === 0) {
        historyHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <h3 class="empty-state-title">${I18n.t('no_checkins')}</h3>
            </div>
        `;
    } else {
        historyHTML = `
            <div class="history-list">
                ${recentCheckins.map(checkin => `
                    <div class="card history-item">
                        <div class="history-date">${formatDate(checkin.date)}</div>
                        <div class="history-stats">
                            <div class="history-stat">
                                <span class="icon">😊</span>
                                <span>${checkin.mood}/10</span>
                            </div>
                            <div class="history-stat">
                                <span class="icon">😰</span>
                                <span>${checkin.stress}/10</span>
                            </div>
                            <div class="history-stat">
                                <span class="icon">🔥</span>
                                <span>${checkin.craving}/10</span>
                            </div>
                            ${checkin.exposure ? '<div class="history-stat"><span class="icon">⚠️</span></div>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    screen.innerHTML = `
        <button class="btn btn-ghost mb-lg" onclick="Router.navigateTo('home')">
            <span>←</span>
            <span>${I18n.t('back')}</span>
        </button>
        
        <div class="mb-lg">
            <h2>${I18n.t('history_title')}</h2>
        </div>
        
        ${historyHTML}
    `;
}

/**
 * Formate une date ISO en format lisible
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return date.toLocaleDateString(I18n.getCurrentLang(), options);
}

// ============================================
// RENDER: DASHBOARD
// ============================================

/**
 * Rendu de l'écran Dashboard
 */
function renderDashboard() {
    const screen = document.getElementById('screen-dashboard');
    if (!screen) return;
    
    const lang = state.profile.lang;
    const weeklyInsights = typeof Coaching !== 'undefined' ? Coaching.computeWeeklyInsights(state) : null;
    const hasInsights = weeklyInsights && weeklyInsights.topTriggers && weeklyInsights.topTriggers.length > 0;
    
    const labels = {
        fr: { title: 'Dashboard', subtitle: 'Vue d\'ensemble de tes données' },
        en: { title: 'Dashboard', subtitle: 'Overview of your data' },
        ar: { title: 'لوحة التحكم', subtitle: 'نظرة عامة على بياناتك' }
    };
    const l = labels[lang] || labels.fr;
    
    screen.innerHTML = `
        <button class="btn btn-ghost mb-lg" onclick="Router.navigateTo('home')">
            <span>←</span>
            <span>${I18n.t('back')}</span>
        </button>
        
        <div class="mb-lg">
            <h2>${l.title}</h2>
            <p class="text-secondary">${l.subtitle}</p>
        </div>
        
        <div class="dashboard-widgets">
            ${hasInsights ? renderCoachingWidget(weeklyInsights, lang) : renderInsightFallback(lang)}
            ${typeof IfThen !== 'undefined' ? IfThen.renderRulesSummary(state) : ''}
            ${typeof Heatmap !== 'undefined' ? Heatmap.renderMiniHeatmap(state) : ''}
        </div>
    `;
}

// ============================================
// RENDER: SETTINGS
// ============================================

/**
 * Rendu de l'écran Réglages
 */
function renderSettings() {
    const screen = document.getElementById('screen-settings');
    if (!screen) return;
    
    const langLabels = { fr: 'Français', en: 'English', ar: 'العربية' };
    const religionLabels = { 
        none: I18n.t('religion_none'), 
        islam: I18n.t('religion_islam'),
        christianity: I18n.t('religion_christianity'),
        judaism: I18n.t('religion_judaism'),
        buddhism: I18n.t('religion_buddhism')
    };
    
    screen.innerHTML = `
        <div class="mb-lg">
            <h2>${I18n.t('settings')}</h2>
        </div>
        
        <!-- Section Profil -->
        <div class="settings-section">
            <div class="settings-title">${I18n.t('appearance')}</div>
            <div class="settings-list">
                <div class="settings-item" onclick="openLanguageModal()">
                    <div class="settings-item-left">
                        <div class="settings-item-icon">🌍</div>
                        <div class="settings-item-text">
                            <span class="settings-item-title">${I18n.t('language')}</span>
                            <span class="settings-item-value">${langLabels[state.profile.lang]}</span>
                        </div>
                    </div>
                    <div class="settings-item-right">›</div>
                </div>
                <div class="settings-item">
                    <div class="settings-item-left">
                        <div class="settings-item-icon">${(state.settings.theme || 'dark') === 'light' ? '☀️' : '🌙'}</div>
                        <div class="settings-item-text">
                            <span class="settings-item-title">${(state.settings.theme || 'dark') === 'light' ? 'Thème clair' : 'Thème sombre'}</span>
                            <span class="settings-item-value">${(state.settings.theme || 'dark') === 'light' ? 'Activé' : 'Activé'}</span>
                        </div>
                    </div>
                    <label class="toggle">
                        <input type="checkbox" 
                               ${(state.settings.theme || 'dark') === 'light' ? 'checked' : ''}
                               onchange="toggleTheme()">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>
        
        <!-- Section Spirituel -->
        <div class="settings-section">
            <div class="settings-title">${I18n.t('spiritual_cards')}</div>
            <div class="settings-list">
                <div class="settings-item" onclick="openReligionModal()">
                    <div class="settings-item-left">
                        <div class="settings-item-icon">🤲</div>
                        <div class="settings-item-text">
                            <span class="settings-item-title">${I18n.t('religion')}</span>
                            <span class="settings-item-value">${religionLabels[state.profile.religion]}</span>
                        </div>
                    </div>
                    <div class="settings-item-right">›</div>
                </div>
                <div class="settings-item">
                    <div class="settings-item-left">
                        <div class="settings-item-icon">✨</div>
                        <div class="settings-item-text">
                            <span class="settings-item-title">${I18n.t('spiritual_cards')}</span>
                            <span class="settings-item-value">${state.profile.spiritualEnabled ? I18n.t('enabled') : I18n.t('disabled')}</span>
                        </div>
                    </div>
                    <label class="toggle">
                        <input type="checkbox" id="toggle-spiritual" 
                               ${state.profile.spiritualEnabled ? 'checked' : ''}
                               onchange="toggleSpiritualCards(this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>
        
        <!-- Section Addictions -->
        <div class="settings-section">
            <div class="settings-title">${I18n.t('addictions')}</div>
            <div class="settings-list">
                ${(typeof AddictionsConfig !== 'undefined' && AddictionsConfig.getAllAddictionIds ? AddictionsConfig.getAllAddictionIds() : ['porn', 'cigarette', 'alcohol', 'drugs']).map(id => {
                    const isTracked = state.addictions.some(a => a.id === id);
                    const icon = typeof getAddictionIcon === 'function' ? getAddictionIcon(id) : '📋';
                    return `
                        <div class="settings-item">
                            <div class="settings-item-left">
                                <div class="settings-item-icon">${icon}</div>
                                <div class="settings-item-text">
                                    <span class="settings-item-title">${I18n.t('addiction_' + id)}</span>
                                </div>
                            </div>
                            <label class="toggle">
                                <input type="checkbox" 
                                       ${isTracked ? 'checked' : ''}
                                       onchange="toggleAddiction('${id}', this.checked)">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        
        <!-- Section Données -->
        <div class="settings-section">
            <div class="settings-title">${I18n.t('data_management')}</div>
            <div class="settings-list">
                <div class="settings-item" onclick="exportData()">
                    <div class="settings-item-left">
                        <div class="settings-item-icon">📤</div>
                        <div class="settings-item-text">
                            <span class="settings-item-title">${I18n.t('export_data')}</span>
                        </div>
                    </div>
                    <div class="settings-item-right">›</div>
                </div>
                <div class="settings-item" onclick="triggerImport()">
                    <div class="settings-item-left">
                        <div class="settings-item-icon">📥</div>
                        <div class="settings-item-text">
                            <span class="settings-item-title">${I18n.t('import_data')}</span>
                        </div>
                    </div>
                    <div class="settings-item-right">›</div>
                </div>
                <div class="settings-item" onclick="confirmClearData()">
                    <div class="settings-item-left">
                        <div class="settings-item-icon">🗑️</div>
                        <div class="settings-item-text">
                            <span class="settings-item-title" style="color: var(--danger)">${I18n.t('clear_data')}</span>
                        </div>
                    </div>
                    <div class="settings-item-right">›</div>
                </div>
            </div>
        </div>
        
        <!-- Input file caché pour l'import -->
        <input type="file" id="import-file" accept=".json" style="display: none" onchange="handleImport(this)">
        
        <!-- Section À propos -->
        <div class="settings-section">
            <div class="settings-title">${I18n.t('about')}</div>
            <div class="about-content">
                <p class="about-description">
                    Revenir est une application web progressive (PWA) pour le suivi et la gestion des addictions, 
                    avec un focus sur la confidentialité et le fonctionnement hors-ligne. 
                    100% privée, toutes les données restent sur votre appareil.
                </p>
                <div class="about-links">
                    <a href="https://github.com/MehdyDriouech/anti-addict" target="_blank" rel="noopener noreferrer" class="about-link">
                        <span class="about-link-icon">📦</span>
                        <span>Code source (GitHub)</span>
                    </a>
                    <a href="https://paypal.me/MDRIOUECH" target="_blank" rel="noopener noreferrer" class="about-link">
                        <span class="about-link-icon">💝</span>
                        <span>Soutenir le projet</span>
                    </a>
                </div>
                <div class="settings-item" style="margin-top: var(--space-md);">
                    <div class="settings-item-left">
                        <div class="settings-item-icon">ℹ️</div>
                        <div class="settings-item-text">
                            <span class="settings-item-title">${I18n.t('version')}</span>
                            <span class="settings-item-value">3.0.0</span>
                        </div>
                    </div>
                </div>
            </div>
            <p class="text-secondary mt-md" style="font-size: 0.875rem; text-align: center;">
                ${I18n.t('privacy_note')}
            </p>
            <p class="text-secondary mt-sm" style="font-size: 0.75rem; text-align: center; font-style: italic;">
                Cette application ne remplace pas un suivi médical ou thérapeutique professionnel.
            </p>
        </div>
    `;
}

/**
 * Applique le thème (dark/light)
 */
function applyTheme(themeName) {
    const html = document.documentElement;
    if (themeName === 'light') {
        html.classList.add('theme-light');
    } else {
        html.classList.remove('theme-light');
    }
}

/**
 * Bascule entre thème clair et sombre
 */
function toggleTheme() {
    const currentTheme = state.settings.theme || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    state.settings.theme = newTheme;
    Storage.saveState(state);
    applyTheme(newTheme);
    
    // Re-render settings pour mettre à jour le toggle
    if (Router.getCurrentRoute() === 'settings') {
        renderSettings();
    }
}

/**
 * Ouvre le modal de sélection de langue
 */
function openLanguageModal() {
    const html = `
        <div class="form-group">
            <div class="checkbox-group">
                <label class="checkbox-item">
                    <input type="radio" name="lang" value="fr" ${state.profile.lang === 'fr' ? 'checked' : ''}>
                    <span>🇫🇷 Français</span>
                </label>
                <label class="checkbox-item">
                    <input type="radio" name="lang" value="en" ${state.profile.lang === 'en' ? 'checked' : ''}>
                    <span>🇬🇧 English</span>
                </label>
                <label class="checkbox-item">
                    <input type="radio" name="lang" value="ar" ${state.profile.lang === 'ar' ? 'checked' : ''}>
                    <span>🇸🇦 العربية</span>
                </label>
            </div>
        </div>
    `;
    
    showModal(I18n.t('language'), html, async () => {
        const selected = document.querySelector('input[name="lang"]:checked');
        if (selected) {
            state.profile.lang = selected.value;
            state.profile.rtl = selected.value === 'ar';
            Storage.saveState(state);
            await I18n.initI18n(state.profile.lang, state.profile.religion);
            applyTranslations();
            renderSettings();
            closeModal('dynamic-modal');
        }
    });
}

/**
 * Ouvre le modal de sélection de religion
 */
function openReligionModal() {
    const html = `
        <div class="form-group">
            <div class="checkbox-group">
                <label class="checkbox-item">
                    <input type="radio" name="religion" value="none" ${state.profile.religion === 'none' ? 'checked' : ''}>
                    <span>${I18n.t('religion_none')}</span>
                </label>
                <label class="checkbox-item">
                    <input type="radio" name="religion" value="islam" ${state.profile.religion === 'islam' ? 'checked' : ''}>
                    <span>☪️ ${I18n.t('religion_islam')}</span>
                </label>
                <label class="checkbox-item">
                    <input type="radio" name="religion" value="christianity" ${state.profile.religion === 'christianity' ? 'checked' : ''}>
                    <span>✝️ ${I18n.t('religion_christianity')}</span>
                </label>
                <label class="checkbox-item">
                    <input type="radio" name="religion" value="judaism" ${state.profile.religion === 'judaism' ? 'checked' : ''}>
                    <span>✡️ ${I18n.t('religion_judaism')}</span>
                </label>
                <label class="checkbox-item">
                    <input type="radio" name="religion" value="buddhism" ${state.profile.religion === 'buddhism' ? 'checked' : ''}>
                    <span>☸️ ${I18n.t('religion_buddhism')}</span>
                </label>
            </div>
        </div>
    `;
    
    showModal(I18n.t('religion'), html, async () => {
        const selected = document.querySelector('input[name="religion"]:checked');
        if (selected) {
            state.profile.religion = selected.value;
            state.profile.spiritualEnabled = selected.value !== 'none';
            Storage.saveState(state);
            await I18n.loadSpiritualCards(state.profile.lang, state.profile.religion);
            renderSettings();
            closeModal('dynamic-modal');
        }
    });
}

/**
 * Toggle une addiction (ajoute ou retire)
 * @param {string} addictionId - ID de l'addiction
 * @param {boolean} enabled - true pour activer, false pour désactiver
 */
async function toggleAddiction(addictionId, enabled) {
    // Vérifier si un disclaimer est nécessaire
    if (enabled && typeof AddictionsConfig !== 'undefined' && AddictionsConfig.hasDisclaimer) {
        const needsDisclaimer = AddictionsConfig.hasDisclaimer(addictionId);
        if (needsDisclaimer) {
            const config = AddictionsConfig.getAddictionConfig(addictionId);
            const proceed = await showDisclaimerModal([{ id: addictionId, disclaimerKey: config.disclaimerKey }]);
            if (!proceed) {
                // L'utilisateur a annulé, remettre la checkbox à son état précédent
                const checkbox = document.querySelector(`input[onchange*="toggleAddiction('${addictionId}'"]`);
                if (checkbox) checkbox.checked = false;
                return;
            }
        }
    }
    
    // Ajouter ou retirer l'addiction
    if (enabled) {
        const config = typeof AddictionsConfig !== 'undefined' && AddictionsConfig.getAddictionConfig ? AddictionsConfig.getAddictionConfig(addictionId) : null;
        const goal = config && config.defaultGoal ? config.defaultGoal : 'abstinence';
        
        // Vérifier si elle n'existe pas déjà
        if (!state.addictions.some(a => a.id === addictionId)) {
            state.addictions.push({ id: addictionId, goal });
        }
    } else {
        state.addictions = state.addictions.filter(a => a.id !== addictionId);
    }
    
    Storage.saveState(state);
    renderSettings();
    
    const lang = state.profile.lang || 'fr';
    const messages = {
        fr: enabled ? 'Addiction activée' : 'Addiction désactivée',
        en: enabled ? 'Addiction enabled' : 'Addiction disabled',
        ar: enabled ? 'تم تفعيل الإدمان' : 'تم تعطيل الإدمان'
    };
    showToast(messages[lang] || messages.fr);
}
window.toggleAddiction = toggleAddiction;

/**
 * Toggle les cartes spirituelles
 */
async function toggleSpiritualCards(enabled) {
    state.profile.spiritualEnabled = enabled;
    Storage.saveState(state);
    
    if (enabled && state.profile.religion !== 'none') {
        await I18n.loadSpiritualCards(state.profile.lang, state.profile.religion);
    }
}

/**
 * Exporte les données
 */
function exportData() {
    try {
        Storage.exportState(state);
        showToast(I18n.t('export_success'), 'success');
    } catch (error) {
        showToast(I18n.t('import_error'), 'error');
    }
}

/**
 * Déclenche le sélecteur de fichier pour l'import
 */
function triggerImport() {
    document.getElementById('import-file').click();
}

/**
 * Gère l'import d'un fichier
 */
async function handleImport(input) {
    if (!input.files || !input.files[0]) return;
    
    const file = input.files[0];
    const result = await Storage.importState(file);
    
    if (result.valid) {
        state = result.state;
        Storage.saveState(state);
        await I18n.initI18n(state.profile.lang, state.profile.religion);
        applyTranslations();
        showToast(I18n.t('import_success'), 'success');
        renderSettings();
        renderHome();
    } else {
        showToast(`${I18n.t('import_error')}: ${result.errors.join(', ')}`, 'error');
    }
    
    // Reset l'input
    input.value = '';
}

/**
 * Demande confirmation avant d'effacer les données
 */
function confirmClearData() {
    const html = `
        <p style="text-align: center; color: var(--text-secondary);">
            ${I18n.t('clear_confirm')}
        </p>
    `;
    
    showModal(I18n.t('clear_data'), html, () => {
        Storage.clearAllData();
        state = Storage.getDefaultState();
        closeModal('dynamic-modal');
        showToast(I18n.t('reset_complete'), 'success');
        showOnboarding();
    }, true);
}

// ============================================
// MODAL HELPERS
// ============================================

/**
 * Affiche un modal dynamique
 */
function showModal(title, content, onConfirm, isDanger = false) {
    // Supprimer l'ancien modal s'il existe
    const existing = document.getElementById('dynamic-modal');
    if (existing) existing.remove();
    
    const modalHTML = `
        <div class="modal-overlay" id="dynamic-modal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="closeModal('dynamic-modal')">✕</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('dynamic-modal')">
                        ${I18n.t('cancel')}
                    </button>
                    <button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" id="modal-confirm-btn">
                        ${isDanger ? I18n.t('yes') : I18n.t('save')}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Activer le modal
    setTimeout(() => {
        document.getElementById('dynamic-modal').classList.add('active');
    }, 10);
    
    // Ajouter le listener de confirmation
    document.getElementById('modal-confirm-btn').addEventListener('click', onConfirm);
}

/**
 * Ferme un modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

/**
 * Affiche une notification toast
 */
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove après 3 secondes
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// GLOBAL EXPORTS
// ============================================

// Exposer les fonctions globalement pour les onclick dans le HTML
window.completeOnboarding = completeOnboarding;
window.updateRangeValue = updateRangeValue;
window.submitCheckin = submitCheckin;
window.openLanguageModal = openLanguageModal;
window.openReligionModal = openReligionModal;
window.toggleSpiritualCards = toggleSpiritualCards;
window.toggleAddiction = toggleAddiction;
window.exportData = exportData;
window.triggerImport = triggerImport;
window.handleImport = handleImport;
window.confirmClearData = confirmClearData;
window.closeModal = closeModal;
window.showToast = showToast;
window.showHelpModal = showHelpModal;

// Fonctions du protocole 90 secondes
window.confirmProtocolStep = confirmProtocolStep;
window.updateIntensity = updateIntensity;
window.showEncouragement = showEncouragement;
window.finishProtocol = finishProtocol;
window.markActionDone = markActionDone;
window.openRelapseFromCraving = openRelapseFromCraving;

// Exposer renderHome pour les features qui en ont besoin
window.renderHome = renderHome;

// Exposer state pour les features qui en ont besoin
Object.defineProperty(window, 'state', {
    get: function() { return state; },
    set: function(value) { state = value; },
    configurable: true
});

// V3: Quick check-in
window.submitQuickCheckin = submitQuickCheckin;

// UX Improvements: Nouvelles fonctions
window.handleMoodSelection = handleMoodSelection;

// Helpers addictions
function getAddictionIcon(addictionId) {
    const icons = {
        porn: '🔞',
        cigarette: '🚬',
        alcohol: '🍷',
        drugs: '💊',
        social_media: '📱',
        gaming: '🎮',
        food: '🍔',
        shopping: '🛒'
    };
    return icons[addictionId] || '📋';
}
window.getAddictionIcon = getAddictionIcon;
window.showHelpSuggestion = showHelpSuggestion;
window.dismissHelpSuggestion = dismissHelpSuggestion;
window.activateCrisisMode = activateCrisisMode;
window.renderSOSFab = renderSOSFab;
window.openToolsDrawer = openToolsDrawer;
window.closeToolsDrawer = closeToolsDrawer;

// Theme functions
window.toggleTheme = toggleTheme;

// ============================================
// DÉMARRAGE
// ============================================
document.addEventListener('DOMContentLoaded', initApp);
