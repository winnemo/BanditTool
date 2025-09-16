export const algorithms = {
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

    'epsilon-greedy': (drugStats, numDrugs) => {
        if (Math.random() < 0.1) { // 10% exploration
            return Math.floor(Math.random() * numDrugs);
        } else {
            return algorithms.greedy(drugStats);
        }
    },

    random: (drugStats, numDrugs) => {
        return Math.floor(Math.random() * numDrugs);
    }
};