/**
 * Ein Objekt, das verschiedene Algorithmen zur Lösung des Multi-Armed Bandit-Problems enthält.
 * Jede Funktion entscheidet, welche Aktion als Nächstes ausgeführt werden soll.
 */
export const algorithms = {
    /**
     * Wählt immer die Aktion mit der bisher höchsten Erfolgsrate.
     * @param {object} drugStats - Objekt mit Statistiken { attempts, successes } für jede Aktion.
     * @returns {number} Der Index der besten Aktion.
     */
    greedy: (drugStats) => {
        let bestDrug = 0;
        let bestRate = -1;

        // Iteriere über alle Aktionen (Bohnen) im Statistik-Objekt.
        Object.keys(drugStats).forEach((drugKey, index) => {
            const stats = drugStats[drugKey];
            // Berechne die Erfolgsrate. Falls noch keine Versuche gemacht wurden, ist die Rate 0.
            const rate = stats.attempts > 0 ? stats.successes / stats.attempts : 0;

            // Wenn die aktuelle Rate besser ist als die bisher beste, merke sie dir.
            if (rate > bestRate) {
                bestRate = rate;
                bestDrug = index;
            }
        });

        return bestDrug;
    },

    /**
     * Wählt meistens die beste Aktion (greedy), aber mit einer Wahrscheinlichkeit
     * von 10% (epsilon = 0.1) eine zufällige Aktion (exploration).
     * @param {object} drugStats - Das Statistik-Objekt.
     * @param {number} numActions - Die Gesamtzahl der verfügbaren Aktionen.
     * @returns {number} Der Index der gewählten Aktion.
     */
    'epsilon-greedy': (drugStats, numActions) => {
        // Phase der Erkundung (Exploration) mit 10% Wahrscheinlichkeit.
        if (Math.random() < 0.1) {
            // Wähle eine zufällige Aktion.
            return Math.floor(Math.random() * numActions);
        } else {
            // Phase der Ausnutzung (Exploitation): Rufe den Greedy-Algorithmus auf.
            return algorithms.greedy(drugStats);
        }
    },

    /**
     * Wählt immer eine zufällige Aktion.
     * @param {object} drugStats - Wird nicht verwendet.
     * @param {number} numActions - Die Gesamtzahl der verfügbaren Aktionen.
     * @returns {number} Der Index einer zufälligen Aktion.
     */
    random: (drugStats, numActions) => {
        return Math.floor(Math.random() * numActions);
    }
};