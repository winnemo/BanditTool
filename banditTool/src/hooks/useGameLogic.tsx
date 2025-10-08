import { useState, useEffect } from 'react';
import { algorithms } from '../utils/algorithms';
import { generateDrugProbabilities, simulateDrugOutcome, initializeDrugStats } from '../utils/banditSimulation';

/**
 * Ein Custom React Hook, der die gesamte Spiellogik und das State Management kapselt.
 * @param {object} config - Das Konfigurationsobjekt aus dem Einstellungs-Panel.
 * @returns {object} Ein Objekt mit allen Zuständen und Handlern, die für die UI benötigt werden.
 */
export const useGameLogic = (config) => {
    // Zentraler State für den Spieler und den allgemeinen Spielverlauf.
    const [gameState, setGameState] = useState({
        currentPatient: 0,
        savedLives: 0,
        gameData: [],
        isPlaying: false,
        drugStats: {},
        showPlot: false
    });

    // State für die "wahren", aber unbekannten Erfolgswahrscheinlichkeiten der Bohnen.
    const [drugProbabilities, setDrugProbabilities] = useState([]);
    // State für die Performance-Daten des Graphen.
    const [algorithmPerformance, setAlgorithmPerformance] = useState([]);
    // State für Benachrichtigungen an den Spieler.
    const [notification, setNotification] = useState(null);
    // State für die letzte Aktion des Algorithmus (zur Anzeige in der UI).
    const [algorithmState, setAlgorithmState] = useState({ choice: -1, success: null });

    // Separater State für die Statistiken des Algorithmus, um Fairness zu gewährleisten.
    const [algorithmStats, setAlgorithmStats] = useState({});

    // Dieser Effekt wird ausgelöst, wenn sich die Konfiguration ändert. Er setzt das gesamte Spiel zurück.
    useEffect(() => {
        const probs = generateDrugProbabilities(config.numActions, config.banditType);
        setDrugProbabilities(probs);

        const initialDrugStats = initializeDrugStats(config.numActions);

        // Alle relevanten States auf ihren Anfangszustand zurücksetzen.
        setGameState({
            currentPatient: 0,
            savedLives: 0,
            gameData: [],
            isPlaying: false,
            drugStats: initialDrugStats,
            showPlot: false
        });
        setAlgorithmStats(initializeDrugStats(config.numActions)); // Wichtig: auch Algorithmus-Stats zurücksetzen
        setAlgorithmPerformance([]);
        setNotification(null);
        setAlgorithmState({ choice: -1, success: null });
    }, [config.numActions, config.banditType]);

    // Abgeleiteter Wert: Prüft, ob das Spiel beendet ist.
    const isMaxAttemptsReached = gameState.currentPatient >= config.numIterations;

    // Handler, der bei jeder Spieler-Aktion aufgerufen wird.
    const handleDrugChoice = (drugIndex) => {
        // Guard-Clauses, um ungültige Aktionen zu verhindern.
        if (!gameState.isPlaying) {
            setNotification("Bitte starten Sie das Spiel zuerst.");
            return;
        }
        if (isMaxAttemptsReached) {
            setNotification("Maximale Anzahl an Versuchen erreicht! Bitte klicken Sie auf 'Spiel abbrechen'.");
            return;
        }

        const newCurrentPatient = gameState.currentPatient + 1;

        // --- 1. Spieler-Logik ---
        const playerSuccess = simulateDrugOutcome(drugIndex, drugProbabilities, config.banditType);
        const newSavedLives = gameState.savedLives + (playerSuccess ? 1 : 0);
        const newDrugStats = {...gameState.drugStats};
        newDrugStats[`drug${drugIndex}`].attempts++;
        if (playerSuccess) newDrugStats[`drug${drugIndex}`].successes++;

        // --- 2. Algorithmus-Logik (Echtzeit-Simulation) ---
        const algoChoice = algorithms[config.algorithm](algorithmStats, config.numActions);
        const algoSuccess = simulateDrugOutcome(algoChoice, drugProbabilities, config.banditType);
        const newAlgoStats = {...algorithmStats};
        newAlgoStats[`drug${algoChoice}`].attempts++;
        if (algoSuccess) newAlgoStats[`drug${algoChoice}`].successes++;
        setAlgorithmStats(newAlgoStats); // Algorithmus-Stats separat aktualisieren.

        // --- 3. Performance-Update (für den Graphen) ---
        const lastAlgoSavedLives = algorithmPerformance.length > 0
            ? algorithmPerformance[algorithmPerformance.length - 1].algorithmSavedLives
            : 0;
        const currentAlgoSavedLives = lastAlgoSavedLives + (algoSuccess ? 1 : 0);
        const currentDataPoint = {
            patient: newCurrentPatient,
            playerSavedLives: newSavedLives,
            algorithmSavedLives: currentAlgoSavedLives,
        };
        setAlgorithmPerformance((prev) => [...prev, currentDataPoint]);

        // --- 4. Zentrale State-Updates am Ende aller Berechnungen ---
        setGameState({
            ...gameState,
            currentPatient: newCurrentPatient,
            savedLives: newSavedLives,
            drugStats: newDrugStats,
        });
        setAlgorithmState({
            choice: algoChoice,
            success: algoSuccess,
        });
    };

    // Funktion zum Starten des Spiels. Setzt alles zurück und setzt isPlaying auf true.
    const startGame = () => {
        const initialDrugStats = initializeDrugStats(config.numActions);
        setGameState({
            currentPatient: 0,
            savedLives: 0,
            gameData: [],
            isPlaying: true,
            drugStats: initialDrugStats,
            showPlot: false
        });
        setAlgorithmStats(initialDrugStats);
        setAlgorithmPerformance([]);
        setNotification(null);
        setAlgorithmState({ choice: -1, success: null });
    };

    // Funktion zum Stoppen des Spiels.
    const stopGame = () => {
        setGameState({...gameState, isPlaying: false});
        setNotification("Spiel beendet. Starten Sie das Spiel neu, um die Konfiguration zu ändern.");
    };

    const isGameComplete = gameState.currentPatient >= config.numIterations;

    // Rückgabe aller Werte, die von UI-Komponenten benötigt werden.
    return {
        gameState,
        algorithmPerformance,
        handleDrugChoice,
        startGame,
        stopGame,
        isGameComplete,
        notification,
        algorithmState,
    };
};