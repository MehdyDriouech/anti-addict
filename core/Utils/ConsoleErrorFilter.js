/**
 * ConsoleErrorFilter.js - Filtre pour ignorer les erreurs d'extensions de navigateur
 * 
 * Extrait la logique de filtrage des erreurs d'extensions de app.js
 * pour améliorer la maintenabilité et la testabilité.
 */

/**
 * Classe de base pour les règles de détection d'erreurs d'extensions
 */
class ErrorRule {
    matches(message, source, error) {
        return false;
    }
}

/**
 * Règle pour détecter les erreurs "deref"
 */
class DerefErrorRule extends ErrorRule {
    matches(message, source, error) {
        const combined = (message + ' ' + source + ' ' + (error?.stack || '')).toLowerCase();
        return combined.includes('deref') || 
               message.includes('Cannot read properties of null (reading \'deref\')') ||
               message.includes('Cannot read property \'deref\'') ||
               /\.deref\s*\(/.test(message);
    }
}

/**
 * Règle pour détecter les erreurs MutationObserver
 */
class MutationObserverErrorRule extends ErrorRule {
    matches(message, source, error) {
        const combined = (message + ' ' + source + ' ' + (error?.stack || '')).toLowerCase();
        return combined.includes('mutationobserver');
    }
}

/**
 * Règle pour détecter les erreurs WeakRef/FinalizationRegistry
 */
class WeakRefErrorRule extends ErrorRule {
    matches(message, source, error) {
        const combined = (message + ' ' + source + ' ' + (error?.stack || '')).toLowerCase();
        return combined.includes('weakref') || combined.includes('finalizationregistry');
    }
}

/**
 * Règle pour détecter les URLs d'extensions
 */
class ExtensionUrlRule extends ErrorRule {
    matches(message, source, error) {
        const combined = (message + ' ' + source + ' ' + (error?.stack || '')).toLowerCase();
        return combined.includes('chrome-extension://') || 
               combined.includes('moz-extension://') ||
               combined.includes('safari-extension://') ||
               combined.includes('extension://');
    }
}

/**
 * Règle pour détecter les erreurs dans content_script.js et background.js
 */
class ContentScriptErrorRule extends ErrorRule {
    matches(message, source, error) {
        const msg = (message || '').toString();
        const src = (source || '').toString();
        const errorStack = (error?.stack || '').toString();
        const combinedLower = (msg + ' ' + src + ' ' + errorStack).toLowerCase();
        
        return combinedLower.includes('content_script.js') || 
               combinedLower.includes('background.js') ||
               combinedLower.includes('content_script') ||
               combinedLower.includes('background_script') ||
               msg.includes('content_script.js') ||
               src.includes('content_script.js') ||
               errorStack.includes('content_script.js') ||
               errorStack.includes('background.js');
    }
}

/**
 * Règle pour détecter FrameIsBrowserFrameError
 */
class FrameIsBrowserFrameErrorRule extends ErrorRule {
    matches(message, source, error) {
        if (!error) return false;
        
        const errorName = (error.name || '').toString().toLowerCase();
        const constructorName = (error.constructor?.name || '').toString().toLowerCase();
        if (errorName.includes('frameisbrowserframeerror') || 
            constructorName.includes('frameisbrowserframeerror')) {
            return true;
        }
        
        const combined = (message + ' ' + source + ' ' + (error?.stack || '')).toLowerCase();
        return combined.includes('frameisbrowserframeerror') ||
               combined.includes('is a browser frame') ||
               (combined.includes('frame') && combined.includes('browser frame'));
    }
}

/**
 * Règle pour détecter les erreurs de port déconnecté
 */
class DisconnectedPortRule extends ErrorRule {
    matches(message, source, error) {
        const combined = (message + ' ' + source + ' ' + (error?.stack || '')).toLowerCase();
        return combined.includes('attempting to use a disconnected port object') ||
               combined.includes('disconnected port object') ||
               combined.includes('disconnected port') ||
               combined.includes('error in event handler') ||
               combined.includes('called encrypt() without a session key') ||
               combined.includes('extension context invalidated') ||
               combined.includes('message port closed');
    }
}

/**
 * Règle pour détecter les patterns de stack trace d'extensions
 */
class ExtensionStackTraceRule extends ErrorRule {
    matches(message, source, error) {
        const errorStack = error?.stack || '';
        if (!errorStack) return false;
        
        return /chrome-extension:\/\/[a-z]+\/content_script\.js/i.test(errorStack) ||
               /moz-extension:\/\/[a-z]+\/content_script\.js/i.test(errorStack) ||
               /at.*content_script\.js.*\d+:\d+/i.test(errorStack);
    }
}

/**
 * Détecteur d'erreurs d'extensions utilisant plusieurs règles
 */
class ExtensionErrorDetector {
    constructor() {
        this.rules = [
            new DerefErrorRule(),
            new MutationObserverErrorRule(),
            new WeakRefErrorRule(),
            new ExtensionUrlRule(),
            new ContentScriptErrorRule(),
            new FrameIsBrowserFrameErrorRule(),
            new DisconnectedPortRule(),
            new ExtensionStackTraceRule()
        ];
    }

