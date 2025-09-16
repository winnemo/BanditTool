export const generateDrugProbabilities = (numDrugs, banditType) => {
    const probs = [];
    for (let i = 0; i < numDrugs; i++) {
        if (banditType === 'bernoulli') {
            probs.push(Math.random() * 0.8 + 0.1); // Between 0.1 and 0.9
        } else {
            probs.push({
                mean: Math.random() * 80 + 10, // Mean between 10-90
                std: Math.random() * 15 + 5    // Std between 5-20
            });
        }
    }
    return probs;
};

export const simulateDrugOutcome = (drugIndex, drugProbabilities, banditType) => {
    if (banditType === 'bernoulli') {
        return Math.random() < drugProbabilities[drugIndex];
    } else {
        const { mean, std } = drugProbabilities[drugIndex];
        const outcome = mean + (Math.random() - 0.5) * 2 * std;
        return outcome > 50; // Threshold for success
    }
};

export const initializeDrugStats = (numDrugs) => {
    const stats = {};
    for (let i = 0; i < numDrugs; i++) {
        stats[`drug${i}`] = { attempts: 0, successes: 0 };
    }
    return stats;
};