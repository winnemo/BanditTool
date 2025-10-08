import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import ConfigurationPanel from "../components/configuration.tsx";

describe('ConfigurationPanel', () => {
    const mockSetConfig = vi.fn();
    const mockOnStartGame = vi.fn();
    const mockOnStopGame = vi.fn();

    const defaultConfig = {
        banditType: 'bernoulli',
        numActions: 5,
        numIterations: 10,
        algorithm: 'greedy'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('sollte die Hauptüberschrift rendern', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            expect(screen.getByText('Spiel-Konfiguration')).toBeInTheDocument();
        });

        it('sollte alle Konfigurationsoptionen anzeigen', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            expect(screen.getByText(/Bandit-Typ/)).toBeInTheDocument();
            expect(screen.getByText(/Anzahl verschiedener Bohnen/)).toBeInTheDocument();
            expect(screen.getByText(/Anzahl Versuche/)).toBeInTheDocument();
            expect(screen.getByText(/Algorithmus/)).toBeInTheDocument();
        });

        it('sollte den Start-Button anzeigen wenn Spiel nicht läuft', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            expect(screen.getByText('Spiel starten!')).toBeInTheDocument();
        });

        it('sollte den Stop-Button anzeigen wenn Spiel läuft', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={true}
                />
            );

            expect(screen.getByText(/Spiel läuft/)).toBeInTheDocument();
            expect(screen.getByText(/Spiel abbrechen/)).toBeInTheDocument();
        });
    });

    describe('Bandit-Typ Auswahl', () => {
        it('sollte den korrekten Bandit-Typ anzeigen', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            const select = screen.getByDisplayValue('Bernoulli');
            expect(select).toBeInTheDocument();
        });

        it('sollte setConfig aufrufen beim Ändern des Bandit-Typs', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            const select = screen.getByDisplayValue('Bernoulli');
            fireEvent.change(select, { target: { value: 'gaussian' } });

            expect(mockSetConfig).toHaveBeenCalledWith({
                ...defaultConfig,
                banditType: 'gaussian'
            });
        });

        it('sollte den korrekten Hilfetext für Bernoulli anzeigen', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            expect(screen.getByText(/Binäre Belohnungen/)).toBeInTheDocument();
        });

        it('sollte den korrekten Hilfetext für Gaussian anzeigen', () => {
            const gaussianConfig = { ...defaultConfig, banditType: 'gaussian' };

            render(
                <ConfigurationPanel
                    config={gaussianConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            expect(screen.getByText(/Kontinuierliche Belohnungen/)).toBeInTheDocument();
        });
    });

    describe('Anzahl Aktionen (Bohnen)', () => {
        it('sollte den aktuellen Wert anzeigen', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            expect(screen.getByText(/Anzahl verschiedener Bohnen: 5/)).toBeInTheDocument();
        });

        it('sollte setConfig beim Ändern des Sliders aufrufen', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            const slider = screen.getAllByRole('slider')[0];
            fireEvent.change(slider, { target: { value: '7' } });

            expect(mockSetConfig).toHaveBeenCalledWith({
                ...defaultConfig,
                numActions: 7
            });
        });

        it('sollte setConfig beim Ändern des Number-Inputs aufrufen', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            const numberInputs = screen.getAllByRole('spinbutton');
            const actionsInput = numberInputs[0];
            fireEvent.change(actionsInput, { target: { value: '8' } });

            expect(mockSetConfig).toHaveBeenCalledWith({
                ...defaultConfig,
                numActions: 8
            });
        });

        it('sollte Werte außerhalb des Bereichs ignorieren (zu klein)', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            const numberInputs = screen.getAllByRole('spinbutton');
            const actionsInput = numberInputs[0];
            fireEvent.change(actionsInput, { target: { value: '0' } });

            expect(mockSetConfig).not.toHaveBeenCalled();
        });

        it('sollte Werte außerhalb des Bereichs ignorieren (zu groß)', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            const numberInputs = screen.getAllByRole('spinbutton');
            const actionsInput = numberInputs[0];
            fireEvent.change(actionsInput, { target: { value: '11' } });

            expect(mockSetConfig).not.toHaveBeenCalled();
        });
    });

    describe('Anzahl Iterationen (Versuche)', () => {
        it('sollte den aktuellen Wert anzeigen', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            expect(screen.getByText(/Anzahl Versuche: 10/)).toBeInTheDocument();
        });

        it('sollte setConfig beim Ändern des Sliders aufrufen', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            const slider = screen.getAllByRole('slider')[1];
            fireEvent.change(slider, { target: { value: '25' } });

            expect(mockSetConfig).toHaveBeenCalledWith({
                ...defaultConfig,
                numIterations: 25
            });
        });

        it('sollte Werte außerhalb des Bereichs ignorieren', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            const numberInputs = screen.getAllByRole('spinbutton');
            const iterationsInput = numberInputs[1];
            fireEvent.change(iterationsInput, { target: { value: '51' } });

            expect(mockSetConfig).not.toHaveBeenCalled();
        });
    });

    describe('Algorithmus Auswahl', () => {
        it('sollte den korrekten Algorithmus anzeigen', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            const select = screen.getByDisplayValue('Greedy');
            expect(select).toBeInTheDocument();
        });

        it('sollte setConfig beim Ändern des Algorithmus aufrufen', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            const selects = screen.getAllByRole('combobox');
            const algoSelect = selects[1];
            fireEvent.change(algoSelect, { target: { value: 'epsilon-greedy' } });

            expect(mockSetConfig).toHaveBeenCalledWith({
                ...defaultConfig,
                algorithm: 'epsilon-greedy'
            });
        });
    });

    describe('Spiel Steuerung', () => {
        it('sollte onStartGame aufrufen beim Klick auf Start-Button', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            const startButton = screen.getByText('Spiel starten!');
            fireEvent.click(startButton);

            expect(mockOnStartGame).toHaveBeenCalledTimes(1);
        });

        it('sollte den Start-Button deaktivieren wenn Spiel läuft', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={true}
                />
            );

            const startButton = screen.getByText(/Spiel läuft/).closest('button');
            expect(startButton).toBeDisabled();
        });

        it('sollte onStopGame aufrufen beim Klick auf Stop-Button', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={true}
                />
            );

            const stopButton = screen.getByText(/Spiel abbrechen/);
            fireEvent.click(stopButton);

            expect(mockOnStopGame).toHaveBeenCalledTimes(1);
        });

        it('sollte den Stop-Button nicht anzeigen wenn Spiel nicht läuft', () => {
            render(
                <ConfigurationPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );

            expect(screen.queryByText(/Spiel abbrechen/)).not.toBeInTheDocument();
        });
    });
});