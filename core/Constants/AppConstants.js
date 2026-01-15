/**
 * AppConstants.js - Constantes centralisées de l'application
 * 
 * Centralise tous les magic numbers et magic strings pour éviter
 * la duplication et faciliter la maintenance.
 */

// Délais et timeouts
export const MODAL_DELAY_MS = 100;
export const DEFAULT_AUTO_LOCK_DELAY_MS = 60000;
export const AUTO_LOCK_DELAY_30S = 30000;
export const AUTO_LOCK_DELAY_1MIN = 60000;
export const AUTO_LOCK_DELAY_2MIN = 120000;
export const AUTO_LOCK_DELAY_5MIN = 300000;
export const AUTO_LOCK_DELAY_10MIN = 600000;

// Routes
export const ROUTE_SETTINGS = 'settings';
export const ROUTE_HOME = 'home';

// IDs de modales
export const MODAL_ID_DYNAMIC = 'dynamic-modal';

// Langues supportées
export const LANGUAGES = {
    FR: 'fr',
    EN: 'en',
    AR: 'ar'
};

// Religions supportées
export const RELIGIONS = {
    NONE: 'none',
    ISLAM: 'islam',
    CHRISTIANITY: 'christianity',
    JUDAISM: 'judaism',
    BUDDHISM: 'buddhism'
};

// Thèmes
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

// Types d'addictions
export const ADDICTION_IDS = {
    PORN: 'porn',
    CIGARETTE: 'cigarette',
    ALCOHOL: 'alcohol',
    DRUGS: 'drugs',
    SOCIAL_MEDIA: 'social_media',
    GAMING: 'gaming',
    FOOD: 'food',
    SHOPPING: 'shopping',
    GAMBLING: 'gambling'
};

// Modes de coaching
export const COACHING_MODES = {
    OBSERVER: 'observer',
    STABILITY: 'stability',
    GUIDED: 'guided',
    SILENT: 'silent'
};

// Types d'événements
export const EVENT_TYPES = {
    SLOPE: 'slope',
    RELAPSE: 'relapse',
    CRAVING: 'craving',
    CHECKIN: 'checkin',
    EMERGENCY: 'emergency_used'
};
