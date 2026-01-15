/**
 * AntiShopping Model - Logique métier pour l'addiction aux achats compulsifs
 */

import { AddictionBaseModel } from '../../AddictionBase/model/addiction-base-model.js';
import { CONTEXTUAL_TIPS } from '../data/antishopping-data.js';

export class AntiShoppingModel extends AddictionBaseModel {
    constructor(services = {}) {
        super('shopping', services);
    }

    getRandomTips(lang = 'fr', count = 3) {
        return super.getRandomTips(CONTEXTUAL_TIPS, lang, count);
    }

    calculateMoneySaved(purchasesAvoided, avgPurchaseAmount = 50) {
        return purchasesAvoided * avgPurchaseAmount;
    }
}
