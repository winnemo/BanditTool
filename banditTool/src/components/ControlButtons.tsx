import React from 'react';
import { Play, BarChart3 } from 'lucide-react';

const ControlButtons = ({
                            onStartGame,
                            onShowPlot,
                            hasGameData
                        }) => {
    return (
        <div className="flex gap-4 mb-6 justify-center">
            <button
                onClick={onStartGame}
                className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
            >
                <Play className="mr-2" size={20} />
                Spiel starten
            </button>

            <button
                onClick={onShowPlot}
                disabled={!hasGameData}
                className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <BarChart3 className="mr-2" size={20} />
                Graphen anzeigen
            </button>
        </div>
    );
};

export default ControlButtons;