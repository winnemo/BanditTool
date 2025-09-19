import {
    generateDrugProbabilities,
    initializeDrugStats
} from '../utils/banditSimulation';
import { describe, test, expect } from 'vitest';

// 'describe' gruppiert zusammengehörige Tests
describe('initializeDrugStats', () => {

    // 'test' oder 'it' definiert einen einzelnen Testfall
    test('sollte ein Statistik-Objekt für 3 Medikamente korrekt erstellen', () => {
        const numDrugs = 3;
        const stats = initializeDrugStats(numDrugs);

        // 'expect' prüft, ob das Ergebnis den Erwartungen entspricht
        expect(Object.keys(stats)).toHaveLength(3); //3 Schlüssel?
        expect(stats['drug0']).toEqual({ attempts: 0, successes: 0 }); //Wert korrekt?
        expect(stats['drug2']).toBeDefined(); // Ist der letzte Schlüssel vorhanden?
    });
});

describe('generateDrugProbabilities', () => {

    test('sollte für Bernoulli Wahrscheinlichkeiten im Bereich [0.1, 0.9] erstellen', () => {
        const probabilities = generateDrugProbabilities(10, 'bernoulli') as number[];

        expect(probabilities).toHaveLength(10);
        // Da Ergebnis zufällig -> prüfen nicht den genauen Wert, sondern die Eigenschaften
        probabilities.forEach(prob => {
            expect(prob).toBeGreaterThanOrEqual(0.1);
            expect(prob).toBeLessThanOrEqual(0.9);
        });
    });

    test('sollte für Gaussian korrekte Parameter-Objekte erstellen', () => {
        const params = generateDrugProbabilities(5, 'gaussian') as { mean: number, std: number }[];

        expect(params).toHaveLength(5);
        params.forEach(param => {
            expect(param.mean).toBeGreaterThanOrEqual(10);
            expect(param.mean).toBeLessThanOrEqual(90);
            expect(param.std).toBeGreaterThanOrEqual(5);
            expect(param.std).toBeLessThanOrEqual(20);
        });
    });
});