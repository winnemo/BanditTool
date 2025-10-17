import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
// Da der Graph jetzt in GameArea ist, importieren wir diese Komponente nicht mehr direkt
// sondern die GameArea oder die einzelne Chart-Komponente, je nach Aufbau.
// In deinem Fall ist der Chart-Code Teil von GameArea, also testen wir das dort.
// ABER für einen sauberen Unit-Test sollten wir den Chart wieder auslagern.
// Angenommen, du erstellst eine PerformanceChart.tsx NUR für den Chart:
import { PerformanceChart } from '../components/performanceChart'; // Erstelle diese Datei wieder!

// Mock, um 'recharts' im Test-Environment zu ersetzen
vi.mock('recharts', async () => {
    const OriginalModule = await vi.importActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }) => <div className="responsive-container">{children}</div>,
        LineChart: ({ children }) => <div className="line-chart">{children}</div>,
        // Wir rendern nur die 'name'-Prop der Line, um sie im Test zu finden
        Line: ({ name }) => <div className="line">{name}</div>,
        Legend: () => <div className="legend" />,
        XAxis: () => <div className="x-axis" />,
        YAxis: () => <div className="y-axis" />,
        Tooltip: () => <div className="tooltip" />,
        CartesianGrid: () => <div className="grid" />,
    };
});

describe('PerformanceChart', () => {
    // Basis-Konfiguration für die Tests
    const baseConfig = {
        numActions: 5,
        numIterations: 10,
        banditType: 'bernoulli' as const,
        algorithms: []
    };

    // Basis-Performance-Daten
    const basePerformance = [
        { patient: 1, playerSavedLives: 1 }
    ];

    it('sollte den Titel und die Spieler-Linie auch ohne Algorithmen rendern', () => {
        render(
            <PerformanceChart
                config={baseConfig}
                algorithmPerformance={basePerformance}
            />
        );

        expect(screen.getByText('📈 Performance Vergleich')).toBeInTheDocument();
        expect(screen.getByText('Deine Performance')).toBeInTheDocument();
    });

    it('sollte die Linien für alle ausgewählten Algorithmen rendern', () => {
        const configWithAlgos = {
            ...baseConfig,
            algorithms: ['greedy', 'random']
        };
        const performanceWithAlgos = [
            { patient: 1, playerSavedLives: 1, greedy: 1, random: 0 }
        ];

        render(
            <PerformanceChart
                config={configWithAlgos}
                algorithmPerformance={performanceWithAlgos}
            />
        );

        // Prüft, ob die Legenden-Einträge für beide Algorithmen vorhanden sind
        expect(screen.getByText('greedy Algorithmus')).toBeInTheDocument();
        expect(screen.getByText('random Algorithmus')).toBeInTheDocument();
    });

    it('sollte die Linie für einen nicht ausgewählten Algorithmus NICHT rendern', () => {
        const configWithOneAlgo = {
            ...baseConfig,
            algorithms: ['greedy'] // nur 'greedy' ist ausgewählt
        };
        const performanceWithAllData = [
            // Daten für alle sind vorhanden, aber nur einer soll angezeigt werden
            { patient: 1, playerSavedLives: 1, greedy: 1, 'epsilon-greedy': 1, random: 0 }
        ];

        render(
            <PerformanceChart
                config={configWithOneAlgo}
                algorithmPerformance={performanceWithAllData}
            />
        );

        expect(screen.getByText('greedy Algorithmus')).toBeInTheDocument();
        // Stellt sicher, dass die anderen nicht gerendert werden
        expect(screen.queryByText('epsilon-greedy Algorithmus')).not.toBeInTheDocument();
        expect(screen.queryByText('random Algorithmus')).not.toBeInTheDocument();
    });
});