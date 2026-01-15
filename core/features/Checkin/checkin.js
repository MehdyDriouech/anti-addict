/**
 * Checkin Feature - API publique pour le check-in
 */

import { CheckinController } from './controller/checkin-controller.js';

// Instance unique du controller
const checkinController = new CheckinController();

// API publique
export const Checkin = {
    render: (state) => checkinController.render(state),
    updateRangeValue: (input) => checkinController.updateRangeValue(input),
    submit: (event) => checkinController.submit(event)
};

// Exporter globalement pour compatibilité
if (typeof window !== 'undefined') {
    window.Checkin = Checkin;
    window.renderCheckin = () => {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (state) Checkin.render(state);
    };
    window.updateRangeValue = (input) => Checkin.updateRangeValue(input);
    window.submitCheckin = (event) => Checkin.submit(event);
}
