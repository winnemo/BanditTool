import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
// Name der Komponente an die neue Datei angepasst
import { GameArea } from "../components/game.tsx";

// Mock, um 'recharts' im Test-Environment zu ersetzen, da es auf Browser-APIs angewiesen ist
vi.mock('recharts', async () => {
    const OriginalModule = await vi.importActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }) => <div className="responsive-container">{children}</div>,
    };
});

describe('GameArea', () => {
    // Mock-Funktion an neuen Prop-Namen angepasst
    const mockOnBeanClick = vi.fn();

    // Default-Props an die neue, komplexere Struktur angepasst
    const defaultConfig = {
        banditType: 'bernoulli' as const,
        numActions: 5,
        numIterations: 10,
        algorithms: ['greedy', 'epsilon-greedy']
    };

    const defaultGameState = {
        currentPatient: 1,
        savedLives: 0
    };

    const bernoulliAlgorithmStates = [
        { name: 'greedy' as const, choice: 0, reward: true },
        { name: 'epsilon-greedy' as const, choice: 1, reward: false },
        { name: 'random' as const, choice: 2, reward: true }, // Dieser wird im Test gefiltert
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Generelles Rendering', () => {
        it('sollte die Statusleiste mit den korrekten Infos rendern', () => {
            render(
                <GameArea
                    gameState={{ currentPatient: 3, savedLives: 1 }}
                    config={defaultConfig}
                    onBeanClick={mockOnBeanClick}
                    isGameComplete={false}
                    algorithmPerformance={[]}
                    algorithmStates={[]}
                    lastPlayerReward={null}
                />
            );
            expect(screen.getByText('Runde 3 / 10')).toBeInTheDocument();
            expect(screen.getByText('Bernoulli')).toBeInTheDocument();
            expect(screen.getByText('2 Algorithmen')).toBeInTheDocument();
        });

        it('sollte die korrekte Anzahl an Bohnen-Buttons rendern', () => {
            render(
                <GameArea
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onBeanClick={mockOnBeanClick}
                    isGameComplete={false}
                    algorithmPerformance={[]}
                    algorithmStates={[]}
                    lastPlayerReward={null}
                />
            );
            const buttons = screen.getAllByText(/Bohne \d+/);
            expect(buttons).toHaveLength(5);
        });

        it('sollte den Graphen-Bereich rendern', () => {
            render(
                <GameArea
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onBeanClick={mockOnBeanClick}
                    isGameComplete={false}
                    algorithmPerformance={[{ patient: 1, playerSavedLives: 1, greedy: 1 }]}
                    algorithmStates={[]}
                    lastPlayerReward={null}
                />
            );
            expect(screen.getByText('Performance')).toBeInTheDocument();
            // Testet, ob die Legende gerendert wird
            expect(screen.getByText('Deine Performance')).toBeInTheDocument();
        });
    });

    describe('Algorithmen-Aktionen Anzeige', () => {
        it('sollte den "Warten"-Text anzeigen, wenn keine Algorithmen-Aktionen vorliegen', () => {
            render(
                <GameArea
                    gameState={{ currentPatient: 0, savedLives: 0 }}
                    config={defaultConfig}
                    onBeanClick={mockOnBeanClick}
                    isGameComplete={false}
                    algorithmPerformance={[]}
                    algorithmStates={[]}
                    lastPlayerReward={null}
                />
            );
            expect(screen.getByText('Die Algorithmen warten auf deine erste Wahl...')).toBeInTheDocument();
        });

        it('sollte nur die ausgewählten Algorithmen anzeigen (Filter-Test)', () => {
            render(
                <GameArea
                    gameState={defaultGameState}
                    config={defaultConfig} // config hat nur 'greedy' und 'epsilon-greedy'
                    onBeanClick={mockOnBeanClick}
                    isGameComplete={false}
                    algorithmPerformance={[]}
                    algorithmStates={bernoulliAlgorithmStates} // States für alle drei werden übergeben
                    lastPlayerReward={null}
                />
            );

            expect(screen.getByText('Greedy')).toBeInTheDocument();
            expect(screen.getByText('Epsilon Greedy')).toBeInTheDocument();
            // Der 'random'-Algorithmus sollte nicht angezeigt werden
            expect(screen.queryByText('Random')).not.toBeInTheDocument();
        });

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
            // 'greedy' hatte 'reward: true'
            const greedyBox = screen.getByText('Greedy').closest('.algo-result-box');
            expect(greedyBox).toHaveTextContent('Erfolgreich');

            // 'epsilon-greedy' hatte 'reward: false'
            const epsilonBox = screen.getByText('Epsilon Greedy').closest('.algo-result-box');
            expect(epsilonBox).toHaveTextContent('Misserfolg');
        });

        it('sollte die "Bewertung" für Gaussian-Banditen korrekt anzeigen', () => {
            const gaussianConfig = { ...defaultConfig, banditType: 'gaussian' as const };
            const gaussianStates = [
                { name: 'greedy' as const, choice: 0, reward: 7.5 },
                { name: 'epsilon-greedy' as const, choice: 1, reward: 3.2 },
            ];
            render(
                <GameArea
                    gameState={defaultGameState}
                    config={gaussianConfig}
                    onBeanClick={mockOnBeanClick}
                    isGameComplete={false}
                    algorithmPerformance={[]}
                    algorithmStates={gaussianStates}
                    lastPlayerReward={null}
                />
            );
            expect(screen.getByText(/Bewertung: 7.5/)).toBeInTheDocument();
            expect(screen.getByText(/Bewertung: 3.2/)).toBeInTheDocument();
        });
    });

    describe('Spielende', () => {
        it('sollte die Abschlussnachricht und den finalen Punktestand (Bernoulli) anzeigen', () => {
            render(
                <GameArea
                    gameState={{ currentPatient: 10, savedLives: 7 }}
                    config={defaultConfig}
                    onBeanClick={mockOnBeanClick}
                    isGameComplete={true}
                    algorithmPerformance={[]}
                    algorithmStates={[]}
                    lastPlayerReward={null}
                />
            );
            expect(screen.getByText('Spiel beendet! Sehr gut gemacht!')).toBeInTheDocument();
            expect(screen.getByText(/Dein finaler Punktestand: 7/)).toBeInTheDocument();
        });

        it('sollte die Abschlussnachricht und die finale Durchschnittsbewertung (Gaussian) anzeigen', () => {
            const gaussianConfig = { ...defaultConfig, banditType: 'gaussian' as const };
            render(
                <GameArea
                    gameState={{ currentPatient: 10, savedLives: 68 }} // 6.8 im Durchschnitt
                    config={gaussianConfig}
                    onBeanClick={mockOnBeanClick}
                    isGameComplete={true}
                    algorithmPerformance={[]}
                    algorithmStates={[]}
                    lastPlayerReward={null}
                />
            );
            expect(screen.getByText('Spiel beendet! Sehr gut gemacht!')).toBeInTheDocument();
            expect(screen.getByText(/Deine finale Ø Bewertung: 6.8/)).toBeInTheDocument();
        });
    });
});