/**
 * AntiDrugs Model - Logique métier pour l'addiction aux substances
 */

import { AddictionBaseModel } from '../../AddictionBase/model/addiction-base-model.js';
import { CONTEXTUAL_TIPS } from '../data/antidrugs-data.js';

export class AntiDrugsModel extends AddictionBaseModel {
    constructor(services = {}) {
        super('drugs', services);
    }

    getRandomTips(lang = 'fr', count = 3) {
        return super.getRandomTips(CONTEXTUAL_TIPS, lang, count);
    }
}
