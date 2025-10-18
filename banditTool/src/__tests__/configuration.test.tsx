import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { ConfigPanel } from '../components/configuration';

type AlgorithmType = "greedy" | "epsilon-greedy" | "random" | "ucb" | "thompson";

interface Config {
    numActions: number;
    numIterations: number;
    banditType: "bernoulli" | "gaussian";
    algorithms: AlgorithmType[];
}

describe('ConfigPanel', () => {
    let defaultConfig: Config;
    let mockSetConfig: ReturnType<typeof vi.fn>;
    let mockOnStartGame: ReturnType<typeof vi.fn>;
    let mockOnStopGame: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        defaultConfig = {
            numActions: 3,
            numIterations: 10,
            banditType: 'bernoulli',
            algorithms: ['greedy'],
        };

        mockSetConfig = vi.fn();
        mockOnStartGame = vi.fn();
        mockOnStopGame = vi.fn();
    });

    const renderConfigPanel = (config: Config = defaultConfig, gameStarted: boolean = false) => {
        return render(
            <ConfigPanel
                config={config}
                setConfig={mockSetConfig}
                onStartGame={mockOnStartGame}
                onStopGame={mockOnStopGame}
                gameStarted={gameStarted}
            />
        );
    };

    describe('Rendering', () => {
        it('sollte Titel und Hauptelemente anzeigen', () => {
            renderConfigPanel();

            expect(screen.getByText('Spiel-Konfiguration')).toBeInTheDocument();
            expect(screen.getByText('Wähle deine Gegner')).toBeInTheDocument();
        });

        it('sollte alle Algorithmus-Karten anzeigen', () => {
            renderConfigPanel();

            expect(screen.getByText('Greedy')).toBeInTheDocument();
            expect(screen.getByText('Epsilon Greedy')).toBeInTheDocument();
            expect(screen.getByText('Random')).toBeInTheDocument();
            expect(screen.getByText('Ucb')).toBeInTheDocument();
            expect(screen.getByText('Thompson')).toBeInTheDocument();
        });

        it('sollte Start-Button im initialen Zustand anzeigen', () => {
            renderConfigPanel();

            const startButton = screen.getByText('Spiel starten!');
            expect(startButton).toBeInTheDocument();
            expect(startButton.closest('button')).not.toBeDisabled();
        });

        it('sollte Stop-Button anzeigen wenn Spiel läuft', () => {
            renderConfigPanel(defaultConfig, true);

            expect(screen.getByText('Spiel läuft...')).toBeInTheDocument();
            expect(screen.getByText('Spiel abbrechen')).toBeInTheDocument();
        });
    });

    describe('Bandit-Typ Auswahl', () => {
        it('sollte Bernoulli als aktiv markieren', () => {
            renderConfigPanel();

            const bernoulliButton = screen.getByText('Bernoulli').closest('button');
            expect(bernoulliButton).toHaveClass('active');
        });

        it('sollte zu Gaussian wechseln können', () => {
            renderConfigPanel();

            const gaussianButton = screen.getByText('Gaussian');
            fireEvent.click(gaussianButton);

            expect(mockSetConfig).toHaveBeenCalledWith({
                ...defaultConfig,
                banditType: 'gaussian',
            });
        });

        it('sollte Spiel stoppen bei Typ-Änderung während laufendem Spiel', () => {
            renderConfigPanel(defaultConfig, true);

            const gaussianButton = screen.getByText('Gaussian');
            fireEvent.click(gaussianButton);

            expect(mockOnStopGame).toHaveBeenCalled();
        });

        it('sollte Hilfstext für Bernoulli anzeigen', () => {
            renderConfigPanel();

            expect(screen.getByText(/Binäre Belohnungen/)).toBeInTheDocument();
        });

        it('sollte Hilfstext für Gaussian anzeigen', () => {
            const gaussianConfig = { ...defaultConfig, banditType: 'gaussian' as const };
            renderConfigPanel(gaussianConfig);

            expect(screen.getByText(/Kontinuierliche Belohnungen/)).toBeInTheDocument();
        });
    });

    describe('Bohnen Slider', () => {
        it('sollte aktuellen Wert im Number-Input anzeigen', () => {
            renderConfigPanel();

            const numberInputs = screen.getAllByRole('spinbutton');
            expect(numberInputs[0]).toHaveValue(3);
        });

        it('sollte Wert über Range-Input ändern', () => {
            renderConfigPanel();

            const rangeInputs = screen.getAllByRole('slider');
            const bohnenSlider = rangeInputs[0];

            fireEvent.change(bohnenSlider, { target: { value: '5' } });

            expect(mockSetConfig).toHaveBeenCalledWith({
                ...defaultConfig,
                numActions: 5,
            });
        });

        it('sollte Wert über Number-Input ändern', () => {
            renderConfigPanel();

            const numberInputs = screen.getAllByRole('spinbutton');
            const bohnenInput = numberInputs[0];

            fireEvent.change(bohnenInput, { target: { value: '7' } });

            expect(mockSetConfig).toHaveBeenCalledWith({
                ...defaultConfig,
                numActions: 7,
            });
        });

        it('sollte Werte außerhalb 1-10 ignorieren', () => {
            renderConfigPanel();

            const numberInputs = screen.getAllByRole('spinbutton');
            const bohnenInput = numberInputs[0];

            fireEvent.change(bohnenInput, { target: { value: '15' } });
            expect(mockSetConfig).not.toHaveBeenCalled();

            fireEvent.change(bohnenInput, { target: { value: '0' } });
            expect(mockSetConfig).not.toHaveBeenCalled();
        });
    });

    describe('Versuche Slider', () => {
        it('sollte aktuellen Wert im Number-Input anzeigen', () => {
            renderConfigPanel();

            const numberInputs = screen.getAllByRole('spinbutton');
            expect(numberInputs[1]).toHaveValue(10);
        });

        it('sollte Wert ändern können', () => {
            renderConfigPanel();

            const rangeInputs = screen.getAllByRole('slider');
            const versucheSlider = rangeInputs[1];

            fireEvent.change(versucheSlider, { target: { value: '25' } });

            expect(mockSetConfig).toHaveBeenCalledWith({
                ...defaultConfig,
                numIterations: 25,
            });
        });

        it('sollte Werte außerhalb 1-50 ignorieren', () => {
            renderConfigPanel();

            const numberInputs = screen.getAllByRole('spinbutton');
            const versucheInput = numberInputs[1];

            fireEvent.change(versucheInput, { target: { value: '100' } });
            expect(mockSetConfig).not.toHaveBeenCalled();
        });
    });

    describe('Algorithmus Auswahl', () => {
        it('sollte ausgewählten Algorithmus markieren', () => {
            renderConfigPanel();

            const greedyCard = screen.getByText('Greedy').closest('.algorithm-card');
            expect(greedyCard).toHaveClass('selected');
            expect(screen.getByText('Ausgewählt')).toBeInTheDocument();
        });

        it('sollte Algorithmus hinzufügen können', () => {
            renderConfigPanel();

            const epsilonCard = screen.getByText('Epsilon Greedy');
            fireEvent.click(epsilonCard);

            expect(mockSetConfig).toHaveBeenCalledWith({
                ...defaultConfig,
                algorithms: ['greedy', 'epsilon-greedy'],
            });
        });

        it('sollte Algorithmus entfernen können', () => {
            renderConfigPanel();

            const greedyCard = screen.getByText('Greedy');
            fireEvent.click(greedyCard);

            expect(mockSetConfig).toHaveBeenCalledWith({
                ...defaultConfig,
                algorithms: [],
            });
        });

        it('sollte mehrere Algorithmen auswählen können', () => {
            const multiConfig = {
                ...defaultConfig,
                algorithms: ['greedy', 'ucb', 'thompson'] as AlgorithmType[],
            };
            renderConfigPanel(multiConfig);

            const selectedCards = screen.getAllByText('Ausgewählt');
            expect(selectedCards).toHaveLength(3);
        });
    });

    describe('Hilfstext für Gegner', () => {
        it('sollte Nachricht bei keinen Gegnern anzeigen', () => {
            const noAlgoConfig = { ...defaultConfig, algorithms: [] as AlgorithmType[] };
            renderConfigPanel(noAlgoConfig);

            expect(screen.getByText(/Du trittst gegen niemanden an/)).toBeInTheDocument();
        });

        it('sollte Nachricht bei einem Gegner anzeigen', () => {
            renderConfigPanel();

            expect(screen.getByText(/Du trittst gegen greedy an/)).toBeInTheDocument();
        });

        it('sollte Nachricht bei mehreren Gegnern anzeigen', () => {
            const multiConfig = {
                ...defaultConfig,
                algorithms: ['greedy', 'ucb'] as AlgorithmType[],
            };
            renderConfigPanel(multiConfig);

            expect(screen.getByText(/Du trittst gegen 2 Algorithmen an/)).toBeInTheDocument();
        });
    });

    describe('Spiel Kontrollen', () => {
        it('sollte Spiel starten', () => {
            renderConfigPanel();

            const startButton = screen.getByText('Spiel starten!');
            fireEvent.click(startButton);

            expect(mockOnStartGame).toHaveBeenCalled();
        });

        it('sollte Start-Button deaktivieren wenn Spiel läuft', () => {
            renderConfigPanel(defaultConfig, true);

            const startButton = screen.getByText('Spiel läuft...').closest('button');
            expect(startButton).toBeDisabled();
        });

        it('sollte Spiel stoppen können', () => {
            renderConfigPanel(defaultConfig, true);

            const stopButton = screen.getByText('Spiel abbrechen');
            fireEvent.click(stopButton);

            expect(mockOnStopGame).toHaveBeenCalled();
        });

        it('sollte Stop-Button nicht anzeigen wenn Spiel nicht läuft', () => {
            renderConfigPanel();

            expect(screen.queryByText('Spiel abbrechen')).not.toBeInTheDocument();
        });
    });

    describe('Integration', () => {
        it('sollte mehrere Konfigurationsänderungen nacheinander verarbeiten', () => {
            renderConfigPanel();

            // Bohnen ändern
            const rangeInputs = screen.getAllByRole('slider');
            fireEvent.change(rangeInputs[0], { target: { value: '5' } });

            // Bandit-Typ ändern
            const gaussianButton = screen.getByText('Gaussian');
            fireEvent.click(gaussianButton);

            // Algorithmus hinzufügen
            const ucbCard = screen.getByText('Ucb');
            fireEvent.click(ucbCard);

            expect(mockSetConfig).toHaveBeenCalledTimes(3);
        });

        it('sollte bei jeder Änderung während laufendem Spiel stoppen', () => {
            renderConfigPanel(defaultConfig, true);

            const rangeInputs = screen.getAllByRole('slider');
            fireEvent.change(rangeInputs[0], { target: { value: '4' } });

            expect(mockOnStopGame).toHaveBeenCalled();
        });
    });
});