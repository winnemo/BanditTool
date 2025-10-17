import { useState, useCallback } from 'react';
import { algorithms } from '../utils/algorithms';
import { generateDrugProbabilities, simulateDrugOutcome, initializeDrugStats } from '../utils/banditSimulation';

// ==================================================================
// Typ-Definitionen (Domain Models)
// Beschreiben die zentralen Datenstrukturen der Spiellogik.
// ==================================================================

type AlgorithmType = 'greedy' | 'epsilon-greedy' | 'random' | 'ucb' | 'thompson';

interface Config {
    numActions: number;
    numIterations: number;
    banditType: 'bernoulli' | 'gaussian';
    algorithms: AlgorithmType[];
}

interface DrugStat {
    attempts: number;
    sumOfRewards: number;
}

interface DrugStats {
    [key: string]: DrugStat;
}

interface GameState {
    currentPatient: number;
    savedLives: number;
    isPlaying: boolean;
    drugStats: DrugStats;
}

interface AlgorithmState {
    name: AlgorithmType;
    choice: number;
    reward: number | boolean | null;
}

interface PerformanceDataPoint {
    patient: number;
    playerSavedLives: number;
    [key: string]: number;
}

// ==================================================================
// Implementierung
// ==================================================================
const ALL_ALGORITHMS: AlgorithmType[] = ['greedy', 'epsilon-greedy', 'random', 'ucb', 'thompson'];

/**
 * Custom Hook, der die gesamte Logik für das Bandit-Spiel kapselt.
 * Verwaltet den Spielzustand, die Algorithmen-Simulation und die Interaktionen.
 * @param {Config} config - Das Konfigurationsobjekt, das die Spielregeln definiert.
 * @returns Ein Objekt mit dem Spielzustand und den Handler-Funktionen für die UI.
 */
