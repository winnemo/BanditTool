import React from 'react';
import { Settings, Pill, Users, Brain } from 'lucide-react';

const ConfigurationPanel = ({ config, setConfig }) => {
    return (
        <div className="">
            <div className="">
                <Settings className="mr-2" size={20} />
                <h2 className="">Konfiguration</h2>
            </div>

            <div className="">
                <div>
                    <label className="">
                        <Pill className="" size={16} />
                        Anzahl Medikamente
                    </label>
                    <select
                        value={config.numDrugs}
                        onChange={(e) => setConfig({...config, numDrugs: parseInt(e.target.value)})}
                        className=""
                    >
                        {[2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>

                <div>
                    <label className="">
                        <Users className="" size={16} />
                        Anzahl Patienten
                    </label>
                    <select
                        value={config.numPatients}
                        onChange={(e) => setConfig({...config, numPatients: parseInt(e.target.value)})}
                        className=""
                    >
                        {[50, 100, 200, 500].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
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
                        <Brain className="" size={16} />
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