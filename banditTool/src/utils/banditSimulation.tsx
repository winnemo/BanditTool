
//Gerieren der Startparameter für Simulation
export const generateDrugProbabilities = (numDrugs, banditType) => {
    const probs = [];
    for (let i = 0; i < numDrugs; i++) {
        //für bernoulli: zufällige Erfolgsw'keit von 0.1-0.9
        if (banditType == 'bernoulli') {
            probs.push(Math.random() * 0.8 + 0.1);
            //für gaussian mean von 10 - 90 und St. Abw. 5 - 20
        } else if(banditType == 'gaussian') {
            probs.push({
                mean: Math.random() * 80 + 10,
                std: Math.random() * 15 + 5
            });
        } else {
            throw new Error(`Unbekannter Bandit-Typ: "${banditType}"`)
        }
    }
    return probs;
};

//Hilfsfunktion für Gaussverteilung (Box-Muller-Transformation)
function getGaussianRandom(mean, std) {
    let u = 0, v = 0;
    //sicherstellen, dass u und v nicht null sind (kein log(0))
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    //Box Muller Formel
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    //Skalieren mit Mittelwert und Standardabweichung
    return z * std + mean;
}

//Ergebnissimulation für ein einzelnes Medikament (basierend auf Verteilungstyp)
export const simulateDrugOutcome = (drugIndex, drugProbabilities, banditType) => {
    if (banditType == 'bernoulli') {
        //Bernoulli:  Erfolg wenn Zufallszahl kleiner als Erfolgswahrscheinlichkeit
        return Math.random() < drugProbabilities[drugIndex];
    } else if(banditType == 'gaussian'){
        const{ mean, std } =drugProbabilities[drugIndex];
        //Wert aus Normalverteilung ziehen
        const outcome = getGaussianRandom(mean, std);
        //Erfolg wenn Ergebnis über 50
        return outcome > 50;
    } else {
        throw new Error(`Unbekannter Bandit-Typ: "${banditType}"`);
    }
};

export const initializeDrugStats = (numDrugs) => {
    const stats = {};
    for (let i = 0; i < numDrugs; i++) {
        stats[`drug${i}`] = { attempts: 0, successes: 0 };
    }
    return stats;
};
