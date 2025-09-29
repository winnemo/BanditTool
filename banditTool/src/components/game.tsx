import "./game.css";

const GameInterface = ({
                           gameState,
                           config,
                           onDrugChoice,
                           isGameComplete,
                           notification
                       }) => {

    // Anzeige der Zusammenfassung, WENN das Spiel beendet wurde UND nicht mehr läuft
    if (isGameComplete && !gameState.isPlaying) {
        return (
            <div className="card">
                <div className="card-content">
                    <h3 className="card-title">Spiel beendet!</h3>
                    <p className="game-info">
                        Sie haben <span style={{fontWeight: 'bold'}}>{gameState.savedLives}</span> von {config.numIterations} Tassen gebrüht
                    </p>
                    <p className="game-info">
                        Erfolgsrate: {((gameState.savedLives / config.numIterations) * 100).toFixed(1)}%
                    </p>
                </div>
            </div>
        );
    }

    // Fall 1: Spiel hat nicht begonnen ODER wurde abgebrochen
    if (!gameState.isPlaying && !isGameComplete) return null;

    // Fall 2: Spiel läuft (oder max. Versuche sind erreicht, aber noch nicht abgebrochen)
    const currentAttempt = gameState.currentPatient;
    const isFinished = currentAttempt >= config.numIterations;

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="game-header">
                    <span className="game-info-small">
                        {currentAttempt} von {config.numIterations}
                        {isFinished && " (Maximale Tassen erreicht)"}
                    </span>
                    <span className="game-info-small">
                        Erfolgreiche Tassen: {gameState.savedLives} ({currentAttempt > 0 ? ((gameState.savedLives / currentAttempt) * 100).toFixed(1) : 0}%)
                    </span>
                </h2>
            </div>
            <div className="card-content">
                <div className="game-area">
                    {/* 💡 Benachrichtigungs-Box */}
                    {notification && (
                        <div className="notification-box">
                            {notification}
                        </div>
                    )}

                    <p className="game-info-small" style={{marginTop: notification ? '0.5rem' : '0'}}>
                        {isFinished ? "⚠️ Spiel beenden, um neu zu starten." : "Wählen Sie eine Kaffeebohne:"}
                    </p>
                    <div className="beans-grid">
                        {Array.from({length: config.numActions}).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => onDrugChoice(index)}
                                className="bean-button"
                                disabled={isFinished}
                            >
                                ☕ Bohne {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameInterface;
