import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

// Wir importieren alle Teile, die für das Zusammenspiel notwendig sind
import PerformanceChart from '../components/performanceChart.tsx';
import ConfigurationPanel from '../components/configuration.tsx';
import { useGameLogic } from '../hooks/useGameLogic.tsx';

// --- Setup: Mock für ResizeObserver (weiterhin wichtig für recharts) ---
const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// --- Mocking der Spiellogik-Abhängigkeiten ---
// Dies gibt uns Kontrolle über die Ergebnisse und macht den Test vorhersagbar
vi.mock('../utils/banditSimulation', () => ({
    generateDrugProbabilities: vi.fn(() => [0.2, 0.8]),
    simulateDrugOutcome: vi.fn(() => true), // Jede Aktion ist ein Erfolg
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


// --- Eine Test-App, die unsere Komponenten so verbindet, wie sie in der echten App wären ---
const TestApp = () => {
    const initialConfig = {
        numActions: 5,
        numIterations: 10,
        banditType: 'bernoulli',
        algorithm: 'greedy',
    };

    // Der Hook liefert die Logik
    const gameLogic = useGameLogic(initialConfig);

    // Wir simulieren die "Bohnen"-Buttons, auf die der Spieler klickt
    const beanButtons = Array.from({ length: initialConfig.numActions }, (_, i) => (
        <button key={i} onClick={() => gameLogic.handleDrugChoice(i)}>
            Bohne {i + 1}
        </button>
    ));

    return (
        <div>
            <h1>Bandit Coffeeshop</h1>
            {/* Das Konfigurationspanel hat den "Spiel starten"-Button */}
            <ConfigurationPanel
                config={initialConfig}
                setConfig={() => {}}
                onStartGame={gameLogic.startGame}
                onStopGame={gameLogic.stopGame}
                gameStarted={gameLogic.gameState.isPlaying}
            />

            {/* Die Bohnen-Buttons werden nur angezeigt, wenn das Spiel läuft */}
            {gameLogic.gameState.isPlaying && <div>{beanButtons}</div>}

            {/* Das Diagramm wird nur angezeigt, wenn das Spiel läuft ODER beendet ist */}
            {(gameLogic.gameState.isPlaying || gameLogic.isGameComplete) && (
                <PerformanceChart
                    algorithmPerformance={gameLogic.algorithmPerformance}
                    config={initialConfig}
                />
            )}
        </div>
    );
};


// --- Die eigentliche Test-Suite ---
describe('PerformanceChart Integrationstest', () => {

    it('wird erst nach Klick auf "Spiel starten" angezeigt und hat die korrekten Achsenbeschriftungen', async () => {
        const user = userEvent.setup();
        render(<TestApp />);

        // 1. Überprüfung (Vorher): Das Diagramm sollte NICHT da sein.
        // Wir suchen nach dem Titel des Diagramms. `queryBy` gibt null zurück, wenn es nichts findet (und keinen Fehler).
        expect(screen.queryByText(/Performance Vergleich/)).not.toBeInTheDocument();

        // 2. Aktion: Der Nutzer klickt auf "Spiel starten".
        // Wir suchen den Button anhand seiner zugänglichen Rolle und seines Namens.
        const startButton = screen.getByRole('button', { name: /spiel starten/i });
        await user.click(startButton);

        // 3. Überprüfung (Nachher): Das Diagramm sollte JETZT sichtbar sein.
        // `findBy` wartet, bis das Element erscheint.
        const chartTitle = await screen.findByText(/Performance Vergleich: Sie vs. Greedy/);
        expect(chartTitle).toBeInTheDocument();

        // Finde die Chart-Komponente, um nur innerhalb von ihr zu suchen
        const chartContainer = chartTitle.closest('.performance-card');
        expect(chartContainer).not.toBeNull();

        // 4. Überprüfung: Die Achsenbeschriftungen sind korrekt.
        // `within` erlaubt uns, nur innerhalb der Chart-Komponente zu suchen.
        const chart = within(chartContainer!);
        expect(chart.getByText('Runde (Tasse)')).toBeInTheDocument();
        expect(chart.getByText('Kumulierter Erfolg (Gerettete Tassen)')).toBeInTheDocument();
    });

    it('reagiert auf Klicks und zeigt die Legende der Daten an', async () => {
        const user = userEvent.setup();
        render(<TestApp />);

        // 1. Aktion: Spiel starten
        await user.click(screen.getByRole('button', { name: /spiel starten/i }));

        // 2. Aktion: Nutzer klickt auf die erste Bohne
        const beanButton = await screen.findByRole('button', { name: 'Bohne 1' });
        await user.click(beanButton);

        // 3. Überprüfung: Die Legenden-Einträge, die von den Daten abhängen, sind jetzt sichtbar.
        // Dies bestätigt, dass das Diagramm neue Daten erhalten und gerendert hat.
        const chartTitle = await screen.findByText(/Performance Vergleich/);
        const chartContainer = chartTitle.closest('.performance-card');
        const chart = within(chartContainer!);

        expect(await chart.findByText('Ihre Performance')).toBeInTheDocument();
        expect(await chart.findByText('Greedy Algorithmus')).toBeInTheDocument();
    });
});