export const useGameLogic = (config: Config) => {
    // === STATE MANAGEMENT ===
    // Kernzustand des Spiels (Runde, Punkte, etc.)
    const [gameState, setGameState] = useState<GameState>({
        currentPatient: 0,
        savedLives: 0,
        isPlaying: false,
        drugStats: {},
    });
    // Datenpunkte für den Performance-Graphen
    const [algorithmPerformance, setAlgorithmPerformance] = useState<PerformanceDataPoint[]>([]);
    // UI-Benachrichtigungen
    const [notification, setNotification] = useState<string | null>(null);
    // Zustand der Algorithmen in der aktuellen Runde (für die Anzeige der Wahl)
    const [algorithmStates, setAlgorithmStates] = useState<AlgorithmState[]>([]);
    // Interne Statistiken der Algorithmen für deren Entscheidungsfindung
    const [algorithmStats, setAlgorithmStats] = useState<{ [key in AlgorithmType]?: DrugStats }>({});
    // Vorausberechnete Ergebnis-Matrix für eine faire und reproduzierbare Simulation pro Spiel
    const [outcomes, setOutcomes] = useState<(boolean | number)[][]>([]);

    const [lastPlayerReward, setLastPlayerReward] = useState<number | null>(0);

    /**
     * Setzt alle spielrelevanten Zustände auf ihre initialen Werte zurück.
     * Wird beim Starten eines neuen Spiels aufgerufen.
     */
    const resetGame = useCallback(() => {
        const initialPlayerStats = initializeDrugStats(config.numActions);
        setGameState(prevState => ({
            ...prevState,
            currentPatient: 0,
            savedLives: 0,
            drugStats: initialPlayerStats,
        }));

        const initialAlgoStats = ALL_ALGORITHMS.reduce((acc: { [key in AlgorithmType]?: DrugStats }, algoName: AlgorithmType) => {
            acc[algoName] = initializeDrugStats(config.numActions);
            return acc;
        }, {});
        setAlgorithmStats(initialAlgoStats);

        const initialAlgoStates = ALL_ALGORITHMS.map((name: AlgorithmType) => ({
            name,
            choice: -1,
            reward: null
        }));
        setAlgorithmStates(initialAlgoStates);
        setAlgorithmPerformance([]);
        setLastPlayerReward(0);
        setNotification(null);
    }, [config.numActions]);

    // Berechneter Wert, der anzeigt, ob das Spielende erreicht ist.
    const isMaxAttemptsReached = gameState.currentPatient >= config.numIterations;

    /**
     * Handler für die Spieler-Aktion in jeder Runde.
     * KORREKTUR: Nur aktive Algorithmen werden simuliert und getrackt.
     */
    const handleDrugChoice = (drugIndex: number) => {
        if (!gameState.isPlaying || isMaxAttemptsReached || !outcomes.length) return;

        const patientIndex = gameState.currentPatient;
        const newCurrentPatient = gameState.currentPatient + 1;

        // === SPIELER-LOGIK ===
        const playerSuccess = outcomes[patientIndex][drugIndex];
        const numericReward = typeof playerSuccess === 'boolean' ? (playerSuccess ? 1 : 0) : playerSuccess;
        setLastPlayerReward(numericReward);
        const newSavedLives = gameState.savedLives + numericReward;

        const newDrugStats = { ...gameState.drugStats };
        newDrugStats[`drug${drugIndex}`].attempts++;
        newDrugStats[`drug${drugIndex}`].sumOfRewards += numericReward;

        // === ALGORITHMEN-LOGIK ===
        // WICHTIG: Nur die in config.algorithms ausgewählten Algorithmen werden simuliert
        const newAlgorithmStates: AlgorithmState[] = [];
        const newOverallAlgoStats = { ...algorithmStats };
        const performanceUpdate: { [key: string]: number } = {};

        // Iteriere nur über die AKTIVEN Algorithmen aus der Config
        config.algorithms.forEach((algoName: AlgorithmType) => {
            const currentAlgoStats = algorithmStats[algoName];
            if (!currentAlgoStats) return;

            // Algorithmus trifft seine Wahl basierend auf seinen aktuellen Statistiken
            const choice = algorithms[algoName](currentAlgoStats, {
                numActions: config.numActions,
                banditType: config.banditType
            });
            const reward = outcomes[patientIndex][choice];

            // Aktualisiere die Statistiken des Algorithmus
            const newStatsForAlgo = { ...currentAlgoStats };
            newStatsForAlgo[`drug${choice}`].attempts++;
            const numericAlgoReward = typeof reward === 'boolean' ? (reward ? 1 : 0) : reward;
            newStatsForAlgo[`drug${choice}`].sumOfRewards += numericAlgoReward;
            newOverallAlgoStats[algoName] = newStatsForAlgo;

            // Speichere den Zustand für die UI
            newAlgorithmStates.push({ name: algoName, choice, reward });
            performanceUpdate[algoName] = numericAlgoReward;
        });

        // State-Updates
        setAlgorithmStats(newOverallAlgoStats);
        setAlgorithmStates(newAlgorithmStates);

        // === PERFORMANCE-TRACKING ===
        // KORREKTUR: Nur aktive Algorithmen werden im Performance-Chart getrackt
        const lastPerformancePoint = algorithmPerformance.length > 0
            ? algorithmPerformance[algorithmPerformance.length - 1]
            : {};

        const currentDataPoint: PerformanceDataPoint = {
            patient: newCurrentPatient,
            playerSavedLives: newSavedLives
        };

        // Iteriere nur über die aktiven Algorithmen
        config.algorithms.forEach((algoName: AlgorithmType) => {
            const lastSaved = lastPerformancePoint[algoName] || 0;
            const rewardToAdd = performanceUpdate[algoName] || 0; // Fallback auf 0
            currentDataPoint[algoName] = lastSaved + rewardToAdd;
        });

        setAlgorithmPerformance((prev) => [...prev, currentDataPoint]);

        // === STATE-UPDATE ===
        setGameState({
            ...gameState,
            currentPatient: newCurrentPatient,
            savedLives: newSavedLives,
            drugStats: newDrugStats,
        });
    };

    /**
     * Initialisiert und startet ein neues Spiel.
     * Generiert eine neue outcomes-Matrix für faire Vergleiche.
     */
    const startGame = () => {
        const probs = generateDrugProbabilities(config.numActions, config.banditType);
        const preGeneratedOutcomes: (boolean | number)[][] = [];

        for (let i = 0; i < config.numIterations; i++) {
            const roundOutcomes: (boolean | number)[] = [];
            for (let j = 0; j < config.numActions; j++) {
                roundOutcomes.push(simulateDrugOutcome(j, probs, config.banditType));
            }
            preGeneratedOutcomes.push(roundOutcomes);
        }
        setOutcomes(preGeneratedOutcomes);

        resetGame();

        setGameState(prevState => ({
            ...prevState,
            isPlaying: true
        }));
    };

    /**
     * Stoppt das laufende Spiel.
     */
    const stopGame = () => {
        setGameState(prevState => ({ ...prevState, isPlaying: false }));
        setNotification("Spiel beendet. Starten Sie ein neues Spiel, um die Konfiguration zu ändern.");
    };

    const isGameComplete = gameState.currentPatient >= config.numIterations;

    // === EXPORTIERTE API ===
    return {
        gameState,
        algorithmPerformance,
        handleDrugChoice,
        startGame,
        stopGame,
        isGameComplete,
        notification,
        algorithmStates,
        lastPlayerReward,
        algorithmStats,
    };
};