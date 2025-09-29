import { useState, useEffect } from 'react';
import { algorithms } from '../utils/algorithms';
import { generateDrugProbabilities, simulateDrugOutcome, initializeDrugStats } from '../utils/banditSimulation';

export const useGameLogic = (config) => {
    const [gameState, setGameState] = useState({
        currentPatient: 0,
        savedLives: 0,
        gameData: [],
        isPlaying: false,
        drugStats: {},
        showPlot: false
    });

    const [drugProbabilities, setDrugProbabilities] = useState([]);
    const [algorithmPerformance, setAlgorithmPerformance] = useState([]);
    const [notification, setNotification] = useState(null);

    // 💡 NEU: Zustand für die letzte Algorithmus-Aktion
    const [algorithmState, setAlgorithmState] = useState({
        choice: null,
        success: null,
        stats: initializeDrugStats(config.numActions) // Algorithmus-Statistiken separat halten
    });


    // Initialize drug probabilities when config changes
    useEffect(() => {
        const probs = generateDrugProbabilities(config.numActions, config.banditType);
        setDrugProbabilities(probs);

        // Reset game state
        setGameState({
            currentPatient: 0,
            savedLives: 0,
            gameData: [],
            isPlaying: false,
            drugStats: initializeDrugStats(config.numActions),
            showPlot: false
        });

        // Reset Algorithmus-State
        setAlgorithmState({
            choice: null,
            success: null,
            stats: initializeDrugStats(config.numActions)
        });

        setAlgorithmPerformance([]);
        setNotification(null);
    }, [config.numActions, config.banditType]);

    // Prüfen, ob die maximale Anzahl an Versuchen erreicht ist
    const isMaxAttemptsReached = gameState.currentPatient >= config.numIterations;

    const handleDrugChoice = (drugIndex) => {
        if (!gameState.isPlaying) {
            setNotification("Bitte starten Sie das Spiel zuerst.");
            return;
        }

        if (isMaxAttemptsReached) {
            setNotification("Maximale Anzahl an Versuchen erreicht! Bitte klicken Sie auf 'Spiel abbrechen', um die Ergebnisse zu sehen.");
            return;
        }

        // Benachrichtigung bei erfolgreichem Klick zurücksetzen
        setNotification(null);

        const success = simulateDrugOutcome(drugIndex, drugProbabilities, config.banditType);
        const newSavedLives = gameState.savedLives + (success ? 1 : 0);
        const newCurrentPatient = gameState.currentPatient + 1;

        // 1. UPDATE EIGENE STATS
        const newDrugStats = {...gameState.drugStats};
        newDrugStats[`drug${drugIndex}`].attempts++;
        if (success) newDrugStats[`drug${drugIndex}`].successes++;

        // 2. SIMULIERE ALGORITHMUS-SCHRITT
        const algorithmStats = {...algorithmState.stats};
        const algorithmChoice = algorithms[config.algorithm](algorithmStats, config.numActions);
        const algorithmSuccess = simulateDrugOutcome(algorithmChoice, drugProbabilities, config.banditType);

        // 3. UPDATE ALGORITHMUS-STATS
        algorithmStats[`drug${algorithmChoice}`].attempts++;
        if (algorithmSuccess) algorithmStats[`drug${algorithmChoice}`].successes++;

        // 4. UPDATE GAME DATA
        const newGameData = [...gameState.gameData, {
            patient: newCurrentPatient,
            savedLives: newSavedLives,
            playerChoice: drugIndex,
            playerSuccess: success, // Speichere eigenes Ergebnis
            algorithmChoice: algorithmChoice, // Speichere Algorithmus-Wahl
            algorithmSuccess: algorithmSuccess // Speichere Algorithmus-Ergebnis
        }];

        // 5. SET NEW STATES
        setGameState(prev => ({
            ...prev,
            currentPatient: newCurrentPatient,
            savedLives: newSavedLives,
            gameData: newGameData,
            drugStats: newDrugStats,
        }));

        setAlgorithmState({
            choice: algorithmChoice,
            success: algorithmSuccess,
            stats: algorithmStats // Wichtig: Stats für nächsten Algo-Schritt speichern
        });
    };

    const startGame = () => {
        setGameState({
            currentPatient: 0,
            savedLives: 0,
            gameData: [],
            isPlaying: true,
            drugStats: initializeDrugStats(config.numActions),
            showPlot: false
        });
        setAlgorithmPerformance([]);
        setNotification(null);
    };

    const stopGame = () => {
        setGameState({...gameState, isPlaying: false});
        setNotification(null);
    };

    const runAlgorithmSimulation = () => {
        // Diese Funktion wird nur für den Plot verwendet, wenn das Spiel beendet ist
        // Wir können hier einfach die gesammelten Daten verwenden und die Ergebnisse extrapolieren.
        // Für den Plot ist es am besten, die Daten aus dem gameData zu nutzen.

        // Da wir die Algorithmus-Ergebnisse jetzt in Echtzeit in gameData speichern,
        // müssen wir sie hier nur noch für das Plot-Format aufbereiten.
        let algorithmSavedLives = 0;
        return gameState.gameData.map(data => {
            algorithmSavedLives += data.algorithmSuccess ? 1 : 0;
            return {
                patient: data.patient,
                algorithmSavedLives: algorithmSavedLives,
                algorithmChoice: data.algorithmChoice
            };
        });
    };

    const showPlot = () => {
        const algorithmData = runAlgorithmSimulation();

        const combinedData = [];
        for (let i = 0; i < gameState.gameData.length; i++) {
            combinedData.push({
                patient: i + 1,
                playerSavedLives: gameState.gameData[i]?.savedLives || 0,
                algorithmSavedLives: algorithmData[i]?.algorithmSavedLives || 0
            });
        }

        setAlgorithmPerformance(combinedData);
        setGameState({...gameState, showPlot: true});
        setNotification(null);
        // ACHTUNG: Der return-Block darf NICHT hier stehen!
    };

    const isGameComplete = gameState.currentPatient >= config.numIterations;

    // 💡 KORREKTER RETURN-BLOCK AM ENDE DES HOOKS
    return {
        gameState,
        algorithmPerformance,
        handleDrugChoice,
        startGame,
        stopGame,
        showPlot,
        isGameComplete,
        isMaxAttemptsReached,
        notification,
        algorithmState // 💡 Neuer State zurückgegeben
    };
};
