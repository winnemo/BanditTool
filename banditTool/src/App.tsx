import React, { useState } from 'react';
import ConfigurationPanel from './components/configuration';
import ControlButtons from './components/controlButtons.tsx';
import GameInterface from './components/game';
import PerformanceChart from './components/performanceChart';
import { useGameLogic } from './hooks/useGameLogic';
import "./App.css";

const MultiArmedBanditApp = () => {
    // Configuration state
    const [config, setConfig] = useState({
        numDrugs: 5,
        numPatients: 10,
        banditType: 'bernoulli',
        algorithm: 'epsilon-greedy'
    });

    // Use custom hook for game logic
    const {
        gameState,
        algorithmPerformance,
        handleDrugChoice,
        startGame,
        showPlot,
        isGameComplete
    } = useGameLogic(config);

    return (
        <div className="app-container">

            {/* Header */}
            <div className="header">
                <h1 className="title">
                    Multi-Armed Bandit
                </h1>
                <p className="subtitle"> leck eier </p>
            </div>

            <div className="configuration-container">
                {/* Configuration Panel */}
                <ConfigurationPanel config={config} setConfig={setConfig} />

                {/* Control Buttons */}
                <ControlButtons
                    onStartGame={startGame}
                    onShowPlot={showPlot}
                    hasGameData={gameState.gameData.length > 0}
                />
            </div>

            {/* Game Interface */}
            <GameInterface
                gameState={gameState}
                config={config}
                onDrugChoice={handleDrugChoice}
                isGameComplete={isGameComplete}
            />

            {/* Performance Chart */}
            <PerformanceChart
                algorithmPerformance={algorithmPerformance}
                config={config}
                isVisible={gameState.showPlot}
            />
        </div>

    );
};

export default MultiArmedBanditApp;