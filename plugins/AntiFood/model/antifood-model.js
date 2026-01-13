/**
 * AntiFood Model - Logique métier pour l'addiction alimentaire compulsive
 */

import { AddictionBaseModel } from '../../AddictionBase/model/addiction-base-model.js';
import { CONTEXTUAL_TIPS } from '../data/antifood-data.js';

export class AntiFoodModel extends AddictionBaseModel {
    constructor() {
        super('food');
    }

    getRandomTips(lang = 'fr', count = 3) {
        return super.getRandomTips(CONTEXTUAL_TIPS, lang, count);
    }

    calculateCaloriesSaved(cravingsResisted, avgCaloriesPerCraving = 300) {
        return cravingsResisted * avgCaloriesPerCraving;
    }
}
