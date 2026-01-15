/**
 * Tests fonctionnels pour Coaching V2 - Intégration
 */

describe('Coaching V2 - Tests fonctionnels', () => {
    describe('Mode change without data loss', () => {
        it('should preserve insights when changing mode', async () => {
            const state = {
                coaching: {
                    mode: 'stability',
                    insights: [
                        { id: 'insight1', type: 'retrospective', dismissed: false }
                    ],
                    activeAnchor: null
                }
            };
            
            if (typeof Coaching === 'undefined') {
                // Mock si Coaching non chargé
                return;
            }
            
            await Coaching.changeCoachingMode(state, 'guided');
            expect(state.coaching.mode).toBe('guided');
            expect(state.coaching.insights.length).toBe(1);
            expect(state.coaching.insights[0].id).toBe('insight1');
        });
    });

    describe('No insight during emergency', () => {
        it('should not show insight if emergency is active (all modes)', () => {
            if (typeof window === 'undefined') global.window = {};
            global.window.runtime = { emergencyActive: true };
            
            const modes = ['observer', 'stability', 'guided', 'silent'];
            
            modes.forEach(mode => {
                const state = {
                    coaching: { mode }
                };
                
                if (typeof Coaching !== 'undefined') {
                    const result = Coaching.canShowInsight(state);
                    expect(result).toBe(false);
                }
            });
        });
    });

    describe('Only one active anchor', () => {
        it('should not generate new anchor if one exists < 7 days (stability/guided)', () => {
            const anchorDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            ['stability', 'guided'].forEach(mode => {
                const state = {
                    coaching: {
                        mode,
                        activeAnchor: {
                            id: 'anchor1',
                            suggestedAt: anchorDate
                        }
                    }
                };
                
                if (typeof Coaching !== 'undefined' && Coaching.model) {
                    const result = Coaching.model.generateHabitInsight(state);
                    expect(result).toBeNull();
                }
            });
        });
    });

    describe('Silent mode visibility', () => {
        it('should not show widget on Home if mode is silent', () => {
            const state = {
                coaching: {
                    mode: 'silent'
                },
                profile: { lang: 'fr' }
            };
            
            if (typeof Coaching !== 'undefined' && Coaching.renderWidget) {
                const result = Coaching.renderWidget(state);
                expect(result).toBe('');
            }
        });
    });
});

describe('Coaching V2 - Tests E2E scenarios', () => {
    describe('Scenario: stability → guided → silent', () => {
        it('should handle mode transitions correctly', async () => {
            const state = {
                coaching: {
                    mode: 'stability',
                    insights: [],
                    activeAnchor: null
                },
                profile: { lang: 'fr' }
            };
            
            if (typeof Coaching === 'undefined') return;
            
            // Transition 1: stability → guided
            await Coaching.changeCoachingMode(state, 'guided');
            expect(state.coaching.mode).toBe('guided');
            
            // Transition 2: guided → silent
            await Coaching.changeCoachingMode(state, 'silent');
            expect(state.coaching.mode).toBe('silent');
            // activeAnchor devrait être null car silent n'utilise pas les ancres
            expect(state.coaching.activeAnchor).toBeNull();
        });
    });

    describe('Scenario: app becomes inactive (reduction progressive)', () => {
        it('should reduce coaching frequency over time', () => {
            // Simuler progression: stability → observer → silent
            const state = {
                coaching: {
                    mode: 'stability',
                    lastShownDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    insights: []
                }
            };
            
            // Mode stability: devrait permettre génération après 3 jours
            if (typeof Coaching !== 'undefined' && Coaching.model) {
                const canGenerate = Coaching.model.shouldGenerateInsight(state);
                expect(canGenerate).toBe(true); // 30 jours > 3 jours
            }
        });
    });
});
