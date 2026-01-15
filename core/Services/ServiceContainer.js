/**
 * ServiceContainer.js - Conteneur de services pour injection de dépendances
 * 
 * Permet d'enregistrer et récupérer des services de manière centralisée,
 * avec support des singletons et factories.
 */

class ServiceContainer {
    constructor() {
        this.services = new Map();
    }

    /**
     * Enregistre un service dans le conteneur
     * @param {string} name - Nom du service
     * @param {Function} factory - Fonction factory qui retourne le service (peut être async)
     * @param {Object} options - Options { singleton: boolean }
     */
    register(name, factory, options = {}) {
        this.services.set(name, {
            factory,
            singleton: options.singleton !== false, // Par défaut singleton
            instance: null
        });
    }

    /**
     * Récupère un service depuis le conteneur
     * @param {string} name - Nom du service
     * @returns {Promise<any>} Instance du service
     */
    async get(name) {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service '${name}' not registered`);
        }

        // Si singleton et déjà instancié, retourner l'instance
        if (service.singleton && service.instance) {
            return service.instance;
        }

        // Créer l'instance via la factory
        const instance = await service.factory(this);
        
        // Si singleton, stocker l'instance
        if (service.singleton) {
            service.instance = instance;
        }
        
        return instance;
    }

    /**
     * Vérifie si un service est enregistré
     * @param {string} name - Nom du service
     * @returns {boolean}
     */
    has(name) {
        return this.services.has(name);
    }
}

// Instance singleton
const container = new ServiceContainer();

// Exposer sur window pour compatibilité
if (typeof window !== 'undefined') {
    window.ServiceContainer = container;
}

export default container;
