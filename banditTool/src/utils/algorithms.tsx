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
        let bestAverageReward = -Infinity;

        Object.keys(drugStats).forEach((drugKey, index) => {
            const stats = drugStats[drugKey];

            // Logik von Algorithm 1: Optimistischer Startwert
            const averageReward = stats.attempts > 0
                ? (stats.sumOfRewards / stats.attempts)
                : 0.5;

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
        const totalAttempts = Object.values(drugStats).reduce(
            (sum, stats) => sum + stats.attempts,
            0
        );

        // Edge Case: Verhindert log(0) im allerersten Zug
        if (totalAttempts === 0) {
            const numActions = Object.keys(drugStats).length;
            return Math.floor(Math.random() * numActions);
        }

        let bestDrug = 0;
        let bestUCB = -Infinity;

        Object.keys(drugStats).forEach((drugKey, index) => {
            const stats = drugStats[drugKey];

            const n_pull = stats.attempts === 0 ? 1 : stats.attempts;
            const averageReward = stats.attempts === 0 ? 0 : (stats.sumOfRewards / stats.attempts);

            // UCB1-Formel (entspricht p_hat + sqrt(log(timestep) / n_pull))
            const explorationBonus = Math.sqrt((2 * Math.log(totalAttempts)) / n_pull);
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
            let sampledValue: number;

            // Logik von Algorithm 4: Reines Sampling aus dem Posterior
            if (config.banditType === 'bernoulli') {
                const successes = stats.sumOfRewards;
                const failures = stats.attempts - successes;

                // Prior ist (1, 1). Wenn attempts=0, wird aus Beta(1, 1) gesampelt.
                const alpha = successes + 1;
                const beta = failures + 1;
                sampledValue = betaSample(alpha, beta);

            } else { // 'gaussian'
                // Angepasste Logik für Gaussian mit Prior
                let mean: number;
                let stdDev: number;

                if (stats.attempts === 0) {
                    // Prior-Annahme: Mittelwert 0, hohe Unsicherheit
                    mean = 0;
                    stdDev = 1;
                } else {
                    mean = stats.sumOfRewards / stats.attempts;
                    stdDev = 1 / Math.sqrt(stats.attempts);
                }
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
