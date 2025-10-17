import { algorithms } from '../utils/algorithms';

describe('algorithms', () => {
    describe('greedy', () => {
        // Beschreibung an die neue Logik angepasst
        it('sollte die Aktion mit der höchsten durchschnittlichen Belohnung wählen', () => {
            const drugStats = {
                // 'successes' zu 'sumOfRewards' geändert
                drug0: { attempts: 10, sumOfRewards: 3 },  // Avg: 0.3
                drug1: { attempts: 10, sumOfRewards: 7 },  // Avg: 0.7
                drug2: { attempts: 10, sumOfRewards: 5 }   // Avg: 0.5
            };

            const result = algorithms.greedy(drugStats);
            expect(result).toBe(1);
        });

        it('sollte die erste Aktion wählen bei gleichen Belohnungsraten', () => {
            const drugStats = {
                // 'successes' zu 'sumOfRewards' geändert
                drug0: { attempts: 10, sumOfRewards: 5 },
                drug1: { attempts: 10, sumOfRewards: 5 },
                drug2: { attempts: 10, sumOfRewards: 5 }
            };

            const result = algorithms.greedy(drugStats);
            expect(result).toBe(0);
        });

        it('sollte mit unbenutzten Aktionen umgehen können', () => {
            const drugStats = {
                // 'successes' zu 'sumOfRewards' geändert
                drug0: { attempts: 0, sumOfRewards: 0 },
                drug1: { attempts: 5, sumOfRewards: 3 }, // Avg: 0.6
                drug2: { attempts: 0, sumOfRewards: 0 }
            };

            const result = algorithms.greedy(drugStats);
            expect(result).toBe(1);
        });

        it('sollte die erste Aktion wählen, wenn alle unbenutzt sind', () => {
            const drugStats = {
                // 'successes' zu 'sumOfRewards' geändert
                drug0: { attempts: 0, sumOfRewards: 0 },
                drug1: { attempts: 0, sumOfRewards: 0 },
                drug2: { attempts: 0, sumOfRewards: 0 }
            };

            const result = algorithms.greedy(drugStats);
            expect(result).toBe(0);
        });
    });

    describe('epsilon-greedy', () => {
        it('sollte einen gültigen Index zurückgeben', () => {
            const drugStats = {
                // 'successes' zu 'sumOfRewards' geändert
                drug0: { attempts: 10, sumOfRewards: 3 },
                drug1: { attempts: 10, sumOfRewards: 7 },
                drug2: { attempts: 10, sumOfRewards: 5 }
            };
            const numActions = 3;

            const result = algorithms['epsilon-greedy'](drugStats, numActions);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(numActions);
        });

        it('sollte manchmal explorieren (über mehrere Aufrufe)', () => {
            const drugStats = {
                // 'successes' zu 'sumOfRewards' geändert
                drug0: { attempts: 10, sumOfRewards: 1 },
                drug1: { attempts: 10, sumOfRewards: 9 }, // klar die beste Wahl
                drug2: { attempts: 10, sumOfRewards: 1 }
            };
            const numActions = 3;

            const results = new Set();
            for (let i = 0; i < 100; i++) {
                results.add(algorithms['epsilon-greedy'](drugStats, numActions));
            }

            // Mit epsilon=0.1 sollten über 100 Versuche sehr wahrscheinlich mehrere Aktionen gewählt werden
            expect(results.size).toBeGreaterThan(1);
        });
    });

    describe('random', () => {
        it('sollte einen gültigen zufälligen Index zurückgeben', () => {
            const drugStats = {};
            const numActions = 5;

            const result = algorithms.random(drugStats, numActions);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(numActions);
        });

        it('sollte verschiedene Werte über mehrere Aufrufe zurückgeben', () => {
            const drugStats = {};
            const numActions = 3;

            const results = new Set();
            for (let i = 0; i < 50; i++) {
                results.add(algorithms.random(drugStats, numActions));
            }

            // Bei 50 zufälligen Versuchen sollten wir mehrere verschiedene Werte sehen
            expect(results.size).toBeGreaterThan(1);
        });
    });
});