import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

// Manueller Import der Matcher, da die globale Konfig bei dir nicht greift
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);



// --- NEUE MOCK-STRATEGIE: Wir ersetzen die Chart-Komponenten durch simple Platzhalter ---
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div className="responsive-container-mock">{children}</div>,
    LineChart: ({ children }) => <div className="line-chart-mock">{children}</div>,
    CartesianGrid: () => <div data-testid="grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    XAxis: ({ label }) => <div className="x-axis-label">{label.value}</div>,
    YAxis: ({ label }) => <div className="y-axis-label">{label.value}</div>,
    Legend: () => <div data-testid="legend" />,
    Line: ({ name }) => <div className="line-legend-name">{name}</div>,
}));

// Mocking der Spiellogik-Abhängigkeiten bleibt gleich
vi.mock('../utils/banditSimulation', () => ({
    generateDrugProbabilities: vi.fn(() => [0.2, 0.8]),
    simulateDrugOutcome: vi.fn(() => true),
    initializeDrugStats: vi.fn((numActions) => {
        const stats = {};
        for (let i = 0; i < numActions; i++) {
            stats[`drug${i}`] = { attempts: 0, successes: 0 };
        }
        return stats;
    }),
}));
vi.mock('../utils/algorithms', () => ({
    algorithms: { greedy: vi.fn(() => 0) },
}));


// Die TestApp bleibt unverändert
const TestApp = () => { /* ... Komplette TestApp wie zuvor ... */ };


// Die Tests bleiben fast gleich, sind jetzt aber viel zuverlässiger
describe('PerformanceChart Integrationstest', () => {

    it('wird erst nach Klick auf "Spiel starten" angezeigt und hat die korrekten Achsenbeschriftungen', async () => {
        const user = userEvent.setup();
        render(<TestApp />);

        expect(screen.queryByText(/Performance Vergleich/)).not.toBeInTheDocument();

        const startButton = screen.getByRole('button', { name: /spiel starten/i });
        await user.click(startButton);

        const chartTitle = await screen.findByText(/Performance Vergleich: Sie vs. Greedy/);
        expect(chartTitle).toBeInTheDocument();

        // Überprüfung der Achsenbeschriftungen, die von unseren Mocks als Text gerendert werden
        expect(await screen.findByText('Runde (Tasse)')).toBeInTheDocument();
        expect(await screen.findByText('Kumulierter Erfolg (Gerettete Tassen)')).toBeInTheDocument();
    });

    it('reagiert auf Klicks und zeigt die Legende der Daten an', async () => {
        const user = userEvent.setup();
        render(<TestApp />);

        await user.click(screen.getByRole('button', { name: /spiel starten/i }));

        const beanButton = await screen.findByRole('button', { name: 'Bohne 1' });
        await user.click(beanButton);

        // Überprüfung der Legenden-Namen, die von unserem <Line>-Mock als Text gerendert werden
        expect(await screen.findByText('Ihre Performance')).toBeInTheDocument();
        expect(await screen.findByText('Greedy Algorithmus')).toBeInTheDocument();
    });
});