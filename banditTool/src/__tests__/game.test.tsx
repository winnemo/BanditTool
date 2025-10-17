import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { GameArea } from "../components/game.tsx";

// Der Mock für 'recharts' bleibt unverändert und korrekt
vi.mock('recharts', async () => {
    const OriginalModule = await vi.importActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }) => <div className="responsive-container">{children}</div>,
        LineChart: ({ children }) => <div className="line-chart">{children}</div>,
        Line: ({ name }) => <div className="line">{name}</div>,
        Legend: ({ children }) => <div className="legend">{children}</div>,
        XAxis: () => <div className="x-axis" />,
        YAxis: () => <div className="y-axis" />,
        Tooltip: () => <div className="tooltip" />,
        CartesianGrid: () => <div className="grid" />,
    };
});

describe('GameArea', () => {
    // ... (deine mockOnBeanClick, defaultConfig, etc. bleiben unverändert)
    const mockOnBeanClick = vi.fn();
    const defaultConfig = { /* ... */ };
    const defaultGameState = { /* ... */ };
    const bernoulliAlgorithmStates = [ /* ... */ ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Der "Generelles Rendering"-Block bleibt unverändert
    describe('Generelles Rendering', () => { /* ... */ });

    describe('Algorithmen-Aktionen Anzeige', () => {
        it('sollte den "Warten"-Text anzeigen, wenn keine Algorithmen-Aktionen vorliegen', () => {
            // ... (dieser Test bleibt unverändert)
        });

        // GEÄNDERT: Dieser Test verwendet jetzt 'within'
        it('sollte nur die ausgewählten Algorithmen anzeigen (Filter-Test)', () => {
            render(
                <GameArea
                    gameState={defaultGameState}
                    config={defaultConfig} // config hat 'greedy' und 'epsilon-greedy'
                    onBeanClick={mockOnBeanClick}
                    isGameComplete={false}
                    algorithmPerformance={[]}
                    algorithmStates={bernoulliAlgorithmStates}
                    lastPlayerReward={null}
                />
            );

            // 1. Finde den Container der Algorithmen-Aktionen
            const actionsContainer = screen.getByText('Algorithmen-Aktionen').closest('.card');

            // 2. Suche nur INNERHALB dieses Containers
            expect(within(actionsContainer!).getByText('Greedy')).toBeInTheDocument();
            expect(within(actionsContainer!).getByText('Epsilon Greedy')).toBeInTheDocument();
            expect(within(actionsContainer!).queryByText('Random')).not.toBeInTheDocument();
        });

        // GEÄNDERT: Dieser Test verwendet jetzt auch 'within'
        it('sollte "Erfolg" und "Misserfolg" für Bernoulli-Banditen korrekt anzeigen', () => {
            render(
                <GameArea
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onBeanClick={mockOnBeanClick}
                    isGameComplete={false}
                    algorithmPerformance={[]}
                    algorithmStates={bernoulliAlgorithmStates}
                    lastPlayerReward={null}
                />
            );

            // 1. Finde wieder den spezifischen Container
            const actionsContainer = screen.getByText('Algorithmen-Aktionen').closest('.card');

            // 2. Finde die Boxen innerhalb des Containers
            const greedyBox = within(actionsContainer!).getByText('Greedy').closest('.algo-result-box');
            expect(greedyBox).toHaveTextContent('Erfolgreich');

            const epsilonBox = within(actionsContainer!).getByText('Epsilon Greedy').closest('.algo-result-box');
            expect(epsilonBox).toHaveTextContent('Misserfolg');
        });

        it('sollte die "Bewertung" für Gaussian-Banditen korrekt anzeigen', () => {
            // ... (dieser Test bleibt unverändert)
        });
    });

    // Der "Spielende"-Block bleibt unverändert
    describe('Spielende', () => { /* ... */ });
});