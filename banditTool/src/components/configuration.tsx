import {
    Settings,
    Play,
    Square,
    BarChart3,
    TrendingUp,
    Shuffle,
} from "lucide-react";
import './configuration.css';

// Die Typen aus deiner Logik
type AlgorithmType = "greedy" | "epsilon-greedy" | "random";

interface Config {
    numActions: number;
    numIterations: number;
    banditType: "bernoulli" | "gaussian";
    algorithms: AlgorithmType[];
}

interface ConfigPanelProps {
    config: Config;
    setConfig: (config: Config) => void;
    onStartGame: () => void;
    onStopGame: () => void;
    gameStarted: boolean;
}

export function ConfigPanel({
                                config,
                                setConfig,
                                onStartGame,
                                onStopGame,
                                gameStarted,
                            }: ConfigPanelProps) {

    // Angepasste Handler, die das config-Objekt aktualisieren
    const handleConfigChange = (field: keyof Config, value: any) => {
        const parsedValue = typeof config[field] === 'number' ? parseInt(value, 10) : value;
        if (field === 'numActions' && (parsedValue < 1 || parsedValue > 10)) return;
        if (field === 'numIterations' && (parsedValue < 1 || parsedValue > 50)) return;

        setConfig({ ...config, [field]: parsedValue });
    };

    const handleAlgorithmToggle = (algorithm: AlgorithmType) => {
        const currentAlgorithms = config.algorithms;
        if (currentAlgorithms.includes(algorithm)) {
                setConfig({
                    ...config,
                    algorithms: currentAlgorithms.filter((a) => a !== algorithm),
                })
        } else {
            setConfig({ ...config, algorithms: [...currentAlgorithms, algorithm] });
        }
    };

    const algorithmInfo: Record<AlgorithmType, { description: string; icon: React.ReactNode }> = {
        greedy: {
            description: "Wählt immer die aktuell beste bekannte Kaffeebohne aus.",
            icon: <BarChart3 className="algorithm-card-icon" />,
        },
        'epsilon-greedy': {
            description: "Wählt meistens die beste Bohne, aber manchmal auch zufällig, um neue Optionen zu erkunden.",
            icon: <TrendingUp className="algorithm-card-icon" />,
        },
        random: {
            description: "Reiner Zufall: Dient als gute Vergleichsbasis.",
            icon: <Shuffle className="algorithm-card-icon" />,
        },
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title-main">
                    <Settings className="config-icon-main" /> Spiel-Konfiguration
                </h2>
            </div>
            <div className="card-content">
                <div className="config-section">
                    <div className="config-params-grid">
                        <div className="config-param-box">
                            <label className="config-label-compact">Bandit-Typ</label>
                            <div className="toggle-group">
                                <button
                                    type="button"
                                    className={`toggle-button ${config.banditType === "bernoulli" ? "active" : ""}`}
                                    onClick={() => handleConfigChange('banditType', 'bernoulli')}
                                >
                                    Bernoulli
                                </button>
                                <button
                                    type="button"
                                    className={`toggle-button ${config.banditType === "gaussian" ? "active" : ""}`}
                                    onClick={() => handleConfigChange('banditType', 'gaussian')}
                                >
                                    Gaussian
                                </button>
                            </div>
                            <p className="help-text-compact">
                                {config.banditType === "bernoulli"
                                    ? "💡 Binäre Belohnungen: 0 oder 1 Punkt."
                                    : "💡 Kontinuierliche Belohnungen aus Normalverteilung."}
                            </p>
                        </div>

                        <div className="config-param-box config-param-box-wide">
                            <div className="slider-row">
                                <label className="config-label-compact">Bohnen:</label>
                                <div className="slider-with-input">
                                    <input
                                        type="range"
                                        className="slider"
                                        value={config.numActions}
                                        onChange={(e) => handleConfigChange('numActions', e.target.value)}
                                        max={10} min={1} step={1}
                                    />
                                    <input
                                        type="number"
                                        className="number-input-compact"
                                        value={config.numActions}
                                        onChange={(e) => handleConfigChange('numActions', e.target.value)}
                                        min={1} max={10}
                                    />
                                </div>
                            </div>

                            <div className="slider-row">
                                <label className="config-label-compact">Versuche:</label>
                                <div className="slider-with-input">
                                    <input
                                        type="range"
                                        className="slider"
                                        value={config.numIterations}
                                        onChange={(e) => handleConfigChange('numIterations', e.target.value)}
                                        max={50} min={1} step={1}
                                    />
                                    <input
                                        type="number"
                                        className="number-input-compact"
                                        value={config.numIterations}
                                        onChange={(e) => handleConfigChange('numIterations', e.target.value)}
                                        min={1} max={50}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="config-section-group">
                        <h3 className="config-section-title">
                            <BarChart3 className="config-icon" /> Wähle deine Gegner
                        </h3>
                        <div className="algorithm-cards">
                            {(["greedy", "epsilon-greedy", "random"] as AlgorithmType[]).map((algo) => (
                                <div
                                    key={algo}
                                    className={`algorithm-card ${config.algorithms.includes(algo) ? "selected" : ""}`}
                                    onClick={() => handleAlgorithmToggle(algo)}
                                >
                                    <div className="algorithm-card-header">
                                        {algorithmInfo[algo].icon}
                                        {config.algorithms.includes(algo) && (
                                            <div className="algorithm-badge">Ausgewählt</div>
                                        )}
                                    </div>
                                    <h3 className="algorithm-card-title">{algo.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                                    <p className="algorithm-card-description">{algorithmInfo[algo].description}</p>
                                </div>
                            ))}
                        </div>
                        <p className="help-text help-text-centered">
                            {config.algorithms.length === 0
                                ? "Du trittst gegen niemanden an. Perfekt zum Üben!"
                                : config.algorithms.length === 1
                                    ? `Du trittst gegen ${config.algorithms[0].replace('-', ' ')} an.`
                                    : `Du trittst gegen ${config.algorithms.length} Algorithmen an!`}
                        </p>
                    </div>

                    <div className="button-container">
                        <button
                            className={`button button-start ${gameStarted ? "disabled" : ""}`}
                            onClick={onStartGame}
                            disabled={gameStarted}
                        >
                            {gameStarted ? (
                                <>
                                    <div className="spin-animation">⚡</div> Spiel läuft...
                                </>
                            ) : (
                                <>
                                    <Play className="button-icon" /> Spiel starten!
                                </>
                            )}
                        </button>
                        {gameStarted && (
                            <button className="button button-stop" onClick={onStopGame}>
                                <Square className="button-icon" /> Spiel abbrechen
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}