/**
 * Coaching View - Rendu HTML
 */

import { DAY_PERIODS, LABELS } from '../data/coaching-data.js';

export class CoachingView {
    constructor() { this.modalEl = null; }

    /**
     * Récupère une traduction avec fallback automatique
     * @param {string} key - Clé de traduction
     * @param {Object} params - Paramètres pour interpolation
     * @param {string} lang - Langue
     * @param {string|Object} fallback - Fallback (string ou objet {fr, en, ar})
     * @returns {string} Texte traduit
     */
    getTranslation(key, params = {}, lang = 'fr', fallback = null) {
        // Essayer I18n.t() si disponible
        if (typeof I18n !== 'undefined' && I18n.t) {
            const translated = I18n.t(key, params);
            // Si la traduction est différente de la clé, elle a été trouvée
            if (translated !== key) {
                return translated;
            }
        }
        
        // Utiliser le fallback fourni
        if (fallback) {
            if (typeof fallback === 'string') {
                // Fallback simple : interpoler les paramètres
                let result = fallback;
                Object.keys(params).forEach(param => {
                    result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
                });
                return result;
            } else if (typeof fallback === 'object') {
                // Fallback par langue : {fr: "...", en: "...", ar: "..."}
                const fallbackText = fallback[lang] || fallback.fr || fallback.en || fallback.ar || key;
                let result = fallbackText;
                Object.keys(params).forEach(param => {
                    result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
                });
                return result;
            }
        }
        
        // Dernier recours : retourner la clé
        return key;
    }

    createModalElement() {
        if (!this.modalEl) {
            this.modalEl = document.createElement('div');
            this.modalEl.className = 'modal-overlay';
            this.modalEl.id = 'insightsModal';
            document.body.appendChild(this.modalEl);
        }
        return this.modalEl;
    }

    show() { if (this.modalEl) this.modalEl.classList.add('active'); }
    hide() { if (this.modalEl) this.modalEl.classList.remove('active'); }

    formatCorrelation(corr, l) {
        const templates = { stress_craving: l.stressCorrelation, solitude_craving: l.solitudeCorrelation, phone_bed_night: l.phoneCorrelation };
        return (templates[corr.type] || '').replace('{x}', corr.multiplier);
    }

    renderModal(lang, insights) {
        const l = LABELS[lang] || LABELS.fr;
        this.modalEl.innerHTML = `
            <div class="modal-content insights-modal">
                <button class="modal-close" onclick="Coaching.closeInsights()">×</button>
                <h2>${l.title}</h2>
                <div class="insights-summary"><h4>${l.summary}</h4>
                    <div class="insights-stats-grid">
                        <div class="insight-stat"><span class="stat-value">${insights.cravingsCount}</span><span class="stat-label">${l.cravings}</span></div>
                        <div class="insight-stat ${insights.episodesCount > 0 ? 'negative' : ''}"><span class="stat-value">${insights.episodesCount}</span><span class="stat-label">${l.episodes}</span></div>
                        <div class="insight-stat positive"><span class="stat-value">${insights.winsCount}</span><span class="stat-label">${l.wins}</span></div>
                        <div class="insight-stat"><span class="stat-value">${insights.slopesCount}</span><span class="stat-label">${l.slopes}</span></div>
                    </div>
                </div>
                ${insights.topTriggers.length > 0 ? `<div class="insights-section"><h4>🎯 ${l.triggers}</h4><div class="triggers-list">${insights.topTriggers.map(t => `<div class="trigger-item"><span class="trigger-name">${typeof AntiPorn !== 'undefined' && AntiPorn.TRIGGERS?.[t.trigger]?.[lang] || t.trigger}</span><span class="trigger-count">${t.count}x</span></div>`).join('')}</div></div>` : ''}
                ${insights.riskHours.topHours.length > 0 ? `<div class="insights-section"><h4>⏰ ${l.hours}</h4><div class="hours-list">${insights.riskHours.topHours.map(h => `<span class="hour-chip">${h.hour}h (${h.count}x)</span>`).join('')}</div><p class="periods-text">${insights.riskHours.periods.map(p => DAY_PERIODS[p][lang] || p).join(', ')}</p></div>` : ''}
                ${insights.correlations.length > 0 ? `<div class="insights-section"><h4>🔗 ${l.correlations}</h4><div class="correlations-list">${insights.correlations.map(c => `<div class="correlation-item" style="opacity: ${0.5 + c.confidence * 0.5}"><span class="correlation-icon">⚡</span><span class="correlation-text">${this.formatCorrelation(c, l)}</span></div>`).join('')}</div></div>` : ''}
                ${insights.suggestedRules.length > 0 ? `<div class="insights-section"><h4>💡 ${l.suggestions}</h4><div class="suggestions-list">${insights.suggestedRules.map(s => `<div class="suggestion-card"><p class="suggestion-if">${s.ifCondition?.[lang] || s.ifCondition?.fr || ''}</p><p class="suggestion-then">→ ${s.thenAction?.[lang] || s.thenAction?.fr || ''}</p><button class="btn btn-small btn-secondary" onclick="Coaching.addSuggestedRule('${s.trigger}')">+ ${l.addRule}</button></div>`).join('')}</div></div>` : ''}
                ${insights.cravingsCount === 0 && insights.topTriggers.length === 0 ? `<p class="no-data">${l.noData}</p>` : ''}
            </div>
        `;
    }

