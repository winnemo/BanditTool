import {
    generateDrugProbabilities,
    initializeDrugStats,
    simulateDrugOutcome
} from '../utils/banditSimulation';
import { describe, test, expect } from 'vitest';

// ## Tests für initializeDrugStats ##
describe('initializeDrugStats', () => {
    test('sollte ein Statistik-Objekt für 3 Aktionen korrekt erstellen', () => {
        const numActions = 3;
        const stats = initializeDrugStats(numActions);

        expect(Object.keys(stats)).toHaveLength(3);
        // Prüft jetzt auf 'sumOfRewards'
        expect(stats['drug0']).toEqual({ attempts: 0, sumOfRewards: 0 });
        expect(stats['drug2']).toBeDefined();
    });
});

// ## Tests für generateDrugProbabilities ##
describe('generateDrugProbabilities', () => {
    test('sollte für Bernoulli Wahrscheinlichkeiten im Bereich [0.1, 0.9] erstellen', () => {
        const probabilities = generateDrugProbabilities(10, 'bernoulli') as number[];

        expect(probabilities).toHaveLength(10);
        probabilities.forEach(prob => {
            expect(prob).toBeGreaterThanOrEqual(0.1);
            expect(prob).toBeLessThanOrEqual(0.9);
        });
    });

    test('sollte für Gaussian korrekte Parameter-Objekte erstellen', () => {
        const params = generateDrugProbabilities(5, 'gaussian') as { mean: number, std: number }[];

        expect(params).toHaveLength(5);
        params.forEach(param => {
            // Angepasst an die neuen Werte in deiner Funktion
            expect(param.mean).toBeGreaterThanOrEqual(3);
            expect(param.mean).toBeLessThanOrEqual(9);
            expect(param.std).toBeGreaterThanOrEqual(0.5);
            expect(param.std).toBeLessThanOrEqual(1.5);
        });
    });
});

// ## NEU: Tests für simulateDrugOutcome ##
describe('simulateDrugOutcome', () => {
    test('sollte für Bernoulli einen boolean zurückgeben', () => {
        const probabilities = [0.5]; // 50% Wahrscheinlichkeit
        const result = simulateDrugOutcome(0, probabilities, 'bernoulli');
        // Wir können nur den Typ prüfen, nicht den zufälligen Wert
        expect(typeof result).toBe('boolean');
    });

    test('sollte für Gaussian eine Zahl zwischen 0 und 10 zurückgeben', () => {
        const probabilities = [{ mean: 5, std: 1 }];
        const result = simulateDrugOutcome(0, probabilities, 'gaussian');

        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(10);
    });

    test('sollte für Gaussian Belohnungen um den Mittelwert herum generieren', () => {
        const probabilities = [{ mean: 8, std: 0.1 }]; // Geringe Abweichung für einen vorhersagbaren Test
        let sum = 0;
        const iterations = 100;

        for (let i = 0; i < iterations; i++) {
            sum += simulateDrugOutcome(0, probabilities, 'gaussian');
        }
        const average = sum / iterations;

        // Der Durchschnitt von 100 Versuchen sollte sehr nah am Mittelwert von 8 liegen
        expect(average).toBeCloseTo(8, 0); // Prüft auf eine Genauigkeit von 0 Dezimalstellen
    });
});