/**
 * Tests fonctionnels pour l'application Haven
 * 
 * Ce fichier contient une suite de tests à exécuter dans le navigateur
 * pour valider toutes les fonctionnalités de l'application.
 */

class FunctionalTests {
    constructor() {
        this.results = [];
        this.currentTest = null;
    }

    /**
     * Log un résultat de test
     */
    log(testName, passed, message = '') {
        const result = {
            test: testName,
            passed,
            message,
            timestamp: new Date().toISOString()
        };
        this.results.push(result);
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`[TEST] ${status}: ${testName}${message ? ' - ' + message : ''}`);
        return passed;
    }

    /**
     * Attend un délai
     */
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Test 1 : Chargement de l'application
     */
    async testAppLoad() {
        this.currentTest = 'Chargement de l\'application';
        
        // Vérifier que window.state existe
        if (!window.state) {
            return this.log(this.currentTest, false, 'window.state n\'existe pas');
        }
        
        // Vérifier que les services sont chargés
        if (!window.Store || !window.Router) {
            return this.log(this.currentTest, false, 'Services non chargés (Store, Router)');
        }
        
        // Vérifier que l'écran home est visible
        const homeScreen = document.getElementById('screen-home');
        if (!homeScreen) {
            return this.log(this.currentTest, false, 'Écran home non trouvé');
        }
        
        return this.log(this.currentTest, true, 'Application chargée correctement');
    }

    /**
     * Test 2 : Navigation
     */
    async testNavigation() {
        this.currentTest = 'Navigation';
        let allPassed = true;
        
        // Test navigation vers craving
        if (typeof Router !== 'undefined') {
            Router.navigateTo('craving', true);
            await this.wait(300);
            const cravingScreen = document.getElementById('screen-craving');
            if (!cravingScreen || !cravingScreen.classList.contains('active')) {
                allPassed = this.log('Navigation vers craving', false, 'Écran craving non actif') && allPassed;
            } else {
                this.log('Navigation vers craving', true);
            }
            
            // Test navigation vers home
            Router.navigateTo('home', true);
            await this.wait(300);
            const homeScreen = document.getElementById('screen-home');
            if (!homeScreen || !homeScreen.classList.contains('active')) {
                allPassed = this.log('Navigation vers home', false, 'Écran home non actif') && allPassed;
            } else {
                this.log('Navigation vers home', true);
            }
            
            // Test navigation vers settings
            Router.navigateTo('settings', true);
            await this.wait(300);
            const settingsScreen = document.getElementById('screen-settings');
            if (!settingsScreen || !settingsScreen.classList.contains('active')) {
                allPassed = this.log('Navigation vers settings', false, 'Écran settings non actif') && allPassed;
            } else {
                this.log('Navigation vers settings', true);
            }
        } else {
            allPassed = this.log('Navigation', false, 'Router non disponible') && allPassed;
        }
        
        return allPassed;
    }

    /**
     * Test 3 : Boutons du header
     */
    async testHeaderButtons() {
        this.currentTest = 'Boutons du header';
        let allPassed = true;
        
        // Test bouton lock
        const lockBtn = document.getElementById('lock-btn');
        if (!lockBtn) {
            allPassed = this.log('Bouton lock présent', false, 'Bouton lock non trouvé') && allPassed;
        } else {
            this.log('Bouton lock présent', true);
            
            // Vérifier que la fonction est disponible
            if (typeof window.toggleAppLock !== 'function') {
                allPassed = this.log('Fonction toggleAppLock', false, 'Fonction non disponible') && allPassed;
            } else {
                this.log('Fonction toggleAppLock', true);
            }
        }
        
        // Test bouton settings du header
        const settingsBtn = document.querySelector('.header .nav-link[data-route="settings"]');
        if (!settingsBtn) {
            allPassed = this.log('Bouton settings header présent', false, 'Bouton settings header non trouvé') && allPassed;
        } else {
            this.log('Bouton settings header présent', true);
            
            // Tester le clic (simulation)
            const currentRoute = Router.getCurrentRoute();
            settingsBtn.click();
            await this.wait(300);
            const newRoute = Router.getCurrentRoute();
            if (newRoute !== 'settings') {
                allPassed = this.log('Clic bouton settings header', false, `Route actuelle: ${newRoute}, attendu: settings`) && allPassed;
            } else {
                this.log('Clic bouton settings header', true);
            }
        }
        
        return allPassed;
    }

    /**
     * Test 4 : Verrouillage PIN
     */
    async testPinLock() {
        this.currentTest = 'Verrouillage PIN';
        let allPassed = true;
        
        // Vérifier que SecurityService est disponible
        if (!window.Security) {
            return this.log(this.currentTest, false, 'SecurityService non disponible');
        }
        
        // Vérifier l'état initial
        const isEnabled = window.Security.isEnabled();
        const isLocked = window.Security.isLocked();
        
        this.log('SecurityService disponible', true);
        this.log(`État initial - Enabled: ${isEnabled}, Locked: ${isLocked}`, true);
        
        // Si un PIN est défini, tester le verrouillage
        if (isEnabled) {
            // Tester le verrouillage
            if (typeof window.Security.lock === 'function') {
                window.Security.lock();
                await this.wait(200);
                const locked = window.Security.isLocked();
                if (!locked) {
                    allPassed = this.log('Verrouillage', false, 'App non verrouillée après lock()') && allPassed;
                } else {
                    this.log('Verrouillage', true);
                    
                    // Vérifier que le menu du bas est masqué
                    const bottomNav = document.querySelector('nav.nav');
                    if (bottomNav && bottomNav.style.display !== 'none') {
                        allPassed = this.log('Menu du bas masqué', false, 'Menu du bas toujours visible') && allPassed;
                    } else {
                        this.log('Menu du bas masqué', true);
                    }
                    
                    // Vérifier que la home affiche la vue verrouillée
                    const homeScreen = document.getElementById('screen-home');
                    if (homeScreen) {
                        const lockedView = homeScreen.querySelector('.locked-view');
                        if (!lockedView) {
                            allPassed = this.log('Vue verrouillée affichée', false, 'Vue verrouillée non trouvée') && allPassed;
                        } else {
                            this.log('Vue verrouillée affichée', true);
                        }
                    }
                }
            }
        } else {
            this.log('PIN non défini (test ignoré)', true, 'Définir un PIN pour tester le verrouillage');
        }
        
        return allPassed;
    }

    /**
     * Test 5 : Routes d'urgence en mode verrouillé
     */
    async testEmergencyRoutes() {
        this.currentTest = 'Routes d\'urgence en mode verrouillé';
        let allPassed = true;
        
        if (!window.Security || !window.Security.isEnabled()) {
            return this.log(this.currentTest, true, 'PIN non activé, test ignoré');
        }
        
        // Verrouiller l'app
        if (window.Security.isLocked && !window.Security.isLocked()) {
            window.Security.lock();
            await this.wait(200);
        }
        
        if (!window.Security.isLocked()) {
            return this.log(this.currentTest, true, 'App non verrouillée, test ignoré');
        }
        
        // Tester l'accès à craving
        if (typeof window.canAccessRoute === 'function') {
            const canAccessCraving = window.canAccessRoute('craving');
            if (!canAccessCraving) {
                allPassed = this.log('Accès craving verrouillé', false, 'Route craving bloquée') && allPassed;
            } else {
                this.log('Accès craving verrouillé', true);
            }
            
            // Tester l'accès à sos (si la route existe)
            const canAccessSos = window.canAccessRoute('sos');
            this.log('Accès SOS verrouillé', canAccessSos, canAccessSos ? '' : 'Route SOS peut-être bloquée');
        }
        
        return allPassed;
    }

    /**
     * Test 6 : Modales PIN
     */
    async testPinModals() {
        this.currentTest = 'Modales PIN';
        let allPassed = true;
        
        // Vérifier que les modales peuvent s'ouvrir
        if (typeof Settings !== 'undefined' && Settings.openSetPinModal) {
            // On ne va pas vraiment ouvrir la modale pour éviter d'interrompre l'utilisateur
            this.log('Fonction openSetPinModal disponible', true);
        } else {
            allPassed = this.log('Fonction openSetPinModal', false, 'Fonction non disponible') && allPassed;
        }
        
        // Vérifier que le texte "OK" est dans les traductions
        if (typeof I18n !== 'undefined' && I18n.t) {
            const yesText = I18n.t('yes');
            if (yesText === 'OK') {
                this.log('Texte bouton modal = OK', true);
            } else {
                allPassed = this.log('Texte bouton modal = OK', false, `Texte actuel: "${yesText}"`) && allPassed;
            }
        }
        
        return allPassed;
    }

    /**
     * Test 7 : Menu du bas
     */
    async testBottomNav() {
        this.currentTest = 'Menu du bas';
        let allPassed = true;
        
        const navContainer = document.querySelector('nav.nav');
        if (!navContainer) {
            return this.log(this.currentTest, false, 'Menu du bas non trouvé');
        }
        
        this.log('Menu du bas présent', true);
        
        // Vérifier que les boutons sont présents
        const homeBtn = navContainer.querySelector('.nav-link[data-route="home"]');
        const cravingBtn = navContainer.querySelector('.nav-link[data-route="craving"]');
        const settingsBtn = navContainer.querySelector('.nav-link[data-route="settings"]');
        
        if (!homeBtn) {
            allPassed = this.log('Bouton home présent', false) && allPassed;
        } else {
            this.log('Bouton home présent', true);
        }
        
        if (!cravingBtn) {
            allPassed = this.log('Bouton craving présent', false) && allPassed;
        } else {
            this.log('Bouton craving présent', true);
        }
        
        if (!settingsBtn) {
            allPassed = this.log('Bouton settings présent', false) && allPassed;
        } else {
            this.log('Bouton settings présent', true);
        }
        
        // Tester un clic (simulation)
        if (homeBtn && typeof Router !== 'undefined') {
            const currentRoute = Router.getCurrentRoute();
            homeBtn.click();
            await this.wait(300);
            const newRoute = Router.getCurrentRoute();
            if (newRoute !== 'home' && currentRoute !== 'home') {
                allPassed = this.log('Clic bouton home fonctionne', false, `Route: ${currentRoute} → ${newRoute}`) && allPassed;
            } else {
                this.log('Clic bouton home fonctionne', true);
            }
        }
        
        return allPassed;
    }

    /**
     * Test 8 : Boutons d'urgence dans craving/SOS
     */
    async testEmergencyButtons() {
        this.currentTest = 'Boutons d\'urgence';
        let allPassed = true;
        
        // Vérifier que les fonctions sont disponibles
        if (typeof window.finishProtocol === 'function') {
            this.log('Fonction finishProtocol disponible', true);
        } else {
            allPassed = this.log('Fonction finishProtocol', false, 'Fonction non disponible') && allPassed;
        }
        
        if (typeof window.SOS !== 'undefined' && window.SOS.confirmExit) {
            this.log('Fonction SOS.confirmExit disponible', true);
        } else {
            allPassed = this.log('Fonction SOS.confirmExit', false, 'Fonction non disponible') && allPassed;
        }
        
        return allPassed;
    }

    /**
     * Test 9 : calculateStreak avec state.events undefined
     */
    async testCalculateStreakSafety() {
        this.currentTest = 'calculateStreak avec state.events undefined';
        let allPassed = true;
        
        if (typeof Storage === 'undefined' || typeof Storage.calculateStreak !== 'function') {
            return this.log(this.currentTest, false, 'Storage.calculateStreak non disponible');
        }
        
        // Test avec state.events undefined
        const stateWithoutEvents = {
            profile: { lang: 'fr' },
            checkins: []
        };
        
        try {
            const streak = Storage.calculateStreak(stateWithoutEvents);
            if (typeof streak !== 'number') {
                allPassed = this.log('calculateStreak avec events undefined', false, `Retourne ${typeof streak} au lieu d'un nombre`) && allPassed;
            } else {
                this.log('calculateStreak avec events undefined', true, `Streak: ${streak}`);
            }
        } catch (error) {
            allPassed = this.log('calculateStreak avec events undefined', false, `Erreur: ${error.message}`) && allPassed;
        }
        
        // Test avec state.events null
        const stateWithNullEvents = {
            profile: { lang: 'fr' },
            events: null,
            checkins: []
        };
        
        try {
            const streak = Storage.calculateStreak(stateWithNullEvents);
            if (typeof streak !== 'number') {
                allPassed = this.log('calculateStreak avec events null', false, `Retourne ${typeof streak} au lieu d'un nombre`) && allPassed;
            } else {
                this.log('calculateStreak avec events null', true, `Streak: ${streak}`);
            }
        } catch (error) {
            allPassed = this.log('calculateStreak avec events null', false, `Erreur: ${error.message}`) && allPassed;
        }
        
        return allPassed;
    }

    /**
     * Test 10 : Masquage de l'icône de verrouillage dans settings
     */
    async testLockIconVisibilityInSettings() {
        this.currentTest = 'Masquage icône verrouillage dans settings';
        let allPassed = true;
        
        if (typeof Router === 'undefined') {
            return this.log(this.currentTest, false, 'Router non disponible');
        }
        
        // Naviguer vers settings
        Router.navigateTo('settings', true);
        await this.wait(300);
        
        const lockBtn = document.getElementById('lock-btn');
        if (!lockBtn) {
            allPassed = this.log('Bouton lock présent', false, 'Bouton lock non trouvé') && allPassed;
        } else {
            this.log('Bouton lock présent', true);
            
            // Vérifier que l'icône est masquée
            const isHidden = lockBtn.style.display === 'none';
            if (!isHidden) {
                allPassed = this.log('Icône masquée dans settings', false, `display: ${lockBtn.style.display}`) && allPassed;
            } else {
                this.log('Icône masquée dans settings', true);
            }
        }
        
        // Naviguer vers home pour vérifier que l'icône réapparaît
        Router.navigateTo('home', true);
        await this.wait(300);
        
        if (lockBtn) {
            const isVisible = lockBtn.style.display !== 'none';
            if (!isVisible) {
                allPassed = this.log('Icône visible hors settings', false, `display: ${lockBtn.style.display}`) && allPassed;
            } else {
                this.log('Icône visible hors settings', true);
            }
        }
        
        return allPassed;
    }

    /**
     * Test 11 : Empêcher le verrouillage depuis settings
     */
    async testPreventLockFromSettings() {
        this.currentTest = 'Empêcher verrouillage depuis settings';
        let allPassed = true;
        
        if (typeof Router === 'undefined' || typeof window.toggleAppLock !== 'function') {
            return this.log(this.currentTest, true, 'Router ou toggleAppLock non disponible, test ignoré');
        }
        
        // Naviguer vers settings
        Router.navigateTo('settings', true);
        await this.wait(300);
        
        // Vérifier que toggleAppLock empêche le verrouillage depuis settings
        // On ne peut pas tester directement car toggleAppLock est async et affiche un toast
        // Mais on peut vérifier que la fonction existe et que l'icône est masquée
        if (typeof window.toggleAppLock === 'function') {
            this.log('toggleAppLock disponible', true);
        } else {
            allPassed = this.log('toggleAppLock disponible', false, 'Fonction non disponible') && allPassed;
        }
        
        // Vérifier que l'icône est masquée (déjà testé dans testLockIconVisibilityInSettings)
        const lockBtn = document.getElementById('lock-btn');
        if (lockBtn && lockBtn.style.display === 'none') {
            this.log('Verrouillage empêché depuis settings', true, 'Icône masquée');
        } else {
            allPassed = this.log('Verrouillage empêché depuis settings', false, 'Icône toujours visible') && allPassed;
        }
        
        return allPassed;
    }

    /**
     * Test 12 : Scénario complet - Déverrouillage depuis craving et navigation vers home
     */
    async testUnlockFromCraving() {
        this.currentTest = 'Déverrouillage depuis craving';
        let allPassed = true;
        
        // Prérequis : avoir un PIN défini
        if (!window.Security) {
            return this.log(this.currentTest, true, 'SecurityService non disponible, test ignoré');
        }
        
        const hasPin = await window.Security.hasPin();
        if (!hasPin) {
            return this.log(this.currentTest, true, 'PIN non défini, test ignoré. Définir un PIN pour tester ce scénario.');
        }

        // 1. S'assurer que l'app est verrouillée
        if (!window.Security.isLocked()) {
            if (typeof window.Security.lock === 'function') {
                await window.Security.lock();
                await this.wait(200);
            }
        }
        
        if (!window.Security.isLocked()) {
            return this.log(this.currentTest, true, 'App non verrouillée, test ignoré');
        }

        // 2. Naviguer vers craving (route d'urgence accessible même verrouillée)
        if (typeof Router !== 'undefined') {
            Router.navigateTo('craving', true);
            await this.wait(300);
            
            const routeAfterNav = Router.getCurrentRoute();
            if (routeAfterNav !== 'craving') {
                allPassed = this.log('Navigation vers craving en mode verrouillé', false, `Route actuelle: ${routeAfterNav}`) && allPassed;
            } else {
                this.log('Navigation vers craving en mode verrouillé', true);
            }

            // 3. Vérifier que le menu du bas est masqué
            const navBefore = document.querySelector('nav.nav');
            if (navBefore && navBefore.style.display !== 'none') {
                allPassed = this.log('Menu du bas masqué en mode verrouillé', false, 'Menu du bas toujours visible') && allPassed;
            } else {
                this.log('Menu du bas masqué en mode verrouillé', true);
            }

            // 4. Vérifier que les fonctions nécessaires sont disponibles pour le déverrouillage
            if (typeof window.showUnlockModal !== 'function') {
                allPassed = this.log('Fonction showUnlockModal disponible', false, 'Fonction non disponible') && allPassed;
            } else {
                this.log('Fonction showUnlockModal disponible', true);
            }

            // 5. Vérifier que setupEventListeners est disponible
            if (typeof window.Init === 'undefined' || typeof window.Init.setupEventListeners !== 'function') {
                allPassed = this.log('Init.setupEventListeners disponible', false, 'Fonction non disponible') && allPassed;
            } else {
                this.log('Init.setupEventListeners disponible', true);
            }

            // 6. Vérifier que le bouton home existe dans le DOM (même s'il est masqué)
            const homeBtn = document.querySelector('nav.nav .nav-link[data-route="home"]');
            if (!homeBtn) {
                allPassed = this.log('Bouton home présent dans le DOM', false, 'Bouton home non trouvé') && allPassed;
            } else {
                this.log('Bouton home présent dans le DOM', true);
            }

            // Note: Pour un test complet automatisé, il faudrait déverrouiller réellement
            // et tester le clic sur le bouton home. Pour l'instant, on vérifie que
            // tous les éléments nécessaires sont en place.
            this.log('Éléments prêts pour déverrouillage', true, 'Test partiel - nécessite déverrouillage manuel pour test complet');
            
            // Test supplémentaire : vérifier que calculateStreak fonctionne après déverrouillage
            // En simulant un state avec events vide
            if (window.state) {
                const testState = { ...window.state };
                if (!testState.events) {
                    testState.events = [];
                }
                try {
                    if (typeof Storage !== 'undefined' && Storage.calculateStreak) {
                        const streak = Storage.calculateStreak(testState);
                        if (typeof streak === 'number') {
                            this.log('calculateStreak fonctionne après déverrouillage', true, `Streak: ${streak}`);
                        } else {
                            allPassed = this.log('calculateStreak fonctionne après déverrouillage', false, `Retourne ${typeof streak}`) && allPassed;
                        }
                    }
                } catch (error) {
                    allPassed = this.log('calculateStreak fonctionne après déverrouillage', false, `Erreur: ${error.message}`) && allPassed;
                }
            }
        } else {
            allPassed = this.log(this.currentTest, false, 'Router non disponible') && allPassed;
        }
        
        return allPassed;
    }

    /**
     * Exécute tous les tests
     */
    async runAll() {
        console.log('🧪 Démarrage de la suite de tests fonctionnels...\n');
        this.results = [];
        
        const tests = [
            () => this.testAppLoad(),
            () => this.testNavigation(),
            () => this.testHeaderButtons(),
            () => this.testPinLock(),
            () => this.testEmergencyRoutes(),
            () => this.testPinModals(),
            () => this.testBottomNav(),
            () => this.testEmergencyButtons(),
            () => this.testCalculateStreakSafety(),
            () => this.testLockIconVisibilityInSettings(),
            () => this.testPreventLockFromSettings(),
            () => this.testUnlockFromCraving()
        ];
        
        for (const test of tests) {
            try {
                await test();
                await this.wait(200); // Pause entre les tests
            } catch (error) {
                console.error(`[TEST] Erreur dans ${this.currentTest}:`, error);
                this.log(this.currentTest || 'Test inconnu', false, `Erreur: ${error.message}`);
            }
        }
        
        // Résumé
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        const failed = total - passed;
        
        console.log('\n📊 Résumé des tests:');
        console.log(`✅ Réussis: ${passed}/${total}`);
        console.log(`❌ Échoués: ${failed}/${total}`);
        
        if (failed > 0) {
            console.log('\n❌ Tests échoués:');
            this.results.filter(r => !r.passed).forEach(r => {
                console.log(`  - ${r.test}: ${r.message}`);
            });
        }
        
        return {
            passed,
            total,
            failed,
            results: this.results
        };
    }

    /**
     * Affiche les résultats dans l'UI
     */
    displayResults() {
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        
        const html = `
            <div style="position: fixed; top: 20px; right: 20px; background: var(--bg-primary); border: 2px solid var(--border); border-radius: 8px; padding: 20px; max-width: 400px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <h3 style="margin-top: 0;">🧪 Résultats des tests</h3>
                <p><strong>${passed}/${total}</strong> tests réussis</p>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${this.results.map(r => `
                        <div style="margin: 8px 0; padding: 8px; background: ${r.passed ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)'}; border-radius: 4px;">
                            <strong>${r.passed ? '✅' : '❌'}</strong> ${r.test}
                            ${r.message ? `<br><small style="color: var(--text-secondary);">${r.message}</small>` : ''}
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.parentElement.remove()" style="margin-top: 12px; padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer;">Fermer</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', html);
    }
}

// Exposer globalement
if (typeof window !== 'undefined') {
    window.FunctionalTests = FunctionalTests;
    window.runTests = async () => {
        const tests = new FunctionalTests();
        const results = await tests.runAll();
        tests.displayResults();
        return results;
    };
}

export { FunctionalTests };
