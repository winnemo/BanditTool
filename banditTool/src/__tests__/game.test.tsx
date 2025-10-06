import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import GameInterface from "../components/game.tsx";

describe('GameInterface', () => {
    const mockOnDrugChoice = vi.fn();

    const defaultConfig = {
        banditType: 'bernoulli',
        numActions: 5,
        numIterations: 10,
        algorithm: 'greedy'
    };

    const defaultGameState = {
        isPlaying: true,
        currentPatient: 1,
        savedLives: 0
    };

    const defaultAlgorithmState = {
        choice: -1,
        success: false
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering Zustände', () => {
        it('sollte null zurückgeben wenn Spiel nicht läuft und nicht beendet ist', () => {
            const { container } = render(
                <GameInterface
                    gameState={{ ...defaultGameState, isPlaying: false }}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={defaultAlgorithmState}
                />
            );

            expect(container.firstChild).toBeNull();
        });

        it('sollte die Spieloberfläche anzeigen wenn Spiel läuft', () => {
            render(
                <GameInterface
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={defaultAlgorithmState}
                />
            );

            expect(screen.getByText(/Runde 1 von 10/)).toBeInTheDocument();
        });

        it('sollte den Abschlussbildschirm anzeigen wenn Spiel beendet ist', () => {
            render(
                <GameInterface
                    gameState={{ ...defaultGameState, savedLives: 8 }}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={true}
                    notification={null}
                    algorithmState={defaultAlgorithmState}
                />
            );

            expect(screen.getByText(/Spiel beendet!/)).toBeInTheDocument();
        });
    });

    describe('Spielstatus Anzeige', () => {
        it('sollte die aktuelle Runde korrekt anzeigen', () => {
            render(
                <GameInterface
                    gameState={{ ...defaultGameState, currentPatient: 5 }}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={defaultAlgorithmState}
                />
            );

            expect(screen.getByText(/Runde 5 von 10/)).toBeInTheDocument();
        });

        it('sollte die Anzahl gebrühter Tassen korrekt anzeigen', () => {
            render(
                <GameInterface
                    gameState={{ ...defaultGameState, currentPatient: 5, savedLives: 3 }}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={defaultAlgorithmState}
                />
            );

            expect(screen.getByText(/Gebrühte Tassen: 3 von 5/)).toBeInTheDocument();
        });
    });

    describe('Bohnen Buttons', () => {
        it('sollte die korrekte Anzahl von Bohnen-Buttons rendern', () => {
            render(
                <GameInterface
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={defaultAlgorithmState}
                />
            );

            const buttons = screen.getAllByText(/Bohne \d+/);
            expect(buttons).toHaveLength(5);
        });

        it('sollte onDrugChoice mit korrektem Index aufrufen', () => {
            render(
                <GameInterface
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={defaultAlgorithmState}
                />
            );

            const button = screen.getByText('☕ Bohne 3');
            fireEvent.click(button);

            expect(mockOnDrugChoice).toHaveBeenCalledWith(2);
        });

        it('sollte Bohnen-Buttons mit unterschiedlicher Anzahl rendern', () => {
            const configWith8Actions = { ...defaultConfig, numActions: 8 };

            render(
                <GameInterface
                    gameState={defaultGameState}
                    config={configWith8Actions}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={defaultAlgorithmState}
                />
            );

            const buttons = screen.getAllByText(/Bohne \d+/);
            expect(buttons).toHaveLength(8);
        });

        it('sollte Buttons deaktivieren wenn Spiel beendet ist', () => {
            render(
                <GameInterface
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={true}
                    notification={null}
                    algorithmState={defaultAlgorithmState}
                />
            );

            const buttons = screen.queryAllByText(/Bohne \d+/);
            buttons.forEach(button => {
                expect(button.closest('button')).toBeDisabled();
            });
        });

        it('sollte algo-selected Klasse auf gewählter Bohne anzeigen', () => {
            const algoStateWithChoice = { choice: 2, success: true };

            render(
                <GameInterface
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={algoStateWithChoice}
                />
            );

            const button = screen.getByText('☕ Bohne 3').closest('button');
            expect(button).toHaveClass('algo-selected');
        });
    });

    describe('Benachrichtigungen', () => {
        it('sollte keine Benachrichtigung anzeigen wenn keine vorhanden', () => {
            render(
                <GameInterface
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={defaultAlgorithmState}
                />
            );

            expect(screen.queryByTestId('notification-box')).not.toBeInTheDocument();
        });

        it('sollte Benachrichtigung anzeigen wenn vorhanden', () => {
            const notification = <div data-testid="test-notification">Test Nachricht</div>;

            render(
                <GameInterface
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={notification}
                    algorithmState={defaultAlgorithmState}
                />
            );

            expect(screen.getByTestId('test-notification')).toBeInTheDocument();
        });
    });

    describe('Algorithmus Bereich', () => {
        it('sollte Algorithmus-Bereich nicht anzeigen ohne Wahl', () => {
            render(
                <GameInterface
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={{ choice: -1, success: false }}
                />
            );

            expect(screen.queryByText(/Algorithmus/)).not.toBeInTheDocument();
        });

        it('sollte Algorithmus-Bereich anzeigen mit Wahl', () => {
            const algoStateWithChoice = { choice: 2, success: true };

            render(
                <GameInterface
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={algoStateWithChoice}
                />
            );

            expect(screen.getByText(/Greedy Algorithmus/)).toBeInTheDocument();
        });

        it('sollte den Algorithmus-Namen korrekt formatieren', () => {
            const epsilonConfig = { ...defaultConfig, algorithm: 'epsilon-greedy' };
            const algoStateWithChoice = { choice: 1, success: true };

            render(
                <GameInterface
                    gameState={defaultGameState}
                    config={epsilonConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={algoStateWithChoice}
                />
            );

            expect(screen.getByText(/Epsilon greedy Algorithmus/)).toBeInTheDocument();
        });

        it('sollte die gewählte Bohne anzeigen', () => {
            const algoStateWithChoice = { choice: 3, success: true };

            render(
                <GameInterface
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={algoStateWithChoice}
                />
            );

            expect(screen.getByText(/Wahl: Bohne 4/)).toBeInTheDocument();
        });

        it('sollte Erfolg korrekt anzeigen', () => {
            const algoStateWithChoice = { choice: 1, success: true };

            render(
                <GameInterface
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={algoStateWithChoice}
                />
            );

            expect(screen.getByText('Erfolgreich')).toBeInTheDocument();
        });

        it('sollte Misserfolg korrekt anzeigen', () => {
            const algoStateWithChoice = { choice: 1, success: false };

            render(
                <GameInterface
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={algoStateWithChoice}
                />
            );

            expect(screen.getByText('Misserfolg')).toBeInTheDocument();
        });
    });

    describe('Abschlussbildschirm', () => {
        it('sollte die Erfolgsrate korrekt berechnen und anzeigen', () => {
            render(
                <GameInterface
                    gameState={{ ...defaultGameState, savedLives: 7 }}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={true}
                    notification={null}
                    algorithmState={defaultAlgorithmState}
                />
            );

            expect(screen.getByText(/70.0%/)).toBeInTheDocument();
        });

        it('sollte Erfolgsrate von 100% korrekt anzeigen', () => {
            render(
                <GameInterface
                    gameState={{ ...defaultGameState, savedLives: 10 }}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={true}
                    notification={null}
                    algorithmState={defaultAlgorithmState}
                />
            );

            expect(screen.getByText(/100.0%/)).toBeInTheDocument();
        });

        it('sollte Erfolgsrate von 0% korrekt anzeigen', () => {
            render(
                <GameInterface
                    gameState={{ ...defaultGameState, savedLives: 0 }}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={true}
                    notification={null}
                    algorithmState={defaultAlgorithmState}
                />
            );

            expect(screen.getByText(/0.0%/)).toBeInTheDocument();
        });
    });

    describe('Integration Tests', () => {
        it('sollte mehrere Bohnen-Klicks verarbeiten', () => {
            render(
                <GameInterface
                    gameState={defaultGameState}
                    config={defaultConfig}
                    onDrugChoice={mockOnDrugChoice}
                    isGameComplete={false}
                    notification={null}
                    algorithmState={defaultAlgorithmState}
                />
            );

            fireEvent.click(screen.getByText('☕ Bohne 1'));
            fireEvent.click(screen.getByText('☕ Bohne 3'));
            fireEvent.click(screen.getByText('☕ Bohne 5'));

            expect(mockOnDrugChoice).toHaveBeenCalledTimes(3);
            expect(mockOnDrugChoice).toHaveBeenNthCalledWith(1, 0);
            expect(mockOnDrugChoice).toHaveBeenNthCalledWith(2, 2);
            expect(mockOnDrugChoice).toHaveBeenNthCalledWith(3, 4);
        });

        it('sollte Algorithmus-Namen für alle Typen korrekt formatieren', () => {
            const algorithms = ['greedy', 'epsilon-greedy', 'random'];
            const expectedNames = ['Greedy Algorithmus', 'Epsilon greedy Algorithmus', 'Random Algorithmus'];

            algorithms.forEach((algo, index) => {
                const config = { ...defaultConfig, algorithm: algo };
                const algoState = { choice: 0, success: true };

                const { unmount } = render(
                    <GameInterface
                        gameState={defaultGameState}
                        config={config}
                        onDrugChoice={mockOnDrugChoice}
                        isGameComplete={false}
                        notification={null}
                        algorithmState={algoState}
                    />
                );

                expect(screen.getByText(expectedNames[index])).toBeInTheDocument();
                unmount();
            });
        });
    });
});