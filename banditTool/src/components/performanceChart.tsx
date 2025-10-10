import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PLAYER_COLOR, ALGORITHM_COLORS } from '../utils/styleConstants';
import "./performanceChart.css";

// NEU: Unsere eigene Tooltip-Komponente
// Sie erhält automatisch 'props' vom Graphen, wenn man darüber hovert.
const CustomTooltip = ({ active, payload, label }) => {
    // Wir zeigen den Tooltip nur an, wenn der Mauszeiger aktiv über einem Datenpunkt ist
    if (active && payload && payload.length) {
        return (
            // Wir verwenden unsere eigene CSS-Klasse für volles Styling
            <div className="custom-tooltip">
                <p className="tooltip-label">{`Runde: ${label}`}</p>
                <ul className="tooltip-list">
                    {/* Wir mappen über die Daten, um jede Zeile anzuzeigen */}
                    {payload.map((entry, index) => (
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

const PerformanceChart = ({ algorithmPerformance, config }) => {
    const dataToRender = algorithmPerformance.length > 0
        ? algorithmPerformance
        : [{ patient: 0, playerSavedLives: 0 }, { patient: config.numIterations, playerSavedLives: 0 }];

    const maxIterations = Math.max(config.numIterations, 10);

    return (
        <div className="card performance-card chart-side-panel">
            <div className="card-header">
                <h3 className="card-title">📈 Performance Vergleich</h3>
            </div>
            <div className="card-content">
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={dataToRender} margin={{ top: 20, right: 30, left: 45, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="patient" stroke="#6b7280" label={{ value: 'Runde (Tasse)', position: 'insideBottom', dy: 20 }} domain={[0, maxIterations]} type="number" allowDuplicatedCategory={false}/>
                            <YAxis stroke="#6b7280" label={{ value: 'Kumulierter Erfolg', angle: -90, position: 'insideLeft', dx: -35 }} domain={[0, maxIterations]} />

                            {/* GEÄNDERT: Wir entfernen 'contentStyle' und benutzen die 'content'-Prop */}
                            <Tooltip content={<CustomTooltip />} />

                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Line type="monotone" dataKey="playerSavedLives" stroke={PLAYER_COLOR} strokeWidth={3} name="Ihre Performance" dot={false} isAnimationActive={false} />
                            {config.algorithms.map((algoName, index) => (
                                <Line
                                    key={algoName}
                                    type="monotone"
                                    dataKey={algoName}
                                    stroke={ALGORITHM_COLORS[index % ALGORITHM_COLORS.length]}
                                    strokeWidth={3}
                                    name={`${algoName} Algorithmus`}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default PerformanceChart;