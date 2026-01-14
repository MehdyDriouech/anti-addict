/**
 * debug.js - Exposition globale du harness de test
 */

import EmergencyTest from './debug/emergency-test.js';

// Exposer globalement si en mode debug
if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const isDebug = urlParams.get('debug') === '1' || window.location.hash === '#debug';
    
    if (isDebug) {
        window.EmergencyTest = EmergencyTest;
    }
}
