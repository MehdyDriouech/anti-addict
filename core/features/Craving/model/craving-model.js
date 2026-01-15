/**
 * Craving Model - Logique métier pour le protocole de craving
 */

import { PROTOCOL_DURATION, BREATHING_DURATION, BREATHING_PHASES, DEFAULT_INTENSITY } from '../data/craving-data.js';

export class CravingModel {
    constructor() {
        this.protocolInterval = null;
        this.protocolSeconds = 0;
        this.protocolRunning = false;
        this.protocolCompleted = false;
        
        this.breathingInterval = null;
        this.breathingPhase = 'inhale';
        this.breathingCount = 4;
        this.breathingCycle = 0;
        this.breathingTotalSeconds = BREATHING_DURATION;
        this.breathingRunning = false;
        
        this.currentIntensity = DEFAULT_INTENSITY;
    }

    /**
     * Réinitialise l'état du protocole
     */
    resetProtocolState() {
        if (this.protocolInterval) {
            clearInterval(this.protocolInterval);
            this.protocolInterval = null;
        }
        if (this.breathingInterval) {
            clearInterval(this.breathingInterval);
            this.breathingInterval = null;
        }
        
        this.protocolSeconds = 0;
        this.protocolRunning = false;
        this.protocolCompleted = false;
        this.breathingPhase = 'inhale';
        this.breathingCount = 4;
        this.breathingCycle = 0;
        this.breathingTotalSeconds = BREATHING_DURATION;
        this.breathingRunning = false;
        this.currentIntensity = DEFAULT_INTENSITY;
    }

    /**
     * Démarre le protocole
     * @param {Function} onProgress - Callback pour la progression
     * @param {Function} onComplete - Callback pour la complétion
     */
    startProtocol(onProgress, onComplete) {
        this.protocolRunning = true;
        
        this.protocolInterval = setInterval(() => {
            this.protocolSeconds++;
            if (onProgress) onProgress(this.protocolSeconds);
            
            if (this.protocolSeconds >= PROTOCOL_DURATION) {
                this.protocolCompleted = true;
                clearInterval(this.protocolInterval);
                this.protocolInterval = null;
                if (onComplete) onComplete();
            }
        }, 1000);
    }

    /**
     * Démarre la respiration guidée
     * @param {Function} onUpdate - Callback pour la mise à jour
     */
    startBreathing(onUpdate) {
        this.breathingRunning = true;
        this.breathingPhase = 'inhale';
        this.breathingCount = 4;
        
        if (onUpdate) onUpdate(this.getBreathingState());
        
        this.breathingInterval = setInterval(() => {
            this.breathingCount--;
            this.breathingTotalSeconds--;
            
            if (this.breathingCount <= 0) {
                const phase = BREATHING_PHASES[this.breathingPhase];
                this.breathingPhase = phase.next;
                this.breathingCount = phase.duration;
                if (this.breathingPhase === 'inhale') {
                    this.breathingCycle++;
                }
            }
            
            if (onUpdate) onUpdate(this.getBreathingState());
            
            if (this.breathingTotalSeconds <= 0) {
                clearInterval(this.breathingInterval);
                this.breathingInterval = null;
                this.breathingRunning = false;
            }
        }, 1000);
    }

    /**
     * Récupère l'état de la respiration
     * @returns {Object} État de la respiration
     */
    getBreathingState() {
        return {
            phase: this.breathingPhase,
            count: this.breathingCount,
            totalSeconds: this.breathingTotalSeconds,
            cycle: this.breathingCycle
        };
    }

    /**
     * Met à jour l'intensité
     * @param {number} value - Nouvelle intensité
     */
    updateIntensity(value) {
        this.currentIntensity = parseInt(value);
    }

    /**
     * Récupère l'intensité actuelle
     * @returns {number}
     */
    getIntensity() {
        return this.currentIntensity;
    }

    /**
     * Arrête tous les timers
     */
    stopAllTimers() {
        if (this.protocolInterval) {
            clearInterval(this.protocolInterval);
            this.protocolInterval = null;
        }
        if (this.breathingInterval) {
            clearInterval(this.breathingInterval);
            this.breathingInterval = null;
        }
    }

    /**
     * Récupère les suggestions d'actions depuis IfThen
     * @param {Object} state - State de l'application
     * @param {string} lang - Langue
     * @returns {Array} Liste des actions suggérées
     */
    getSuggestedActions(state, lang) {
        if (typeof IfThen === 'undefined') return [];
        
        const context = {
            timeRange: Utils.getTimeBucket(new Date().getHours()),
            triggers: state.addictionConfigs?.[state.addictions[0]?.id || 'porn']?.triggers || []
        };
        const matchedRules = IfThen.findMatchingRules(state, context);
        return IfThen.getActionsFromRules(matchedRules, lang);
    }
}
