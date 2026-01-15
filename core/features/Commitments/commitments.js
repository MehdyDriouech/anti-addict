/**
 * Commitments Feature - API publique pour les engagements
 */

import { CommitmentsController } from './controller/commitments-controller.js';

// Instance unique du controller
const commitmentsController = new CommitmentsController();

// API publique
export const Commitments = {
    openModal: (state) => commitmentsController.openModal(state),
    closeModal: () => commitmentsController.closeModal()
};

// Exporter globalement pour compatibilité
if (typeof window !== 'undefined') {
    window.Commitments = Commitments;
}

export default Commitments;