    /**
     * Vérifie si une erreur provient d'une extension
     * @param {string} message - Message d'erreur
     * @param {string} source - Source de l'erreur
     * @param {Error} error - Objet Error
     * @returns {boolean}
     */
    isExtensionError(message, source, error) {
        if (!message && !source && !error) return false;
        
        return this.rules.some(rule => rule.matches(message, source, error));
    }
}

/**
 * Filtre de console pour ignorer les erreurs d'extensions
 */
export class ConsoleErrorFilter {
    constructor() {
        this.detector = new ExtensionErrorDetector();
        this.originalError = console.error;
        this.originalWarn = console.warn;
    }

    /**
     * Configure tous les filtres
     */
    setup() {
        this.setupConsoleFiltering();
        this.setupWindowErrorHandling();
        this.setupPromiseRejectionHandling();
    }

    /**
     * Configure le filtrage de console.error et console.warn
     */
    setupConsoleFiltering() {
        // Filtrer les erreurs d'extensions via console.error
        console.error = (...args) => {
            const message = args.join(' ');
            const error = args.find(arg => arg instanceof Error);
            
            // Vérifier aussi dans tous les arguments (certains peuvent être des objets avec stack)
            let foundError = error;
            if (!foundError) {
                for (const arg of args) {
                    if (arg && typeof arg === 'object' && arg.stack) {
                        foundError = arg;
                        break;
                    }
                }
            }
            
            // Extraire la stack trace de tous les arguments
            let stackTrace = '';
            if (foundError) {
                stackTrace = foundError.stack || '';
            } else {
                // Chercher une stack trace dans les arguments string
                for (const arg of args) {
                    if (typeof arg === 'string' && arg.includes('at ')) {
                        stackTrace += ' ' + arg;
                    }
                }
            }
            
            if (this.detector.isExtensionError(message, null, foundError || { stack: stackTrace })) {
                return; // Ignorer silencieusement
            }
            this.originalError.apply(console, args);
        };
        
        // Filtrer les warnings d'extensions
        console.warn = (...args) => {
            const message = args.join(' ');
            const error = args.find(arg => arg instanceof Error);
            
            // Vérifier aussi dans tous les arguments
            let foundError = error;
            if (!foundError) {
                for (const arg of args) {
                    if (arg && typeof arg === 'object' && arg.stack) {
                        foundError = arg;
                        break;
                    }
                }
            }
            
            let stackTrace = '';
            if (foundError) {
                stackTrace = foundError.stack || '';
            } else {
                for (const arg of args) {
                    if (typeof arg === 'string' && arg.includes('at ')) {
                        stackTrace += ' ' + arg;
                    }
                }
            }
            
            if (this.detector.isExtensionError(message, null, foundError || { stack: stackTrace })) {
                return; // Ignorer silencieusement
            }
            this.originalWarn.apply(console, args);
        };
    }

    /**
     * Configure le filtrage de window.onerror et addEventListener('error')
     */
    setupWindowErrorHandling() {
        // Intercepter window.onerror pour capturer les erreurs non gérées
        const originalOnError = window.onerror;
        window.onerror = (message, source, lineno, colno, error) => {
            if (this.detector.isExtensionError(message, source, error)) {
                return true; // Empêcher l'affichage de l'erreur
            }
            // Appeler le handler original s'il existe
            if (originalOnError) {
                return originalOnError.call(this, message, source, lineno, colno, error);
            }
            return false;
        };
        
        // Intercepter aussi via addEventListener('error') pour capturer plus d'erreurs
        window.addEventListener('error', (event) => {
            const message = event.message || '';
            const source = event.filename || event.source || '';
            const error = event.error;
            
            if (this.detector.isExtensionError(message, source, error)) {
                event.preventDefault(); // Empêcher l'affichage de l'erreur
                event.stopPropagation(); // Empêcher la propagation
                return false;
            }
        }, true); // Utiliser capture phase pour intercepter plus tôt
    }

    /**
     * Configure le filtrage des promesses rejetées non gérées
     */
    setupPromiseRejectionHandling() {
        // Intercepter les erreurs non gérées de promesses
        window.addEventListener('unhandledrejection', (event) => {
            const reason = event.reason;
            const message = reason?.message || reason?.toString() || '';
            const stack = reason?.stack || '';
            const error = reason instanceof Error ? reason : null;
            
            if (this.detector.isExtensionError(message + ' ' + stack, null, error)) {
                event.preventDefault(); // Empêcher l'affichage de l'erreur
                return;
            }
        });
    }
}
