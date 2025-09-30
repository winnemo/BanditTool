// Importiert alle notwendigen Komponenten aus der 'recharts' Bibliothek zur Erstellung des Diagramms.
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// Importiert das zugehörige CSS für das Styling der Komponente.
import "./performanceChart.css";

/**
 * Eine React-Komponente, die ein Liniendiagramm zur Visualisierung der Performance
 * des Spielers im Vergleich zum Algorithmus rendert.
 *
 * @param {object} props - Die Eigenschaften der Komponente.
 * @param {Array<object>} props.algorithmPerformance - Ein Array mit den Leistungsdaten über die Zeit.
 * @param {object} props.config - Das Spiel-Konfigurationsobjekt.
 * @returns {JSX.Element} Das gerenderte Performance-Diagramm.
 */
const PerformanceChart = ({
                              algorithmPerformance,
                              config,
                          }) => {

    // Formatiert den Namen des Algorithmus für die Anzeige im Titel.
    const algoName = config.algorithm.charAt(0).toUpperCase() + config.algorithm.slice(1).replace('-', ' ');


    // Stellt sicher, dass immer Daten zum Rendern vorhanden sind.
    // Wenn keine echten Daten da sind, wird ein Platzhalter-Array erstellt,
    // das die X-Achse von 0 bis zur maximalen Iteration aufspannt.
    const dataToRender = algorithmPerformance.length > 0
        ? algorithmPerformance
        : [
            { patient: 0, playerSavedLives: 0, algorithmSavedLives: 0 },
            { patient: config.numIterations, playerSavedLives: 0, algorithmSavedLives: 0 }
        ];

    // Bestimmt das Maximum für die Y-Achse. Es ist entweder die Anzahl der Iterationen
    // oder ein Mindestwert von 10, um eine gute visuelle Darstellung zu gewährleisten.
    const maxIterations = Math.max(config.numIterations, 10);


    return (
        <div className="card performance-card chart-side-panel">
            <div className="card-header">
                <h3 className="card-title">
                    📈 Performance Vergleich: Sie vs. {algoName}
                </h3>
            </div>
            <div className="card-content">
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart
                            data={dataToRender}
                            // Die Ränder sind angepasst, um Platz für die Achsenbeschriftungen zu schaffen.
                            margin={{ top: 20, right: 30, left: 45, bottom: 30 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="patient"
                                stroke="#6b7280"
                                label={{ value: 'Runde (Tasse)', position: 'insideBottom', dy: 20 }}
                                allowDuplicatedCategory={false}
                                // Die Domäne (Wertebereich) der Achse wird fest auf 0 bis maxIterations gesetzt.
                                domain={[0, maxIterations]}
                                type="number"
                            />
                            <YAxis
                                stroke="#6b7280"
                                // Die Beschriftung wird gedreht und verschoben, damit sie gut lesbar ist.
                                label={{ value: 'Kumulierter Erfolg (Gerettete Tassen)', angle: -90, position: 'insideLeft', dx: -35 }}
                                // Die Domäne der Y-Achse wird ebenfalls dynamisch gesetzt.
                                domain={[0, maxIterations]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    padding: '0.5rem',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            {/* Linie für die Performance des Spielers */}
                            <Line
                                type="monotone"
                                dataKey="playerSavedLives"
                                stroke="#059669" // Grün
                                strokeWidth={3}
                                name="Ihre Performance"
                                dot={false} // Keine Punkte auf der Linie
                                isAnimationActive={false} // Keine Animation bei Updates
                            />
                            {/* Linie für die Performance des Algorithmus */}
                            <Line
                                type="monotone"
                                dataKey="algorithmSavedLives"
                                stroke="#3B82F6" // Blau
                                strokeWidth={3}
                                name={`${algoName} Algorithmus`}
                                dot={false}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default PerformanceChart;