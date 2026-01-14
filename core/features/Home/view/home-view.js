/**
 * Home View - Rendu HTML pour la page d'accueil
 */

export class HomeView {
    /**
     * Rend la page d'accueil
     * @param {Object} state - State de l'application
     * @param {Object} labels - Labels traduits
     * @param {string} validationMessage - Message de validation
     * @param {boolean} hasProgram - Si un programme est actif
     * @param {Function} renderProgressDashboard - Fonction pour rendre le dashboard
     * @param {Function} renderActiveProgramWidget - Fonction pour rendre le widget programme
     * @param {Function} renderIntentionBlock - Fonction pour rendre le bloc intention
     * @param {string} toolsMenuLabel - Label du menu outils
     */
    render(state, labels, validationMessage, hasProgram, renderProgressDashboard, renderActiveProgramWidget, renderIntentionBlock, toolsMenuLabel) {
        const screen = document.getElementById('screen-home');
        if (!screen) return;
        
        // Vérifier si l'app est verrouillée
        const isLocked = window.Security && window.Security.isLocked && window.Security.isLocked();
        
        if (isLocked) {
            // Afficher la vue verrouillée avec seulement les boutons d'urgence
            this.renderLockedView(state);
            return;
        }
        
        // Vue normale
        screen.innerHTML = `
            <div class="home-layout">
                <!-- UX #10: Bannière de validation émotionnelle -->
                <div class="validation-banner">
                    <p><span class="emoji">💜</span>${validationMessage}</p>
                </div>

                <!-- Zone 1 : État émotionnel (UX #2: séparé de l'action) -->
                <div class="quick-checkin-bar" id="quickCheckinBar">
                    <span class="quick-checkin-label">${labels.howDoYouFeel}</span>
                    <div class="quick-checkin-buttons">
                        <button class="quick-btn" onclick="Home.handleMoodSelection('good', 9, 2)">${labels.feeling_good}</button>
                        <button class="quick-btn" onclick="Home.handleMoodSelection('ok', 6, 4)">${labels.feeling_ok}</button>
                        <button class="quick-btn" onclick="Home.handleMoodSelection('bad', 3, 7)">${labels.feeling_bad}</button>
                    </div>
                    <!-- UX #2: Bouton d'aide séparé -->
                    <button class="crisis-action-btn" onclick="Home.activateCrisisMode()">
                        ${labels.needHelp}
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
                ${hasProgram ? renderActiveProgramWidget(state) : renderIntentionBlock(state)}

                <!-- Zone 5 : Bouton Menu Outils (Burger Menu) -->
                <button class="burger-menu-btn" onclick="openToolsDrawer()">
                    <span class="burger-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                    <span>${toolsMenuLabel}</span>
                </button>

                <!-- Zone 6 : Actions secondaires -->
                <div class="bottom-actions">
                    <button class="btn btn-danger btn-block" onclick="typeof Relapse !== 'undefined' && Relapse.openRelapseMode(state)">
                        😔 ${labels.hadEpisode}
                    </button>
                    <button class="btn btn-ghost btn-small mt-md" onclick="UI.showHelpModal(state.profile.lang)">
                        ❓ ${labels.help}
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Rend la vue verrouillée avec seulement les boutons d'urgence
     * @param {Object} state - State de l'application
     */
    renderLockedView(state) {
        const screen = document.getElementById('screen-home');
        if (!screen) return;
        
        const lang = state.profile.lang || 'fr';
        const labels = {
            fr: {
                lockedTitle: 'Application verrouillée',
                lockedMessage: 'Déverrouille l\'application pour accéder à toutes les fonctionnalités',
                urgencyButton: 'Urgence Tentation',
                sosButton: 'SOS'
            },
            en: {
                lockedTitle: 'App locked',
                lockedMessage: 'Unlock the app to access all features',
                urgencyButton: 'Urgent craving',
                sosButton: 'SOS'
            },
            ar: {
                lockedTitle: 'التطبيق مقفل',
                lockedMessage: 'افتح القفل للوصول إلى جميع الميزات',
                urgencyButton: 'إلحاح الرغبة',
                sosButton: 'SOS'
            }
        };
        const l = labels[lang] || labels.fr;
        
        screen.innerHTML = `
            <div class="home-layout locked-view">
                <div class="locked-content">
                    <div class="locked-icon">🔒</div>
                    <h2 class="locked-title">${l.lockedTitle}</h2>
                    <p class="locked-message">${l.lockedMessage}</p>
                </div>
                
                <!-- Boutons d'urgence uniquement -->
                <div class="locked-actions">
                    <button class="btn btn-danger btn-lg btn-block" onclick="Router.navigateTo('craving')">
                        <span class="btn-icon">🔥</span>
                        <span class="btn-text">${l.urgencyButton}</span>
                    </button>
                    <button class="btn btn-primary btn-lg btn-block" onclick="typeof SOS !== 'undefined' ? SOS.activate(window.state) : Router.navigateTo('craving')">
                        <span class="btn-icon">🆘</span>
                        <span class="btn-text">${l.sosButton}</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Rend le bouton SOS flottant (FAB)
     * @param {Object} state - State de l'application
     */
    renderSOSFab(state) {
        // Ne pas afficher le FAB SOS si l'app est verrouillée
        const isLocked = window.Security && window.Security.isLocked && window.Security.isLocked();
        if (isLocked) {
            const existing = document.getElementById('sosFab');
            if (existing) existing.remove();
            return;
        }
        
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
     * Rend le fallback insight
     * @param {Object} labels - Labels traduits
     * @returns {string} HTML
     */
    renderInsightFallback(labels) {
        return `
            <div class="coaching-widget empty-state">
                <div class="insight-empty-message">
                    <span class="emoji">${labels.insightFallbackEmoji}</span>
                    ${labels.insightFallback}
                </div>
            </div>
        `;
    }

    /**
     * Rend le widget de coaching
     * @param {Object} insights - Insights hebdomadaires
     * @param {string} lang - Langue
     * @returns {string} HTML
     */
    renderCoachingWidget(insights, lang) {
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
     * Rend le widget de programme actif
     * @param {Object} state - State de l'application
     * @returns {string} HTML
     */
    renderActiveProgramWidget(state) {
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
     * Affiche la suggestion d'aide
     * @param {Object} labels - Labels traduits
     */
    showHelpSuggestion(labels) {
        const zone = document.getElementById('helpSuggestionZone');
        if (!zone) return;
        
        zone.innerHTML = `
            <div class="help-suggestion">
                <p>${labels.helpSuggestionTitle}</p>
                <div class="help-actions">
                    <button class="help-btn primary" onclick="Home.activateCrisisMode()">${labels.goToSOS}</button>
                    <button class="help-btn secondary" onclick="Router.navigateTo('craving')">${labels.goToCraving}</button>
                    <button class="help-btn secondary" onclick="Home.dismissHelpSuggestion()">${labels.imOkay}</button>
                </div>
            </div>
        `;
    }

    /**
     * Ferme la suggestion d'aide
     */
    dismissHelpSuggestion() {
        const zone = document.getElementById('helpSuggestionZone');
        if (zone) zone.innerHTML = '';
        document.body.classList.remove('focus-mode');
    }

    /**
     * Rend le dashboard de progression
     * @param {Object} state - State de l'application
     * @returns {string} HTML
     */
    renderProgressDashboard(state) {
        const streak = Storage.calculateStreak(state);
        const todayCravings = Storage.countTodayCravings(state);
        const resistedCount = state.wins?.resistedCravings || 0;
        const lang = state.profile.lang;
        
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
}
