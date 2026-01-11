/**
 * ifthen.js - Gestion des règles "Si... Alors..."
 * 
 * Fonctionnalités:
 * - CRUD des règles
 * - Templates rapides
 * - Matching engine
 * - Affichage des règles actives
 */

// ============================================
// TEMPLATES DE RÈGLES
// ============================================

const RULE_TEMPLATES = {
    night_alone: {
        id: 'tpl_night_alone',
        name: {
            fr: 'Nuit seul',
            en: 'Night alone',
            ar: 'ليلة وحيد'
        },
        if: {
            timeRange: 'night',
            alone: true
        },
        then: {
            actionIds: ['phone_out_bedroom', 'walk_2min'],
            messageKey: 'rule_night_alone_msg'
        }
    },
    stress_high: {
        id: 'tpl_stress_high',
        name: {
            fr: 'Stress élevé',
            en: 'High stress',
            ar: 'إجهاد عالي'
        },
        if: {
            stressAbove: 7
        },
        then: {
            actionIds: ['shower', 'breathing_446'],
            messageKey: 'rule_stress_high_msg'
        }
    },
    exposure: {
        id: 'tpl_exposure',
        name: {
            fr: 'Après exposition',
            en: 'After exposure',
            ar: 'بعد التعرض'
        },
        if: {
            exposed: true
        },
        then: {
            actionIds: ['close_app', 'leave_room', 'reset'],
            messageKey: 'rule_exposure_msg'
        }
    },
    bed_phone: {
        id: 'tpl_bed_phone',
        name: {
            fr: 'Téléphone au lit',
            en: 'Phone in bed',
            ar: 'الهاتف في السرير'
        },
        if: {
            inBedWithPhone: true
        },
        then: {
            actionIds: ['phone_out_bedroom', 'read_book'],
            messageKey: 'rule_bed_phone_msg'
        }
    },
    boredom: {
        id: 'tpl_boredom',
        name: {
            fr: 'Ennui',
            en: 'Boredom',
            ar: 'ملل'
        },
        if: {
            triggerTag: 'boredom'
        },
        then: {
            actionIds: ['call_friend', 'exercise', 'hobby'],
            messageKey: 'rule_boredom_msg'
        }
    }
};

// Actions suggérées
const ACTIONS = {
    phone_out_bedroom: {
        fr: 'Téléphone hors de la chambre',
        en: 'Phone out of bedroom',
        ar: 'الهاتف خارج الغرفة'
    },
    walk_2min: {
        fr: 'Marcher 2 minutes',
        en: 'Walk for 2 minutes',
        ar: 'المشي لمدة دقيقتين'
    },
    shower: {
        fr: 'Prendre une douche',
        en: 'Take a shower',
        ar: 'الاستحمام'
    },
    breathing_446: {
        fr: 'Respiration 4-4-6',
        en: 'Breathing 4-4-6',
        ar: 'تنفس 4-4-6'
    },
    close_app: {
        fr: 'Fermer l\'application/onglet',
        en: 'Close the app/tab',
        ar: 'إغلاق التطبيق'
    },
    leave_room: {
        fr: 'Quitter la pièce 2 min',
        en: 'Leave the room for 2 min',
        ar: 'مغادرة الغرفة لدقيقتين'
    },
    reset: {
        fr: 'Faire un reset mental',
        en: 'Do a mental reset',
        ar: 'إعادة ضبط ذهني'
    },
    read_book: {
        fr: 'Lire un livre',
        en: 'Read a book',
        ar: 'قراءة كتاب'
    },
    call_friend: {
        fr: 'Appeler un ami',
        en: 'Call a friend',
        ar: 'الاتصال بصديق'
    },
    exercise: {
        fr: 'Faire de l\'exercice',
        en: 'Do some exercise',
        ar: 'ممارسة التمارين'
    },
    hobby: {
        fr: 'Pratiquer un hobby',
        en: 'Practice a hobby',
        ar: 'ممارسة هواية'
    },
    cold_water: {
        fr: 'Eau froide sur le visage',
        en: 'Cold water on face',
        ar: 'ماء بارد على الوجه'
    },
    pushups: {
        fr: 'Faire des pompes',
        en: 'Do push-ups',
        ar: 'تمارين الضغط'
    }
};

