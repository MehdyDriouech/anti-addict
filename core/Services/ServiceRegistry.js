/**
 * ServiceRegistry.js - Registre des services de l'application
 * 
 * Enregistre tous les services dans le ServiceContainer pour permettre
 * l'injection de dépendances.
 */

import container from './ServiceContainer.js';

/**
 * Enregistre tous les services de l'application
 * Utilise des imports dynamiques pour éviter les dépendances circulaires
 */
export async function registerServices() {
    // Security Service
    container.register('security', async () => {
        const { default: SecurityService } = await import('../security/SecurityService.js');
        return SecurityService;
    }, { singleton: true });

    // Store Service
    container.register('store', async () => {
        const Store = await import('../store/Store.js');
        return Store.default;
    }, { singleton: true });

    // Analytics Service
    container.register('analytics', async () => {
        const { default: AnalyticsService } = await import('../analytics/AnalyticsService.js');
        return AnalyticsService;
    }, { singleton: true });

    // Router Service (exposé sur window.Router)
    container.register('router', async () => {
        // Le router est déjà exposé sur window.Router, on le retourne
        // Si window.Router n'existe pas encore, on attend un peu
        if (typeof window !== 'undefined' && window.Router) {
            return window.Router;
        }
        // Sinon, on importe le module qui l'expose
        await import('../Navigation/router.js');
        return window.Router;
    }, { singleton: true });

    // i18n Service (exposé sur window.I18n)
    container.register('i18n', async () => {
        // Le i18n est déjà exposé sur window.I18n, on le retourne
        if (typeof window !== 'undefined' && window.I18n) {
            return window.I18n;
        }
        // Sinon, on importe le module qui l'expose
        await import('../Navigation/i18n.js');
        return window.I18n;
    }, { singleton: true });

    // Storage Service
    container.register('storage', async () => {
        // S'assurer que le module Storage est chargé
        if (typeof window === 'undefined' || !window.Storage) {
            await import('./storage.js');
        }
        // Retourner StorageService
        const { default: StorageService } = await import('../storage/StorageService.js');
        return StorageService;
    }, { singleton: true });

    // Date Service
    container.register('date', async () => {
        const { default: DateService } = await import('../Utils/DateService.js');
        return DateService;
    }, { singleton: true });
}

export default container;
