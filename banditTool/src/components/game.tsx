import { Coffee, TrendingUp, Trophy, Check, X, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PLAYER_COLOR, ALGORITHM_COLORS } from '../utils/styleConstants';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './game.css';

// Die Typen aus dem useGameLogic Hook importieren/neu definieren
// Es ist besser, diese aus einer zentralen 'types.ts' Datei zu importieren
type AlgorithmType = 'greedy' | 'epsilon-greedy' | 'random' | 'ucb' | 'thompson';

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string | number;
}

interface PayloadEntry {
    name: string;
    value: number;
    color: string;
}

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
    reward: number | boolean | null;
}

interface AlgorithmPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    pseudocode: string;
    complexity: string;
}

// Statische AlgorithmInfo-Daten (angepasst an deine AlgorithmType-Keys)
const algorithmInfo: Record<AlgorithmType, { description: string; pseudocode: string; complexity: string }> = {
    'greedy': {
        description: 'Der Greedy-Algorithmus wählt immer die Aktion mit dem aktuell höchsten geschätzten Wert. Er exploitiert nur und exploriert nie neue Optionen. Das führt dazu, dass er schnell eine lokal optimale Lösung findet, aber möglicherweise bessere Optionen verpasst.',
        pseudocode: `function Greedy():
  for each round:
    estimated_values = calculate_average_reward(beans)
    best_bean = argmax(estimated_values)
    pull(best_bean)
    update_estimates(best_bean, reward)`,
        complexity: 'Zeit: O(n), Speicher: O(k) wobei k = Anzahl Arme'
    },
    'epsilon-greedy': {
        description: 'Epsilon-Greedy balanciert Exploration und Exploitation. Mit Wahrscheinlichkeit ε (z.B. 0.1) wählt er zufällig eine Option (Exploration), sonst die beste bekannte Option (Exploitation). Dies ermöglicht es, neue Optionen zu entdecken, während hauptsächlich die beste bekannte Option genutzt wird.',
        pseudocode: `function EpsilonGreedy(epsilon = 0.1):
  for each round:
    if random() < epsilon:
      # Exploration
      bean = random_choice(all_beans)
    else:
      # Exploitation
      estimated_values = calculate_average_reward(beans)
      bean = argmax(estimated_values)
    
    pull(bean)
    update_estimates(bean, reward)`,
        complexity: 'Zeit: O(n), Speicher: O(k)'
    },
    'ucb': {
        description: 'Upper Confidence Bound (UCB) wählt Aktionen basierend auf ihrem oberen Konfidenzintervall. Optionen mit hoher Unsicherheit (wenig getestet) bekommen einen Bonus. Dies führt zu einer optimistischen Exploration: "Im Zweifelsfall ist es gut, bis das Gegenteil bewiesen ist."',
        pseudocode: `function UCB(c = 2):
  for each round t:
    for each bean i:
      if pulls[i] == 0:
        ucb_value[i] = infinity
      else:
        average = total_reward[i] / pulls[i]
        exploration_bonus = c * sqrt(log(t) / pulls[i])
        ucb_value[i] = average + exploration_bonus
    
    bean = argmax(ucb_value)
    pull(bean)
    update_statistics(bean, reward)`,
        complexity: 'Zeit: O(k·n), Speicher: O(k)'
    },
    'thompson': {
        description: 'Thompson Sampling ist ein bayesianischer Ansatz. Für jede Option wird eine Wahrscheinlichkeitsverteilung über den wahren Wert gepflegt. In jeder Runde wird aus jeder Verteilung ein Wert gesampelt und die Option mit dem höchsten Sample gewählt. Dies führt zu probabilistischer Exploration.',
        pseudocode: `function ThompsonSampling():
  # Initialize Beta distributions
  alpha = [1, 1, ..., 1]  # successes + 1
  beta = [1, 1, ..., 1]   # failures + 1
  
  for each round:
    samples = []
    for each bean i:
      # Sample from Beta distribution
      sample = beta_distribution(alpha[i], beta[i])
      samples.append(sample)
    
    bean = argmax(samples)
    reward = pull(bean)
    
    # Update distributions
    if reward == 1:
      alpha[bean] += 1
    else:
      beta[bean] += 1`,
        complexity: 'Zeit: O(k·n), Speicher: O(k)'
    },
    'random': {
        description: 'Wählt in jeder Runde eine komplett zufällige Aktion (Kaffeebohne). Dieser Algorithmus dient als Basislinie (Baseline), um die Performance der anderen Algorithmen zu bewerten. Er betreibt reine Exploration.',
        pseudocode: `function Random():
  for each round:
    bean = random_choice(all_beans)
    pull(bean)`,
        complexity: 'Zeit: O(n), Speicher: O(1)'
    }
};

