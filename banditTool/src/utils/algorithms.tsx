// in algorithms.tsx

// Hinzugefügte Typ-Definitionen für mehr Sicherheit
interface DrugStat {
    attempts: number;
    successes: number;
}

interface DrugStats {
    [key: string]: DrugStat;
}

type AlgorithmFunction = (drugStats: DrugStats, numActions?: number) => number;

/**
 * Ein Objekt, das verschiedene Algorithmen zur Lösung des Multi-Armed Bandit-Problems enthält.
 */
export const algorithms: { [key: string]: AlgorithmFunction } = {
    /**
     * Wählt immer die Aktion mit der bisher höchsten Erfolgsrate.
     */
    greedy: (drugStats) => {
        let bestDrug = 0;
        let bestRate = -1;

        Object.keys(drugStats).forEach((drugKey, index) => {
            const stats = drugStats[drugKey];
            const rate = stats.attempts > 0 ? stats.successes / stats.attempts : 0;

            if (rate > bestRate) {
                bestRate = rate;
                bestDrug = index;
            }
        });
        return bestDrug;
    },

    /**
     * Wählt meistens die beste Aktion, aber mit 10% Wahrscheinlichkeit eine zufällige.
     */
    'epsilon-greedy': (drugStats, numActions = 1) => { // numActions mit Default-Wert versehen
        if (Math.random() < 0.1) {
            return Math.floor(Math.random() * numActions);
        } else {
            return algorithms.greedy(drugStats);
        }
    },

    /**
     * Wählt immer eine zufällige Aktion.
     */
    random: (drugStats, numActions = 1) => { // numActions mit Default-Wert versehen
        return Math.floor(Math.random() * numActions);
    }
};