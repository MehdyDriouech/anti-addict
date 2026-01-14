/**
 * Evening Model - Logique métier
 */

export class EveningModel {
    constructor() {
        this.data = {
            exposed: false, // Pour compatibilité rétroactive
            exposures: {}, // Expositions par addiction : { [addictionId]: boolean }
            helped: '',
            gratitude: ''
        };
    }

    /**
     * Réinitialise les données
     */
    reset() {
        this.data = {
            exposed: false, // Pour compatibilité rétroactive
            exposures: {},
            helped: '',
            gratitude: ''
        };
    }

    /**
     * Charge les données existantes
     * @param {Object} existing - Données existantes
     */
    loadExisting(existing) {
        if (existing) {
            this.data = { ...existing };
            // Migration : si exposed existe mais pas exposures, créer exposures
            if (this.data.exposed !== undefined && !this.data.exposures) {
                this.data.exposures = {};
                // Si une addiction était stockée, on peut essayer de la récupérer
                // Sinon, on initialise vide
            }
            // S'assurer que exposures existe
            if (!this.data.exposures) {
                this.data.exposures = {};
            }
        } else {
            this.reset();
        }
    }

    /**
     * Définit l'exposition pour une addiction spécifique
     * @param {string} addictionId - ID de l'addiction
     * @param {boolean} value - Valeur de l'exposition
     */
    setExposed(addictionId, value) {
        if (!this.data.exposures) {
            this.data.exposures = {};
        }
        this.data.exposures[addictionId] = value;
        
        // Pour compatibilité rétroactive, mettre à jour exposed si c'est la première addiction
        if (Object.keys(this.data.exposures).length === 1) {
            this.data.exposed = value;
        }
    }

    /**
     * Récupère l'exposition pour une addiction
     * @param {string} addictionId - ID de l'addiction
     * @returns {boolean} Exposition pour cette addiction
     */
    getExposed(addictionId) {
        if (!this.data.exposures) {
            return false;
        }
        return this.data.exposures[addictionId] || false;
    }

    /**
     * Définit ce qui a aidé
     * @param {string} value
     */
    setHelped(value) {
        this.data.helped = value;
    }

    /**
     * Définit la gratitude
     * @param {string} value
     */
    setGratitude(value) {
        this.data.gratitude = value;
    }

    /**
     * Récupère les données actuelles
     * @returns {Object}
     */
    getData() {
        return { ...this.data };
    }

    /**
     * Sauvegarde le rituel
     * @param {Object} state - State de l'application
     * @param {string} helped - Valeur du champ helped
     * @param {string} gratitude - Valeur du champ gratitude
     */
    save(state, helped, gratitude) {
        this.data.helped = helped || this.data.helped;
        this.data.gratitude = gratitude || '';
        
        Storage.addEveningRitual(state, this.data);
    }

    /**
     * Vérifie si le rituel du soir est fait aujourd'hui
     * @param {Object} state - State de l'application
     * @returns {boolean}
     */
    hasCompletedToday(state) {
        return Storage.getTodayEveningRitual(state) !== null;
    }

    /**
     * Récupère les rituels des N derniers jours
     * @param {Object} state - State de l'application
     * @param {number} days - Nombre de jours
     * @returns {Array}
     */
    getRecentRituals(state, days = 7) {
        return state.eveningRituals
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, days);
    }

    /**
     * Calcule les stats des rituels
     * @param {Object} state - State de l'application
     * @param {number} days - Nombre de jours
     * @returns {Object}
     */
    getRitualStats(state, days = 7) {
        const rituals = this.getRecentRituals(state, days);
        const completed = rituals.length;
        const exposureDays = rituals.filter(r => r.exposed).length;
        const cleanDays = completed - exposureDays;
        
        return {
            completed,
            exposureDays,
            cleanDays,
            completionRate: days > 0 ? Math.round((completed / days) * 100) : 0
        };
    }
}
