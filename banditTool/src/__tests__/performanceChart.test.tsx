import { render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

// Manueller Import der Matcher
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

// Import der zu testenden Komponenten und Hooks
import ConfigurationPanel from '../components/configuration.tsx';
import { useGameLogic } from '../hooks/useGameLogic';


// --- NEUER FIX: Mock für die Icon-Bibliothek 'lucide-react' ---
// Dies verhindert, dass das ConfigurationPanel beim Rendern abstürzt.
vi.mock('lucide-react', () => ({
    Settings: () => <div data-testid="icon-settings" />,
    Coffee: () => <div data-testid="icon-coffee" />,
    RotateCcw: () => <div data-testid="icon-rotate" />,
    Play: () => <div data-testid="icon-play" />,
    AlertCircle: () => <div data-testid="icon-alert" />,
}));

// Mock für Recharts bleibt bestehen
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    LineChart: ({ children }) => <div>{children}</div>,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    XAxis: ({ label }) => <div>{label.value}</div>,
    YAxis: ({ label }) => <div>{label.value}</div>,
    Legend: () => <div />,
    Line: ({ name }) => <div>{name}</div>,
}));

// Mocking der Spiellogik-Abhängigkeiten bleibt bestehen
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


// Die TestApp-Komponente
const TestApp = () => {
    const initialConfig = {
        numActions: 5, numIterations: 10, banditType: 'bernoulli', algorithm: 'greedy',
    };
    const gameLogic = useGameLogic(initialConfig);
    const beanButtons = Array.from({ length: initialConfig.numActions }, (_, i) => (
        <button key={i} onClick={() => gameLogic.handleDrugChoice(i)}>Bohne {i + 1}</button>
    ));
    return (
        <div>
            <h1>Bandit Coffeeshop</h1>
            <ConfigurationPanel
                config={initialConfig} setConfig={() => {}}
                onStartGame={gameLogic.startGame} onStopGame={gameLogic.stopGame}
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


// Die Test-Suite
describe('PerformanceChart Integrationstest', () => {
    it('wird erst nach Klick auf "Spiel starten" angezeigt und hat die korrekten Achsenbeschriftungen', async () => {
        const user = userEvent.setup();
        render(<TestApp />);
        expect(screen.queryByText(/Performance Vergleich/)).not.toBeInTheDocument();
        const startButton = screen.getByRole('button', { name: /spiel starten/i });
        await user.click(startButton);
        const chartTitle = await screen.findByText(/Performance Vergleich: Sie vs. Greedy/);
        expect(chartTitle).toBeInTheDocument();
        expect(await screen.findByText('Runde (Tasse)')).toBeInTheDocument();
        expect(await screen.findByText('Kumulierter Erfolg (Gerettete Tassen)')).toBeInTheDocument();
    });

    it('reagiert auf Klicks und zeigt die Legende der Daten an', async () => {
        const user = userEvent.setup();
        render(<TestApp />);
        await user.click(screen.getByRole('button', { name: /spiel starten/i }));
        const beanButton = await screen.findByRole('button', { name: 'Bohne 1' });
        await user.click(beanButton);
        expect(await screen.findByText('Ihre Performance')).toBeInTheDocument();
        expect(await screen.findByText('Greedy Algorithmus')).toBeInTheDocument();
    });
});