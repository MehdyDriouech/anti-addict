/**
 * sw.js - Service Worker pour l'application Haven (PWA)
 * 
 * Fonctionnalités:
 * - Cache des ressources statiques pour fonctionnement offline
 * - Stratégie "Cache First, Network Fallback" pour les assets
 * - Mise à jour automatique du cache
 */

// Nom et version du cache (incrémenter à chaque mise à jour)
const CACHE_NAME = 'revenir-v5';

// Ressources à mettre en cache
const STATIC_ASSETS = [
    // Pages et scripts principaux
    './',
    './index.html',
    './core/styles.css',
    './core/utils.js',
    './core/storage.js',
    './core/i18n.js',
    './core/router.js',
    './core/app.js',
    './core/sw.js',
    './manifest.webmanifest',
    
    // Plugins MVC
    './plugins/Wins/wins.js',
    './plugins/Intentions/intentions.js',
    './plugins/SOS/sos.js',
    './plugins/Heatmap/heatmap.js',
    './plugins/Actions/actions.js',
    './plugins/IfThen/ifthen.js',
    './plugins/Relapse/relapse.js',
    './plugins/Evening/evening.js',
    './plugins/AntiPorn/antiporn.js',
    './plugins/Experiments/experiments.js',
    './plugins/Coaching/coaching.js',
    './plugins/Programs/programs.js',
    './plugins/Calendar/calendar.js',
    './plugins/Spiritual/spiritual.js',
    './plugins/Journal/journal.js',
    
    // Plugins Anti-Addiction (V5 Multi-Addictions)
    './plugins/AddictionBase/addiction-base.js',
    './plugins/AntiSmoke/antismoke.js',
    './plugins/AntiAlcohol/antialcohol.js',
    './plugins/AntiDrugs/antidrugs.js',
    './plugins/AntiSocialMedia/antisocialmedia.js',
    './plugins/AntiGaming/antigaming.js',
    './plugins/AntiFood/antifood.js',
    './plugins/AntiShopping/antishopping.js',
    './plugins/AntiGambling/antigambling.js',
    
    // Icônes
    './data/pictures/icon.svg',
    './data/pictures/icon-192.png',
    './data/pictures/icon-512.png',
    
    // Traductions
    './data/texts/strings.fr.json',
    './data/texts/strings.en.json',
    './data/texts/strings.ar.json',
    
    // Cartes spirituelles - Islam
    './data/texts/spiritual_islam.fr.json',
    './data/texts/spiritual_islam.en.json',
    './data/texts/spiritual_islam.ar.json',
    
    // Cartes spirituelles - Christianisme
    './data/texts/spiritual_christianity.fr.json',
    './data/texts/spiritual_christianity.en.json',
    './data/texts/spiritual_christianity.ar.json',
    
    // Cartes spirituelles - Judaïsme
    './data/texts/spiritual_judaism.fr.json',
    './data/texts/spiritual_judaism.en.json',
    './data/texts/spiritual_judaism.ar.json',
    
    // Cartes spirituelles - Bouddhisme
    './data/texts/spiritual_buddhism.fr.json',
    './data/texts/spiritual_buddhism.en.json',
    './data/texts/spiritual_buddhism.ar.json'
];

// ============================================
// INSTALLATION
// ============================================

/**
 * Événement d'installation du Service Worker
 * Met en cache toutes les ressources statiques
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installation en cours...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Mise en cache des ressources statiques');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Installation terminée');
                // Activer immédiatement sans attendre la fermeture des onglets
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Erreur lors de l\'installation:', error);
            })
    );
});

// ============================================
// ACTIVATION
// ============================================

/**
 * Événement d'activation du Service Worker
 * Nettoie les anciens caches
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activation en cours...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Suppression de l\'ancien cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activation terminée');
                // Prendre le contrôle immédiatement de toutes les pages
                return self.clients.claim();
            })
    );
});

// ============================================
// FETCH (INTERCEPTION DES REQUÊTES)
// ============================================

/**
 * Événement fetch - Intercepte toutes les requêtes réseau
 * Stratégie: Cache First, Network Fallback
 */
self.addEventListener('fetch', (event) => {
    // Ne pas intercepter les requêtes non-GET
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Ne pas intercepter les requêtes externes (analytics, fonts, etc.)
    const requestURL = new URL(event.request.url);
    if (requestURL.origin !== self.location.origin) {
        // Pour les fonts Google, on peut quand même les cacher
        if (requestURL.hostname.includes('fonts.googleapis.com') || 
            requestURL.hostname.includes('fonts.gstatic.com')) {
            event.respondWith(
                caches.open(CACHE_NAME)
                    .then((cache) => {
                        return cache.match(event.request)
                            .then((cachedResponse) => {
                                if (cachedResponse) {
                                    return cachedResponse;
                                }
                                return fetch(event.request)
                                    .then((networkResponse) => {
                                        cache.put(event.request, networkResponse.clone());
                                        return networkResponse;
                                    });
                            });
                    })
            );
            return;
        }
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Retourner la réponse en cache si elle existe
                if (cachedResponse) {
                    // En arrière-plan, mettre à jour le cache (stale-while-revalidate)
                    fetch(event.request)
                        .then((networkResponse) => {
                            if (networkResponse && networkResponse.status === 200) {
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(event.request, networkResponse);
                                    });
                            }
                        })
                        .catch(() => {
                            // Ignorer les erreurs réseau en arrière-plan
                        });
                    
                    return cachedResponse;
                }
                
                // Sinon, faire une requête réseau
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Ne pas mettre en cache les réponses non-OK
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // Cloner la réponse car elle ne peut être lue qu'une fois
                        const responseToCache = networkResponse.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch(() => {
                        // En cas d'échec réseau, retourner une page offline basique
                        // pour les requêtes de navigation
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        
                        // Pour les autres ressources, retourner une réponse vide
                        return new Response('', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// ============================================
// MESSAGE HANDLING
// ============================================

/**
 * Gestion des messages depuis l'application
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME)
            .then(() => {
                console.log('[SW] Cache effacé');
            });
    }
});

// ============================================
// NOTIFICATION HANDLING (OPTIONNEL)
// ============================================

/**
 * Gestion des notifications push (si activées)
 */
self.addEventListener('push', (event) => {
    // Cette fonctionnalité nécessite un backend pour les notifications push
    // Pour l'instant, on la laisse inactive
    console.log('[SW] Notification push reçue:', event);
});

/**
 * Gestion du clic sur une notification
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Si une fenêtre est déjà ouverte, la mettre au premier plan
                for (const client of clientList) {
                    if (client.url.includes('index.html') && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Sinon, ouvrir une nouvelle fenêtre
                if (clients.openWindow) {
                    return clients.openWindow('./index.html');
                }
            })
    );
});

console.log('[SW] Service Worker chargé');
