import { getGaussianRandom } from './banditSimulation';

// Hilfsfunktion zur Erzeugung einer Gamma-verteilten Zufallszahl
// (Nötig für die Beta-Verteilungs-Stichprobe)
const gammaSample = (alpha: number, beta: number): number => {
    // Implementierung basierend auf der Methode von Marsaglia und Tsang
    if (alpha < 1) {
        return gammaSample(alpha + 1, beta) * Math.pow(Math.random(), 1 / alpha);
    }
    const d = alpha - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    let x, v;
    while (true) {
        do {
            x = getGaussianRandom(0, 1); // Wir brauchen eine Standard-Normalverteilung
            v = 1 + c * x;
        } while (v <= 0);
        v = v * v * v;
        const u = Math.random();
        const x2 = x * x;
        if (u < 1 - 0.0331 * x2 * x2) return d * v * beta;
        if (Math.log(u) < 0.5 * x2 + d * (1 - v + Math.log(v))) return d * v * beta;
    }
};

// Hilfsfunktion zur Erzeugung einer Beta-verteilten Zufallszahl
const betaSample = (alpha: number, beta: number): number => {
    const ga = gammaSample(alpha, 1);
    const gb = gammaSample(beta, 1);
    return ga / (ga + gb);
};
// in algorithms.tsx

// Hinzugefügte Typ-Definitionen für mehr Sicherheit
interface DrugStat {
    attempts: number;
    sumOfRewards: number;
}

interface DrugStats {
    [key: string]: DrugStat;
}

type AlgorithmFunction = (drugStats: DrugStats, config?: { numActions: number; banditType: string }) => number;

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
    'epsilon-greedy': (drugStats, config) => {
        if (!config) {
            throw new Error("Epsilon-Greedy benötigt ein Konfigurationsobjekt.");
        }

        if (Math.random() < 0.1) {
            return Math.floor(Math.random() * config.numActions);
        } else {
            return algorithms.greedy(drugStats);
        }
    },

    /**
     * Wählt immer eine zufällige Aktion.
     */
    random: (_drugStats, config) => {
        if(!config){
            throw Error("Random benötigt Konfigurationsobjekt.")
        }
        return Math.floor(Math.random() * config.numActions);
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

    thompson: (drugStats, config) => {
        if (!config) {
            throw new Error("Thompson Sampling benötigt ein Konfigurationsobjekt.");
        }
        let bestDrug = 0;
        let maxSampledValue = -Infinity;
        const drugKeys = Object.keys(drugStats);

        for (let i = 0; i < drugKeys.length; i++) {
            const key = drugKeys[i];
            const stats = drugStats[key];

            // Wenn eine Option noch nie probiert wurde, wähle sie, um Daten zu sammeln.
            if (stats.attempts === 0) {
                return i;
            }

            let sampledValue: number;

            if (config.banditType === 'bernoulli') {
                const successes = stats.sumOfRewards;
                const failures = stats.attempts - successes;

                // Parameter für die Beta-Verteilung (Prior: 1 Erfolg, 1 Misserfolg)
                const alpha = successes + 1;
                const beta = failures + 1;

                sampledValue = betaSample(alpha, beta);

            } else { // 'gaussian'
                const mean = stats.sumOfRewards / stats.attempts;
                // Die Unsicherheit (Standardabweichung) nimmt mit der Anzahl der Versuche ab.
                // Ein einfacher Ansatz ist 1 / sqrt(Anzahl der Versuche).
                const stdDev = 1 / Math.sqrt(stats.attempts);

                sampledValue = getGaussianRandom(mean, stdDev);
            }

            if (sampledValue > maxSampledValue) {
                maxSampledValue = sampledValue;
                bestDrug = i;
            }
        }

        return bestDrug;
    },
};