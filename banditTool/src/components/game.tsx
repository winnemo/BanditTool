import "./game.css";
// Importiert die Icons für Erfolg (Häkchen) und Misserfolg (Kreuz).
import { Check, X } from 'lucide-react';

/**
 * Eine React-Komponente, die die Haupt-Spieloberfläche darstellt.
 * Sie zeigt den Spielstatus, die Auswahlmöglichkeiten für den Spieler und die Aktionen des Algorithmus an.
 *
 * @param {object} props - Die Eigenschaften der Komponente.
 * @param {object} props.gameState - Der aktuelle Zustand des Spiels (Runde, Punkte etc.).
 * @param {object} props.config - Die vom Benutzer gewählte Spielkonfiguration.
 * @param {function} props.onDrugChoice - Callback, der bei der Wahl einer Aktion durch den Spieler ausgelöst wird.
 * @param {boolean} props.isGameComplete - Flag, das anzeigt, ob das Spiel beendet ist.
 * @param {JSX.Element|null} props.notification - Eine Benachrichtigung, die dem Spieler angezeigt wird.
 * @param {object} props.algorithmState - Der Zustand der letzten Aktion des Algorithmus.
 * @returns {JSX.Element|null} Die gerenderte Spieloberfläche oder null.
 */
const GameInterface = ({
                           gameState,
                           config,
                           onDrugChoice,
                           isGameComplete,
                           notification,
                           algorithmState
                       }) => {

    // Formatiert den Algorithmus-Namen für eine schönere Anzeige (z.B. "epsilon-greedy" -> "Epsilon greedy").
    const algoName = config.algorithm.charAt(0).toUpperCase() + config.algorithm.slice(1).replace('-', ' ');

    // Wenn das Spiel weder läuft noch beendet ist, wird nichts angezeigt.
    if (!gameState.isPlaying && !isGameComplete) return null;

    // Zustand 1: Das Spiel ist beendet. Zeige den Abschlussbildschirm an.
    if (isGameComplete) {
        return (
            <div className="card">
                <div className="card-content text-center p-8">
                    <h3 className="text-2xl font-bold text-green-700 mb-4">Spiel beendet! ☕</h3>
                    <p className="text-lg text-gray-700 mb-2">
                        Sie haben <span className="font-bold text-green-600">{gameState.savedLives}</span> von {config.numIterations} Tassen erfolgreich gebrüht.
                    </p>
                    <p className="text-lg text-gray-700">
                        Ihre Erfolgsrate: <span className="font-bold text-green-600">
                            {((gameState.savedLives / config.numIterations) * 100).toFixed(1)}%
                        </span>
                    </p>
                </div>
            </div>
        );
    }

    // Hilfsvariable, um zu prüfen, ob der Algorithmus in dieser Runde bereits eine Wahl getroffen hat.
    const hasAlgoResult = algorithmState.choice !== -1;

    // Zustand 2: Das Spiel läuft. Zeige die aktive Spieloberfläche an.
    return (
        <div className="card">
            <div className="card-header">
                <h2 className="game-header">
                    <span className="game-info">
                        <span className="game-info-small">
                            Runde {gameState.currentPatient} von {config.numIterations}
                        </span>
                    </span>
                    <span className="game-info">
                        <span className="game-info-small">
                            Gebrühte Tassen: {gameState.savedLives} von {gameState.currentPatient}
                        </span>
                    </span>
                </h2>
            </div>
            <div className="card-content">

                {/* Zeigt die Benachrichtigung an, falls eine vorhanden ist. */}
                {notification && (
                    <div className="notification-box mb-4">
                        {notification}
                    </div>
                )}

                <div className="game-grid">

                    {/* Bereich für die Aktionen des Spielers */}
                    <div className="player-actions">
                        <p className="game-info-small mb-3">Wählen Sie eine Kaffeebohne:</p>
                        <div className="beans-grid">
                            {/* Erzeugt für jede mögliche Aktion einen Button */}
                            {Array.from({length: config.numActions}).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => onDrugChoice(index)}
                                    // Wendet eine spezielle Klasse an, wenn der Algorithmus dieselbe Bohne gewählt hat.
                                    className={`bean-button ${hasAlgoResult && algorithmState.choice === index ? 'algo-selected' : ''}`}
                                    disabled={isGameComplete}
                                >
                                    ☕ Bohne {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bereich für die Aktionen des Algorithmus. Wird nur angezeigt, wenn ein Ergebnis vorliegt. */}
                    {hasAlgoResult && (
                        <div className="algorithm-area">
                            <h4 className="algo-title">
                                {algoName} Algorithmus
                            </h4>
                            <div className="algo-result-box">
                                <p className="algo-choice-text">
                                    Wahl: Bohne {algorithmState.choice + 1}
                                </p>
                                <div className={`algo-outcome ${algorithmState.success ? 'success' : 'failure'}`}>
                                    {/* Zeigt je nach Erfolg ein Häkchen oder ein Kreuz an. */}
                                    {algorithmState.success ? (
                                        <>
                                            <Check className="outcome-icon" />
                                            Erfolgreich
                                        </>
                                    ) : (
                                        <>
                                            <X className="outcome-icon" />
                                            Misserfolg
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default GameInterface;