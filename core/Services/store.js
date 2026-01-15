/**
 * store.js - Exposition globale de Store
 * 
 * Charge le module Store et l'expose sur window.Store
 */

import Store, { registerHook } from '../store/Store.js';

// Exposer globalement
window.Store = {
    update: Store.update,
    registerHook
};
