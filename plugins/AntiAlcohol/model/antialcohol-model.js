/**
 * AntiAlcohol Model - Logique métier pour l'addiction à l'alcool
 */

import { AddictionBaseModel } from '../../AddictionBase/model/addiction-base-model.js';
import { CONTEXTUAL_TIPS } from '../data/antialcohol-data.js';

export class AntiAlcoholModel extends AddictionBaseModel {
    constructor(services = {}) {
        super('alcohol', services);
    }

    getRandomTips(lang = 'fr', count = 3) {
        return super.getRandomTips(CONTEXTUAL_TIPS, lang, count);
    }

    calculateMoneySaved(drinksPerWeek, avgPricePerDrink, weeksStopped) {
        return Math.round(drinksPerWeek * avgPricePerDrink * weeksStopped * 100) / 100;
    }

    calculateCaloriesSaved(drinksAvoided, avgCaloriesPerDrink = 150) {
        return drinksAvoided * avgCaloriesPerDrink;
    }
}
