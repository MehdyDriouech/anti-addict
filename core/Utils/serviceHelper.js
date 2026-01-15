/**
 * serviceHelper.js - Helpers pour obtenir les services
 * 
 * Fournit des fonctions utilitaires pour obtenir les services depuis
 * le ServiceContainer avec fallback vers window.* pour compatibilité.
 */

import container from '../Services/ServiceContainer.js';

/**
 * Obtient un service depuis le conteneur ou window.* en fallback
 * @param {string} name - Nom du service
 * @returns {Promise<any>} Instance du service ou null
 */
export async function getService(name) {
    try {
        if (container.has(name)) {
            return await container.get(name);
        }
    } catch (error) {
        console.warn(`[serviceHelper] Erreur lors de la récupération du service '${name}':`, error);
    }
    
    // Fallback vers window.* pour compatibilité
    if (typeof window !== 'undefined' && window[name]) {
        return window[name];
    }
    
    return null;
}

/**
 * Obtient plusieurs services depuis le conteneur
 * @param {Array<string>} names - Noms des services
 * @returns {Promise<Object>} Objet avec les services { name: service }
 */
export async function getServices(names) {
    const services = {};
    for (const name of names) {
        services[name] = await getService(name);
    }
    return services;
}
