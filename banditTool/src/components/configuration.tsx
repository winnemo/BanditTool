import React from 'react';
import { Settings, Pill, Users, Brain } from 'lucide-react';

const ConfigurationPanel = ({ config, setConfig }) => {
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-slate-700">
            <div className="flex items-center mb-4">
                <Settings className="mr-2" size={20} />
                <h2 className="text-xl font-semibold">Konfiguration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        <Pill className="inline mr-1" size={16} />
                        Anzahl Medikamente
                    </label>
                    <select
                        value={config.numDrugs}
                        onChange={(e) => setConfig({...config, numDrugs: parseInt(e.target.value)})}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-400"
                    >
                        {[2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        <Users className="inline mr-1" size={16} />
                        Anzahl Patienten
                    </label>
                    <select
                        value={config.numPatients}
                        onChange={(e) => setConfig({...config, numPatients: parseInt(e.target.value)})}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-400"
                    >
                        {[50, 100, 200, 500].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Bandit Typ</label>
                    <select
                        value={config.banditType}
                        onChange={(e) => setConfig({...config, banditType: e.target.value})}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-400"
                    >
                        <option value="bernoulli">Bernoulli</option>
                        <option value="gaussian">Gaussian</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        <Brain className="inline mr-1" size={16} />
                        Algorithmus
                    </label>
                    <select
                        value={config.algorithm}
                        onChange={(e) => setConfig({...config, algorithm: e.target.value})}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-400"
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