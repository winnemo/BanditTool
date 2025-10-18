import { type DrugStats } from '../hooks/useGameLogic';

type BanditType = 'bernoulli' | 'gaussian';
/**
 * Generiert die "wahren" Erfolgsparameter für eine neue Simulation.
 */
export const generateDrugProbabilities = (numActions : number, banditType : BanditType) => {
    const probs = [];
    for (let i = 0; i < numActions; i++) {
        // Für Bernoulli-Banditen: eine zufällige Erfolgswahrscheinlichkeit von 0.1 bis 0.9.
        if (banditType == 'bernoulli') {
            probs.push(Math.random() * 0.8 + 0.1);
            // Für Gaussian-Banditen: ein Mittelwert von 10 bis 90 und eine Standardabweichung von 5 bis 20.
        } else if(banditType == 'gaussian') {
            probs.push({
                mean: Math.random() * 6 + 3, // Werte 3 bis 9
                std:  Math.random() + 0.5 // Werte 0.5 bis 1.5
            });
        } else {
            throw new Error(`Unbekannter Bandit-Typ: "${banditType}"`)
        }
    }
    return probs;
};

/**
 * Erzeugt eine normalverteilte Zufallszahl mittels der Box-Muller-Transformation.
 */
export function getGaussianRandom(mean: number, std: number) {
    let u = 0, v = 0;
    // Stellt sicher, dass u und v nicht null sind, um log(0) zu vermeiden.
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    // Box-Muller-Formel zur Umwandlung von uniformen in normalverteilte Zufallszahlen.
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Skaliert das Ergebnis auf den gewünschten Mittelwert und die Standardabweichung.
    return z * std + mean;
}

/**
 * Simuliert das Ergebnis einer einzelnen Aktion basierend auf dem Verteilungstyp.
 */
export const simulateDrugOutcome = (
    drugIndex: number,
    drugProbabilities: (number | { mean: number; std: number })[],
    banditType: BanditType
): boolean | number => {
    if (banditType === 'bernoulli') {
        return Math.random() < (drugProbabilities[drugIndex] as number);

    } else if (banditType === 'gaussian') {
        const { mean, std } = drugProbabilities[drugIndex] as { mean: number; std: number };

        const outcome = getGaussianRandom(mean, std);
        const clampedOutcome = Math.max(0, Math.min(10, outcome));
        return Math.round(clampedOutcome * 10) / 10;

    } else {
        throw new Error(`Unbekannter Bandit-Typ: "${banditType}"`);
    }
};

/**
 * Erstellt ein initiales, leeres Statistik-Objekt.
 */
export const initializeDrugStats = (numActions: number) => {
    const stats: DrugStats = {};
    for (let i = 0; i < numActions; i++) {
        stats[`drug${i}`] = { attempts: 0, sumOfRewards: 0 };
    }
    return stats;
};