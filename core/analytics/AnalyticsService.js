/**
 * AnalyticsService.js - Summary Index pour le coaching local
 * 
 * Maintient un index incrémental des métriques (daily/weekly)
 * pour éviter de scanner tous les events à chaque rendu
 */

/**
 * Calcule la clé de période hebdomadaire (YYYY-WW)
 */
function getWeekKey(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7); // Jeudi de la semaine
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum = Math.ceil((((d - week1) / 86400000) + week1.getDay() + 1) / 7);
    const year = d.getFullYear();
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * Calcule la clé de période quotidienne (YYYY-MM-DD)
 */
function getDayKey(date = new Date()) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

/**
 * Met à jour les analytics après une mutation
 * @param {Object} draft - State draft (après mutation)
 * @param {Object} options - Options { reason?: string }
 * @returns {Promise<void>}
 */
export async function updateAnalytics(draft, options = {}) {
    try {
        // Récupérer le driver IndexedDB
        const driver = await getIndexedDBDriver();
        if (!driver) {
            // Pas d'IndexedDB, analytics non disponibles
            return;
        }

        // Analyser les changements dans draft.events
        // (Pour l'instant, on suppose que les events sont dans draft.events)
        // Plus tard, ils seront dans domains['events'] chiffré

        const today = getDayKey();
        const thisWeek = getWeekKey();

        // Récupérer analytics existants
        const dailyAnalytics = await driver.getAnalytics(`daily:${today}`) || {
            periodKey: `daily:${today}`,
            totalEmergencies: 0,
            totalCravings: 0,
            totalWins: 0,
            totalEpisodes: 0,
            avgIntensity: 0,
            intensitySum: 0,
            intensityCount: 0
        };

        const weeklyAnalytics = await driver.getAnalytics(`weekly:${thisWeek}`) || {
            periodKey: `weekly:${thisWeek}`,
            totalEmergencies: 0,
            totalCravings: 0,
            totalWins: 0,
            totalEpisodes: 0,
            avgIntensity: 0,
            intensitySum: 0,
            intensityCount: 0
        };

        // Compter les events d'aujourd'hui
        // NOTE: Pour l'instant, on lit depuis draft.events
        // Plus tard, on devra déchiffrer domains['events']
        const todayEvents = (draft.events || []).filter(e => {
            const eventDate = e.date || (e.ts ? new Date(e.ts).toISOString().split('T')[0] : null);
            return eventDate === today;
        });

        // Mettre à jour les compteurs
        let newEmergencies = 0;
        let newCravings = 0;
        let newWins = 0;
        let newEpisodes = 0;
        let intensitySum = dailyAnalytics.intensitySum || 0;
        let intensityCount = dailyAnalytics.intensityCount || 0;

        todayEvents.forEach(event => {
            if (event.type === 'craving' && options.reason === 'emergency_used') {
                newEmergencies++;
            }
            if (event.type === 'craving') {
                newCravings++;
                if (event.intensity !== undefined && event.intensity !== null) {
                    intensitySum += event.intensity;
                    intensityCount++;
                }
            }
            if (event.type === 'win') {
                newWins++;
            }
            if (event.type === 'episode') {
                newEpisodes++;
            }
        });

        // Mettre à jour daily
        dailyAnalytics.totalEmergencies = (dailyAnalytics.totalEmergencies || 0) + newEmergencies;
        dailyAnalytics.totalCravings = (dailyAnalytics.totalCravings || 0) + newCravings;
        dailyAnalytics.totalWins = (dailyAnalytics.totalWins || 0) + newWins;
        dailyAnalytics.totalEpisodes = (dailyAnalytics.totalEpisodes || 0) + newEpisodes;
        dailyAnalytics.intensitySum = intensitySum;
        dailyAnalytics.intensityCount = intensityCount;
        dailyAnalytics.avgIntensity = intensityCount > 0 ? intensitySum / intensityCount : 0;

        // Mettre à jour weekly
        weeklyAnalytics.totalEmergencies = (weeklyAnalytics.totalEmergencies || 0) + newEmergencies;
        weeklyAnalytics.totalCravings = (weeklyAnalytics.totalCravings || 0) + newCravings;
        weeklyAnalytics.totalWins = (weeklyAnalytics.totalWins || 0) + newWins;
        weeklyAnalytics.totalEpisodes = (weeklyAnalytics.totalEpisodes || 0) + newEpisodes;
        weeklyAnalytics.intensitySum = (weeklyAnalytics.intensitySum || 0) + (intensitySum - (dailyAnalytics.intensitySum - intensitySum));
        weeklyAnalytics.intensityCount = (weeklyAnalytics.intensityCount || 0) + (intensityCount - (dailyAnalytics.intensityCount - intensityCount));
        weeklyAnalytics.avgIntensity = weeklyAnalytics.intensityCount > 0 
            ? weeklyAnalytics.intensitySum / weeklyAnalytics.intensityCount 
            : 0;

        // Sauvegarder
        await driver.setAnalytics(`daily:${today}`, dailyAnalytics);
        await driver.setAnalytics(`weekly:${thisWeek}`, weeklyAnalytics);

    } catch (error) {
        console.error('[AnalyticsService] Erreur lors de la mise à jour:', error);
        // Ne pas bloquer l'écriture si analytics échoue
    }
}

/**
 * Récupère les analytics pour une période
 * @param {string} period - 'daily' ou 'weekly'
 * @param {Date} date - Date (optionnel, défaut aujourd'hui)
 * @returns {Promise<Object|null>}
 */
export async function getAnalytics(period, date = new Date()) {
    try {
        const driver = await getIndexedDBDriver();
        if (!driver) {
            return null;
        }

        const key = period === 'daily' 
            ? `daily:${getDayKey(date)}`
            : `weekly:${getWeekKey(date)}`;

        return await driver.getAnalytics(key);
    } catch (error) {
        console.error('[AnalyticsService] Erreur lors de la récupération:', error);
        return null;
    }
}

/**
 * Récupère le driver IndexedDB
 * @private
 */
async function getIndexedDBDriver() {
    if (typeof window !== 'undefined' && window.Storage && window.Storage.initStorageDriver) {
        const driver = await window.Storage.initStorageDriver();
        // Vérifier si c'est IndexedDBDriver
        if (driver && typeof driver.getAnalytics === 'function') {
            return driver;
        }
    }
    return null;
}

/**
 * Initialise les analytics (appelé au démarrage)
 * @returns {Promise<void>}
 */
export async function initAnalytics() {
    // Rien à faire pour l'instant
    // Les analytics seront créés à la demande lors des mises à jour
}

export default {
    updateAnalytics,
    getAnalytics,
    initAnalytics,
    getDayKey,
    getWeekKey
};
