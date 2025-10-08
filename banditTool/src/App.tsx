import { useState, useRef } from 'react';
import { Header } from './components/header';
import { InfoBox } from './components/infoBox';
import ConfigurationPanel from './components/configuration';
import GameInterface from './components/game';
import PerformanceChart from './components/performanceChart';
import { useGameLogic } from './hooks/useGameLogic';
import "./App.css";

/**
 * Die Hauptkomponente der Multi-Armed Bandit Anwendung.
 * Sie orchestriert den Zustand und setzt alle UI-Komponenten zusammen.
 */
const MultiArmedBanditApp = () => {
    // 1. Zustand für die Spielkonfiguration. Wird hier gehalten und nach unten weitergegeben.
    const [config, setConfig] = useState({
        numActions: 5,
        numIterations: 10,
        banditType: 'bernoulli',
        algorithm: 'greedy'
    });

    // 2. Ein Ref, um eine Referenz auf das DOM-Element des Spielbereichs zu erhalten.
    const gameAreaRef = useRef(null);

    // 3. Aufruf des Custom Hooks, der die gesamte Spiellogik und den Spielzustand verwaltet.
    const {
        gameState,
        algorithmPerformance,
        handleDrugChoice,
        startGame: startLogic, // startLogic ist die originale Start-Funktion aus dem Hook
        stopGame,
        isGameComplete,
        notification,
        algorithmState
    } = useGameLogic(config);

    /**
     * Eine Wrapper-Funktion, die das Spiel startet UND danach zum Spielbereich scrollt.
     */
    const startGameAndScroll = () => {
        // Zuerst die Logik zum Starten des Spiels aufrufen.
        startLogic();

        // Mit einer kleinen Verzögerung wird zum Spielbereich gescrollt.
        // Die Verzögerung gibt React Zeit, das GameInterface zu rendern.
        setTimeout(() => {
            gameAreaRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }, 100);
    };

    return (
        <div className="app-container">
            <Header />
            <main className="main-container">
                <InfoBox />

                <div className="content-container">
                    <div className="configuration-container">
                        {/* Die Konfigurations-Komponente erhält Props, um den Zustand zu lesen und zu ändern. */}
                        <ConfigurationPanel
                            config={config}
                            setConfig={setConfig}
                            onStartGame={startGameAndScroll} // Die Scroll-Funktion wird hier übergeben
                            onStopGame={stopGame}
                            gameStarted={gameState.isPlaying}
                        />
                    </div>

                    {/* Bedingtes Rendern: Der Spiel- und Chart-Bereich wird nur angezeigt, wenn das Spiel läuft. */}
                    {gameState.isPlaying && (
                        // Das Ref wird an diesen Container gebunden, damit wir zu ihm scrollen können.
                        <div className="output-container" ref={gameAreaRef}>
                            <GameInterface
                                gameState={gameState}
                                config={config}
                                onDrugChoice={handleDrugChoice}
                                isGameComplete={isGameComplete}
                                notification={notification}
                                algorithmState={algorithmState}
                            />
                            <PerformanceChart
                                algorithmPerformance={algorithmPerformance}
                                config={config}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MultiArmedBanditApp;