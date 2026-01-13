/**
 * AddictionBase - Module de base pour toutes les addictions
 * 
 * Ce module fournit la logique partagée entre tous les plugins anti-addiction.
 * Chaque plugin spécifique (AntiPorn, AntiSmoke, etc.) hérite de ces classes.
 */

export { AddictionBaseModel } from './model/addiction-base-model.js';
export { AddictionBaseView } from './view/addiction-base-view.js';
export { AddictionBaseController } from './controller/addiction-base-controller.js';
export { 
    COMMON_TRIGGERS, 
    COMMON_ACTIONS, 
    COMMON_SLOPE_STEPS,
    UI_LABELS 
} from './data/addiction-base-data.js';
