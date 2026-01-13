/**
 * IfThen Plugin - Point d'entrée
 */

import { IfThenModel } from './model/ifthen-model.js';
import { IfThenView } from './view/ifthen-view.js';
import { IfThenController } from './controller/ifthen-controller.js';
import { RULE_TEMPLATES, ACTIONS } from './data/ifthen-data.js';

// Créer les instances
const ifthenModel = new IfThenModel();
const ifthenView = new IfThenView();
const ifthenController = new IfThenController(ifthenModel, ifthenView);

// Exporter l'API publique
const IfThen = {
    // Templates & Actions
    RULE_TEMPLATES,
    ACTIONS,
    
    // CRUD
    getRules: (state) => ifthenController.getRules(state),
    getActiveRules: (state) => ifthenController.getActiveRules(state),
    createRuleFromTemplate: (templateKey, state) => ifthenController.createRuleFromTemplate(templateKey, state),
    createCustomRule: (ruleData, state) => ifthenController.createCustomRule(ruleData, state),
    updateRule: (ruleId, updates, state) => ifthenController.updateRule(ruleId, updates, state),
    toggleRule: (ruleId, enabled, state) => ifthenController.toggleRule(ruleId, enabled, state),
    deleteRule: (ruleId, state) => ifthenController.deleteRule(ruleId, state),
    
    // Matching
    findMatchingRules: (state, context) => ifthenController.findMatchingRules(state, context),
    getActionsFromRules: (matchedRules, lang) => ifthenController.getActionsFromRules(matchedRules, lang),
    
    // Render
    renderRulesSummary: (state, maxShow) => ifthenController.renderRulesSummary(state, maxShow),
    renderRulesList: (state) => ifthenController.renderRulesList(state),
    renderRuleItem: (rule, lang) => ifthenController.renderRuleItem(rule, lang),
    renderTemplates: (lang) => ifthenController.renderTemplates(lang),
    
    // UI Handlers
    openRulesModal: () => ifthenController.openRulesModal(),
    closeRulesModal: () => ifthenController.closeRulesModal(),
    showTemplates: () => ifthenController.showTemplates(),
    showCustomForm: () => ifthenController.showCustomForm(),
    addFromTemplate: (templateKey) => ifthenController.addFromTemplate(templateKey),
    toggle: (ruleId, enabled) => ifthenController.toggle(ruleId, enabled),
    delete: (ruleId) => ifthenController.deleteHandler(ruleId),
    saveCustomRule: () => ifthenController.saveCustomRule()
};

// Exposer globalement
window.IfThen = IfThen;

export default IfThen;
