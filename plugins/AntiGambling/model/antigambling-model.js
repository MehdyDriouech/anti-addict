/**
 * AntiGambling Model - Logique métier pour l'addiction au jeu d'argent
 */

import { AddictionBaseModel } from '../../AddictionBase/model/addiction-base-model.js';
import { CONTEXTUAL_TIPS } from '../data/antigambling-data.js';

export class AntiGamblingModel extends AddictionBaseModel {
    constructor() {
        super('gambling');
    }

    getRandomTips(lang = 'fr', count = 3) {
        return super.getRandomTips(CONTEXTUAL_TIPS, lang, count);
    }
}
