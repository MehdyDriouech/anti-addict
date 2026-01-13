/**
 * AntiGaming Model - Logique métier pour l'addiction aux jeux vidéo
 */

import { AddictionBaseModel } from '../../AddictionBase/model/addiction-base-model.js';
import { CONTEXTUAL_TIPS } from '../data/antigaming-data.js';

export class AntiGamingModel extends AddictionBaseModel {
    constructor() {
        super('gaming');
    }

    getRandomTips(lang = 'fr', count = 3) {
        return super.getRandomTips(CONTEXTUAL_TIPS, lang, count);
    }

    calculateTimeSaved(hoursSaved) {
        const days = Math.floor(hoursSaved / 24);
        return { hours: hoursSaved, days };
    }
}
