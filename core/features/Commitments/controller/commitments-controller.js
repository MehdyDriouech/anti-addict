/**
 * Commitments Controller - Orchestration Model/View
 */

import { CommitmentsModel } from '../model/commitments-model.js';
import { CommitmentsView } from '../view/commitments-view.js';

export class CommitmentsController {
    constructor() {
        this.model = new CommitmentsModel();
        this.view = new CommitmentsView();
    }
    
    /**
     * Ouvre la modale des engagements
     * @param {Object} state - State de l'application
     */
    openModal(state) {
        if (!state) {
            state = typeof window !== 'undefined' ? window.state : null;
        }
        if (!state) {
            console.warn('[Commitments] State non disponible');
            return;
        }
        
        const commitments = this.model.getAllCommitments(state);
        this.view.renderModal(state, commitments);
    }
    
    /**
     * Ferme la modale
     */
    closeModal() {
        this.view.closeModal();
    }
}
