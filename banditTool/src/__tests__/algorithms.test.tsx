import { algorithms } from '../utils/algorithms';
import { describe, it, expect } from 'vitest';

describe('algorithms', () => {
    describe('greedy', () => {
        it('sollte die Aktion mit der höchsten durchschnittlichen Belohnung wählen', () => {
            const drugStats = {
                drug0: { attempts: 10, sumOfRewards: 3 },  // Avg: 0.3
                drug1: { attempts: 10, sumOfRewards: 7 },  // Avg: 0.7
                drug2: { attempts: 10, sumOfRewards: 5 }   // Avg: 0.5
            };

            const result = algorithms.greedy(drugStats);
            expect(result).toBe(1);
        });

        it('sollte die erste Aktion wählen bei gleichen Belohnungsraten', () => {
            const drugStats = {
                drug0: { attempts: 10, sumOfRewards: 5 },
                drug1: { attempts: 10, sumOfRewards: 5 },
                drug2: { attempts: 10, sumOfRewards: 5 }
            };

            const result = algorithms.greedy(drugStats);
            expect(result).toBe(0);
        });

        it('sollte mit unbenutzten Aktionen umgehen können', () => {
            const drugStats = {
                drug0: { attempts: 0, sumOfRewards: 0 },
                drug1: { attempts: 5, sumOfRewards: 3 }, // Avg: 0.6
                drug2: { attempts: 0, sumOfRewards: 0 }
            };

            const result = algorithms.greedy(drugStats);
            expect(result).toBe(1);
        });

        it('sollte die erste Aktion wählen, wenn alle unbenutzt sind', () => {
            const drugStats = {
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
                drug0: { attempts: 10, sumOfRewards: 3 },
                drug1: { attempts: 10, sumOfRewards: 7 },
                drug2: { attempts: 10, sumOfRewards: 5 }
            };
            const config = {
                numActions: 5,
                banditType: 'bernoulli' // Der Typ ist für diesen Test nicht relevant, muss aber für die Signatur vorhanden sein.
            };

            const result = algorithms['epsilon-greedy'](drugStats, config);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(config.numActions);
        });

        it('sollte manchmal explorieren (über mehrere Aufrufe)', () => {
            const drugStats = {
                drug0: { attempts: 10, sumOfRewards: 1 },
                drug1: { attempts: 10, sumOfRewards: 9 }, // klar die beste Wahl
                drug2: { attempts: 10, sumOfRewards: 1 }
            };
            const config = {
                numActions: 3,
                banditType: 'epsilon-greedy' // Der Typ ist für diesen Test nicht relevant, muss aber für die Signatur vorhanden sein.
            };

            const results = new Set();
            for (let i = 0; i < 100; i++) {
                results.add(algorithms['epsilon-greedy'](drugStats, config));
            }

            // Mit epsilon=0.1 sollten über 100 Versuche sehr wahrscheinlich mehrere Aktionen gewählt werden
            expect(results.size).toBeGreaterThan(1);
        });
    });

    describe('random', () => {
        it('sollte einen gültigen zufälligen Index zurückgeben', () => {
            const drugStats = {};
            const config = {
                numActions: 5,
                banditType: 'bernoulli' // Der Typ ist für diesen Test nicht relevant, muss aber für die Signatur vorhanden sein.
            };

            const result = algorithms.random(drugStats, config);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(config.numActions);
        });

        it('sollte verschiedene Werte über mehrere Aufrufe zurückgeben', () => {
            const drugStats = {};
            const config = {
                numActions: 5,
                banditType: 'bernoulli' // Der Typ ist für diesen Test nicht relevant, muss aber für die Signatur vorhanden sein.
            };

            const results = new Set();
            for (let i = 0; i < 50; i++) {
                results.add(algorithms.random(drugStats, config));
            }

            // Bei 50 zufälligen Versuchen sollten wir mehrere verschiedene Werte sehen
            expect(results.size).toBeGreaterThan(1);
        });
    });

    describe('ucb', () => {
        it('sollte eine ungetestete Aktion wählen, wenn welche vorhanden sind', () => {
            const drugStats = {
                drug0: { attempts: 5, sumOfRewards: 3 },
                drug1: { attempts: 0, sumOfRewards: 0 }, // ungetestet
                drug2: { attempts: 3, sumOfRewards: 2 }
            };

            const result = algorithms.ucb(drugStats);
            // Sollte die ungetestete Aktion wählen
            expect(result).toBe(1);
        });

        it('sollte eine zufällige ungetestete Aktion wählen, wenn mehrere vorhanden sind', () => {
            const drugStats = {
                drug0: { attempts: 5, sumOfRewards: 3 },
                drug1: { attempts: 0, sumOfRewards: 0 }, // ungetestet
                drug2: { attempts: 0, sumOfRewards: 0 }  // ungetestet
            };

            const results = new Set();
            for (let i = 0; i < 50; i++) {
                results.add(algorithms.ucb(drugStats));
            }

            // Sollte sowohl 1 als auch 2 wählen (nicht 0)
            expect(results.has(0)).toBe(false);
            expect(results.size).toBeGreaterThan(1);
        });

        it('sollte die Aktion mit dem höchsten UCB-Wert wählen', () => {
            const drugStats = {
                drug0: { attempts: 10, sumOfRewards: 3 },  // Avg: 0.3, UCB niedrig (viele Versuche)
                drug1: { attempts: 10, sumOfRewards: 7 },  // Avg: 0.7, UCB hoch (beste durchschnittliche Belohnung)
                drug2: { attempts: 2, sumOfRewards: 1 }    // Avg: 0.5, UCB sehr hoch (wenige Versuche = hoher Explorationsbonus)
            };

            const result = algorithms.ucb(drugStats);
            // Drug2 sollte gewählt werden, da der Explorationsbonus den niedrigeren Durchschnitt ausgleicht
            // UCB für drug2: 0.5 + sqrt(2 * ln(22) / 2) ≈ 0.5 + 1.86 = 2.36
            // UCB für drug1: 0.7 + sqrt(2 * ln(22) / 10) ≈ 0.7 + 0.83 = 1.53
            expect(result).toBe(2);
        });

        it('sollte die Aktion mit der besten Performance wählen, wenn alle gleich oft getestet wurden', () => {
            const drugStats = {
                drug0: { attempts: 10, sumOfRewards: 3 },  // Avg: 0.3
                drug1: { attempts: 10, sumOfRewards: 7 },  // Avg: 0.7
                drug2: { attempts: 10, sumOfRewards: 5 }   // Avg: 0.5
            };

            const result = algorithms.ucb(drugStats);
            // Bei gleicher Anzahl von Versuchen ist der Explorationsbonus gleich
            // Daher sollte die Aktion mit dem höchsten Durchschnitt gewählt werden
            expect(result).toBe(1);
        });

        it('sollte einen gültigen Index zurückgeben', () => {
            const drugStats = {
                drug0: { attempts: 5, sumOfRewards: 2 },
                drug1: { attempts: 3, sumOfRewards: 2 },
                drug2: { attempts: 7, sumOfRewards: 4 }
            };

            const result = algorithms.ucb(drugStats);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(3);
        });

        it('sollte Exploration bevorzugen bei wenig getesteten Aktionen', () => {
            const drugStats = {
                drug0: { attempts: 100, sumOfRewards: 90 }, // Avg: 0.9, sehr gut aber oft getestet
                drug1: { attempts: 1, sumOfRewards: 0 },    // Avg: 0.0, schlecht aber kaum getestet
                drug2: { attempts: 100, sumOfRewards: 85 }  // Avg: 0.85, gut und oft getestet
            };

            const result = algorithms.ucb(drugStats);
            // Der hohe Explorationsbonus von drug1 sollte den niedrigen Durchschnitt kompensieren
            // UCB für drug1: 0.0 + sqrt(2 * ln(201) / 1) ≈ 0.0 + 3.32 = 3.32
            // UCB für drug0: 0.9 + sqrt(2 * ln(201) / 100) ≈ 0.9 + 0.33 = 1.23
            expect(result).toBe(1);
        });

        it('sollte konsistente Ergebnisse für identische Eingaben liefern', () => {
            const drugStats = {
                drug0: { attempts: 5, sumOfRewards: 3 },
                drug1: { attempts: 5, sumOfRewards: 4 },
                drug2: { attempts: 5, sumOfRewards: 2 }
            };

            const result1 = algorithms.ucb(drugStats);
            const result2 = algorithms.ucb(drugStats);
            const result3 = algorithms.ucb(drugStats);

            // Bei gleichen Statistiken sollte immer die gleiche Wahl getroffen werden
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
            expect(result1).toBe(1); // drug1 hat die höchste durchschnittliche Belohnung
        });

        it('sollte die erste Aktion wählen, wenn alle unbenutzt sind', () => {
            const drugStats = {
                drug0: { attempts: 0, sumOfRewards: 0 },
                drug1: { attempts: 0, sumOfRewards: 0 },
                drug2: { attempts: 0, sumOfRewards: 0 }
            };

            // Da alle ungetestet sind, sollte eine zufällige gewählt werden
            // Wir prüfen nur, dass ein gültiger Index zurückgegeben wird
            const results = new Set();
            for (let i = 0; i < 30; i++) {
                const result = algorithms.ucb(drugStats);
                expect(result).toBeGreaterThanOrEqual(0);
                expect(result).toBeLessThan(3);
                results.add(result);
            }
            // Über mehrere Durchläufe sollten verschiedene Aktionen gewählt werden
            expect(results.size).toBeGreaterThan(1);
        });
    });
});