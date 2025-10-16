import { useState, useEffect, useCallback } from 'react';
import { algorithms } from '../utils/algorithms';
import { generateDrugProbabilities, simulateDrugOutcome, initializeDrugStats } from '../utils/banditSimulation';

// ==================================================================
// NEU: Definitionen für alle unsere Datenstrukturen
// ==================================================================

// Definiert die möglichen Namen der Algorithmen
type AlgorithmType = 'greedy' | 'epsilon-greedy' | 'random';

// Definiert die Struktur des Konfigurationsobjekts
interface Config {
    numActions: number;
    numIterations: number;
    banditType: 'bernoulli' | 'gaussian';
    algorithms: AlgorithmType[];
}

// Definiert die Statistiken für eine einzelne Bohne
interface DrugStat {
    attempts: number;
    successes: number;
}

// Definiert ein Objekt, das die Statistiken für alle Bohnen enthält
// z.B. { drug0: { attempts: 0, successes: 0 }, drug1: ... }
interface DrugStats {
    [key: string]: DrugStat;
}

// Definiert die Struktur des Haupt-Spielzustands
interface GameState {
    currentPatient: number;
    savedLives: number;
    isPlaying: boolean;
    drugStats: DrugStats;
}

// Definiert die Struktur für den Zustand eines einzelnen Algorithmus (für die UI)
interface AlgorithmState {
    name: AlgorithmType;
    choice: number;
    success: boolean | null;
}

// Definiert die Struktur eines Datenpunkts für den Graphen
interface PerformanceDataPoint {
    patient: number;
    playerSavedLives: number;
    [key: string]: number; // Erlaubt dynamische Keys für die Algorithmen, z.B. 'Greedy': 5
}

// ==================================================================
// Der eigentliche Hook mit den neuen Typ-Annotationen
// ==================================================================
const ALL_ALGORITHMS: AlgorithmType[] = ['greedy', 'epsilon-greedy', 'random'];

export const useGameLogic = (config: Config) => {
    // State mit Typen versehen
    const [gameState, setGameState] = useState<GameState>({
        currentPatient: 0,
        savedLives: 0,
        isPlaying: false,
        drugStats: {},
    });

    const [algorithmPerformance, setAlgorithmPerformance] = useState<PerformanceDataPoint[]>([]);
    const [notification, setNotification] = useState<string | null>(null);
    const [algorithmStates, setAlgorithmStates] = useState<AlgorithmState[]>([]);
    const [algorithmStats, setAlgorithmStats] = useState<{ [key in AlgorithmType]?: DrugStats }>({});

    const resetGame = useCallback(() => {
        const initialPlayerStats = initializeDrugStats(config.numActions);
        setGameState(prevState => ({
            ...prevState,
            currentPatient: 0,
            savedLives: 0,
            drugStats: initialPlayerStats,
        }));

        // Parameter 'acc' und 'algoName' sind jetzt getypt
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

    const [outcomes, setOutcomes] = useState<boolean[][]>([]);

    useEffect(() => {
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
    }, [config.numActions, config.banditType, config.numIterations, resetGame]);

    const isMaxAttemptsReached = gameState.currentPatient >= config.numIterations
    // Parameter 'drugIndex' ist jetzt getypt
    const handleDrugChoice = (drugIndex: number) => {

        if (!gameState.isPlaying || isMaxAttemptsReached || !outcomes.length) return;
        const patientIndex = gameState.currentPatient;

        const newCurrentPatient = gameState.currentPatient + 1;

        const playerSuccess = outcomes[patientIndex][drugIndex];
        const newSavedLives = gameState.savedLives + (playerSuccess ? 1 : 0);
        const newDrugStats = { ...gameState.drugStats };
        newDrugStats[`drug${drugIndex}`].attempts++;
        if (playerSuccess) newDrugStats[`drug${drugIndex}`].successes++;

        const newAlgorithmStates: AlgorithmState[] = [];
        const newOverallAlgoStats = { ...algorithmStats };
        const performanceUpdate: { [key: string]: number } = {};

        ALL_ALGORITHMS.forEach((algoName: AlgorithmType) => {

            const currentAlgoStats = algorithmStats[algoName];
            if (!currentAlgoStats) return; // Sicherheits-Check

            const choice = algorithms[algoName](currentAlgoStats, config.numActions);

            const success = outcomes[patientIndex][choice];

            const newStatsForAlgo = { ...currentAlgoStats };
            newStatsForAlgo[`drug${choice}`].attempts++;
            if (success) newStatsForAlgo[`drug${choice}`].successes++;
            newOverallAlgoStats[algoName] = newStatsForAlgo;

            newAlgorithmStates.push({ name: algoName, choice, success });
            performanceUpdate[algoName] = success ? 1 : 0;
        });

        setAlgorithmStats(newOverallAlgoStats);
        setAlgorithmStates(newAlgorithmStates);

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

    const startGame = () => {
        resetGame();
        setGameState(prevState => ({
            ...prevState,
            isPlaying: true
        }));
    };

    const stopGame = () => {
        setGameState(prevState => ({ ...prevState, isPlaying: false }));
        setNotification("Spiel beendet. Starten Sie ein neues Spiel, um die Konfiguration zu ändern.");
    };

    const isGameComplete = gameState.currentPatient >= config.numIterations;

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