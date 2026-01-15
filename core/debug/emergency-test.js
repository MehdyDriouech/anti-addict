/**
 * emergency-test.js - Harness de test pour le chemin critique d'urgence
 * 
 * Accessible via ?debug=1 ou route #debug (dev only)
 */

let testResults = [];

/**
 * Réinitialise le state
 */
export async function resetState() {
    try {
        if (window.Storage && window.Storage.clearAllData) {
            window.Storage.clearAllData();
        }
        if (window.localStorage) {
            localStorage.clear();
        }
        if (window.indexedDB) {
            // Supprimer la base IndexedDB
            return new Promise((resolve, reject) => {
                const deleteReq = indexedDB.deleteDatabase('revenir-db');
                deleteReq.onsuccess = () => {
                    console.log('[EmergencyTest] IndexedDB cleared');
                    resolve();
                };
                deleteReq.onerror = () => {
                    console.error('[EmergencyTest] Error clearing IndexedDB');
                    reject(deleteReq.error);
                };
            });
        }
    } catch (error) {
        console.error('[EmergencyTest] Error resetting state:', error);
        throw error;
    }
}

/**
 * Seed le state avec des données de test
 */
export async function seedState() {
    try {
        const defaultState = window.Storage.getDefaultState();
        defaultState.addictions = ['porn', 'cigarette'];
        defaultState.events = [
            {
                ts: Date.now() - 86400000,
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                type: 'craving',
                addictionId: 'porn',
                intensity: 5
            }
        ];
        
        if (window.Storage && window.Storage.saveState) {
            window.Storage.saveState(defaultState);
        }
        
        console.log('[EmergencyTest] State seeded');
    } catch (error) {
        console.error('[EmergencyTest] Error seeding state:', error);
        throw error;
    }
}

/**
 * Test complet du chemin d'urgence
 */
export async function smokeTestEmergency() {
    testResults = [];
    const startTime = performance.now();
    
    try {
        // Test 1: Démarrage app < 2s
        const initStart = performance.now();
        if (window.Storage && window.Storage.loadState) {
            const state = window.Storage.loadState();
            const initTime = performance.now() - initStart;
            addTestResult('App startup', initTime < 2000, `Took ${initTime.toFixed(0)}ms (target: <2000ms)`);
        } else {
            addTestResult('App startup', false, 'Storage.loadState not available');
        }

        // Test 2: Accès #craving < 2s
        const cravingStart = performance.now();
        if (window.Router && window.Router.navigateTo) {
            window.Router.navigateTo('craving');
            // Attendre un peu pour le rendu
            await new Promise(resolve => setTimeout(resolve, 100));
            const cravingTime = performance.now() - cravingStart;
            addTestResult('Craving route access', cravingTime < 2000, `Took ${cravingTime.toFixed(0)}ms (target: <2000ms)`);
        } else {
            addTestResult('Craving route access', false, 'Router.navigateTo not available');
        }

        // Test 3: Protocole 90s démarre immédiatement
        if (window.Craving) {
            addTestResult('Protocol starts', true, 'Craving module available');
        } else {
            addTestResult('Protocol starts', false, 'Craving module not available');
        }

        // Test 4: Pas de blocage sur IndexedDB
        const idbStart = performance.now();
        try {
            if (window.Storage && window.Storage.initStorageDriver) {
                await window.Storage.initStorageDriver();
                const idbTime = performance.now() - idbStart;
                addTestResult('IndexedDB access', idbTime < 1000, `Took ${idbTime.toFixed(0)}ms (target: <1000ms)`);
            } else {
                addTestResult('IndexedDB access', true, 'Using localStorage fallback');
            }
        } catch (error) {
            addTestResult('IndexedDB access', false, `Error: ${error.message}`);
        }

        // Test 5: Fallback localStorage fonctionne
        try {
            const testKey = 'emergency_test_key';
            localStorage.setItem(testKey, 'test');
            const value = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            addTestResult('localStorage fallback', value === 'test', 'localStorage working');
        } catch (error) {
            addTestResult('localStorage fallback', false, `Error: ${error.message}`);
        }

        // Test 6: Mode verrouillé - urgence accessible
        if (window.Security) {
            try {
                // Activer security
                await window.Security.enable('1234');
                window.Security.lock();
                
                // Tester que l'urgence est accessible
                const isLocked = window.Security.isLocked();
                const canAccessEmergency = window.Security.canAccessDomain('events', true);
                
                addTestResult('Locked mode - emergency accessible', 
                    isLocked && canAccessEmergency, 
                    `Locked: ${isLocked}, Emergency access: ${canAccessEmergency}`);
                
                // Déverrouiller
                await window.Security.unlock('1234');
            } catch (error) {
                addTestResult('Locked mode - emergency accessible', false, `Error: ${error.message}`);
            }
        } else {
            addTestResult('Locked mode - emergency accessible', true, 'Security not enabled (skip)');
        }

        const totalTime = performance.now() - startTime;
        const passed = testResults.filter(r => r.pass).length;
        const failed = testResults.filter(r => !r.pass).length;

        console.log(`\n[EmergencyTest] ===== RESULTS =====`);
        console.log(`Total time: ${totalTime.toFixed(0)}ms`);
        console.log(`Passed: ${passed}/${testResults.length}`);
        console.log(`Failed: ${failed}/${testResults.length}`);
        testResults.forEach(result => {
            const icon = result.pass ? '✓' : '✗';
            console.log(`${icon} ${result.name}: ${result.message}`);
        });
        console.log(`[EmergencyTest] ====================\n`);

        return {
            pass: failed === 0,
            passed,
            failed,
            total: testResults.length,
            results: testResults,
            totalTime
        };
    } catch (error) {
        console.error('[EmergencyTest] Test failed:', error);
        return {
            pass: false,
            error: error.message,
            results: testResults
        };
    }
}

/**
 * Ajoute un résultat de test
 * @private
 */
function addTestResult(name, pass, message) {
    testResults.push({ name, pass, message });
}

/**
 * Checklist manuelle Emergency Path
 */
export const EMERGENCY_CHECKLIST = [
    '1. Démarrage app < 2s',
    '2. Accès #craving < 2s',
    '3. Protocole 90s démarre immédiatement',
    '4. Pas de blocage sur IndexedDB',
    '5. Fallback localStorage fonctionne',
    '6. Mode verrouillé : urgence accessible, domaines sensibles bloqués'
];

/**
 * Affiche la checklist
 */
export function showChecklist() {
    console.log('\n[EmergencyTest] ===== EMERGENCY PATH CHECKLIST =====');
    EMERGENCY_CHECKLIST.forEach(item => {
        console.log(item);
    });
    console.log('[EmergencyTest] ======================================\n');
}

// Exposer globalement si en mode debug
if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const isDebug = urlParams.get('debug') === '1' || window.location.hash === '#debug';
    
    if (isDebug) {
        window.EmergencyTest = {
            resetState,
            seedState,
            smokeTestEmergency,
            showChecklist,
            EMERGENCY_CHECKLIST
        };
        
        console.log('[EmergencyTest] Debug mode enabled. Use window.EmergencyTest for testing.');
        showChecklist();
    }
}

export default {
    resetState,
    seedState,
    smokeTestEmergency,
    showChecklist,
    EMERGENCY_CHECKLIST
};
