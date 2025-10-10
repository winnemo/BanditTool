import "./game.css";
import { Check, X } from 'lucide-react';
import { PLAYER_COLOR, ALGORITHM_COLORS } from '../utils/styleConstants';

// Macht aus "greedy" -> "Greedy" und aus "epsilon-greedy" -> "Epsilon-Greedy"
const formatAlgoName = (name: string) => {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-');
};

const GameInterface = ({ gameState, config, onDrugChoice, isGameComplete, notification, algorithmStates }) => {

    if (isGameComplete) {
        // Der Endbildschirm bleibt unverändert
        return (
            <div className="card">
                <div className="card-content text-center p-8">
                    <h3 className="text-2xl font-bold text-green-700 mb-4">Spiel beendet! ☕</h3>
                    <p className="text-lg text-gray-700 mb-2">
                        Sie haben <span className="font-bold" style={{ color: PLAYER_COLOR }}>{gameState.savedLives}</span> von {config.numIterations} Tassen erfolgreich gebrüht.
                    </p>
                    <p className="text-lg text-gray-700">
                        Ihre Erfolgsrate: <span className="font-bold" style={{ color: PLAYER_COLOR }}>
                            {((gameState.savedLives / config.numIterations) * 100).toFixed(1)}%
                        </span>
                    </p>
                </div>
            </div>
        );
    }

    const visibleAlgorithmStates = algorithmStates.filter(state =>
        config.algorithms.includes(state.name)
    );

    const hasAlgoResults = visibleAlgorithmStates.length > 0 && visibleAlgorithmStates[0].choice !== -1;

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="game-header">
                <span className="game-info">
                    Runde {gameState.currentPatient} von {config.numIterations}
                </span>

                    {/* HIER kommt die Änderung: Das 'style'-Attribut wird hinzugefügt */}
                    <span className="game-info" style={{color: PLAYER_COLOR}}>
                    Gebrühte Tassen: {gameState.savedLives} von {gameState.currentPatient}
                </span>
                </h2>
            </div>

            <div className="card-content">
                {notification && (
                    <div className="notification-box mb-4" style={{color: PLAYER_COLOR, borderColor: PLAYER_COLOR}}>
                        {notification}
                    </div>
                )}

                <div className="game-grid">
                    <div className="player-actions">
                        <p className="game-info-small mb-3">Wählen Sie eine Kaffeebohne:</p>
                        <div className="beans-grid">
                            {Array.from({ length: config.numActions }).map((_, index) => {
                                const isAlgoSelected = hasAlgoResults && visibleAlgorithmStates.some(state => state.choice === index);
                                return (
                                    <button
                                        key={index}
                                        onClick={() => onDrugChoice(index)}
                                        className={`bean-button ${isAlgoSelected ? 'algo-selected' : ''}`}
                                        disabled={isGameComplete}
                                    >
                                        ☕ Bohne {index + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {hasAlgoResults && (
                        <div className="algorithm-area">
                            <h4 className="algo-title">Algorithmen-Aktionen</h4>
                            <div className="algo-results-grid">
                                {/* GEÄNDERT: Mappt jetzt über die `visibleAlgorithmStates` */}
                                {visibleAlgorithmStates.map((state) => {
                                    // Finde den originalen Index für die korrekte Farbe
                                    const originalIndex = config.algorithms.indexOf(state.name);
                                    return (
                                        <div
                                            key={state.name}
                                            className="algo-result-box"
                                            style={{ color: ALGORITHM_COLORS[originalIndex % ALGORITHM_COLORS.length] }}
                                        >
                                            <p className="algo-choice-text">
                                                <strong className="algo-name-tag">{formatAlgoName(state.name)}</strong> wählt Bohne {state.choice + 1}
                                            </p>
                                            <div className={`algo-outcome ${state.success ? 'success' : 'failure'}`}>
                                                {state.success ? ( <><Check className="outcome-icon" /> Erfolgreich</> ) : ( <><X className="outcome-icon" /> Misserfolg</> )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameInterface;