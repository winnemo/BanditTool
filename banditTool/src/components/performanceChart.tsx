import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./performanceChart.css";

const PerformanceChart = ({
                              algorithmPerformance,
                              config,
                              isVisible
                          }) => {
    if (!isVisible || algorithmPerformance.length === 0) return null;

    return (
        <div className="">
            <h3 className="">Performance Vergleich</h3>
            <div className="chart-container">
                <ResponsiveContainer id="chart">
                    <LineChart data={algorithmPerformance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="patient"
                            stroke="#9CA3AF"
                            width="auto"
                            label={{ value: 'Patient Nummer', position: 'insideBottom' }}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            width="auto"
                            label={{ value: 'Gerettete Leben', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend align="right"/>
                        <Line
                            type="monotone"
                            dataKey="playerSavedLives"
                            stroke="#10B981"
                            strokeWidth={2}
                            name="Ihre Performance"
                            dot={{ fill: '#10B981', r: 3 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="algorithmSavedLives"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            name={`${config.algorithm} Algorithmus`}
                            dot={{ fill: '#3B82F6', r: 3 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PerformanceChart;