    renderWidget(lang) {
        const l = LABELS[lang] || LABELS.fr;
        return `<div class="insights-widget" onclick="Coaching.openInsights(state)"><span class="widget-icon">📊</span><span class="widget-text">${l.new}</span><span class="widget-badge">!</span></div>`;
    }

    /**
     * Rend le modal coaching complet
     * @param {string} lang - Langue
     * @param {Object} screenData - { activeInsight, history, observations, actions }
     */
    renderCoachingModal(lang, screenData) {
        const l = LABELS[lang] || LABELS.fr;
        const { activeInsight, history, observations, actions, personalizedAdvice } = screenData;
        
        if (!this.modalEl) {
            this.createModalElement();
        }

        // Récupérer le message traduit pour l'insight actif
        let insightMessage = '';
        if (activeInsight && activeInsight.messageKey) {
            const messageKey = activeInsight.messageKey;
            const data = activeInsight.data || {};
            
            // Fallback messages par clé
            const fallbackMessages = {
                'coaching.insight.weekly_summary': {
                    fr: `Cette semaine: {cravings} urgences, {wins} victoires.`,
                    en: `This week: {cravings} emergencies, {wins} wins.`,
                    ar: `هذا الأسبوع: {cravings} حالات طوارئ، {wins} انتصارات.`
                },
                'coaching.insight.avg_intensity': {
                    fr: `Intensité moyenne cette semaine: {avg}.`,
                    en: `Average intensity this week: {avg}.`,
                    ar: `متوسط الكثافة هذا الأسبوع: {avg}.`
                },
                'coaching.insight.week_comparison': {
                    fr: `Cette semaine est plus chargée que la précédente.`,
                    en: `This week is busier than the previous one.`,
                    ar: `هذا الأسبوع أكثر ازدحامًا من الأسبوع السابق.`
                },
                'coaching.insight.suggested_actions': {
                    fr: `Actions suggérées disponibles.`,
                    en: `Suggested actions available.`,
                    ar: `إجراءات مقترحة متاحة.`
                }
            };
            
            insightMessage = this.getTranslation(
                messageKey,
                data,
                lang,
                fallbackMessages[messageKey]
            );
        }

        this.modalEl.innerHTML = `
            <div class="modal-content coaching-modal">
                <button class="modal-close" onclick="Coaching.closeCoaching()">×</button>
                <h2>🧠 ${this.getTranslation('coaching', {}, lang, { fr: 'Coaching', en: 'Coaching', ar: 'تدريب' })}</h2>
                
                ${activeInsight ? `
                    <div class="coaching-insight-card">
                        <div class="insight-message">${insightMessage}</div>
                        <div class="insight-actions">
                            <button class="btn btn-small btn-secondary" onclick="Coaching.dismissInsight('${activeInsight.id}').then(() => Coaching.closeCoaching())">
                                ${this.getTranslation('coaching.not_useful', {}, lang, { fr: 'Pas utile', en: 'Not useful', ar: 'غير مفيد' })}
                            </button>
                            <button class="btn btn-small btn-primary" onclick="Coaching.markInsightUseful('${activeInsight.id}')">
                                ${this.getTranslation('coaching.useful', {}, lang, { fr: 'Utile', en: 'Useful', ar: 'مفيد' })}
                            </button>
                        </div>
                    </div>
                ` : `
                    <div class="coaching-no-insight">
                        <p>${this.getTranslation('coaching.no_insight_yet', {}, lang, { fr: 'Pas encore d\'insight disponible', en: 'No insight available yet', ar: 'لا توجد رؤية متاحة بعد' })}</p>
                    </div>
                `}
                
                ${observations ? `
                    <div class="coaching-observations">
                        <h4>${this.getTranslation('coaching.what_app_observes', {}, lang, { fr: 'Ce que l\'app observe', en: 'What the app observes', ar: 'ما تلاحظه التطبيق' })}</h4>
                        <p>${this.getTranslation('coaching.observation_text', { days: observations.days, sampleSize: observations.sampleSize }, lang, { fr: 'Analyse sur {days} jours ({sampleSize} échantillons)', en: 'Analysis over {days} days ({sampleSize} samples)', ar: 'تحليل على مدى {days} أيام ({sampleSize} عينات)' })}</p>
                    </div>
                ` : ''}
                
                ${actions && actions.favoriteActions && actions.favoriteActions.length > 0 ? `
                    <div class="coaching-actions">
                        <h4>${this.getTranslation('coaching.suggested_actions', {}, lang, { fr: 'Actions suggérées', en: 'Suggested actions', ar: 'إجراءات مقترحة' })}</h4>
                        <div class="actions-list">
                            ${actions.favoriteActions.map(action => `<div class="action-item">${action}</div>`).join('')}
                        </div>
                        ${actions.hasIfThen ? `
                            <button class="btn btn-small btn-primary" onclick="typeof IfThen !== 'undefined' && IfThen.openModal && IfThen.openModal(window.state)">
                                ${this.getTranslation('coaching.create_rule', {}, lang, { fr: 'Créer une règle', en: 'Create a rule', ar: 'إنشاء قاعدة' })}
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
                
                ${personalizedAdvice && personalizedAdvice.length > 0 ? `
                    <div class="coaching-personalized-advice">
                        <h4>${this.getTranslation('coaching.personalized_advice', {}, lang, { fr: 'Conseils personnalisés', en: 'Personalized advice', ar: 'نصائح مخصصة' })}</h4>
                        <div class="advice-cards">
                            ${this.renderAdviceCards(personalizedAdvice, lang)}
                        </div>
                    </div>
                ` : ''}
                
                ${history && history.length > 0 ? `
                    <div class="coaching-history">
                        <h4>${this.getTranslation('coaching.history', {}, lang, { fr: 'Historique', en: 'History', ar: 'التاريخ' })}</h4>
                        <div class="history-list">
                            ${history.slice(0, 7).map(insight => `
                                <div class="history-item ${insight.dismissed ? 'dismissed' : ''}">
                                    <span class="history-date">${insight.date}</span>
                                    <span class="history-type">${insight.type}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Rend le modal "pas d'insight disponible"
     * @param {string} lang - Langue
     * @param {Object} l - Labels traduits
     */
    renderNoInsightModal(lang, l) {
        if (!this.modalEl) {
            this.createModalElement();
        }
        
        this.modalEl.innerHTML = `
            <div class="modal-content coaching-modal">
                <button class="modal-close" onclick="Coaching.closeCoaching()">×</button>
                <h2>🧠 ${this.getTranslation('coaching', {}, lang, { fr: 'Coaching', en: 'Coaching', ar: 'تدريب' })}</h2>
                <div class="coaching-no-insight">
                    <p>${this.getTranslation('coaching.no_insight_available', {}, lang, { fr: 'Pas encore d\'insight disponible. Reviens plus tard.', en: 'No insight available yet. Come back later.', ar: 'لا توجد رؤية متاحة بعد. عد لاحقًا.' })}</p>
                </div>
            </div>
        `;
    }

    /**
     * Rend les cartes de conseils personnalisés
     * @param {Array} advice - Liste des conseils
     * @param {string} lang - Langue
     * @returns {string} HTML
     */
    renderAdviceCards(advice, lang) {
        // Grouper par addiction
        const byAddiction = {};
        advice.forEach(item => {
            if (!byAddiction[item.addictionId]) {
                byAddiction[item.addictionId] = [];
            }
            byAddiction[item.addictionId].push(item);
        });

        // Icônes par addiction
        const addictionIcons = {
            porn: '🔞',
            cigarette: '🚬',
            alcohol: '🍺',
            drugs: '💊',
            social_media: '📱',
            gaming: '🎮',
            food: '🍔',
            shopping: '🛒'
        };

        // Utiliser les traductions existantes pour les noms d'addictions
        const getAddictionName = (addictionId, currentLang) => {
            const key = `addiction_${addictionId}`;
            return this.getTranslation(
                key,
                {},
                currentLang,
                {
                    addiction_porn: { fr: 'Contenu adulte', en: 'Adult content', ar: 'محتوى للبالغين' },
                    addiction_cigarette: { fr: 'Cigarette', en: 'Cigarette', ar: 'سجائر' },
                    addiction_alcohol: { fr: 'Alcool', en: 'Alcohol', ar: 'كحول' },
                    addiction_drugs: { fr: 'Substances', en: 'Substances', ar: 'مواد' },
                    addiction_social_media: { fr: 'Réseaux sociaux', en: 'Social media', ar: 'وسائل التواصل الاجتماعي' },
                    addiction_gaming: { fr: 'Jeux vidéo', en: 'Gaming', ar: 'ألعاب الفيديو' },
                    addiction_food: { fr: 'Nourriture compulsive', en: 'Compulsive eating', ar: 'الأكل القهري' },
                    addiction_shopping: { fr: 'Achats compulsifs', en: 'Compulsive shopping', ar: 'التسوق القهري' }
                }[key] || { fr: addictionId, en: addictionId, ar: addictionId }
            );
        };

        return Object.keys(byAddiction).map(addictionId => {
            const items = byAddiction[addictionId];
            const icon = addictionIcons[addictionId] || '💡';
            const name = getAddictionName(addictionId, lang);
            const cardId = `advice-card-${addictionId}`;
            
            // Premier conseil (le plus prioritaire)
            const mainAdvice = items[0];
            const mainMessage = this.getTranslation(
                mainAdvice.messageKey,
                {},
                lang,
                { fr: mainAdvice.messageKey, en: mainAdvice.messageKey, ar: mainAdvice.messageKey }
            );
            
            // Badge de type
            const typeLabel = this.getTranslation(
                `coaching.advice.${mainAdvice.type}`,
                {},
                lang,
                {
                    retrospective: { fr: 'Rétrospectif', en: 'Retrospective', ar: 'رجعي' },
                    preventive: { fr: 'Préventif', en: 'Preventive', ar: 'وقائي' },
                    prescriptive: { fr: 'Prescriptif', en: 'Prescriptive', ar: 'وصفي' }
                }[mainAdvice.type] || { fr: mainAdvice.type, en: mainAdvice.type, ar: mainAdvice.type }
            );

            return `
                <div class="advice-card" id="${cardId}">
                    <div class="advice-card-header" onclick="const card = this.closest('.advice-card'); const details = card.querySelector('.advice-card-details'); const toggle = card.querySelector('.advice-card-toggle'); if (card.classList.contains('expanded')) { card.classList.remove('expanded'); details.style.display = 'none'; toggle.textContent = '▼'; } else { card.classList.add('expanded'); details.style.display = 'block'; toggle.textContent = '▲'; }">
                        <div class="advice-card-icon">${icon}</div>
                        <div class="advice-card-content">
                            <div class="advice-card-title">${name}</div>
                            <div class="advice-card-message">${mainMessage}</div>
                        </div>
                        <div class="advice-card-badge advice-badge-${mainAdvice.type}">${typeLabel}</div>
                        <div class="advice-card-toggle">▼</div>
                    </div>
                    <div class="advice-card-details" style="display: none;">
                        ${items.map((item, idx) => {
                            if (idx === 0) return ''; // Déjà affiché dans le header
                            const message = this.getTranslation(
                                item.messageKey,
                                {},
                                lang,
                                { fr: item.messageKey, en: item.messageKey, ar: item.messageKey }
                            );
                            const itemTypeLabel = this.getTranslation(
                                `coaching.advice.${item.type}`,
                                {},
                                lang,
                                {
                                    retrospective: { fr: 'Rétrospectif', en: 'Retrospective', ar: 'رجعي' },
                                    preventive: { fr: 'Préventif', en: 'Preventive', ar: 'وقائي' },
                                    prescriptive: { fr: 'Prescriptif', en: 'Prescriptive', ar: 'وصفي' }
                                }[item.type] || { fr: item.type, en: item.type, ar: item.type }
                            );
                            return `
                                <div class="advice-detail-item">
                                    <div class="advice-detail-badge advice-badge-${item.type}">${itemTypeLabel}</div>
                                    <div class="advice-detail-message">${message}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Nettoie le DOM du modal
     */
    cleanup() {
        if (this.modalEl) {
            this.modalEl.innerHTML = '';
            this.hide();
        }
    }
}
