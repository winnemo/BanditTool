import { Settings, Coffee, RotateCcw, Play, AlertCircle } from 'lucide-react';
import "./configuration.css";

const ConfigurationPanel = ({ config, setConfig, onStartGame, onStopGame, gameStarted }) => {

    // Handler für Änderungen an den Sliders und Number-Inputs
    const handleNumActionsChange = (value) => {
        if (!isNaN(value) && value >= 1 && value <= 10) {
            setConfig({ ...config, numActions: value });
        }
    };

    const handleNumIterationsChange = (value) => {
        if (!isNaN(value) && value >= 1 && value <= 50) {
            setConfig({ ...config, numIterations: value });
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">
                    <Settings className="config-icon" />
                    Spiel-Konfiguration
                </h2>
            </div>
            <div className="card-content">
                <div className="config-section">

                    {/* Bandit-Typ */}
                    <div className="config-item">
                        <label className="config-label">
                            📊 Bandit-Typ
                        </label>
                        <div className="select-container">
                            <select
                                className="select-trigger"
                                value={config.banditType}
                                onChange={(e) => setConfig({...config, banditType: e.target.value})}
                            >
                                <option value="bernoulli">Bernoulli</option>
                                <option value="gaussian">Gaussian</option>
                            </select>
                        </div>
                        <p className="help-text">
                            {config.banditType === 'bernoulli'
                                ? 'Binäre Belohnungen: Jede Kaffeebohne gibt entweder 0 oder 1 Punkt.'
                                : 'Kontinuierliche Belohnungen: Jede Kaffeebohne gibt Punkte aus einer Normalverteilung.'
                            }
                        </p>
                    </div>

                {/* Anzahl Aktionen (Medikamente / Bohnen) */}
                <div className="config-item">
                    <label className="config-label">
                        <Coffee className="config-icon"/>
                        Anzahl verschiedener Bohnen: {config.numActions}
                        </label>
                        <div className="slider-container">
                            <div className="slider-wrapper">
                                <input
                                    type="range"
                                    className="slider"
                                    value={config.numActions}
                                    onChange={(e) => handleNumActionsChange(parseInt(e.target.value, 10))}
                                    min={1}
                                    max={10}
                                    step={1}
                                />
                                <div className="slider-labels">
                                    <span>1</span>
                                    <span>10</span>
                                </div>
                            </div>
                            <input
                                type="number"
                                className="number-input"
                                value={config.numActions}
                                onChange={(e) => handleNumActionsChange(parseInt(e.target.value, 10))}
                                min={1}
                                max={10}
                            />
                        </div>
                    </div>

                    {/* Anzahl Iterationen (Patienten / Versuche) */}
                    <div className="config-item">
                        <label className="config-label">
                            <RotateCcw className="config-icon" />
                            Anzahl Versuche: {config.numIterations}
                        </label>
                        <div className="slider-container">
                            <div className="slider-wrapper">
                                <input
                                    type="range"
                                    className="slider"
                                    value={config.numIterations}
                                    onChange={(e) => handleNumIterationsChange(parseInt(e.target.value, 10))}
                                    min={1}
                                    max={50}
                                    step={1}
                                />
                                <div className="slider-labels">
                                    <span>1</span>
                                    <span>50</span>
                                </div>
                            </div>
                            <input
                                type="number"
                                className="number-input"
                                value={config.numIterations}
                                onChange={(e) => handleNumIterationsChange(parseInt(e.target.value, 10))}
                                min={1}
                                max={50}
                                step={1}
                            />
                        </div>
                    </div>

                    {/* Hinweis-Text */}
                    <div className="config-separator">
                        <p className="tip-text">
                            <span className="tip-emoji">💡</span>
                            Stelle die Parameter für dein Multi-Armed Bandit Experiment ein. Mehr Bohnen bedeuten mehr Optionen, aber auch schwierigere Entscheidungen!
                        </p>
                    </div>

                    {/* Algorithmus-Auswahl */}
                    <div className="config-item">
                        <label className="config-label">
                            <AlertCircle className="config-icon" />
                            Algorithmus
                        </label>
                        <div className="select-container">
                            <select
                                id="algorithm"
                                value={config.algorithm}
                                onChange={(e) => setConfig({ ...config, algorithm: e.target.value })}
                                className="select-trigger"
                            >
                                <option value="greedy">Greedy</option>
                                <option value="epsilon-greedy">ε-Greedy</option>
                                <option value="random">Random</option>
                            </select>
                        </div>
                    </div>

                    {/* Buttons Start/Stop */}
                    <div className="button-container">
                        <button
                            className={`button button-start ${gameStarted ? 'disabled' : ''}`}
                            onClick={onStartGame}
                            disabled={gameStarted}
                        >
                            {gameStarted ? (
                                <>
                                    <div className="spin-animation">⚡</div>
                                    Spiel läuft...
                                </>
                            ) : (
                                <>
                                    <Play className="button-icon" />
                                    Spiel starten!
                                </>
                            )}
                        </button>

                        {gameStarted && (
                            <button
                                className="button button-stop"
                                onClick={onStopGame}
                            >

                                🛑 Spiel abbrechen
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigurationPanel;