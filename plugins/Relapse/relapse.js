/**
 * Relapse Plugin - Point d'entrée
 */

import { RelapseModel } from './model/relapse-model.js';
import { RelapseView } from './view/relapse-view.js';
import { RelapseController } from './controller/relapse-controller.js';
import { TRIGGER_TAGS, CHANGE_SUGGESTIONS } from './data/relapse-data.js';

const relapseModel = new RelapseModel();
const relapseView = new RelapseView();
const relapseController = new RelapseController(relapseModel, relapseView);

const Relapse = {
    TRIGGER_TAGS,
    CHANGE_SUGGESTIONS,
    
    openRelapseMode: (state) => relapseController.open(state),
    closeRelapseMode: () => relapseController.close(),
    close: () => relapseController.close(),
    
    goStep2: () => relapseController.goStep2(),
    goStep3: () => relapseController.goStep3(),
    setWhen: (value) => relapseController.setWhen(value),
    setTrigger: (value) => relapseController.setTrigger(value),
    selectSuggestion: (index) => relapseController.selectSuggestion(index),
    finish: () => relapseController.finish(),
    createRuleFromRelapse: () => relapseController.createRuleFromRelapse()
};

window.Relapse = Relapse;

export default Relapse;
