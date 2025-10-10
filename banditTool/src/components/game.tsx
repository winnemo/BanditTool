import { Coffee, TrendingUp, Trophy, Check, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PLAYER_COLOR, ALGORITHM_COLORS } from '../utils/styleConstants';
import './game.css';

// Die Typen aus dem useGameLogic Hook importieren/neu definieren
// Es ist besser, diese aus einer zentralen 'types.ts' Datei zu importieren
type AlgorithmType = 'greedy' | 'epsilon-greedy' | 'random';
interface GameState {
    currentPatient: number;
    savedLives: number;
}
interface Config {
    numActions: number;
    numIterations: number;
    banditType: "bernoulli" | "gaussian";
    algorithms: AlgorithmType[];
}
interface PerformanceDataPoint {
    patient: number;
    playerSavedLives: number;
    [key: string]: number;
}

interface AlgorithmState {
    name: AlgorithmType;
    choice: number;
    success: boolean | null;
}

interface GameAreaProps {
    gameState: GameState;
    config: Config;
    onBeanClick: (index: number) => void;
    isGameComplete: boolean;
    algorithmPerformance: PerformanceDataPoint[];
    algorithmStates: AlgorithmState[];
}

// Benutzerdefinierter Tooltip für den Graphen (aus deinem alten Projekt übernommen)
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{`Runde: ${label}`}</p>
                <ul className="tooltip-list">
                    {payload.map((entry: any, index: number) => (
                        <li key={`item-${index}`} style={{ color: entry.color }}>
                            {`${entry.name} : ${entry.value}`}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
    return null;
};

// Hilfsfunktion zur Formatierung der Namen
const formatAlgoName = (name: string) => {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export function GameArea({
                             gameState,
                             config,
                             onBeanClick,
                             isGameComplete,
                             algorithmPerformance,
                             algorithmStates,
                         }: GameAreaProps) {

    // Prüfen, ob die Algorithmen bereits eine Wahl getroffen haben in dieser Runde
    const hasAlgoResults = gameState.currentPatient > 0 && algorithmStates.length > 0 && algorithmStates[0].choice !== -1;

    return (
        <div className="game-area-container">
            {/* Status Bar */}
            <div className="game-status-bar">
                <div className="status-badge status-badge-primary">
                    Runde {gameState.currentPatient} / {config.numIterations}
                </div>
                <div className="status-badge status-badge-secondary">
                    {config.banditType.charAt(0).toUpperCase() + config.banditType.slice(1)}
                </div>
                <div className="status-badge status-badge-success">
                    {config.algorithms.length} {config.algorithms.length === 1 ? 'Algorithmus' : 'Algorithmen'}
                </div>
            </div>

            {/* Left Column - Bean Selection */}
            <div className="game-column game-column-main">
                <div className="card card-game">
                    <div className="card-header">
                        <h2 className="card-title-game">
                            <Coffee className="config-icon" />
                            Wähle eine Kaffeebohne
                        </h2>
                    </div>
                    <div className="card-content">
                        <div className="beans-grid-compact">
                            {Array.from({ length: config.numActions }, (_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => onBeanClick(index)}
                                    className="bean-button"
                                    disabled={isGameComplete}
                                >
                                    <Coffee className="bean-icon" />
                                    <span className="bean-text">Bohne {index + 1}</span>
                                </button>
                            ))}
                        </div>

                        {isGameComplete && (
                            <div className="game-complete-message">
                                <Trophy className="complete-icon" />
                                <p>Spiel beendet! Sehr gut gemacht!</p>
                                <p className="score-text">
                                    Dein finaler Punktestand: {gameState.savedLives} / {config.numIterations}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column - Stats & Chart */}
            <div className="game-column game-column-side">
                {/* Cups Counter, zeigt den Punktestand */}
                <div className="card cups-card">
                    <div className="card-content">
                        <div className="cups-stats">
                            <Coffee className="cups-icon"/>
                            <div className="cups-info">
                                <div className="cups-number">{gameState.savedLives}</div>
                                <div className="cups-label">Punkte</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Algorithm Actions */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title-small">Algorithmen-Aktionen</h3>
                    </div>
                    <div className="card-content">
                        {hasAlgoResults ? (
                            <div className="algorithm-details-grid">
                                {algorithmStates
                                    .filter(state => config.algorithms.includes(state.name))
                                    .map((state) => {
                                        const colorIndex = config.algorithms.indexOf(state.name);
                                        const color = ALGORITHM_COLORS[colorIndex % ALGORITHM_COLORS.length];

                                        return (
                                            <div key={state.name} className="algo-result-box"
                                                 style={{borderColor: color, color: color}}>
                                                <div className="algo-header">
                                                    <strong
                                                        className="algo-name-tag">{formatAlgoName(state.name)}</strong>
                                                    <span>wählt Bohne {state.choice + 1}</span>
                                                </div>
                                                <div
                                                    className={`algo-outcome ${state.success ? 'success' : 'failure'}`}>
                                                    {state.success ? (
                                                        <><Check className="outcome-icon"/> Erfolgreich</>
                                                    ) : (
                                                        <><X className="outcome-icon"/> Misserfolg</>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <p className="algo-wait-text">Die Algorithmen warten auf deine erste Wahl...</p>
                        )}
                    </div>
                </div>

                {/* Performance Chart (Logik aus PerformanceChart.tsx übernommen) */}
                <div className="card card-chart">
                    <div className="card-header">
                        <h3 className="card-title-small">
                            <TrendingUp className="config-icon-small"/> Performance
                        </h3>
                    </div>
                    <div className="card-content">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={algorithmPerformance} margin={{top: 5, right: 20, left: 20, bottom: 25}}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis
                                    dataKey="patient"
                                    label={{value: 'Runde (Tasse)', position: 'insideBottom', offset: -15}}
                                    domain={[0, config.numIterations]}
                                />
                                <YAxis
                                    label={{
                                        value: 'Kumulierte Punkte',
                                        angle: -90,
                                        position: 'insideLeft',
                                        offset: -15
                                    }}
                                    domain={[0, config.numIterations]}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<CustomTooltip/>}/>
                                <Legend wrapperStyle={{paddingTop: '25px'}}/>
                                <Line
                                    type="monotone"
                                    dataKey="playerSavedLives"
                                    stroke={PLAYER_COLOR}
                                    strokeWidth={2}
                                    name="Deine Performance"
                                    dot={{r: 4}}
                                />
                                {config.algorithms.map((algoName, index) => (
                                    <Line
                                        key={algoName}
                                        type="monotone"
                                        dataKey={algoName}
                                        stroke={ALGORITHM_COLORS[index % ALGORITHM_COLORS.length]}
                                        strokeWidth={2}
                                        name={`${algoName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
                                        dot={{r: 4}}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}