/**
 * DateService.js - Service de gestion des dates
 * 
 * Extrait toutes les fonctions de manipulation de dates de utils.js
 * pour permettre l'injection de dépendances.
 */

/**
 * Labels des créneaux horaires pour l'UI
 */
export const TIME_BUCKET_LABELS = {
    morning: { fr: 'Matin', en: 'Morning', ar: 'صباح' },
    noon: { fr: 'Midi', en: 'Noon', ar: 'ظهر' },
    afternoon: { fr: 'Après-midi', en: 'Afternoon', ar: 'بعد الظهر' },
    evening: { fr: 'Soir', en: 'Evening', ar: 'مساء' },
    night: { fr: 'Nuit', en: 'Night', ar: 'ليل' },
    late: { fr: 'Tard', en: 'Late', ar: 'متأخر' }
};

/**
 * Labels des jours de la semaine
 */
export const DAY_LABELS = {
    0: { fr: 'Dim', en: 'Sun', ar: 'أحد' },
    1: { fr: 'Lun', en: 'Mon', ar: 'إثن' },
    2: { fr: 'Mar', en: 'Tue', ar: 'ثلا' },
    3: { fr: 'Mer', en: 'Wed', ar: 'أرب' },
    4: { fr: 'Jeu', en: 'Thu', ar: 'خمي' },
    5: { fr: 'Ven', en: 'Fri', ar: 'جمع' },
    6: { fr: 'Sam', en: 'Sat', ar: 'سبت' }
};

/**
 * Service de gestion des dates
 */
export class DateService {
    /**
     * Retourne la date du jour au format ISO (YYYY-MM-DD)
     * @returns {string}
     */
    todayISO() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Parse une date ISO en objet Date
     * @param {string} isoDate - Date au format YYYY-MM-DD
     * @returns {Date}
     */
    parseISODate(isoDate) {
        const [year, month, day] = isoDate.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    /**
     * Retourne la date il y a N jours au format ISO
     * @param {number} daysAgo - Nombre de jours dans le passé
     * @returns {string}
     */
    daysAgoISO(daysAgo) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
    }

    /**
     * Calcule le nombre de jours entre deux dates ISO
     * @param {string} date1 - Date ISO
     * @param {string} date2 - Date ISO
     * @returns {number}
     */
    daysBetween(date1, date2) {
        const d1 = this.parseISODate(date1);
        const d2 = this.parseISODate(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Retourne le jour de la semaine (0=Dim, 1=Lun, ..., 6=Sam)
     * @param {string} isoDate - Date ISO
     * @returns {number}
     */
    getDayOfWeek(isoDate) {
        return this.parseISODate(isoDate).getDay();
    }

    /**
     * Retourne l'heure d'un timestamp
     * @param {number} timestamp - Timestamp en ms
     * @returns {number} Heure (0-23)
     */
    getHourFromTimestamp(timestamp) {
        return new Date(timestamp).getHours();
    }

    /**
     * Retourne le créneau horaire (bucket) pour une heure donnée
     * @param {number} hour - Heure (0-23)
     * @returns {string} morning|noon|afternoon|evening|night|late
     */
    getTimeBucket(hour) {
        if (hour >= 5 && hour < 9) return 'morning';      // 5h-9h
        if (hour >= 9 && hour < 12) return 'noon';        // 9h-12h
        if (hour >= 12 && hour < 17) return 'afternoon';  // 12h-17h
        if (hour >= 17 && hour < 21) return 'evening';    // 17h-21h
        if (hour >= 21 && hour < 24) return 'night';      // 21h-00h
        return 'late';                                     // 00h-5h
    }
}

// Instance singleton par défaut
const instance = new DateService();
export default instance;