// ============================================
// FONCTIONS CRUD
// ============================================

/**
 * Récupère toutes les règles
 * @param {Object} state - State de l'application
 * @returns {Array}
 */
function getRules(state) {
    return state.ifThenRules || [];
}

/**
 * Récupère les règles actives
 * @param {Object} state - State de l'application
 * @returns {Array}
 */
function getActiveRules(state) {
    return getRules(state).filter(r => r.enabled);
}

/**
 * Crée une nouvelle règle à partir d'un template
 * @param {string} templateKey - Clé du template
 * @param {Object} state - State de l'application
 * @returns {Object} La règle créée
 */
function createRuleFromTemplate(templateKey, state) {
    const template = RULE_TEMPLATES[templateKey];
    if (!template) return null;
    
    const lang = state.profile.lang;
    
    const rule = {
        id: Utils.generateId(),
        enabled: true,
        addictionId: 'porn',
        name: template.name[lang] || template.name.fr,
        if: { ...template.if },
        then: { ...template.then }
    };
    
    Storage.saveIfThenRule(state, rule);
    return rule;
}

/**
 * Crée une règle personnalisée
 * @param {Object} ruleData - Données de la règle
 * @param {Object} state - State de l'application
 * @returns {Object} La règle créée
 */
function createCustomRule(ruleData, state) {
    const rule = {
        id: Utils.generateId(),
        enabled: true,
        addictionId: ruleData.addictionId || 'porn',
        name: ruleData.name || '',
        if: ruleData.if || {},
        then: ruleData.then || { actionIds: [] }
    };
    
    Storage.saveIfThenRule(state, rule);
    return rule;
}

/**
 * Met à jour une règle
 * @param {string} ruleId - ID de la règle
 * @param {Object} updates - Mises à jour
 * @param {Object} state - State de l'application
 * @returns {Object|null} La règle mise à jour
 */
function updateRule(ruleId, updates, state) {
    const rules = getRules(state);
    const ruleIndex = rules.findIndex(r => r.id === ruleId);
    
    if (ruleIndex === -1) return null;
    
    const updatedRule = { ...rules[ruleIndex], ...updates };
    Storage.saveIfThenRule(state, updatedRule);
    return updatedRule;
}

/**
 * Active/désactive une règle
 * @param {string} ruleId - ID de la règle
 * @param {boolean} enabled - État souhaité
 * @param {Object} state - State de l'application
 */
function toggleRule(ruleId, enabled, state) {
    return updateRule(ruleId, { enabled }, state);
}

/**
 * Supprime une règle
 * @param {string} ruleId - ID de la règle
 * @param {Object} state - State de l'application
 */
function deleteRule(ruleId, state) {
    Storage.deleteIfThenRule(state, ruleId);
}

// ============================================
// MATCHING ENGINE
// ============================================

/**
 * Trouve les règles qui matchent le contexte actuel
 * @param {Object} state - State de l'application
 * @param {Object} context - Contexte { alone, stress, mood, triggers, ... }
 * @returns {Array} Règles qui matchent
 */
function findMatchingRules(state, context = {}) {
    return Utils.matchIfThenRules(state, context);
}

/**
 * Récupère les actions suggérées pour les règles matchées
 * @param {Array} matchedRules - Règles qui ont matché
 * @param {string} lang - Langue
 * @returns {Array} Actions avec labels
 */
function getActionsFromRules(matchedRules, lang = 'fr') {
    const actionSet = new Set();
    const actions = [];
    
    matchedRules.forEach(rule => {
        (rule.then.actionIds || []).forEach(actionId => {
            if (!actionSet.has(actionId) && ACTIONS[actionId]) {
                actionSet.add(actionId);
                actions.push({
                    id: actionId,
                    label: ACTIONS[actionId][lang] || ACTIONS[actionId].fr
                });
            }
        });
    });
    
    return actions;
}

// ============================================
// RENDU UI
// ============================================

