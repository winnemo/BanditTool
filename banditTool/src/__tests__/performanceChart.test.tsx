import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

// FIX 1: Manueller Import der Test-Matcher, um "toBeInTheDocument" verfügbar zu machen
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

// Import der zu testenden Komponenten und Hooks
import PerformanceChart from '../components/performanceChart.tsx';
import ConfigurationPanel from '../components/configuration.tsx';
import { useGameLogic } from '../hooks/useGameLogic';

// FIX 2: Mocking der Recharts-Komponente, damit sie in der Testumgebung rendert
vi.mock('recharts', async (importOriginal) => {
    const originalModule = await importOriginal<typeof import('recharts')>();
    return {
        ...originalModule,
        ResponsiveContainer: ({ children }) => (
            <div className="recharts-responsive-container" style={{ width: '800px', height: '500px' }}>
                {children}
            </div>
        ),
    };
});

// Mocking der Spiellogik-Abhängigkeiten für vorhersagbare Tests
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

// --- HIER IST DIE VOLLSTÄNDIGE TestApp-KOMPONENTE ---
const TestApp = () => {
    const initialConfig = {
        numActions: 5,
        numIterations: 10,
        banditType: 'bernoulli',
        algorithm: 'greedy',
    };

    const gameLogic = useGameLogic(initialConfig);

    const beanButtons = Array.from({ length: initialConfig.numActions }, (_, i) => (
        <button key={i} onClick={() => gameLogic.handleDrugChoice(i)}>
            Bohne {i + 1}
        </button>
    ));

    // Die Komponente MUSS JSX mit "return" zurückgeben
    return (
        <div>
            <h1>Bandit Coffeeshop</h1>
            <ConfigurationPanel
                config={initialConfig}
                setConfig={() => {}}
                onStartGame={gameLogic.startGame}
                onStopGame={gameLogic.stopGame}
                gameStarted={gameLogic.gameState.isPlaying}
            />

            {gameLogic.gameState.isPlaying && <div>{beanButtons}</div>}

            {(gameLogic.gameState.isPlaying || gameLogic.isGameComplete) && (
                <PerformanceChart
                    algorithmPerformance={gameLogic.algorithmPerformance}
                    config={initialConfig}
                />
            )}
        </div>
    );
};


// --- Die Test-Suite ---
describe('PerformanceChart Integrationstest', () => {

    it('wird erst nach Klick auf "Spiel starten" angezeigt und hat die korrekten Achsenbeschriftungen', async () => {
        const user = userEvent.setup();
        render(<TestApp />);

        expect(screen.queryByText(/Performance Vergleich/)).not.toBeInTheDocument();

        const startButton = screen.getByRole('button', { name: /spiel starten/i });
        await user.click(startButton);

        const chartTitle = await screen.findByText(/Performance Vergleich: Sie vs. Greedy/);
        expect(chartTitle).toBeInTheDocument();

        const chartContainer = chartTitle.closest('.performance-card');
        expect(chartContainer).not.toBeNull();

        const chart = within(chartContainer!);
        expect(await chart.findByText('Runde (Tasse)')).toBeInTheDocument();
        expect(await chart.findByText('Kumulierter Erfolg (Gerettete Tassen)')).toBeInTheDocument();
    });

    it('reagiert auf Klicks und zeigt die Legende der Daten an', async () => {
        const user = userEvent.setup();
        render(<TestApp />);

        await user.click(screen.getByRole('button', { name: /spiel starten/i }));

        const beanButton = await screen.findByRole('button', { name: 'Bohne 1' });
        await user.click(beanButton);

        const chartTitle = await screen.findByText(/Performance Vergleich/);
        const chartContainer = chartTitle.closest('.performance-card');
        const chart = within(chartContainer!);

        expect(await chart.findByText('Ihre Performance')).toBeInTheDocument();
        expect(await chart.findByText('Greedy Algorithmus')).toBeInTheDocument();
    });
});