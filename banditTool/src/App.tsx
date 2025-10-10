import { useState, useRef } from 'react';
import { Header } from './components/header.tsx';
import { InfoBox } from './components/infoBox.tsx';
import { ConfigPanel } from './components/configuration.tsx';
import { GameArea } from './components/game.tsx';
import { useGameLogic } from './hooks/useGameLogic';
import "./App.css";

// Definieren des Typs für Algorithmen für Typsicherheit
type AlgorithmType = "greedy" | "epsilon-greedy" | "random";

const App = () => {
    // 1. Zustand für die Spielkonfiguration mit initialen Werten
    const [config, setConfig] = useState({
        numActions: 5,
        numIterations: 10,
        banditType: 'bernoulli' as 'bernoulli' | 'gaussian',
        algorithms: [] as AlgorithmType[]
    });

    // 2. Ref für das Scroll-Verhalten zum Spielbereich
    const gameAreaRef = useRef<HTMLDivElement>(null);

    // 3. Der useGameLogic Hook ist die zentrale Logik-Einheit
    const {
        gameState,
        algorithmPerformance,
        handleDrugChoice,
        startGame: startLogic,
        stopGame: stopLogic,
        isGameComplete,
        algorithmStates
    } = useGameLogic(config);

    // Start-Funktion mit Scroll-Logik
    const startGame = () => {
        startLogic();
        setTimeout(() => {
            gameAreaRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }, 100);
    };

    // Stop-Funktion, die auch das Spiel zurücksetzt
    const stopGame = () => {
        stopLogic();
        // Optional: Nach oben scrollen
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Das Spiel gilt als "gestartet", wenn es läuft ODER beendet ist (um die Ergebnisse anzuzeigen)
    const gameHasBeenStarted = gameState.isPlaying || isGameComplete;

    return (
        <div className="app-container">
            <Header />
            <main className="main-container">
                <InfoBox />
                <ConfigPanel
                    config={config}
                    setConfig={setConfig}
                    onStartGame={startGame}
                    onStopGame={stopGame}
                    gameStarted={gameState.isPlaying}
                />

                {/* Der Spielbereich wird gerendert, sobald das Spiel gestartet wurde */}
                {gameHasBeenStarted && (
                    <div ref={gameAreaRef}>
                        <GameArea
                            gameState={gameState}
                            config={config}
                            onBeanClick={handleDrugChoice}
                            isGameComplete={isGameComplete}
                            algorithmPerformance={algorithmPerformance}
                            algorithmStates={algorithmStates}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;