import { describe, it, expect} from 'vitest';
import {
    generateDrugProbabilities,
    getGaussianRandom,
    simulateDrugOutcome,
    initializeDrugStats
} from '../utils/banditSimulation';

describe('banditSimulation', () => {
    describe('generateDrugProbabilities', () => {
        it('sollte korrekte Anzahl an Wahrscheinlichkeiten für Bernoulli generieren', () => {
            const probs = generateDrugProbabilities(5, 'bernoulli');

            expect(probs).toHaveLength(5);
            probs.forEach(prob => {
                expect(typeof prob).toBe('number');
                expect(prob).toBeGreaterThanOrEqual(0.1);
                expect(prob).toBeLessThanOrEqual(0.9);
            });
        });

        it('sollte korrekte Anzahl an Parametern für Gaussian generieren', () => {
            const probs = generateDrugProbabilities(3, 'gaussian');

            expect(probs).toHaveLength(3);
            probs.forEach(prob => {
                expect(prob).toHaveProperty('mean');
                expect(prob).toHaveProperty('std');

                const { mean, std } = prob as { mean: number; std: number };
                expect(mean).toBeGreaterThanOrEqual(3);
                expect(mean).toBeLessThanOrEqual(9);
                expect(std).toBeGreaterThanOrEqual(0.5);
                expect(std).toBeLessThanOrEqual(1.5);
            });
        });

        it('sollte Fehler bei unbekanntem Bandit-Typ werfen', () => {
            // @ts-expect-error Testing invalid bandit type
            expect(() => generateDrugProbabilities(3, 'invalid'))
                .toThrow('Unbekannter Bandit-Typ');
        });

        it('sollte mit numActions = 1 funktionieren', () => {
            const probs = generateDrugProbabilities(1, 'bernoulli');
            expect(probs).toHaveLength(1);
        });

        it('sollte mit vielen Aktionen funktionieren', () => {
            const probs = generateDrugProbabilities(20, 'bernoulli');
            expect(probs).toHaveLength(20);
        });
    });

    describe('getGaussianRandom', () => {
        it('sollte Werte um den Mittelwert generieren', () => {
            const mean = 5;
            const std = 1;
            const samples: number[] = [];

            for (let i = 0; i < 1000; i++) {
                samples.push(getGaussianRandom(mean, std));
            }

            const sampleMean = samples.reduce((sum, val) => sum + val, 0) / samples.length;

            // Der Mittelwert sollte nahe am erwarteten Mittelwert liegen (±10% Toleranz)
            expect(sampleMean).toBeGreaterThan(mean - 0.5);
            expect(sampleMean).toBeLessThan(mean + 0.5);
        });

        it('sollte mit mean = 0 funktionieren', () => {
            const value = getGaussianRandom(0, 1);
            expect(typeof value).toBe('number');
            expect(isNaN(value)).toBe(false);
        });

        it('sollte mit verschiedenen Standardabweichungen funktionieren', () => {
            const value1 = getGaussianRandom(5, 0.1);
            const value2 = getGaussianRandom(5, 10);

            expect(typeof value1).toBe('number');
            expect(typeof value2).toBe('number');
        });

        it('sollte nie NaN zurückgeben', () => {
            for (let i = 0; i < 100; i++) {
                const value = getGaussianRandom(10, 2);
                expect(isNaN(value)).toBe(false);
            }
        });
    });

    describe('simulateDrugOutcome', () => {
        describe('Bernoulli', () => {
            it('sollte boolean Werte zurückgeben', () => {
                const probs = [0.5, 0.7, 0.3];

                for (let i = 0; i < 10; i++) {
                    const outcome = simulateDrugOutcome(0, probs, 'bernoulli');
                    expect(typeof outcome).toBe('boolean');
                }
            });

            it('sollte bei Wahrscheinlichkeit 1.0 immer true zurückgeben', () => {
                const probs = [1.0];

                for (let i = 0; i < 50; i++) {
                    const outcome = simulateDrugOutcome(0, probs, 'bernoulli');
                    expect(outcome).toBe(true);
                }
            });

            it('sollte bei Wahrscheinlichkeit 0.0 immer false zurückgeben', () => {
                const probs = [0.0];

                for (let i = 0; i < 50; i++) {
                    const outcome = simulateDrugOutcome(0, probs, 'bernoulli');
                    expect(outcome).toBe(false);
                }
            });

            it('sollte verschiedene Drugs unterschiedlich behandeln', () => {
                const probs = [0.0, 1.0, 0.5];

                expect(simulateDrugOutcome(0, probs, 'bernoulli')).toBe(false);
                expect(simulateDrugOutcome(1, probs, 'bernoulli')).toBe(true);
                // drug2 mit 0.5 kann true oder false sein
                const outcome2 = simulateDrugOutcome(2, probs, 'bernoulli');
                expect(typeof outcome2).toBe('boolean');
            });
        });

        describe('Gaussian', () => {
            it('sollte Zahlen zwischen 0 und 10 zurückgeben', () => {
                const probs = [{ mean: 5, std: 1 }];

                for (let i = 0; i < 100; i++) {
                    const outcome = simulateDrugOutcome(0, probs, 'gaussian');
                    expect(typeof outcome).toBe('number');
                    expect(outcome as number).toBeGreaterThanOrEqual(0);
                    expect(outcome as number).toBeLessThanOrEqual(10);
                }
            });

            it('sollte Werte auf eine Dezimalstelle runden', () => {
                const probs = [{ mean: 5, std: 1 }];

                for (let i = 0; i < 20; i++) {
                    const outcome = simulateDrugOutcome(0, probs, 'gaussian') as number;
                    const decimalPart = (outcome * 10) % 1;
                    expect(decimalPart).toBeCloseTo(0, 10);
                }
            });

            it('sollte extreme Werte auf 0-10 clampen', () => {
                const probs = [
                    { mean: -5, std: 0.1 }, // Sollte nahe 0 sein
                    { mean: 15, std: 0.1 }  // Sollte nahe 10 sein
                ];

                const outcome1 = simulateDrugOutcome(0, probs, 'gaussian');
                const outcome2 = simulateDrugOutcome(1, probs, 'gaussian');

                expect(outcome1).toBeGreaterThanOrEqual(0);
                expect(outcome2).toBeLessThanOrEqual(10);
            });

            it('sollte verschiedene Drugs mit unterschiedlichen Parametern verarbeiten', () => {
                const probs = [
                    { mean: 3, std: 0.5 },
                    { mean: 7, std: 0.5 }
                ];

                const samples1: number[] = [];
                const samples2: number[] = [];

                for (let i = 0; i < 100; i++) {
                    samples1.push(simulateDrugOutcome(0, probs, 'gaussian') as number);
                    samples2.push(simulateDrugOutcome(1, probs, 'gaussian') as number);
                }

                const mean1 = samples1.reduce((a, b) => a + b) / samples1.length;
                const mean2 = samples2.reduce((a, b) => a + b) / samples2.length;

                // mean2 sollte größer sein als mean1
                expect(mean2).toBeGreaterThan(mean1);
            });
        });

        it('sollte Fehler bei unbekanntem Bandit-Typ werfen', () => {
            const probs = [0.5];

            // @ts-expect-error Testing invalid bandit type
            expect(() => simulateDrugOutcome(0, probs, 'invalid'))
                .toThrow('Unbekannter Bandit-Typ');
        });
    });

    describe('initializeDrugStats', () => {
        it('sollte korrekte Anzahl an Drug-Einträgen erstellen', () => {
            const stats = initializeDrugStats(4);

            expect(Object.keys(stats)).toHaveLength(4);
            expect(stats).toHaveProperty('drug0');
            expect(stats).toHaveProperty('drug1');
            expect(stats).toHaveProperty('drug2');
            expect(stats).toHaveProperty('drug3');
        });

        it('sollte alle Stats mit 0 initialisieren', () => {
            const stats = initializeDrugStats(3);

            Object.values(stats).forEach(stat => {
                expect(stat.attempts).toBe(0);
                expect(stat.sumOfRewards).toBe(0);
            });
        });

        it('sollte mit numActions = 1 funktionieren', () => {
            const stats = initializeDrugStats(1);

            expect(Object.keys(stats)).toHaveLength(1);
            expect(stats.drug0).toEqual({ attempts: 0, sumOfRewards: 0 });
        });

        it('sollte mit vielen Aktionen funktionieren', () => {
            const stats = initializeDrugStats(20);

            expect(Object.keys(stats)).toHaveLength(20);
            expect(stats.drug19).toBeDefined();
        });

        it('sollte korrekte Struktur haben', () => {
            const stats = initializeDrugStats(2);

            expect(stats.drug0).toEqual({
                attempts: 0,
                sumOfRewards: 0
            });
            expect(stats.drug1).toEqual({
                attempts: 0,
                sumOfRewards: 0
            });
        });
    });
});