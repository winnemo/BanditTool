// in game.test.tsx

import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { GameArea } from "../components/game.tsx";
import {type Config, type GameState, type AlgorithmState, type AlgorithmType} from '../hooks/useGameLogic';

// Mock für 'recharts', der jetzt alle benötigten Teile enthält
vi.mock('recharts', async () => {
    const OriginalModule = await vi.importActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children } :{children: React.ReactNode}) => <div className="responsive-container">{children}</div>,
        LineChart: ({ children } :{children: React.ReactNode}) => <div className="line-chart">{children}</div>,
        Line: ({ name } :{name: string}) => <div className="line">{name}</div>,
        Legend: ({ children } : {children: React.ReactNode}) => <div className="legend">{children}</div>,
        XAxis: () => <div className="x-axis" />,
        YAxis: () => <div className="y-axis" />,
        Tooltip: () => <div className="tooltip" />,
        CartesianGrid: () => <div className="grid" />,
    };
});

describe('GameArea', () => {
    const mockOnBeanClick = vi.fn();
    const defaultConfig: Config = {
        banditType: 'bernoulli' as const,
        numActions: 5,
        numIterations: 10,
        algorithms: ['greedy', 'epsilon-greedy'] as AlgorithmType[],
    };
    const defaultGameState: Partial<GameState> = { currentPatient: 1, savedLives: 0 };
    const bernoulliAlgorithmStates: AlgorithmState[] = [
        { name: 'greedy' as const, choice: 0, reward: true },
        { name: 'epsilon-greedy' as const, choice: 1, reward: false },
        { name: 'random' as const, choice: 2, reward: true },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // HIER WERDEN DIE FEHLENDEN TESTS EINGEFÜGT
    describe('Generelles Rendering', () => {
        it('sollte die Statusleiste mit den korrekten Infos rendern', () => {
            render(<GameArea gameState={{ currentPatient: 3, savedLives: 1 }} config={defaultConfig} onBeanClick={mockOnBeanClick} isGameComplete={false} algorithmPerformance={[]} algorithmStates={[]} lastPlayerReward={null} />);
            expect(screen.getByText('Runde 3 / 10')).toBeInTheDocument();
            expect(screen.getByText('Bernoulli')).toBeInTheDocument();
            expect(screen.getByText('2 Algorithmen')).toBeInTheDocument();
        });

        it('sollte den Graphen-Bereich rendern', () => {
            render(<GameArea gameState={defaultGameState as GameState} config={defaultConfig} onBeanClick={mockOnBeanClick} isGameComplete={false} algorithmPerformance={[{ patient: 1, playerSavedLives: 1, greedy: 1 }]} algorithmStates={[]} lastPlayerReward={null} />);
            expect(screen.getByText('Performance')).toBeInTheDocument();
            expect(screen.getByText('Deine Performance')).toBeInTheDocument();
        });
    });

    describe('Algorithmen-Aktionen Anzeige', () => {
        it('sollte nur die ausgewählten Algorithmen anzeigen (Filter-Test)', () => {
            render(<GameArea gameState={defaultGameState as GameState} config={defaultConfig} onBeanClick={mockOnBeanClick} isGameComplete={false} algorithmPerformance={[]} algorithmStates={bernoulliAlgorithmStates} lastPlayerReward={null} />);
            const actionsContainer = screen.getByText('Algorithmen-Aktionen').closest('.card') as HTMLElement;
            expect(within(actionsContainer).getByText('Greedy')).toBeInTheDocument();
            expect(within(actionsContainer).getByText('Epsilon Greedy')).toBeInTheDocument();
            expect(within(actionsContainer).queryByText('Random')).not.toBeInTheDocument();
        });

        it('sollte "Erfolg" und "Misserfolg" für Bernoulli-Banditen korrekt anzeigen', () => {
            render(<GameArea gameState={defaultGameState as GameState} config={defaultConfig} onBeanClick={mockOnBeanClick} isGameComplete={false} algorithmPerformance={[]} algorithmStates={bernoulliAlgorithmStates} lastPlayerReward={null} />);
            const actionsContainer = screen.getByText('Algorithmen-Aktionen').closest('.card') as HTMLElement;
            const greedyBox = within(actionsContainer).getByText('Greedy').closest('.algo-result-box')!;
            expect(greedyBox).toHaveTextContent('Erfolgreich');
            const epsilonBox = within(actionsContainer).getByText('Epsilon Greedy').closest('.algo-result-box')!;
            expect(epsilonBox).toHaveTextContent('Misserfolg');
        });
    });

    // HIER WERDEN DIE FEHLENDEN TESTS EINGEFÜGT
    describe('Spielende', () => {
        it('sollte die Abschlussnachricht und den finalen Punktestand (Bernoulli) anzeigen', () => {
            render(<GameArea gameState={{ currentPatient: 10, savedLives: 7 }} config={defaultConfig} onBeanClick={mockOnBeanClick} isGameComplete={true} algorithmPerformance={[]} algorithmStates={[]} lastPlayerReward={null} />);
            expect(screen.getByText('Spiel beendet! Sehr gut gemacht!')).toBeInTheDocument();
            expect(screen.getByText(/Dein finaler Punktestand: 7/)).toBeInTheDocument();
        });
    });
});