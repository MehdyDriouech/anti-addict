/**
 * StorageDriver.js - Interface abstraite pour les drivers de stockage
 * 
 * Tous les drivers de stockage doivent implémenter cette interface
 */

/**
 * Interface StorageDriver
 * @interface
 */
export class StorageDriver {
    /**
     * Charge le state depuis le stockage
     * @returns {Promise<Object>} Le state chargé
     */
    async load() {
        throw new Error('load() must be implemented');
    }

    /**
     * Sauvegarde le state dans le stockage
     * @param {Object} state - Le state à sauvegarder
     * @returns {Promise<void>}
     */
    async save(state) {
        throw new Error('save() must be implemented');
    }

    /**
     * Exporte le state en JSON string
     * @param {Object} state - Le state à exporter
     * @returns {Promise<string>} JSON stringifié
     */
    async export(state) {
        throw new Error('export() must be implemented');
    }

    /**
     * Importe un state depuis un JSON string
     * @param {string} json - JSON stringifié
     * @returns {Promise<Object>} Le state importé
     */
    async import(json) {
        throw new Error('import() must be implemented');
    }
}
