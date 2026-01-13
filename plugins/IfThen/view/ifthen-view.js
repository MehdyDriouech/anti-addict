/**
 * IfThen View - Rendu HTML
 */

import { RULE_TEMPLATES, ACTIONS, LABELS } from '../data/ifthen-data.js';

export class IfThenView {
    constructor() {
        this.modalEl = null;
    }

    /**
     * Crée l'élément modal
     * @returns {HTMLElement}
     */
    createModalElement() {
        if (!this.modalEl) {
            this.modalEl = document.createElement('div');
            this.modalEl.className = 'modal-overlay';
            this.modalEl.id = 'rulesModal';
            document.body.appendChild(this.modalEl);
        }
        return this.modalEl;
    }

    getModalElement() {
        return this.modalEl;
    }

    show() {
        if (this.modalEl) this.modalEl.classList.add('active');
    }

    hide() {
        if (this.modalEl) this.modalEl.classList.remove('active');
    }

    /**
     * Génère le HTML pour le résumé des règles actives (pour Home)
     * @param {Array} activeRules - Règles actives
     * @param {string} lang - Langue
     * @param {number} maxShow - Nombre max de règles à afficher
     * @returns {string} HTML
     */
    renderRulesSummary(activeRules, lang, maxShow = 3) {
        const l = LABELS[lang] || LABELS.fr;
        
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
     * Rendu de la liste complète des règles (modal)
     * @param {Array} rules - Toutes les règles
     * @param {string} lang - Langue
     */
    renderRulesList(rules, lang) {
        const l = LABELS[lang] || LABELS.fr;
        
        this.modalEl.innerHTML = `
            <div class="modal-content modal-large">
                <button class="modal-close" onclick="IfThen.closeRulesModal()">×</button>
                <div class="rules-modal-content">
                    <h3>${l.modalTitle}</h3>
                    
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
                        ` : rules.map(rule => this.renderRuleItem(rule, lang)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Rendu d'un item de règle
     * @param {Object} rule - La règle
     * @param {string} lang - Langue
     * @returns {string} HTML
     */
    renderRuleItem(rule, lang = 'fr') {
        const statusClass = rule.enabled ? 'enabled' : 'disabled';
        const toggleLabel = rule.enabled ? '✓' : '○';
        
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
     * Rendu des templates disponibles
     * @param {string} lang - Langue
     */
    renderTemplates(lang) {
        const l = LABELS[lang] || LABELS.fr;
        
        const modalContent = this.modalEl.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = `
                <button class="modal-close" onclick="IfThen.closeRulesModal()">×</button>
                <div class="templates-list">
                    <div class="templates-header">
                        <button class="btn-small" onclick="IfThen.openRulesModal()">← ${l.back}</button>
                        <h4>${l.chooseTemplate}</h4>
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
    }

    /**
     * Rendu du formulaire personnalisé
     * @param {string} lang - Langue
     */
    renderCustomForm(lang) {
        const l = LABELS[lang] || LABELS.fr;
        
        const modalContent = this.modalEl.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = `
                <button class="modal-close" onclick="IfThen.closeRulesModal()">×</button>
                <div class="custom-rule-form">
                    <div class="form-header">
                        <button class="btn-small" onclick="IfThen.openRulesModal()">← ${l.back}</button>
                        <h4>${l.createRule}</h4>
                    </div>
                    
                    <div class="form-group">
                        <label>${l.ruleName}</label>
                        <input type="text" id="ruleName" class="input" placeholder="${l.ruleName}">
                    </div>
                    
                    <div class="form-group">
                        <label>${l.condition}</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" id="condNight"> ${l.condNight}</label>
                            <label><input type="checkbox" id="condAlone"> ${l.condAlone}</label>
                            <label><input type="checkbox" id="condExposed"> ${l.condExposed}</label>
                            <label><input type="checkbox" id="condBedPhone"> ${l.condBedPhone}</label>
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
}