/**
 * Génère le HTML pour le résumé des règles actives (pour Home)
 * @param {Object} state - State de l'application
 * @param {number} maxShow - Nombre max de règles à afficher
 * @returns {string} HTML
 */
function renderRulesSummary(state, maxShow = 3) {
    const lang = state.profile.lang;
    const activeRules = getActiveRules(state);
    
    const labels = {
        fr: { title: 'Règles actives', manage: 'Gérer', noRules: 'Aucune règle active' },
        en: { title: 'Active rules', manage: 'Manage', noRules: 'No active rules' },
        ar: { title: 'القواعد النشطة', manage: 'إدارة', noRules: 'لا توجد قواعد نشطة' }
    };
    
    const l = labels[lang] || labels.fr;
    
    if (activeRules.length === 0) {
        return `
            <div class="rules-summary empty">
                <span class="rules-empty">${l.noRules}</span>
                <button class="btn-small btn-secondary" onclick="IfThen.openRulesModal()">
                    + ${l.manage}
                </button>
            </div>
        `;
    }
    
    const rulesToShow = activeRules.slice(0, maxShow);
    const remaining = activeRules.length - maxShow;
    
    return `
        <div class="rules-summary">
            <div class="rules-header">
                <h4>📋 ${l.title}</h4>
                <button class="btn-small btn-secondary" onclick="IfThen.openRulesModal()">
                    ${l.manage}
                </button>
            </div>
            <ul class="rules-list-mini">
                ${rulesToShow.map(rule => `
                    <li class="rule-item-mini">
                        <span class="rule-name">${rule.name}</span>
                        <span class="rule-status active">✓</span>
                    </li>
                `).join('')}
                ${remaining > 0 ? `<li class="rule-more">+${remaining}</li>` : ''}
            </ul>
        </div>
    `;
}

/**
 * Génère le HTML pour la liste complète des règles (modal)
 * @param {Object} state - State de l'application
 * @returns {string} HTML
 */
