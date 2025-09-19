import { useState } from 'react';
import ConfigurationPanel from './components/configuration';
import ControlButtons from './components/controlButtons.tsx';
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
            <div className="header-container">
                <h1 className="title">
                    Multi-Armed Bandit
                </h1>
                <h2 className="subtitle"> Hier könnte Ihre Werbung stehen! </h2>
            </div>

            <div className="content-container">
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

                <div className="output-container">
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
            </div>
        </div>

    );
};

export default MultiArmedBanditApp;