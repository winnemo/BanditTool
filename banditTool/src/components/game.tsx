import "./game.css";

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
        <div className="game-container">
            <div className="dashboard">
                <h3 className="">
                    {gameState.currentPatient + 1} von {config.numIterations}
                </h3>
                <p className="">
                    Sie haben <span className="">{gameState.savedLives}</span> von {config.numIterations} Patienten
                    gerettet
                </p>
                <p className="">
                    Erfolgsrate: {((gameState.savedLives / config.numIterations) * 100).toFixed(1)}%
                </p>
            </div>

            <div className="actions">
                <p className="">Wählen Sie ein Medikament:</p>
                <div className="action-button">
                    {Array.from({length: config.numActions}).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => onDrugChoice(index)}
                            className="">
                            Medikament {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GameInterface;