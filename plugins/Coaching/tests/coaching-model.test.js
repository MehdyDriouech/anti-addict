/**
 * Tests unitaires pour CoachingModel - Coaching V2
 */

import { CoachingModel } from '../model/coaching-model.js';

describe('CoachingModel - Coaching V2', () => {
    let model;
    
    beforeEach(() => {
        model = new CoachingModel();
    });

    describe('selectInsightByMode', () => {
        it('should filter insights by observer mode', () => {
            const insights = [
                { type: 'retrospective', confidence: 0.8 },
                { type: 'stabilizing', confidence: 0.9 },
                { type: 'habit', confidence: 0.7 },
                { type: 'prescriptive', confidence: 0.6 }
            ];
            
            const result = model.selectInsightByMode(insights, 'observer');
            expect(result.length).toBe(2);
            expect(result[0].type).toBe('stabilizing');
            expect(result[1].type).toBe('retrospective');
        });

        it('should filter insights by stability mode', () => {
            const insights = [
                { type: 'stabilizing', confidence: 0.9 },
                { type: 'habit', confidence: 0.8 },
                { type: 'transition', confidence: 0.7 },
                { type: 'prescriptive', confidence: 0.6 }
            ];
            
            const result = model.selectInsightByMode(insights, 'stability');
            expect(result.length).toBe(3);
            expect(result[0].type).toBe('stabilizing');
        });

        it('should filter insights by silent mode (high instability only)', () => {
            const insights = [
                { type: 'stabilizing', confidence: 0.9, data: { instabilityScore: 2, cravings: 5 } },
                { type: 'stabilizing', confidence: 0.7, data: { instabilityScore: 1, cravings: 3 } },
                { type: 'retrospective', confidence: 0.8 }
            ];
            
            const result = model.selectInsightByMode(insights, 'silent');
            expect(result.length).toBe(1);
            expect(result[0].data.instabilityScore).toBe(2);
        });
    });

    describe('shouldGenerateInsight', () => {
        it('should respect frequency rules for observer mode', () => {
            const todayISO = '2024-01-15';
            const state = {
                coaching: {
                    mode: 'observer',
                    lastShownDate: '2024-01-14', // 1 jour
                    activeAnchor: null,
                    insights: []
                }
            };
            
            // Mock Storage.getDateISO
            if (typeof window === 'undefined') global.window = {};
            if (typeof Storage === 'undefined') {
                global.Storage = { getDateISO: () => todayISO };
            }
            
            const result = model.shouldGenerateInsight(state);
            expect(result).toBe(false); // Pas assez de jours (besoin 7)
        });

        it('should not generate if activeAnchor < 7 days (stability mode)', () => {
            const todayISO = '2024-01-15';
            const anchorDate = '2024-01-10'; // 5 jours
            const state = {
                coaching: {
                    mode: 'stability',
                    lastShownDate: null,
                    activeAnchor: {
                        suggestedAt: anchorDate
                    },
                    insights: []
                }
            };
            
            const result = model.shouldGenerateInsight(state);
            expect(result).toBe(false);
        });

        it('should generate if activeAnchor >= 7 days', () => {
            const anchorDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const state = {
                coaching: {
                    mode: 'stability',
                    lastShownDate: null,
                    activeAnchor: {
                        suggestedAt: anchorDate
                    },
                    insights: []
                }
            };
            
            const result = model.shouldGenerateInsight(state);
            expect(result).toBe(true);
        });
    });

    describe('isCoachingAllowed', () => {
        it('should return false if emergency is active', () => {
            if (typeof window === 'undefined') global.window = {};
            global.window.runtime = { emergencyActive: true };
            
            const state = { coaching: { mode: 'stability' } };
            const result = model.isCoachingAllowed(state);
            expect(result).toBe(false);
        });

        it('should return false during cooldown post-urgence', () => {
            if (typeof window === 'undefined') global.window = {};
            global.window.runtime = {
                emergencyActive: false,
                lastEmergencyEndedAt: Date.now() - 2 * 60 * 1000 // 2 minutes (cooldown 5 min)
            };
            
            const state = { coaching: { mode: 'stability' } };
            const result = model.isCoachingAllowed(state);
            expect(result).toBe(false);
        });

        it('should return true if no emergency and cooldown passed', () => {
            if (typeof window === 'undefined') global.window = {};
            global.window.runtime = {
                emergencyActive: false,
                lastEmergencyEndedAt: Date.now() - 10 * 60 * 1000 // 10 minutes
            };
            
            const state = { coaching: { mode: 'stability' } };
            const result = model.isCoachingAllowed(state);
            expect(result).toBe(true);
        });
    });

    describe('generateHabitInsight', () => {
        it('should return null if activeAnchor < 7 days', () => {
            const anchorDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const state = {
                coaching: {
                    activeAnchor: {
                        suggestedAt: anchorDate
                    }
                }
            };
            
            const result = model.generateHabitInsight(state);
            expect(result).toBeNull();
        });

        it('should generate habit insight if no activeAnchor', () => {
            const state = {
                coaching: {
                    activeAnchor: null
                }
            };
            
            const result = model.generateHabitInsight(state);
            expect(result).not.toBeNull();
            expect(result.type).toBe('habit');
            expect(result.anchor).toBeDefined();
        });
    });

    describe('activeAnchor management', () => {
        it('should ensure only one active anchor at a time', () => {
            const state1 = {
                coaching: {
                    activeAnchor: {
                        id: 'anchor1',
                        suggestedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    }
                }
            };
            
            // Un ancrage existe mais >= 7 jours, on peut générer un nouveau
            const result = model.generateHabitInsight(state1);
            expect(result).not.toBeNull();
            
            // Mais si < 7 jours, on ne peut pas
            const state2 = {
                coaching: {
                    activeAnchor: {
                        id: 'anchor1',
                        suggestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    }
                }
            };
            
            const result2 = model.generateHabitInsight(state2);
            expect(result2).toBeNull();
        });
    });
});
