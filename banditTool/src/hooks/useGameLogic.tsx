import { useState, useCallback } from 'react';
import { algorithms } from '../utils/algorithms';
import { generateDrugProbabilities, simulateDrugOutcome, initializeDrugStats } from '../utils/banditSimulation';


// ==================================================================
// Typ-Definitionen (Domain Models)
// Beschreiben die zentralen Datenstrukturen der Spiellogik.
// ==================================================================

export type AlgorithmType = 'greedy' | 'epsilon-greedy' | 'random';

export interface Config {
    numActions: number;
    numIterations: number;
    banditType: 'bernoulli' | 'gaussian';
    algorithms: AlgorithmType[];
}

export interface DrugStat {
    attempts: number;
    sumOfRewards: number;
}

export interface DrugStats {
    [key: string]: DrugStat;
}

export interface GameState {
    currentPatient: number;
    savedLives: number;
    isPlaying: boolean;
    drugStats: DrugStats;
}

export interface AlgorithmState {
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
const ALL_ALGORITHMS: AlgorithmType[] = ['greedy', 'epsilon-greedy', 'random'];

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
     * 1. Verarbeitet die Wahl des Spielers.
     * 2. Simuliert die Wahl aller aktiven Algorithmen für dieselbe Runde.
     * 3. Greift auf die `outcomes`-Matrix zu, um für alle Teilnehmer faire Ergebnisse zu gewährleisten.
     * 4. Aktualisiert alle relevanten Statistiken und Performance-Daten.
     * @param {number} drugIndex - Der Index der vom Spieler gewählten Bohne.
     */
    const handleDrugChoice = (drugIndex: number) => {
        if (!gameState.isPlaying || isMaxAttemptsReached || !outcomes.length) return;

        const patientIndex = gameState.currentPatient;
        const newCurrentPatient = gameState.currentPatient + 1;

        // Spieler-Logik
        const playerReward = outcomes[patientIndex][drugIndex];
        const numericPlayerReward = typeof playerReward === 'boolean' ? (playerReward ? 1 : 0) : playerReward;
        setLastPlayerReward(numericPlayerReward);
        const newSavedLives = gameState.savedLives + numericPlayerReward;
        const newDrugStats = { ...gameState.drugStats };
        newDrugStats[`drug${drugIndex}`].attempts++;
        newDrugStats[`drug${drugIndex}`].sumOfRewards += numericPlayerReward;

        // Algorithmen-Logik
        const newAlgorithmStates: AlgorithmState[] = [];
        const newOverallAlgoStats = { ...algorithmStats };
        const performanceUpdate: { [key: string]: number } = {};

        ALL_ALGORITHMS.forEach((algoName: AlgorithmType) => {
            const currentAlgoStats = algorithmStats[algoName];
            if (!currentAlgoStats) return;

            const choice = algorithms[algoName](currentAlgoStats, config.numActions);
            const reward = outcomes[patientIndex][choice];
            const numericReward = typeof reward === 'boolean' ? (reward ? 1 : 0) : reward;

            const newStatsForAlgo = { ...currentAlgoStats };
            newStatsForAlgo[`drug${choice}`].attempts++;
            newStatsForAlgo[`drug${choice}`].sumOfRewards += numericReward;
            newOverallAlgoStats[algoName] = newStatsForAlgo;

            newAlgorithmStates.push({ name: algoName, choice, reward });
            performanceUpdate[algoName] = numericReward;
        });

        // State-Updates
        setAlgorithmStats(newOverallAlgoStats);
        setAlgorithmStates(newAlgorithmStates);

        // Performance-Daten aktualisieren
        const lastPerformancePoint: Partial<PerformanceDataPoint> = algorithmPerformance.length > 0 ? algorithmPerformance[algorithmPerformance.length - 1] : {};
        const currentDataPoint: PerformanceDataPoint = { patient: newCurrentPatient, playerSavedLives: newSavedLives };
        ALL_ALGORITHMS.forEach((algoName: AlgorithmType) => {
            const lastSaved = lastPerformancePoint[algoName] || 0;
            currentDataPoint[algoName] = lastSaved + (performanceUpdate[algoName] || 0);
        });
        setAlgorithmPerformance((prev) => [...prev, currentDataPoint]);

        setGameState({
            ...gameState,
            currentPatient: newCurrentPatient,
            savedLives: newSavedLives,
            drugStats: newDrugStats,
        });
    };

    /**
     * Initialisiert und startet ein neues Spiel.
     * 1. Generiert eine neue, zufällige `outcomes`-Matrix für diese Spielsitzung.
     * 2. Setzt alle Spielzustände über `resetGame()` zurück.
     * 3. Setzt den `isPlaying`-Status auf `true`.
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
     * Stoppt das laufende Spiel, indem `isPlaying` auf `false` gesetzt wird.
     */
    const stopGame = () => {
        setGameState(prevState => ({ ...prevState, isPlaying: false }));
        setNotification("Spiel beendet. Starten Sie ein neues Spiel, um die Konfiguration zu ändern.");
    };

    const isGameComplete = gameState.currentPatient >= config.numIterations;

    // === EXPORTIERTE API ===
    // Stellt der UI alle nötigen Zustände und Handler zur Verfügung.
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