/**
 * Craving Data - Constantes pour le protocole de craving
 */

export const PROTOCOL_DURATION = 90; // secondes
export const BREATHING_DURATION = 60; // secondes
export const BREATHING_PHASES = {
    inhale: { duration: 4, next: 'hold' },
    hold: { duration: 4, next: 'exhale' },
    exhale: { duration: 6, next: 'inhale' }
};
export const DEFAULT_INTENSITY = 3;
