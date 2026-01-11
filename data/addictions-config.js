/**
 * addictions-config.js - Catalogue des addictions disponibles
 * 
 * Définit les configurations pour toutes les addictions supportées,
 * incluant triggers, slope signals, actions, et règles templates.
 */

// ============================================
// CATALOGUE DES ADDICTIONS
// ============================================

const ADDICTIONS_CATALOG = {
    // Addictions existantes (V1-V3)
    porn: {
        id: 'porn',
        labelKey: 'addiction_porn',
        group: 'digital',
        defaultGoal: 'abstinence',
        riskLevel: 'high',
        triggers: ['alone', 'night', 'boredom', 'stress', 'social_scroll', 'fatigue'],
        slopeSignals: ['soft_images', 'endless_scroll', 'searching', 'incognito', 'justifying', 'isolation'],
        replacementActions: ['leave_room', 'cold_water', 'breathing_446', 'walk_2min', 'call_friend', 'pushups']
    },
    
    cigarette: {
        id: 'cigarette',
        labelKey: 'addiction_cigarette',
        group: 'substance',
        defaultGoal: 'reduce',
        riskLevel: 'medium',
        disclaimerKey: 'disclaimer_cigarette',
        triggers: ['stress', 'routine', 'social', 'boredom', 'fatigue'],
        slopeSignals: ['envie_automatique', 'justification'],
        replacementActions: ['breathing_446', 'drink_water', 'delay_5min', 'walk_2min']
    },
    
    alcohol: {
        id: 'alcohol',
        labelKey: 'addiction_alcohol',
        group: 'substance',
        defaultGoal: 'reduce',
        riskLevel: 'medium',
        disclaimerKey: 'disclaimer_alcohol',
        triggers: ['social', 'stress', 'routine', 'boredom', 'emotions'],
        slopeSignals: ['automatisme', 'pression_sociale'],
        replacementActions: ['refuse_drink', 'leave_situation', 'drink_water', 'call_friend']
    },
    
    drugs: {
        id: 'drugs',
        labelKey: 'addiction_drugs',
        group: 'substance',
        defaultGoal: 'abstinence',
        riskLevel: 'high',
        triggers: ['stress', 'boredom', 'emotions', 'social'],
        slopeSignals: ['justification', 'isolation'],
        replacementActions: ['leave_situation', 'call_friend', 'breathing_446', 'walk_2min']
    },
    
    // Nouvelles addictions (V4)
    social_media: {
        id: 'social_media',
        labelKey: 'addiction_social_media',
        group: 'digital',
        defaultGoal: 'reduce',
        riskLevel: 'low',
        triggers: ['boredom', 'alone', 'stress', 'fatigue', 'procrastination'],
        slopeSignals: ['scroll_infini', 'comparaison_sociale', 'perte_du_temps', 'frustration'],
        replacementActions: ['close_app', 'put_phone_away', 'walk_2min', 'breathing_446']
    },
    
    gaming: {
        id: 'gaming',
        labelKey: 'addiction_gaming',
        group: 'digital',
        defaultGoal: 'reduce',
        riskLevel: 'low',
        triggers: ['frustration', 'boredom', 'escape', 'routine'],
        slopeSignals: ['encore_une_partie', 'colere_defaite', 'oubli_temps', 'negligence'],
        replacementActions: ['pause_5min', 'drink_water', 'stretch', 'quit_game']
    },
    
    food: {
        id: 'food',
        labelKey: 'addiction_food',
        group: 'behavior',
        defaultGoal: 'reduce',
        riskLevel: 'low',
        triggers: ['stress', 'fatigue', 'emotions', 'boredom'],
        slopeSignals: ['grignotage_auto', 'manger_sans_faim', 'compensation'],
        replacementActions: ['drink_water', 'breathing_446', 'wait_10min', 'alternative_activity']
    },
    
    shopping: {
        id: 'shopping',
        labelKey: 'addiction_shopping',
        group: 'behavior',
        defaultGoal: 'reduce',
        riskLevel: 'low',
        triggers: ['boredom', 'emotions', 'promo', 'stress'],
        slopeSignals: ['navigation_nocturne', 'panier', 'justification'],
        replacementActions: ['close_site', 'wait_24h', 'wishlist']
    }
};

// ============================================
// HELPERS
// ============================================

/**
 * Récupère la configuration d'une addiction
 * @param {string} addictionId - ID de l'addiction
 * @returns {Object|null} Configuration ou null si introuvable
 */
function getAddictionConfig(addictionId) {
    return ADDICTIONS_CATALOG[addictionId] || null;
}

/**
 * Récupère tous les IDs d'addictions disponibles
 * @returns {string[]} Liste des IDs
 */
function getAllAddictionIds() {
    return Object.keys(ADDICTIONS_CATALOG);
}

/**
 * Récupère les addictions par groupe
 * @param {string} group - 'digital', 'behavior', ou 'substance'
 * @returns {Object[]} Liste des configurations
 */
function getAddictionsByGroup(group) {
    return Object.values(ADDICTIONS_CATALOG).filter(a => a.group === group);
}

/**
 * Vérifie si une addiction nécessite un disclaimer
 * @param {string} addictionId - ID de l'addiction
 * @returns {boolean}
 */
function hasDisclaimer(addictionId) {
    const config = getAddictionConfig(addictionId);
    return config && config.disclaimerKey ? true : false;
}

/**
 * Récupère les triggers par défaut d'une addiction
 * @param {string} addictionId - ID de l'addiction
 * @returns {string[]} Liste des triggers
 */
function getAddictionTriggers(addictionId) {
    const config = getAddictionConfig(addictionId);
    return config ? config.triggers : [];
}

/**
 * Récupère les actions de remplacement d'une addiction
 * @param {string} addictionId - ID de l'addiction
 * @returns {string[]} Liste des actions
 */
function getAddictionActions(addictionId) {
    const config = getAddictionConfig(addictionId);
    return config ? config.replacementActions : [];
}

// ============================================
// EXPORTS
// ============================================

window.AddictionsConfig = {
    CATALOG: ADDICTIONS_CATALOG,
    getAddictionConfig,
    getAllAddictionIds,
    getAddictionsByGroup,
    hasDisclaimer,
    getAddictionTriggers,
    getAddictionActions
};
