import React from 'react';

const GameInterface = ({
                           gameState,
                           config,
                           onDrugChoice,
                           isGameComplete
                       }) => {
    if (!gameState.isPlaying && !isGameComplete) return null;

    if (isGameComplete) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-slate-700 text-center">
                <h3 className="text-2xl font-bold mb-4 text-green-400">Spiel beendet!</h3>
                <p className="text-xl mb-2">
                    Sie haben <span className="text-green-400 font-bold">{gameState.savedLives}</span> von {config.numPatients} Patienten gerettet
                </p>
                <p className="text-slate-300">
                    Erfolgsrate: {((gameState.savedLives / config.numPatients) * 100).toFixed(1)}%
                </p>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-slate-700">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">
                    Patient {gameState.currentPatient + 1} von {config.numPatients}
                </h3>
                <p className="text-slate-300">
                    Gerettete Leben: <span className="text-green-400 font-bold">{gameState.savedLives}</span>
                </p>
            </div>

            <div className="text-center mb-4">
                <p className="text-lg mb-4">Wählen Sie ein Medikament für diesen Patienten:</p>
                <div className="flex gap-4 justify-center flex-wrap">
                    {Array.from({length: config.numDrugs}).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => onDrugChoice(index)}
                            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-lg transition-colors min-w-[120px]"
                        >
                            Medikament {index + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* Drug Statistics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(gameState.drugStats).map(([drugKey, stats], index) => (
                    <div key={drugKey} className="bg-slate-700/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Medikament {index + 1}</h4>
                        <p>Versuche: {stats.attempts}</p>
                        <p>Erfolge: {stats.successes}</p>
                        <p>Erfolgsrate: {stats.attempts > 0 ? ((stats.successes / stats.attempts) * 100).toFixed(1) : 0}%</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameInterface;