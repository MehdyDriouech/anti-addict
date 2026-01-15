/**
 * AntiSocialMedia Model - Logique métier pour l'addiction aux réseaux sociaux
 */

import { AddictionBaseModel } from '../../AddictionBase/model/addiction-base-model.js';
import { CONTEXTUAL_TIPS } from '../data/antisocialmedia-data.js';

export class AntiSocialMediaModel extends AddictionBaseModel {
    constructor(services = {}) {
        super('social_media', services);
    }

    getRandomTips(lang = 'fr', count = 3) {
        return super.getRandomTips(CONTEXTUAL_TIPS, lang, count);
    }

    calculateTimeSaved(minutesSaved) {
        const hours = Math.floor(minutesSaved / 60);
        const days = Math.floor(hours / 24);
        return { minutes: minutesSaved, hours, days };
    }
}
