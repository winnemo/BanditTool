import { describe, it, expect, vi, beforeEach } from 'vitest';
import { algorithms } from '../utils/algorithms';

// Mock für getGaussianRandom
vi.mock('./banditSimulation', () => ({
    getGaussianRandom: vi.fn((mean: number, stdDev: number) => mean + stdDev * 0.5)
}));

describe('Bandit Algorithms', () => {
    let mockDrugStats: any;

    beforeEach(() => {
        mockDrugStats = {
            drug0: { attempts: 10, sumOfRewards: 7 },
            drug1: { attempts: 5, sumOfRewards: 4 },
            drug2: { attempts: 8, sumOfRewards: 3 },
        };
    });

    describe('greedy', () => {
        it('sollte die Aktion mit der höchsten durchschnittlichen Belohnung wählen', () => {
            const result = algorithms.greedy(mockDrugStats);
            // drug1 hat die höchste Rate: 4/5 = 0.8
            expect(result).toBe(1);
        });

        it('sollte die erste Aktion wählen, wenn alle unversucht sind', () => {
            const emptyStats = {
                drug0: { attempts: 0, sumOfRewards: 0 },
                drug1: { attempts: 0, sumOfRewards: 0 },
            };
            const result = algorithms.greedy(emptyStats);
            expect(result).toBe(0);
        });

        it('sollte korrekt mit negativen Belohnungen umgehen', () => {
            const negativeStats = {
                drug0: { attempts: 10, sumOfRewards: -5 },
                drug1: { attempts: 10, sumOfRewards: 2 },
                drug2: { attempts: 10, sumOfRewards: -8 },
            };
            const result = algorithms.greedy(negativeStats);
            expect(result).toBe(1);
        });
    });

    describe('epsilon-greedy', () => {
        it('sollte einen Fehler werfen ohne Konfiguration', () => {
            expect(() => algorithms['epsilon-greedy'](mockDrugStats)).toThrow();
        });

        it('sollte manchmal eine zufällige Aktion wählen', () => {
            const config = { numActions: 3, banditType: 'bernoulli' };
            const results = new Set<number>();

            // Mehrere Durchläufe, um sowohl Exploration als auch Exploitation zu testen
            for (let i = 0; i < 100; i++) {
                const result = algorithms['epsilon-greedy'](mockDrugStats, config);
                results.add(result);
                expect(result).toBeGreaterThanOrEqual(0);
                expect(result).toBeLessThan(3);
            }

            // Bei 100 Versuchen sollten wahrscheinlich mehrere Aktionen gewählt werden
            expect(results.size).toBeGreaterThan(1);
        });

        it('sollte die greedy Aktion wählen bei Exploitation', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.5); // > 0.1, also greedy
            const config = { numActions: 3, banditType: 'bernoulli' };
            const result = algorithms['epsilon-greedy'](mockDrugStats, config);
            expect(result).toBe(1); // beste Aktion
            vi.restoreAllMocks();
        });
    });

    describe('random', () => {
        it('sollte einen Fehler werfen ohne Konfiguration', () => {
            expect(() => algorithms.random(mockDrugStats)).toThrow();
        });

        it('sollte eine zufällige Aktion im gültigen Bereich wählen', () => {
            const config = { numActions: 5, banditType: 'bernoulli' };
            const results = new Set<number>();

            for (let i = 0; i < 50; i++) {
                const result = algorithms.random(mockDrugStats, config);
                results.add(result);
                expect(result).toBeGreaterThanOrEqual(0);
                expect(result).toBeLessThan(5);
            }

            // Bei vielen Versuchen sollten verschiedene Aktionen gewählt werden
            expect(results.size).toBeGreaterThan(1);
        });
    });

    describe('ucb', () => {
        it('sollte eine ungetestete Aktion wählen, falls vorhanden', () => {
            const statsWithUntested = {
                drug0: { attempts: 10, sumOfRewards: 5 },
                drug1: { attempts: 0, sumOfRewards: 0 },
                drug2: { attempts: 5, sumOfRewards: 3 },
            };
            const result = algorithms.ucb(statsWithUntested);
            expect(result).toBe(1);
        });

        it('sollte UCB-Werte korrekt berechnen', () => {
            const result = algorithms.ucb(mockDrugStats);
            // Sollte eine gültige Aktion zurückgeben
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(3);
        });

        it('sollte Aktionen mit weniger Versuchen bevorzugen (Exploration)', () => {
            const explorationStats = {
                drug0: { attempts: 100, sumOfRewards: 70 }, // 0.7 avg, aber viele Versuche
                drug1: { attempts: 1, sumOfRewards: 0.5 },  // 0.5 avg, aber kaum Versuche
                drug2: { attempts: 100, sumOfRewards: 65 },
            };
            const result = algorithms.ucb(explorationStats);
            // drug1 sollte wegen des hohen Exploration-Bonus gewählt werden
            expect(result).toBe(1);
        });

        it('sollte mit allen Aktionen auf 0 Versuchen umgehen', () => {
            const allZero = {
                drug0: { attempts: 0, sumOfRewards: 0 },
                drug1: { attempts: 0, sumOfRewards: 0 },
                drug2: { attempts: 0, sumOfRewards: 0 },
            };
            const result = algorithms.ucb(allZero);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(3);
        });
    });

    describe('thompson', () => {
        it('sollte einen Fehler werfen ohne Konfiguration', () => {
            expect(() => algorithms.thompson(mockDrugStats)).toThrow();
        });

        it('sollte ungetestete Aktionen priorisieren', () => {
            const statsWithUntested = {
                drug0: { attempts: 10, sumOfRewards: 8 },
                drug1: { attempts: 0, sumOfRewards: 0 },
                drug2: { attempts: 5, sumOfRewards: 4 },
            };
            const config = { numActions: 3, banditType: 'bernoulli' };
            const result = algorithms.thompson(statsWithUntested, config);
            expect(result).toBe(1);
        });

        it('sollte für Bernoulli-Banditen funktionieren', () => {
            const config = { numActions: 3, banditType: 'bernoulli' };
            const result = algorithms.thompson(mockDrugStats, config);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(3);
        });

        it('sollte für Gaussian-Banditen funktionieren', () => {
            const config = { numActions: 3, banditType: 'gaussian' };
            const result = algorithms.thompson(mockDrugStats, config);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(3);
        });

        it('sollte verschiedene Aktionen über mehrere Samples wählen können', () => {
            const config = { numActions: 3, banditType: 'bernoulli' };
            const results = new Set<number>();

            for (let i = 0; i < 50; i++) {
                const result = algorithms.thompson(mockDrugStats, config);
                results.add(result);
            }

            // Aufgrund der Stochastik sollten verschiedene Aktionen gewählt werden
            expect(results.size).toBeGreaterThan(1);
        });

        it('sollte mit Bernoulli ganzzahlige Belohnungen korrekt verarbeiten', () => {
            const binaryStats = {
                drug0: { attempts: 10, sumOfRewards: 10 }, // 100% Erfolg
                drug1: { attempts: 10, sumOfRewards: 0 },  // 0% Erfolg
                drug2: { attempts: 10, sumOfRewards: 5 },  // 50% Erfolg
            };
            const config = { numActions: 3, banditType: 'bernoulli' };

            // Über viele Versuche sollte drug0 am häufigsten gewählt werden
            const counts = [0, 0, 0];
            for (let i = 0; i < 100; i++) {
                const result = algorithms.thompson(binaryStats, config);
                counts[result]++;
            }

            expect(counts[0]).toBeGreaterThan(counts[1]);
        });
    });

    describe('Edge Cases', () => {
        it('sollten alle Algorithmen mit einem einzelnen Drug umgehen können', () => {
            const singleDrug = {
                drug0: { attempts: 5, sumOfRewards: 3 },
            };
            const config = { numActions: 1, banditType: 'bernoulli' };

            expect(algorithms.greedy(singleDrug)).toBe(0);
            expect(algorithms['epsilon-greedy'](singleDrug, config)).toBe(0);
            expect(algorithms.random(singleDrug, config)).toBe(0);
            expect(algorithms.ucb(singleDrug)).toBe(0);
            expect(algorithms.thompson(singleDrug, config)).toBe(0);
        });

        it('sollten alle Algorithmen mit identischen Statistiken umgehen', () => {
            const identicalStats = {
                drug0: { attempts: 10, sumOfRewards: 5 },
                drug1: { attempts: 10, sumOfRewards: 5 },
                drug2: { attempts: 10, sumOfRewards: 5 },
            };
            const config = { numActions: 3, banditType: 'bernoulli' };

            expect(() => algorithms.greedy(identicalStats)).not.toThrow();
            expect(() => algorithms['epsilon-greedy'](identicalStats, config)).not.toThrow();
            expect(() => algorithms.random(identicalStats, config)).not.toThrow();
            expect(() => algorithms.ucb(identicalStats)).not.toThrow();
            expect(() => algorithms.thompson(identicalStats, config)).not.toThrow();
        });
    });
});