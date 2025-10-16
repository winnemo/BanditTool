/**
 * Generiert die "wahren" Erfolgsparameter für eine neue Simulation.
 * @param {number} numActions - Die Anzahl der Aktionen (Bohnen).
 * @param {string} banditType - Der Typ des Banditen ('bernoulli' oder 'gaussian').
 * @returns {Array<number|object>} Ein Array mit den Erfolgsparametern.
 */
export const generateDrugProbabilities = (numActions, banditType) => {
    const probs = [];
    for (let i = 0; i < numActions; i++) {
        // Für Bernoulli-Banditen: eine zufällige Erfolgswahrscheinlichkeit von 0.1 bis 0.9.
        if (banditType == 'bernoulli') {
            probs.push(Math.random() * 0.8 + 0.1);
            // Für Gaussian-Banditen: ein Mittelwert von 10 bis 90 und eine Standardabweichung von 5 bis 20.
        } else if(banditType == 'gaussian') {
            probs.push({
                mean: Math.random() * 6 + 3, // Werte 3 bis 9
                std:  Math.random() * 1.0 + 0.5 // Werte 0.5 bis 1.5
            });
        } else {
            throw new Error(`Unbekannter Bandit-Typ: "${banditType}"`)
        }
    }
    return probs;
};

/**
 * Erzeugt eine normalverteilte Zufallszahl mittels der Box-Muller-Transformation.
 * @param {number} mean - Der Mittelwert der Verteilung.
 * @param {number} std - Die Standardabweichung der Verteilung.
 * @returns {number} Eine normalverteilte Zufallszahl.
 */
function getGaussianRandom(mean, std) {
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
 * @param {number} drugIndex - Der Index der gewählten Aktion.
 * @param {Array<number|object>} drugProbabilities - Das Array der "wahren" Erfolgsparameter.
 * @param {string} banditType - Der Typ des Banditen.
 * @returns {boolean} True bei Erfolg, False bei Misserfolg.
 */
export const simulateDrugOutcome = (drugIndex, drugProbabilities, banditType) => {
    if (banditType == 'bernoulli') {
        // Bernoulli-Versuch: Erfolg, wenn Zufallszahl kleiner als die Erfolgswahrscheinlichkeit ist.
        return Math.random() < drugProbabilities[drugIndex];
    } else if(banditType == 'gaussian'){
        const{ mean, std } =drugProbabilities[drugIndex];
        // Ziehe einen Wert aus der Normalverteilung.
        const outcome = getGaussianRandom(mean, std);
        // Erfolg ist definiert als ein Ergebnis über dem Schwellenwert 50.
        const clampedOutcome = Math.max(0, Math.min(10, outcome));
        return Math.round(clampedOutcome * 10) / 10;
    } else {
        throw new Error(`Unbekannter Bandit-Typ: "${banditType}"`);
    }
};

/**
 * Erstellt ein initiales, leeres Statistik-Objekt.
 * @param {number} numActions - Die Anzahl der Aktionen.
 * @returns {object} Ein Objekt zur Speicherung von Versuchen und Erfolgen.
 */
export const initializeDrugStats = (numActions) => {
    const stats = {};
    for (let i = 0; i < numActions; i++) {
        stats[`drug${i}`] = { attempts: 0, sumOfRewards: 0 };
    }
    return stats;
};