import React from 'react';

//Rendert HHaupt-Benutzeroberfläche und hat drei Anzeigezustände (nichts, Endauswertung, aktive spielansicht)

const GameInterface = ({
                           gameState,
                           config,
                           onDrugChoice,
                           isGameComplete
                       }) => {
    // Fall 1: spiel hat nicht begonnen und ist nicht beendet
    if (!gameState.isPlaying && !isGameComplete) return null;

    // Fall 2: Spiel ist beendet, zeige zusammenfassung an
    if (isGameComplete) {
        return (
            <div className="">
                <h3 className="">Spiel beendet!</h3>
                <p className="">
                    Sie haben <span className="">{gameState.savedLives}</span> von {config.numIterations} Patienten gerettet
                </p>
                <p className="">
                    Erfolgsrate: {((gameState.savedLives / config.numIterations) * 100).toFixed(1)}%
                </p>
            </div>
        );
    }

    //Fall 3: Spiel läuft: zeigt Spieloberfläche
    return (
        <div className="">
            <div className="">
                <h3 className="">
                    Patient {gameState.currentPatient + 1} von {config.numIterations}
                </h3>
                <p className="">
                    Gerettete Leben: <span className="">{gameState.savedLives}</span>
                </p>
            </div>

            <div className="">
                <p className="">Wählen Sie ein Medikament für diesen Patienten:</p>
                <div className="">
                    {Array.from({length: config.numActions}).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => onDrugChoice(index)}
                            className=""
                        >
                            Medikament {index + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* Drug Statistics */}
            <div className="">
                {Object.entries(gameState.drugStats).map(([drugKey, stats], index) => (
                    <div key={drugKey} className="">
                        <h4 className="">Medikament {index + 1}</h4>
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