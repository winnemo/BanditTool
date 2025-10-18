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
        description: 'Dieser Algorithmus wählt immer die Aktion (Bohne), die den höchsten bekannten Durchschnittswert hat. Um zu verhindern, dass er bei einer Aktion hängen bleibt, die in der ersten Runde eine 0 zurückgibt, wird ungetesteten Aktionen ein optimistischer Startwert von 0.5 zugewiesen.',
        pseudocode: `FUNKTION Greedy(Statistiken):
  Setze bestes_ergebnis = -UNENDLICH
  Setze beste_aktion = NULL

  FÜR jede Aktion i:
    WENN Aktion_i_versuche == 0:
      // Optimistischer Startwert
      Setze ergebnis = 0.5  
    SONST:
      // Normaler Durchschnitt
      Setze ergebnis = Aktion_i_belohnungssumme / Aktion_i_versuche
    
    WENN ergebnis > bestes_ergebnis:
      Setze bestes_ergebnis = ergebnis
      Setze beste_aktion = i

  RÜCKGABE beste_aktion`,
        complexity: 'Zeit: O(n), Speicher: O(k) wobei k = Anzahl Arme'
    },
    'epsilon-greedy': {
        description: 'Dieser Algorithmus ist eine Erweiterung des "Greedy"-Algorithmus. In 90 % der Fälle wählt er die beste bekannte Aktion (Exploitation). In 10 % der Fälle wählt er jedoch eine komplett zufällige Aktion (Exploration), um potenziell bessere, noch unentdeckte Aktionen zu finden.',
        pseudocode: `FUNKTION Epsilon-Greedy(Statistiken):
  Setze zufallszahl = ZUFALL(0, 1)

  WENN zufallszahl < 0.1: 
    // 10% Exploration
    RÜCKGABE ZUFÄLLIGE_AKTION()
  SONST: 
    // 90% Exploitation
    RÜCKGABE Greedy(Statistiken) // Ruft die Greedy-Funktion auf`,
        complexity: 'Zeit: O(n), Speicher: O(k)'
    },
    'ucb': {
        description: 'UCB balanciert Gier (Exploitation) und Neugier (Exploration) auf clevere Weise. Er wählt die Aktion mit dem höchsten "Potenzial". Dieses Potenzial berechnet sich aus dem bisherigen Durchschnitt (Gier) plus einem "Unsicherheits-Bonus" (Neugier). Aktionen, die selten probiert wurden, erhalten einen hohen Bonus und werden so zur Exploration ausgewählt.',
        pseudocode: `FUNKTION UCB(Statistiken):
  Setze gesamtversuche = Summe aller Versuche
  
  // Verhindert log(0) in der allerersten Runde
  WENN gesamtversuche == 0:
    RÜCKGABE ZUFÄLLIGE_AKTION()

  Setze bestes_ucb = -UNENDLICH
  Setze beste_aktion = NULL

  FÜR jede Aktion i:
    // Spezielle Behandlung für ungetestete Aktionen
    WENN Aktion_i_versuche == 0:
      Setze n_pull = 1 // Behandle wie 1 Versuch
      Setze avg_belohnung = 0
    SONST:
      Setze n_pull = Aktion_i_versuche
      Setze avg_belohnung = Aktion_i_belohnungssumme / n_pull

    // Der "Explorations-Bonus" (Unsicherheit)
    Setze bonus = WURZEL( (2 * LOG(gesamtversuche)) / n_pull )
    Setze ucb_wert = avg_belohnung + bonus

    WENN ucb_wert > bestes_ucb:
      Setze bestes_ucb = ucb_wert
      Setze beste_aktion = i
            
  RÜCKGABE beste_aktion`,
        complexity: 'Zeit: O(k·n), Speicher: O(k)'
    },
    'thompson': {
        description: 'Ein probabilistischer (Bayesianischer) Algorithmus. Statt nur einen Durchschnittswert zu speichern, pflegt er eine ganze Wahrscheinlichkeitsverteilung für den "wahren" Wert jeder Aktion. In jeder Runde zieht er eine Zufallsstichprobe aus der Verteilung jeder Aktion und wählt die Aktion, deren Stichprobe am höchsten war.',
        pseudocode: `FUNKTION Thompson(Statistiken, Bandit-Typ):
  Setze max_stichprobe = -UNENDLICH
  Setze beste_aktion = NULL

  FÜR jede Aktion i:
    WENN Bandit-Typ == "bernoulli":
      // Modelliert Belohnung als Wahrscheinlichkeit (0 bis 1)
      Setze erfolge = Aktion_i_belohnungssumme
      Setze misserfolge = Aktion_i_versuche - erfolge
      // Nutzt Beta-Verteilung (mit Prior von 1 Erfolg, 1 Misserfolg)
      Setze stichprobe = ZUFALLSSTICHPROBE_BETA(erfolge + 1, misserfolge + 1)
      
    SONST: // "gaussian"
      // Modelliert Belohnung als Mittelwert (z.B. 0 bis 10)
      WENN Aktion_i_versuche == 0:
        // Prior-Annahme: Mittelwert 0, hohe Unsicherheit (stdAbw 1)
        Setze mittelwert = 0
        Setze std_abweichung = 1
      SONST:
        Setze mittelwert = Aktion_i_belohnungssumme / Aktion_i_versuche
        Setze std_abweichung = 1 / WURZEL(Aktion_i_versuche) // Unsicherheit nimmt ab
      
      // Nutzt Gauß-Verteilung (Normalverteilung)
      Setze stichprobe = ZUFALLSSTICHPROBE_GAUSS(mittelwert, std_abweichung)

    WENN stichprobe > max_stichprobe:
      Setze max_stichprobe = stichprobe
      Setze beste_aktion = i

  RÜCKGABE beste_aktion`,
        complexity: 'Zeit: O(k·n), Speicher: O(k)'
    },
    'random': {
        description: 'Dieser Algorithmus dient als Basislinie (Baseline). Er ignoriert alle gesammelten Daten (Statistiken) und wählt in jeder einzelnen Runde eine komplett zufällige Aktion.',
        pseudocode: `FUNKTION Random(Statistiken):
  // Ignoriere Statistiken
  RÜCKGABE ZUFÄLLIGE_AKTION()`,
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