import React from 'react';
// Die Icons werden aktuell nicht verwendet, können aber drin bleiben
import "./configuration.css";

const ConfigurationPanel = ({ config, setConfig }) => {
    return (
        <>
            <h2 className="config-title">Konfiguration</h2>

            <div className="config-grid">
                <div className="config-panel">
                    <label>
                        Anzahl Medikamente
                    </label>
                    <div className="input">
                        <input
                            id="numActions-range"
                            type="range"
                            min="1"
                            max="50"
                            value={config.numActions}
                            onChange={(e) =>
                                setConfig({...config, numActions: parseInt(e.target.value, 10)})
                            }
                        />
                        <input
                            id="numActions-number"
                            type="number"
                            min="1"
                            max="50"
                            value={config.numActions}
                            onChange={(e) =>
                                setConfig({...config, numActions: parseInt(e.target.value, 10)})
                            }
                        />
                    </div>

                </div>

                <div className="config-panel">
                    <label>
                        Anzahl Patienten
                    </label>
                    <div className="input">
                        <input
                            id="numIterations-range"
                            type="range"
                            min="1"
                            max="1000"
                            value={config.numIterations}
                            onChange={(e) =>
                                setConfig({...config, numIterations: parseInt(e.target.value, 10)})
                            }
                            aria-labelledby="numIterations-number" // Hilft Screenreadern
                        />
                        <input
                            id="numIterations-number"
                            type="number"
                            min="1"
                            max="1000"
                            value={config.numIterations}
                            onChange={(e) => setConfig({...config, numIterations: parseInt(e.target.value)})}>
                        </input>
                    </div>

                </div>

                <div className="config-panel">
                    <label>
                        Bandit-Typ
                    </label>
                    <select
                        id="banditType"
                        value={config.banditType}
                        onChange={(e) => setConfig({...config, banditType: e.target.value})}
                        className="config-select">
                        <option value="bernoulli">Bernoulli</option>
                        <option value="gaussian">Gaussian</option>
                    </select>
                </div>

                <div className="config-panel">
                    <label>
                        Algorithmus
                    </label>
                    <select
                        id="algorithm"
                        value={config.algorithm}
                        onChange={(e) => setConfig({...config, algorithm: e.target.value})}
                        className="config-select"
                    >
                        <option value="greedy">Greedy</option>
                        <option value="epsilon-greedy">ε-Greedy</option>
                        <option value="random">Random</option>
                    </select>
                </div>
            </div>
        </>
    );
};

export default ConfigurationPanel;