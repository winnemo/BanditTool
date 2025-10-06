import { algorithms } from '../utils/algorithms';

describe('algorithms', () => {
    describe('greedy', () => {
        it('sollte die Aktion mit der höchsten Erfolgsrate wählen', () => {
            const drugStats = {
                drug0: { attempts: 10, successes: 3 },
                drug1: { attempts: 10, successes: 7 },
                drug2: { attempts: 10, successes: 5 }
            };

            const result = algorithms.greedy(drugStats);
            expect(result).toBe(1);
        });

        it('sollte die erste Aktion wählen bei gleichen Raten', () => {
            const drugStats = {
                drug0: { attempts: 10, successes: 5 },
                drug1: { attempts: 10, successes: 5 },
                drug2: { attempts: 10, successes: 5 }
            };

            const result = algorithms.greedy(drugStats);
            expect(result).toBe(0);
        });

        it('sollte mit unbenutzten Aktionen umgehen können', () => {
            const drugStats = {
                drug0: { attempts: 0, successes: 0 },
                drug1: { attempts: 5, successes: 3 },
                drug2: { attempts: 0, successes: 0 }
            };

            const result = algorithms.greedy(drugStats);
            expect(result).toBe(1);
        });

        it('sollte die erste Aktion wählen wenn alle unbenutzt sind', () => {
            const drugStats = {
                drug0: { attempts: 0, successes: 0 },
                drug1: { attempts: 0, successes: 0 },
                drug2: { attempts: 0, successes: 0 }
            };

            const result = algorithms.greedy(drugStats);
            expect(result).toBe(0);
        });
    });

    describe('epsilon-greedy', () => {
        it('sollte einen gültigen Index zurückgeben', () => {
            const drugStats = {
                drug0: { attempts: 10, successes: 3 },
                drug1: { attempts: 10, successes: 7 },
                drug2: { attempts: 10, successes: 5 }
            };
            const numActions = 3;

            const result = algorithms['epsilon-greedy'](drugStats, numActions);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(numActions);
        });

        it('sollte manchmal explorieren (über mehrere Aufrufe)', () => {
            const drugStats = {
                drug0: { attempts: 10, successes: 1 },
                drug1: { attempts: 10, successes: 9 },
                drug2: { attempts: 10, successes: 1 }
            };
            const numActions = 3;

            const results = new Set();
            for (let i = 0; i < 100; i++) {
                results.add(algorithms['epsilon-greedy'](drugStats, numActions));
            }

            // Mit epsilon=0.1 sollten über 100 Versuche mehrere Aktionen gewählt werden
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