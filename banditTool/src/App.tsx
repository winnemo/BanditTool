import React, { useState } from 'react';
import ConfigurationPanel from './components/configuration';
import ControlButtons from './components/ControlButtons';
import GameInterface from './components/game';
import PerformanceChart from './components/performanceChart';
import { useGameLogic } from './hooks/useGameLogic';

const MultiArmedBanditApp = () => {
    // Configuration state
    const [config, setConfig] = useState({
        numDrugs: 3,
        numPatients: 100,
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="container mx-auto p-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Multi-Armed Bandit
                    </h1>
                    <p className="text-slate-300">Medizinische Behandlungsoptimierung</p>
                </div>

                {/* Configuration Panel */}
                <ConfigurationPanel config={config} setConfig={setConfig} />

                {/* Control Buttons */}
                <ControlButtons
                    onStartGame={startGame}
                    onShowPlot={showPlot}
                    hasGameData={gameState.gameData.length > 0}
                />

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
    );
};

export default MultiArmedBanditApp;