import { useState, useRef } from 'react';
import { Header } from './components/header';
import { InfoBox } from './components/infoBox';
import ConfigurationPanel from './components/configuration';
import GameInterface from './components/game';
import PerformanceChart from './components/performanceChart';
import { useGameLogic } from './hooks/useGameLogic';
import "./App.css";

const MultiArmedBanditApp = () => {
    // Configuration state
    const [config, setConfig] = useState({
        numActions: 5,
        numIterations: 10,
        banditType: 'bernoulli',
        algorithm: 'greedy'
    });

    // 💡 1. Ref für den Spielbereich definieren
    const gameAreaRef = useRef(null);

    const {
        gameState,
        algorithmPerformance,
        handleDrugChoice,
        startGame: startLogic,
        stopGame,
        showPlot,
        isGameComplete,
        notification
    } = useGameLogic(config);

    const startGameAndScroll = () => {
        // Zuerst die Spiellogik starten (setzt isPlaying auf true)
        startLogic();

        // Dann mit einer kleinen Verzögerung zum Spielbereich scrollen
        // Die Verzögerung ist notwendig, damit React das GameInterface rendern kann,
        // bevor versucht wird, dorthin zu scrollen.
        setTimeout(() => {
            gameAreaRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start', // Scrollt zum oberen Rand des Elements
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
                        <ConfigurationPanel
                            config={config}
                            setConfig={setConfig}
                            onStartGame={startGameAndScroll}
                            onStopGame={stopGame}
                            gameStarted={gameState.isPlaying}
                        />
                    </div>

                    {gameState.isPlaying && (
                        // 💡 3. Ref an den Container binden
                        <div className="output-container" ref={gameAreaRef}>
                            <GameInterface
                                gameState={gameState}
                                config={config}
                                onDrugChoice={handleDrugChoice}
                                isGameComplete={isGameComplete}
                                notification={notification}
                            />
                            <PerformanceChart
                                algorithmPerformance={algorithmPerformance}
                                config={config}
                                isVisible={gameState.showPlot}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MultiArmedBanditApp;
