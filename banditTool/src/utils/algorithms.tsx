// in algorithms.tsx

// Hinzugefügte Typ-Definitionen für mehr Sicherheit
interface DrugStat {
    attempts: number;
    sumOfRewards: number;
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
        let bestAverageReward = -1;

        Object.keys(drugStats).forEach((drugKey, index) => {
            const stats = drugStats[drugKey];
            const averageReward = stats.attempts > 0 ? stats.sumOfRewards / stats.attempts : 0;

            if (averageReward > bestAverageReward) {
                bestAverageReward = averageReward;
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
    },

    /**.
     * Balanciert Exploitation und Exploration durch Berechnung einer oberen Konfidenzgrenze.
     * Wählt die Aktion mit dem höchsten UCB-Wert: Durchschnittsreward + sqrt(2 * ln(Gesamtversuche) / Versuche_dieser_Aktion)
     */
    ucb: (drugStats) => {
        // Gesamtanzahl aller Versuche berechnen
        const totalAttempts = Object.values(drugStats).reduce(
            (sum, stats) => sum + stats.attempts,
            0
        );

        // Falls noch nicht alle Aktionen mindestens einmal versucht wurden, wähle eine ungetestete
        const untestedActions: number[] = [];
        Object.keys(drugStats).forEach((drugKey, index) => {
            if (drugStats[drugKey].attempts === 0) {
                untestedActions.push(index);
            }
        });

        if (untestedActions.length > 0) {
            return untestedActions[Math.floor(Math.random() * untestedActions.length)];
        }

        // UCB-Wert für jede Aktion berechnen
        let bestDrug = 0;
        let bestUCB = -Infinity;

        Object.keys(drugStats).forEach((drugKey, index) => {
            const stats = drugStats[drugKey];
            const averageReward = stats.sumOfRewards / stats.attempts;

            // UCB-Formel: μ + sqrt(2 * ln(N) / n)
            const explorationBonus = Math.sqrt((2 * Math.log(totalAttempts)) / stats.attempts);
            const ucbValue = averageReward + explorationBonus;

            if (ucbValue > bestUCB) {
                bestUCB = ucbValue;
                bestDrug = index;
            }
        });

        return bestDrug;
    },
};