function AlgorithmPopover({ isOpen, onClose, title, description, pseudocode, complexity }: AlgorithmPopoverProps) {
    useEffect(() => {
        if (isOpen) {
            // Prevent body scroll when popover is open
            document.body.style.overflow = 'hidden';

            // Close on ESC key
            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };
            document.addEventListener('keydown', handleEsc);

            return () => {
                document.body.style.overflow = '';
                document.removeEventListener('keydown', handleEsc);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="algo-popover-overlay" onClick={onClose}>
            <div className="algo-popover-modal" onClick={(e) => e.stopPropagation()}>
                <div className="algo-popover-header-section">
                    <h4 className="algo-popover-title">{title}</h4>
                    <button
                        className="algo-popover-close-btn"
                        onClick={onClose}
                        aria-label="Schließen"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="algo-popover-body">
                    <div className="algo-popover-section">
                        <h5 className="algo-popover-subtitle">Beschreibung</h5>
                        <p className="algo-popover-text">{description}</p>
                    </div>

                    <div className="algo-popover-section">
                        <h5 className="algo-popover-subtitle">Pseudocode</h5>
                        <pre className="algo-popover-code">
              <code>{pseudocode}</code>
            </pre>
                    </div>

                    <div className="algo-popover-section">
                        <h5 className="algo-popover-subtitle">Komplexität</h5>
                        <p className="algo-popover-complexity">{complexity}</p>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

interface GameAreaProps {
    gameState: GameState;
    config: Config;
    onBeanClick: (index: number) => void;
    isGameComplete: boolean;
    algorithmPerformance: PerformanceDataPoint[];
    algorithmStates: AlgorithmState[];
    lastPlayerReward: number | null;
}

const CoffeeBeans = [
    "Arabica",
    "Robusta",
    "Liberica",
    "Excelsa",
    "Typica",
    "Bourbon",
    "Geisha",
    "Maragogype",
    "Kopi Luwak",
    "Jamaica Blue Mountain"
];




// Benutzerdefinierter Tooltip für den Graphen
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{`Runde: ${label}`}</p>
                <ul className="tooltip-list">
                    {/* Dem 'entry' im map den neuen Bauplan zuweisen */}
                    {payload.map((entry: PayloadEntry, index: number) => (
                        <li key={`item-${index}`} style={{color: entry.color}}>
                            {`${entry.name} : ${Math.round(entry.value * 10) / 10}`}
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
                             lastPlayerReward,
                         }: GameAreaProps) {

    // Prüfen, ob die Algorithmen bereits eine Wahl getroffen haben in dieser Runde
    const hasAlgoResults = gameState.currentPatient > 0 && algorithmStates.length > 0 && algorithmStates[0].choice !== -1;

    const [openAlgorithm, setOpenAlgorithm] = useState<AlgorithmType | null>(null);

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
                                    <span className="bean-text">{CoffeeBeans[index]}</span>
                                </button>
                            ))}
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
                                                value: 'Kum. Punkte',
                                                angle: -90,
                                                position: 'insideLeft',
                                                dy: 40

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
            </div>

            {/* Right Column - Stats & Chart */}
            <div className="game-column game-column-side">

                {isGameComplete && (
                    <div className="game-complete-message">
                        <Trophy className="complete-icon"/>
                        <p>Spiel beendet! Sehr gut gemacht!</p>
                        <p className="score-text">
                            {config.banditType === 'bernoulli'
                                ? 'Dein finaler Punktestand'
                                : 'Deine finale Ø Bewertung'
                            }: {
                            config.banditType === 'bernoulli'
                                ? gameState.savedLives.toFixed(0)
                                : (gameState.savedLives / config.numIterations).toFixed(1)
                        }
                        </p>
                    </div>
                )}

                {/* Cups Counter, zeigt den Punktestand */}
                <div className="card cups-card">
                    <div className="card-content">
                        <div className="cups-stats">
                            <Coffee className="cups-icon"/>
                            <div className="cups-info">
                                <div className="cups-number">
                                    {lastPlayerReward !== null
                                        ? lastPlayerReward.toFixed(config.banditType === 'bernoulli' ? 0 : 1)
                                        : '-'}
                                </div>
                                <div className="cups-label">Punkte in dieser Runde</div>
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

                                        // Sicherstellen, dass Info vorhanden ist
                                        const info = algorithmInfo[state.name] || {
                                            description: "Keine Information verfügbar.",
                                            pseudocode: "N/A",
                                            complexity: "N/A"
                                        };

                                        return (
                                            <div key={state.name} className="algo-result-box"
                                                 style={{borderColor: color, color: color}}>

                                                {/* --- START: MODIFIZIERTER HEADER --- */}
                                                <div className="algo-header">
                                                    {/* Wrapper für Name + Info-Button */}
                                                    <div className="algorithm-action-name-wrapper">
                                                        <strong className="algo-name-tag">{formatAlgoName(state.name)}</strong>
                                                        <button
                                                            className="algorithm-info-button"
                                                            aria-label={`Information über ${state.name}`}
                                                            onClick={() => setOpenAlgorithm(state.name)}
                                                        >
                                                            <Info className="algorithm-info-icon" />
                                                        </button>
                                                    </div>
                                                    <span>wählt {CoffeeBeans[state.choice]} </span>
                                                </div>
                                                {/* --- ENDE: MODIFIZIERTER HEADER --- */}

                                                <div className="algo-outcome">
                                                    {config.banditType === 'bernoulli' ? (
                                                        //Bernoulli
                                                        state.reward ? (
                                                            <><Check className="outcome-icon success"/> Erfolgreich</>
                                                        ) : (
                                                            <><X className="outcome-icon failure"/> Misserfolg</>
                                                        )
                                                    ) : (
                                                        // Gauss
                                                        <strong>Bewertung: {typeof state.reward === 'number' ? state.reward.toFixed(1) : 'N/A'}</strong>
                                                    )}
                                                </div>

                                                {/* --- START: HINZUGEFÜGTER POPOVER-AUFRUF --- */}
                                                <AlgorithmPopover
                                                    isOpen={openAlgorithm === state.name}
                                                    onClose={() => setOpenAlgorithm(null)}
                                                    title={formatAlgoName(state.name)}
                                                    description={info.description}
                                                    pseudocode={info.pseudocode}
                                                    complexity={info.complexity}
                                                />
                                                {/* --- ENDE: HINZUGEFÜGTER POPOVER-AUFRUF --- */}

                                            </div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <p className="algo-wait-text">Die Algorithmen warten auf deine erste Wahl...</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}