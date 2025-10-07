// Importiert notwendige Icons aus der 'lucide-react' Bibliothek und das zugehörige CSS-Styling.
import { Settings, Coffee, RotateCcw, Play, AlertCircle } from 'lucide-react';
import "./configuration.css";

/**
 * Eine React-Komponente, die ein Konfigurationspanel für ein "Multi-Armed Bandit"-Spiel anzeigt.
 * Sie ermöglicht es dem Benutzer, verschiedene Parameter wie den Bandit-Typ, die Anzahl der Aktionen
 * und Iterationen sowie den Algorithmus einzustellen und das Spiel zu starten/stoppen.
 *
 * @param {object} props - Die Eigenschaften der Komponente.
 * @param {object} props.config - Das aktuelle Konfigurationsobjekt.
 * @param {function} props.setConfig - Funktion zum Aktualisieren des Konfigurationsobjekts.
 * @param {function} props.onStartGame - Callback-Funktion zum Starten des Spiels.
 * @param {function} props.onStopGame - Callback-Funktion zum Stoppen des Spiels.
 * @param {boolean} props.gameStarted - Flag, das angibt, ob das Spiel gerade läuft.
 * @returns {JSX.Element} Das gerenderte Konfigurationspanel.
 */
const ConfigurationPanel = ({ config, setConfig, onStartGame, onStopGame, gameStarted }) => {

    // Handler-Funktion für Änderungen am Slider/Input für die Anzahl der Aktionen ("Bohnen").
    // Stellt sicher, dass der Wert eine gültige Zahl im Bereich von 1 bis 10 ist.
    const handleNumActionsChange = (value) => {
        if (!isNaN(value) && value >= 1 && value <= 10) {
            setConfig({ ...config, numActions: value });
        }
    };

    // Handler-Funktion für Änderungen am Slider/Input für die Anzahl der Iterationen ("Versuche").
    // Stellt sicher, dass der Wert eine gültige Zahl im Bereich von 1 bis 50 ist.
    const handleNumIterationsChange = (value) => {
        if (!isNaN(value) && value >= 1 && value <= 50) {
            setConfig({ ...config, numIterations: value });
        }
    };

    return (
        <div className="card">
            {/* Kopfzeile des Panels */}
            <div className="card-header">
                <h2 className="card-title">
                    <Settings className="config-icon" />
                    Spiel-Konfiguration
                </h2>
            </div>
            <div className="card-content">
                <div className="config-section">

                    {/* Konfigurationspunkt: Bandit-Typ */}
                    <div className="config-item">
                        <label className="config-label">
                            Bandit-Typ
                        </label>
                        <div className="select-container">
                            <select
                                className="select-trigger"
                                value={config.banditType}
                                onChange={(e) => setConfig({...config, banditType: e.target.value})}
                            >
                                <option value="bernoulli">Bernoulli</option>
                                <option value="gaussian">Gaussian</option>
                            </select>
                        </div>
                        {/* Dynamischer Hilfetext, der den ausgewählten Bandit-Typ erklärt */}
                        <p className="help-text">
                            {config.banditType === 'bernoulli'
                                ? 'Binäre Belohnungen: Jede Kaffeebohne gibt entweder 0 oder 1 Punkt.'
                                : 'Kontinuierliche Belohnungen: Jede Kaffeebohne gibt Punkte aus einer Normalverteilung von 0 bis 10 Punkten.'
                            }
                        </p>
                    </div>

                    {/* Konfigurationspunkt: Anzahl der Aktionen (Bohnen) */}
                    <div className="config-item">
                        <label className="config-label">
                            <Coffee className="config-icon"/>
                            Anzahl verschiedener Bohnen: {config.numActions}
                        </label>
                        <div className="slider-container">
                            <div className="slider-wrapper">
                                <input
                                    type="range"
                                    className="slider"
                                    value={config.numActions}
                                    onChange={(e) => handleNumActionsChange(parseInt(e.target.value, 10))}
                                    min={1}
                                    max={10}
                                    step={1}
                                />
                                <div className="slider-labels">
                                    <span>1</span>
                                    <span>10</span>
                                </div>
                            </div>
                            {/* Zusätzliches Nummern-Input für präzise Eingaben */}
                            <input
                                type="number"
                                className="number-input"
                                value={config.numActions}
                                onChange={(e) => handleNumActionsChange(parseInt(e.target.value, 10))}
                                min={1}
                                max={10}
                            />
                        </div>
                    </div>

                    {/* Konfigurationspunkt: Anzahl der Iterationen (Versuche) */}
                    <div className="config-item">
                        <label className="config-label">
                            <RotateCcw className="config-icon" />
                            Anzahl Versuche: {config.numIterations}
                        </label>
                        <div className="slider-container">
                            <div className="slider-wrapper">
                                <input
                                    type="range"
                                    className="slider"
                                    value={config.numIterations}
                                    onChange={(e) => handleNumIterationsChange(parseInt(e.target.value, 10))}
                                    min={1}
                                    max={50}
                                    step={1}
                                />
                                <div className="slider-labels">
                                    <span>1</span>
                                    <span>50</span>
                                </div>
                            </div>
                            <input
                                type="number"
                                className="number-input"
                                value={config.numIterations}
                                onChange={(e) => handleNumIterationsChange(parseInt(e.target.value, 10))}
                                min={1}
                                max={50}
                                step={1}
                            />
                        </div>
                    </div>

                    {/* Ein kleiner Hinweis-Text für den Benutzer */}
                    <div className="config-separator">
                        <p className="tip-text">
                            <span className="tip-emoji">💡</span>
                            Stelle die Parameter für dein Multi-Armed Bandit Experiment ein. Mehr Bohnen bedeuten mehr Optionen, aber auch schwierigere Entscheidungen!
                        </p>
                    </div>

                    {/* Konfigurationspunkt: Algorithmus-Auswahl */}
                    <div className="config-item">
                        <label className="config-label">
                            <AlertCircle className="config-icon" />
                            Algorithmus
                        </label>
                        <div className="select-container">
                            <select
                                id="algorithm"
                                value={config.algorithm}
                                onChange={(e) => setConfig({ ...config, algorithm: e.target.value })}
                                className="select-trigger"
                            >
                                <option value="greedy">Greedy</option>
                                <option value="epsilon-greedy">ε-Greedy</option>
                                <option value="random">Random</option>
                            </select>
                        </div>
                    </div>

                    {/* Container für die Start/Stop-Aktionsbuttons */}
                    <div className="button-container">
                        <button
                            className={`button button-start ${gameStarted ? 'disabled' : ''}`}
                            onClick={onStartGame}
                            disabled={gameStarted} // Button wird deaktiviert, wenn das Spiel läuft
                        >
                            {/* Bedingte Anzeige: Text ändert sich, je nachdem ob das Spiel läuft */}
                            {gameStarted ? (
                                <>
                                    <div className="spin-animation">⚡</div>
                                    Spiel läuft...
                                </>
                            ) : (
                                <>
                                    <Play className="button-icon" />
                                    Spiel starten!
                                </>
                            )}
                        </button>

                        {/* Der "Spiel abbrechen"-Button wird nur gerendert, wenn das Spiel gestartet ist */}
                        {gameStarted && (
                            <button
                                className="button button-stop"
                                onClick={onStopGame}
                            >
                                🛑 Spiel abbrechen
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigurationPanel;