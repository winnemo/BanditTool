import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { GameArea } from '../components/game';

// Mock ResizeObserver für Recharts
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

type AlgorithmType = 'greedy' | 'epsilon-greedy' | 'random' | 'ucb' | 'thompson';

interface GameState {
    currentPatient: number;
    savedLives: number;
}

interface Config {
    numActions: number;
    numIterations: number;
    banditType: "bernoulli" | "gaussian";
    algorithms: AlgorithmType[];
}

interface PerformanceDataPoint {
    patient: number;
    playerSavedLives: number;
    [key: string]: number;
}

interface AlgorithmState {
    name: AlgorithmType;
    choice: number;
    reward: number | boolean | null;
}

describe('GameArea', () => {
    let defaultGameState: GameState;
    let defaultConfig: Config;
    let mockOnBeanClick: ReturnType<typeof vi.fn>;
    let defaultAlgorithmStates: AlgorithmState[];
    let defaultPerformance: PerformanceDataPoint[];

    beforeEach(() => {
        defaultGameState = {
            currentPatient: 1,
            savedLives: 5,
        };

        defaultConfig = {
            numActions: 3,
            numIterations: 10,
            banditType: 'bernoulli',
            algorithms: ['greedy', 'ucb'],
        };

        mockOnBeanClick = vi.fn();

        defaultAlgorithmStates = [
            { name: 'greedy', choice: 0, reward: true },
            { name: 'ucb', choice: 1, reward: false },
        ];

        defaultPerformance = [
            { patient: 1, playerSavedLives: 1, greedy: 1, ucb: 0 },
        ];
    });

    const renderGameArea = (
        gameState: GameState = defaultGameState,
        config: Config = defaultConfig,
        isGameComplete: boolean = false,
        algorithmPerformance: PerformanceDataPoint[] = defaultPerformance,
        algorithmStates: AlgorithmState[] = defaultAlgorithmStates,
        lastPlayerReward: number | null = 1
    ) => {
        return render(
            <GameArea
                gameState={gameState}
                config={config}
                onBeanClick={mockOnBeanClick}
                isGameComplete={isGameComplete}
                algorithmPerformance={algorithmPerformance}
                algorithmStates={algorithmStates}
                lastPlayerReward={lastPlayerReward}
            />
        );
    };

    describe('Rendering', () => {
        it('sollte Status-Bar mit Runden-Info anzeigen', () => {
            renderGameArea();

            expect(screen.getByText('Runde 1 / 10')).toBeInTheDocument();
        });

        it('sollte Bandit-Typ anzeigen', () => {
            renderGameArea();

            expect(screen.getByText('Bernoulli')).toBeInTheDocument();
        });

        it('sollte Anzahl Algorithmen anzeigen', () => {
            renderGameArea();

            expect(screen.getByText('2 Algorithmen')).toBeInTheDocument();
        });

        it('sollte "Algorithmus" im Singular anzeigen bei einem Algorithmus', () => {
            const singleAlgoConfig = { ...defaultConfig, algorithms: ['greedy'] as AlgorithmType[] };
            renderGameArea(defaultGameState, singleAlgoConfig);

            expect(screen.getByText('1 Algorithmus')).toBeInTheDocument();
        });

        it('sollte Überschrift anzeigen', () => {
            renderGameArea();

            expect(screen.getByText('Wähle eine Kaffeebohne')).toBeInTheDocument();
        });
    });

    describe('Kaffeebohnen Auswahl', () => {
        it('sollte korrekte Anzahl an Bohnen-Buttons anzeigen', () => {
            renderGameArea();

            const beanButtons = screen.getAllByRole('button');
            // Filtere nur die Bean-Buttons (die mit Kaffeenamen)
            const coffeeBeans = beanButtons.filter(btn =>
                btn.textContent?.includes('Arabica') ||
                btn.textContent?.includes('Robusta') ||
                btn.textContent?.includes('Liberica')
            );
            expect(coffeeBeans).toHaveLength(3);
        });

        it('sollte Bohnen mit korrekten Namen anzeigen', () => {
            renderGameArea();

            expect(screen.getByText('Arabica')).toBeInTheDocument();
            expect(screen.getByText('Robusta')).toBeInTheDocument();
            expect(screen.getByText('Liberica')).toBeInTheDocument();
        });

        it('sollte Bean-Click Handler aufrufen', () => {
            renderGameArea();

            const arabicaButton = screen.getByText('Arabica').closest('button');
            if (arabicaButton) {
                fireEvent.click(arabicaButton);
            }

            expect(mockOnBeanClick).toHaveBeenCalledWith(0);
        });

        it('sollte Buttons deaktivieren wenn Spiel beendet', () => {
            renderGameArea(defaultGameState, defaultConfig, true);

            const arabicaButton = screen.getByText('Arabica').closest('button');
            expect(arabicaButton).toBeDisabled();
        });

        it('sollte verschiedene Bohnen anklickbar machen', () => {
            renderGameArea();

            const robustaButton = screen.getByText('Robusta').closest('button');
            if (robustaButton) {
                fireEvent.click(robustaButton);
            }

            expect(mockOnBeanClick).toHaveBeenCalledWith(1);
        });
    });

    describe('Punktestand Anzeige', () => {
        it('sollte letzten Spieler-Reward anzeigen für Bernoulli', () => {
            renderGameArea();

            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getByText('Punkte in dieser Runde')).toBeInTheDocument();
        });

        it('sollte Reward mit Dezimalstelle für Gaussian anzeigen', () => {
            const gaussianConfig = { ...defaultConfig, banditType: 'gaussian' as const };
            renderGameArea(defaultGameState, gaussianConfig, false, defaultPerformance, defaultAlgorithmStates, 0.7);

            expect(screen.getByText('0.7')).toBeInTheDocument();
        });

        it('sollte "-" anzeigen wenn kein Reward vorhanden', () => {
            renderGameArea(defaultGameState, defaultConfig, false, defaultPerformance, defaultAlgorithmStates, null);

            expect(screen.getByText('-')).toBeInTheDocument();
        });
    });

    describe('Algorithmen-Aktionen', () => {
        it('sollte Wartenachricht anzeigen vor erster Wahl', () => {
            const initialStates = [
                { name: 'greedy' as AlgorithmType, choice: -1, reward: null },
            ];
            renderGameArea({ currentPatient: 0, savedLives: 0 }, defaultConfig, false, [], initialStates);

            expect(screen.getByText(/Die Algorithmen warten auf deine erste Wahl/)).toBeInTheDocument();
        });

        it('sollte Algorithmen-Ergebnisse anzeigen', () => {
            renderGameArea();

            expect(screen.getByText('Greedy')).toBeInTheDocument();
            expect(screen.getByText('Ucb')).toBeInTheDocument();
        });

        it('sollte Bohnen-Wahl der Algorithmen anzeigen', () => {
            renderGameArea();

            expect(screen.getByText(/wählt Arabica/)).toBeInTheDocument();
            expect(screen.getByText(/wählt Robusta/)).toBeInTheDocument();
        });

        it('sollte Erfolg/Misserfolg für Bernoulli anzeigen', () => {
            renderGameArea();

            expect(screen.getByText('Erfolgreich')).toBeInTheDocument();
            expect(screen.getByText('Misserfolg')).toBeInTheDocument();
        });

        it('sollte Bewertung für Gaussian anzeigen', () => {
            const gaussianConfig = { ...defaultConfig, banditType: 'gaussian' as const };
            const gaussianStates = [
                { name: 'greedy' as AlgorithmType, choice: 0, reward: 7.5 },
                { name: 'ucb' as AlgorithmType, choice: 1, reward: 3.2 },
            ];
            renderGameArea(defaultGameState, gaussianConfig, false, defaultPerformance, gaussianStates);

            expect(screen.getByText(/Bewertung: 7.5/)).toBeInTheDocument();
            expect(screen.getByText(/Bewertung: 3.2/)).toBeInTheDocument();
        });

        it('sollte nur ausgewählte Algorithmen anzeigen', () => {
            const allStates = [
                { name: 'greedy' as AlgorithmType, choice: 0, reward: true },
                { name: 'random' as AlgorithmType, choice: 2, reward: false },
                { name: 'ucb' as AlgorithmType, choice: 1, reward: true },
            ];
            // Config hat nur greedy und ucb
            renderGameArea(defaultGameState, defaultConfig, false, defaultPerformance, allStates);

            expect(screen.getByText('Greedy')).toBeInTheDocument();
            expect(screen.getByText('Ucb')).toBeInTheDocument();
            expect(screen.queryByText('Random')).not.toBeInTheDocument();
        });
    });

    describe('Spiel-Abschluss', () => {
        it('sollte Abschluss-Nachricht anzeigen', () => {
            renderGameArea(defaultGameState, defaultConfig, true);

            expect(screen.getByText('Spiel beendet! Sehr gut gemacht!')).toBeInTheDocument();
        });

        it('sollte finalen Punktestand für Bernoulli anzeigen', () => {
            const finalState = { currentPatient: 10, savedLives: 8 };
            renderGameArea(finalState, defaultConfig, true);

            expect(screen.getByText(/Dein finaler Punktestand/)).toBeInTheDocument();
            expect(screen.getByText(/: 8/)).toBeInTheDocument();
        });

        it('sollte finale Durchschnittsbewertung für Gaussian anzeigen', () => {
            const gaussianConfig = { ...defaultConfig, banditType: 'gaussian' as const };
            const finalState = { currentPatient: 10, savedLives: 75 };
            renderGameArea(finalState, gaussianConfig, true);

            expect(screen.getByText(/Deine finale Ø Bewertung/)).toBeInTheDocument();
            expect(screen.getByText(/: 7.5/)).toBeInTheDocument();
        });

        it('sollte Trophy-Icon anzeigen', () => {
            renderGameArea(defaultGameState, defaultConfig, true);

            // Trophy wird als SVG gerendert, prüfe auf Container
            const completeMessage = screen.getByText('Spiel beendet! Sehr gut gemacht!').closest('.game-complete-message');
            expect(completeMessage).toBeInTheDocument();
        });
    });

    describe('Performance Chart', () => {
        it('sollte Performance-Überschrift anzeigen', () => {
            renderGameArea();

            expect(screen.getByText('Performance')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('sollte mit vielen Bohnen umgehen', () => {
            const manyBeansConfig = { ...defaultConfig, numActions: 10 };
            renderGameArea(defaultGameState, manyBeansConfig);

            expect(screen.getByText('Arabica')).toBeInTheDocument();
            expect(screen.getByText('Jamaica Blue Mountain')).toBeInTheDocument();
        });

        it('sollte mit einer Bohne umgehen', () => {
            const singleBeanConfig = { ...defaultConfig, numActions: 1 };
            renderGameArea(defaultGameState, singleBeanConfig);

            const arabicaButton = screen.getByText('Arabica').closest('button');
            expect(arabicaButton).toBeInTheDocument();
        });

        it('sollte mit keinen Algorithmen umgehen', () => {
            const noAlgoConfig = { ...defaultConfig, algorithms: [] as AlgorithmType[] };
            renderGameArea(defaultGameState, noAlgoConfig, false, defaultPerformance, []);

            expect(screen.getByText('0 Algorithmen')).toBeInTheDocument();
        });

        it('sollte mit allen Algorithmen umgehen', () => {
            const allAlgoConfig = {
                ...defaultConfig,
                algorithms: ['greedy', 'epsilon-greedy', 'random', 'ucb', 'thompson'] as AlgorithmType[]
            };
            const allStates = [
                { name: 'greedy' as AlgorithmType, choice: 0, reward: true },
                { name: 'epsilon-greedy' as AlgorithmType, choice: 1, reward: false },
                { name: 'random' as AlgorithmType, choice: 2, reward: true },
                { name: 'ucb' as AlgorithmType, choice: 0, reward: false },
                { name: 'thompson' as AlgorithmType, choice: 1, reward: true },
            ];
            renderGameArea(defaultGameState, allAlgoConfig, false, defaultPerformance, allStates);

            expect(screen.getByText('5 Algorithmen')).toBeInTheDocument();
            expect(screen.getByText('Greedy')).toBeInTheDocument();
            expect(screen.getByText('Epsilon Greedy')).toBeInTheDocument();
            expect(screen.getByText('Thompson')).toBeInTheDocument();
        });
    });
});