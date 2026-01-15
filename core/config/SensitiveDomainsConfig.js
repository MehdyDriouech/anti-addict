/**
 * SensitiveDomainsConfig.js - Configuration des domaines sensibles
 * 
 * Définit les domaines de données qui doivent être chiffrés
 * et/ou retirés du state en mode verrouillé.
 */

/**
 * Configuration des domaines sensibles
 * @type {Array<{key: string, encrypt: boolean, removeWhenLocked: boolean, subKey?: string}>}
 */
export const SENSITIVE_DOMAINS = [
    { key: 'events', encrypt: true, removeWhenLocked: true },
    { key: 'journal', encrypt: true, removeWhenLocked: true },
    { key: 'addictions', encrypt: true, removeWhenLocked: true },
    { key: 'addictionConfigs', encrypt: true, removeWhenLocked: true },
    { key: 'history', encrypt: true, removeWhenLocked: true },
    { key: 'sos', encrypt: true, removeWhenLocked: true },
    { key: 'calendar', encrypt: true, removeWhenLocked: false, subKey: 'cleanDays' }
];
