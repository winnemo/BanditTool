import React from 'react';
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
                    <label className="config-item label">
                        Anzahl Medikamente
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={config.numDrugs}
                        onChange={(e) =>
                            setConfig({...config, numDrugs: parseInt(e.target.value, 10)})
                        }
                        className=""
                    />
                    <input
                        type="number"
                        min="1"
                        max="50"
                        value={config.numDrugs}
                        onChange={(e) =>
                            setConfig({...config, numDrugs: parseInt(e.target.value, 10)})
                        }
                        className=""
                    />
                </div>

                <div>
                    <label className="">
                        Anzahl Patienten
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="1000"
                        value={config.numPatients}
                        onChange={(e) =>
                            setConfig({...config, numPatients: parseInt(e.target.value, 10)})
                        }
                        className=""
                    />
                    <input
                        type="number"
                        min="1"
                        max="1000"
                        value={config.numPatients}
                        onChange={(e) => setConfig({...config, numPatients: parseInt(e.target.value)})}>
                    </input>
                </div>

                <div>
                    <label className="">Bandit Typ</label>
                    <select
                        value={config.banditType}
                        onChange={(e) => setConfig({...config, banditType: e.target.value})}
                        className=""
                    >
                        <option value="bernoulli">Bernoulli</option>
                        <option value="gaussian">Gaussian</option>
                    </select>
                </div>

                <div>
                    <label className="">
                        Algorithmus
                    </label>
                    <select
                        value={config.algorithm}
                        onChange={(e) => setConfig({...config, algorithm: e.target.value})}
                        className=""
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