function renderRulesList(state) {
    const lang = state.profile.lang;
    const rules = getRules(state);
    
    const labels = {
        fr: { 
            title: 'Mes règles Si... Alors...', 
            addTemplate: 'Ajouter depuis template',
            addCustom: 'Créer une règle',
            empty: 'Aucune règle. Ajoute-en une !'
        },
        en: { 
            title: 'My If... Then... Rules', 
            addTemplate: 'Add from template',
            addCustom: 'Create a rule',
            empty: 'No rules. Add one!'
        },
        ar: { 
            title: 'قواعدي إذا... إذن...', 
            addTemplate: 'إضافة من قالب',
            addCustom: 'إنشاء قاعدة',
            empty: 'لا توجد قواعد. أضف واحدة!'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    return `
        <div class="rules-modal-content">
            <h3>${l.title}</h3>
            
            <div class="rules-actions">
                <button class="btn btn-secondary" onclick="IfThen.showTemplates()">
                    📋 ${l.addTemplate}
                </button>
                <button class="btn btn-secondary" onclick="IfThen.showCustomForm()">
                    ✏️ ${l.addCustom}
                </button>
            </div>
            
            <div class="rules-list" id="rulesList">
                ${rules.length === 0 ? `
                    <p class="empty-message">${l.empty}</p>
                ` : rules.map(rule => renderRuleItem(rule, lang)).join('')}
            </div>
        </div>
    `;
}

/**
 * Génère le HTML pour un item de règle
 * @param {Object} rule - La règle
 * @param {string} lang - Langue
 * @returns {string} HTML
 */
function renderRuleItem(rule, lang = 'fr') {
    const statusClass = rule.enabled ? 'enabled' : 'disabled';
    const toggleLabel = rule.enabled ? '✓' : '○';
    
    // Construire la description "Si... Alors..."
    const ifParts = [];
    if (rule.if.timeRange) ifParts.push(rule.if.timeRange);
    if (rule.if.alone) ifParts.push(lang === 'fr' ? 'seul' : lang === 'ar' ? 'وحيد' : 'alone');
    if (rule.if.stressAbove) ifParts.push(`stress > ${rule.if.stressAbove}`);
    if (rule.if.exposed) ifParts.push(lang === 'fr' ? 'exposé' : lang === 'ar' ? 'معرض' : 'exposed');
    
    const actions = (rule.then.actionIds || [])
        .map(id => ACTIONS[id]?.[lang] || id)
        .slice(0, 2);
    
    return `
        <div class="rule-item ${statusClass}" data-rule-id="${rule.id}">
            <div class="rule-main">
                <button class="rule-toggle" onclick="IfThen.toggle('${rule.id}', ${!rule.enabled})">
                    ${toggleLabel}
                </button>
                <div class="rule-content">
                    <span class="rule-name">${rule.name}</span>
                    <span class="rule-desc">
                        Si: ${ifParts.join(', ') || '—'} → ${actions.join(', ') || '—'}
                    </span>
                </div>
            </div>
            <button class="rule-delete" onclick="IfThen.delete('${rule.id}')">🗑️</button>
        </div>
    `;
}

/**
 * Génère le HTML pour les templates disponibles
 * @param {string} lang - Langue
 * @returns {string} HTML
 */
function renderTemplates(lang = 'fr') {
    const labels = {
        fr: { title: 'Choisir un modèle', back: 'Retour' },
        en: { title: 'Choose a template', back: 'Back' },
        ar: { title: 'اختر قالبًا', back: 'رجوع' }
    };
    
    const l = labels[lang] || labels.fr;
    
    return `
        <div class="templates-list">
            <div class="templates-header">
                <button class="btn-small" onclick="IfThen.openRulesModal()">← ${l.back}</button>
                <h4>${l.title}</h4>
            </div>
            ${Object.entries(RULE_TEMPLATES).map(([key, tpl]) => `
                <button class="template-item" onclick="IfThen.addFromTemplate('${key}')">
                    <span class="template-name">${tpl.name[lang] || tpl.name.fr}</span>
                    <span class="template-add">+</span>
                </button>
            `).join('')}
        </div>
    `;
}

// ============================================
// HANDLERS UI
// ============================================

let rulesModalEl = null;

/**
 * Ouvre le modal des règles
 */
function openRulesModal() {
    if (!rulesModalEl) {
        rulesModalEl = document.createElement('div');
        rulesModalEl.className = 'modal-overlay';
        rulesModalEl.id = 'rulesModal';
        document.body.appendChild(rulesModalEl);
    }
    
    rulesModalEl.innerHTML = `
        <div class="modal-content modal-large">
            <button class="modal-close" onclick="IfThen.closeRulesModal()">×</button>
            ${renderRulesList(state)}
        </div>
    `;
    rulesModalEl.classList.add('active');
}

/**
 * Ferme le modal des règles
 */
function closeRulesModal() {
    if (rulesModalEl) {
        rulesModalEl.classList.remove('active');
    }
}

/**
 * Affiche les templates
 */
function showTemplates() {
    const modalContent = rulesModalEl?.querySelector('.modal-content');
    if (modalContent) {
        const lang = state?.profile?.lang || 'fr';
        modalContent.innerHTML = `
            <button class="modal-close" onclick="IfThen.closeRulesModal()">×</button>
            ${renderTemplates(lang)}
        `;
    }
}

/**
 * Ajoute une règle depuis un template
 */
function addFromTemplate(templateKey) {
    createRuleFromTemplate(templateKey, state);
    openRulesModal(); // Refresh
    
    if (typeof renderHome === 'function') {
        renderHome();
    }
}

/**
 * Toggle une règle
 */
function toggle(ruleId, enabled) {
    toggleRule(ruleId, enabled, state);
    openRulesModal(); // Refresh
    
    if (typeof renderHome === 'function') {
        renderHome();
    }
}

/**
 * Supprime une règle
 */
function deleteRuleHandler(ruleId) {
    const lang = state?.profile?.lang || 'fr';
    const confirmMsg = {
        fr: 'Supprimer cette règle ?',
        en: 'Delete this rule?',
        ar: 'حذف هذه القاعدة؟'
    };
    
    if (confirm(confirmMsg[lang] || confirmMsg.fr)) {
        deleteRule(ruleId, state);
        openRulesModal(); // Refresh
        
        if (typeof renderHome === 'function') {
            renderHome();
        }
    }
}

/**
 * Affiche le formulaire de création personnalisée
 */
function showCustomForm() {
    const lang = state?.profile?.lang || 'fr';
    
    const labels = {
        fr: { 
            title: 'Créer une règle',
            name: 'Nom de la règle',
            condition: 'Condition (Si...)',
            actions: 'Actions (Alors...)',
            save: 'Enregistrer',
            back: 'Retour'
        },
        en: { 
            title: 'Create a rule',
            name: 'Rule name',
            condition: 'Condition (If...)',
            actions: 'Actions (Then...)',
            save: 'Save',
            back: 'Back'
        },
        ar: { 
            title: 'إنشاء قاعدة',
            name: 'اسم القاعدة',
            condition: 'الشرط (إذا...)',
            actions: 'الإجراءات (إذن...)',
            save: 'حفظ',
            back: 'رجوع'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    const modalContent = rulesModalEl?.querySelector('.modal-content');
    if (modalContent) {
        modalContent.innerHTML = `
            <button class="modal-close" onclick="IfThen.closeRulesModal()">×</button>
            <div class="custom-rule-form">
                <div class="form-header">
                    <button class="btn-small" onclick="IfThen.openRulesModal()">← ${l.back}</button>
                    <h4>${l.title}</h4>
                </div>
                
                <div class="form-group">
                    <label>${l.name}</label>
                    <input type="text" id="ruleName" class="input" placeholder="${l.name}">
                </div>
                
                <div class="form-group">
                    <label>${l.condition}</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" id="condNight"> Nuit</label>
                        <label><input type="checkbox" id="condAlone"> Seul</label>
                        <label><input type="checkbox" id="condExposed"> Exposé</label>
                        <label><input type="checkbox" id="condBedPhone"> Téléphone au lit</label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>${l.actions}</label>
                    <div class="checkbox-group">
                        ${Object.entries(ACTIONS).map(([id, labels]) => `
                            <label><input type="checkbox" data-action="${id}"> ${labels[lang] || labels.fr}</label>
                        `).join('')}
                    </div>
                </div>
                
                <button class="btn btn-primary" onclick="IfThen.saveCustomRule()">
                    ${l.save}
                </button>
            </div>
        `;
    }
}

/**
 * Sauvegarde une règle personnalisée
 */
function saveCustomRule() {
    const name = document.getElementById('ruleName')?.value || '';
    if (!name.trim()) {
        alert('Nom requis');
        return;
    }
    
    const conditions = {};
    if (document.getElementById('condNight')?.checked) conditions.timeRange = 'night';
    if (document.getElementById('condAlone')?.checked) conditions.alone = true;
    if (document.getElementById('condExposed')?.checked) conditions.exposed = true;
    if (document.getElementById('condBedPhone')?.checked) conditions.inBedWithPhone = true;
    
    const actionIds = [];
    document.querySelectorAll('[data-action]:checked').forEach(cb => {
        actionIds.push(cb.dataset.action);
    });
    
    createCustomRule({
        name: name.trim(),
        if: conditions,
        then: { actionIds }
    }, state);
    
    openRulesModal();
    
    if (typeof renderHome === 'function') {
        renderHome();
    }
}

// ============================================
// EXPORTS
// ============================================

window.IfThen = {
    // Templates & Actions
    RULE_TEMPLATES,
    ACTIONS,
    
    // CRUD
    getRules,
    getActiveRules,
    createRuleFromTemplate,
    createCustomRule,
    updateRule,
    toggleRule,
    deleteRule,
    
    // Matching
    findMatchingRules,
    getActionsFromRules,
    
    // Render
    renderRulesSummary,
    renderRulesList,
    renderRuleItem,
    renderTemplates,
    
    // UI Handlers
    openRulesModal,
    closeRulesModal,
    showTemplates,
    showCustomForm,
    addFromTemplate,
    toggle,
    delete: deleteRuleHandler,
    saveCustomRule
};
