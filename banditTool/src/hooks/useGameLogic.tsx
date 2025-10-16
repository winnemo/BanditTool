import { useState, useCallback } from 'react';
import { algorithms } from '../utils/algorithms';
import { generateDrugProbabilities, simulateDrugOutcome, initializeDrugStats } from '../utils/banditSimulation';

// ==================================================================
// Typ-Definitionen (Domain Models)
// Beschreiben die zentralen Datenstrukturen der Spiellogik.
// ==================================================================

type AlgorithmType = 'greedy' | 'epsilon-greedy' | 'random';

interface Config {
    numActions: number;
    numIterations: number;
    banditType: 'bernoulli' | 'gaussian';
    algorithms: AlgorithmType[];
}

interface DrugStat {
    attempts: number;
    successes: number;
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
    success: boolean | null;
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
    const [outcomes, setOutcomes] = useState<boolean[][]>([]);

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
            success: null
        }));
        setAlgorithmStates(initialAlgoStates);
        setAlgorithmPerformance([]);
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
        const playerSuccess = outcomes[patientIndex][drugIndex];
        const newSavedLives = gameState.savedLives + (playerSuccess ? 1 : 0);
        const newDrugStats = { ...gameState.drugStats };
        newDrugStats[`drug${drugIndex}`].attempts++;
        if (playerSuccess) newDrugStats[`drug${drugIndex}`].successes++;

        // Algorithmen-Logik
        const newAlgorithmStates: AlgorithmState[] = [];
        const newOverallAlgoStats = { ...algorithmStats };
        const performanceUpdate: { [key: string]: number } = {};

        ALL_ALGORITHMS.forEach((algoName: AlgorithmType) => {
            const currentAlgoStats = algorithmStats[algoName];
            if (!currentAlgoStats) return;

            const choice = algorithms[algoName](currentAlgoStats, config.numActions);
            const success = outcomes[patientIndex][choice];

            const newStatsForAlgo = { ...currentAlgoStats };
            newStatsForAlgo[`drug${choice}`].attempts++;
            if (success) newStatsForAlgo[`drug${choice}`].successes++;
            newOverallAlgoStats[algoName] = newStatsForAlgo;

            newAlgorithmStates.push({ name: algoName, choice, success });
            performanceUpdate[algoName] = success ? 1 : 0;
        });

        // State-Updates
        setAlgorithmStats(newOverallAlgoStats);
        setAlgorithmStates(newAlgorithmStates);

        // Performance-Daten aktualisieren
        const lastPerformancePoint = algorithmPerformance.length > 0 ? algorithmPerformance[algorithmPerformance.length - 1] : {};
        const currentDataPoint: PerformanceDataPoint = { patient: newCurrentPatient, playerSavedLives: newSavedLives };
        ALL_ALGORITHMS.forEach((algoName: AlgorithmType) => {
            const lastSaved = lastPerformancePoint[algoName] || 0;
            currentDataPoint[algoName] = lastSaved + performanceUpdate[algoName];
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
        const preGeneratedOutcomes: boolean[][] = [];
        for (let i = 0; i < config.numIterations; i++) {
            const roundOutcomes: boolean[] = [];
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
    };
};