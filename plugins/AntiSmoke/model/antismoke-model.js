/**
 * AntiSmoke Model - Logique métier pour l'addiction à la cigarette
 */

import { AddictionBaseModel } from '../../AddictionBase/model/addiction-base-model.js';
import { CONTEXTUAL_TIPS } from '../data/antismoke-data.js';

export class AntiSmokeModel extends AddictionBaseModel {
    constructor() {
        super('cigarette');
    }

    /**
     * Récupère des conseils aléatoires spécifiques à la cigarette
     */
    getRandomTips(lang = 'fr', count = 3) {
        return super.getRandomTips(CONTEXTUAL_TIPS, lang, count);
    }

    /**
     * Calcule l'argent économisé
     * @param {number} cigarettesPerDay - Nombre de cigarettes par jour avant l'arrêt
     * @param {number} pricePerPack - Prix d'un paquet (20 cigarettes)
     * @param {number} daysStopped - Nombre de jours sans fumer
     */
    calculateMoneySaved(cigarettesPerDay, pricePerPack, daysStopped) {
        const pricePerCigarette = pricePerPack / 20;
        return Math.round(cigarettesPerDay * pricePerCigarette * daysStopped * 100) / 100;
    }

    /**
     * Calcule les cigarettes non fumées
     */
    calculateCigarettesNotSmoked(cigarettesPerDay, daysStopped) {
        return cigarettesPerDay * daysStopped;
    }

    /**
     * Calcule le temps de vie gagné (estimation)
     * Environ 11 minutes de vie gagnées par cigarette non fumée
     */
    calculateLifeTimeGained(cigarettesNotSmoked) {
        const minutesGained = cigarettesNotSmoked * 11;
        const hours = Math.floor(minutesGained / 60);
        const days = Math.floor(hours / 24);
        return { minutes: minutesGained, hours, days };
    }
}
