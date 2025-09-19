import React from 'react';
// Die Icons werden aktuell nicht verwendet, können aber drin bleiben
import { Settings, Pill, Users, Brain } from 'lucide-react';
import "./configuration.css";

const ConfigurationPanel = ({ config, setConfig }) => {
    return (
        <div className="config-panel">
            <div className="config-header">
                <h2 className="config-title">Konfiguration</h2>
            </div>

            <div className="config-grid">
                <div>
                    {/* htmlFor und id hinzugefügt */}
                    <label htmlFor="numDrugs-number" className="config-item label">
                        Anzahl Medikamente
                    </label>
                    <input
                        id="numDrugs-range"
                        type="range"
                        min="1"
                        max="50"
                        value={config.numDrugs}
                        onChange={(e) =>
                            setConfig({...config, numDrugs: parseInt(e.target.value, 10)})
                        }
                        aria-labelledby="numDrugs-number" // Hilft Screenreadern
                    />
                    <input
                        id="numDrugs-number"
                        type="number"
                        min="1"
                        max="50"
                        value={config.numDrugs}
                        onChange={(e) =>
                            setConfig({...config, numDrugs: parseInt(e.target.value, 10)})
                        }
                    />
                </div>

                <div>
                    {/* htmlFor und id hinzugefügt */}
                    <label htmlFor="numPatients-number" className="">
                        Anzahl Patienten
                    </label>
                    <input
                        id="numPatients-range"
                        type="range"
                        min="1"
                        max="1000"
                        value={config.numPatients}
                        onChange={(e) =>
                            setConfig({...config, numPatients: parseInt(e.target.value, 10)})
                        }
                        aria-labelledby="numPatients-number" // Hilft Screenreadern
                    />
                    <input
                        id="numPatients-number"
                        type="number"
                        min="1"
                        max="1000"
                        value={config.numPatients}
                        onChange={(e) => setConfig({...config, numPatients: parseInt(e.target.value)})}>
                    </input>
                </div>

                <div>
                    {/* htmlFor und id hinzugefügt */}
                    <label htmlFor="banditType" className="">Bandit Typ</label>
                    <select
                        id="banditType"
                        value={config.banditType}
                        onChange={(e) => setConfig({...config, banditType: e.target.value})}
                        className="config-select" // CSS-Klasse hinzugefügt
                    >
                        <option value="bernoulli">Bernoulli</option>
                        <option value="gaussian">Gaussian</option>
                    </select>
                </div>

                <div>
                    {/* htmlFor und id hinzugefügt */}
                    <label htmlFor="algorithm" className="">
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
        </div>
    );
};

export default ConfigurationPanel;