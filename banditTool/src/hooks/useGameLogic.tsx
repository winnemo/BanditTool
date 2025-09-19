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

        setAlgorithmPerformance([]);
    }, [config.numActions, config.banditType]);

    const handleDrugChoice = (drugIndex) => {
        if (!gameState.isPlaying || gameState.currentPatient >= config.numIterations) return;

        const success = simulateDrugOutcome(drugIndex, drugProbabilities, config.banditType);
        const newSavedLives = gameState.savedLives + (success ? 1 : 0);
        const newCurrentPatient = gameState.currentPatient + 1;

        // Update drug stats
        const newDrugStats = { ...gameState.drugStats };
        newDrugStats[`drug${drugIndex}`].attempts++;
        if (success) newDrugStats[`drug${drugIndex}`].successes++;

        // Update game data for plotting
        const newGameData = [...gameState.gameData, {
            patient: newCurrentPatient,
            savedLives: newSavedLives,
            playerChoice: drugIndex,
            success: success
        }];

        setGameState({
            ...gameState,
            currentPatient: newCurrentPatient,
            savedLives: newSavedLives,
            gameData: newGameData,
            drugStats: newDrugStats,
            isPlaying: newCurrentPatient < config.numIterations
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
    };

    const runAlgorithmSimulation = () => {
        const algorithmData = [];
        let algorithmSavedLives = 0;
        const algorithmDrugStats = initializeDrugStats(config.numActions);

        for (let patient = 0; patient < config.numIterations; patient++) {
            const drugChoice = patient < config.numActions
                ? patient % config.numActions
                : algorithms[config.algorithm](algorithmDrugStats, config.numActions);

            const success = simulateDrugOutcome(drugChoice, drugProbabilities, config.banditType);

            algorithmSavedLives += success ? 1 : 0;
            algorithmDrugStats[`drug${drugChoice}`].attempts++;
            if (success) algorithmDrugStats[`drug${drugChoice}`].successes++;

            algorithmData.push({
                patient: patient + 1,
                algorithmSavedLives,
                algorithmChoice: drugChoice
            });
        }

        return algorithmData;
    };

    const showPlot = () => {
        const algorithmData = runAlgorithmSimulation();

        // Combine player and algorithm data
        const combinedData = [];
        for (let i = 0; i < Math.max(gameState.gameData.length, algorithmData.length); i++) {
            combinedData.push({
                patient: i + 1,
                playerSavedLives: gameState.gameData[i]?.savedLives || 0,
                algorithmSavedLives: algorithmData[i]?.algorithmSavedLives || 0
            });
        }

        setAlgorithmPerformance(combinedData);
        setGameState({ ...gameState, showPlot: true });
    };

    const isGameComplete = !gameState.isPlaying && gameState.currentPatient >= config.numIterations;

    return {
        gameState,
        algorithmPerformance,
        handleDrugChoice,
        startGame,
        showPlot,
        isGameComplete
    };
};