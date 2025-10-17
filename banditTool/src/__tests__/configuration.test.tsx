import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
// Name der Komponente an die neue Datei angepasst
import { ConfigPanel } from "../components/configuration.tsx";

describe('ConfigPanel', () => {
    // Mock-Funktionen bleiben gleich
    const mockSetConfig = vi.fn();
    const mockOnStartGame = vi.fn();
    const mockOnStopGame = vi.fn();

    // defaultConfig an die neue Struktur angepasst (algorithms ist jetzt ein Array)
    const defaultConfig = {
        banditType: 'bernoulli',
        numActions: 5,
        numIterations: 10,
        algorithms: ['greedy'] // Startet mit einem ausgewählten Algorithmus
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('sollte die Hauptüberschrift rendern', () => {
            render(
                <ConfigPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );
            expect(screen.getByText('Spiel-Konfiguration')).toBeInTheDocument();
        });

        it('sollte die neuen, kompakten Labels anzeigen', () => {
            render(
                <ConfigPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );
            // Tests an neue Labels angepasst
            expect(screen.getByText('Bandit-Typ')).toBeInTheDocument();
            expect(screen.getByText('Bohnen:')).toBeInTheDocument();
            expect(screen.getByText('Versuche:')).toBeInTheDocument();
            expect(screen.getByText('Wähle deine Gegner')).toBeInTheDocument();
        });
    });

    describe('Bandit-Typ Auswahl (Toggle Buttons)', () => {
        it('sollte den "Bernoulli"-Button als aktiv anzeigen', () => {
            render(
                <ConfigPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );
            const bernoulliButton = screen.getByRole('button', { name: 'Bernoulli' });
            expect(bernoulliButton).toHaveClass('active');
        });

        it('sollte setConfig aufrufen beim Klick auf den "Gaussian"-Button', () => {
            render(
                <ConfigPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );
            const gaussianButton = screen.getByRole('button', { name: 'Gaussian' });
            fireEvent.click(gaussianButton);

            expect(mockSetConfig).toHaveBeenCalledWith({
                ...defaultConfig,
                banditType: 'gaussian'
            });
        });
    });

    describe('Parameter-Slider (Bohnen & Versuche)', () => {
        it('sollte die korrekten Werte in den Slidern und Inputs anzeigen', () => {
            render(
                <ConfigPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );
            const sliders = screen.getAllByRole('slider');
            expect(sliders[0]).toHaveValue('5'); // Bohnen
            expect(sliders[1]).toHaveValue('10'); // Versuche

            const numberInputs = screen.getAllByRole('spinbutton');
            expect(numberInputs[0]).toHaveValue(5); // Bohnen
            expect(numberInputs[1]).toHaveValue(10); // Versuche
        });

        it('sollte setConfig beim Ändern des Bohnen-Sliders aufrufen', () => {
            render(
                <ConfigPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );
            const slider = screen.getAllByRole('slider')[0];
            fireEvent.change(slider, { target: { value: '8' } });

            expect(mockSetConfig).toHaveBeenCalledWith({
                ...defaultConfig,
                numActions: 8
            });
        });
    });

    describe('Algorithmus Auswahl (Karten)', () => {
        it('sollte die "Greedy"-Karte als ausgewählt rendern', () => {
            render(
                <ConfigPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );
            // Finde die Karte über den Titel-Text
            const greedyCard = screen.getByText('Greedy').closest('.algorithm-card');
            expect(greedyCard).toHaveClass('selected');
        });

        it('sollte einen Algorithmus zur Auswahl hinzufügen beim Klick auf eine nicht ausgewählte Karte', () => {
            const configWithoutRandom = { ...defaultConfig, algorithms: ['greedy'] };
            render(
                <ConfigPanel
                    config={configWithoutRandom}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );
            const randomCard = screen.getByText('Random').closest('.algorithm-card');
            fireEvent.click(randomCard!);

            expect(mockSetConfig).toHaveBeenCalledWith({
                ...configWithoutRandom,
                algorithms: ['greedy', 'random']
            });
        });

        it('sollte einen Algorithmus aus der Auswahl entfernen beim Klick auf eine ausgewählte Karte', () => {
            const configWithTwo = { ...defaultConfig, algorithms: ['greedy', 'random'] };
            render(
                <ConfigPanel
                    config={configWithTwo}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );
            const greedyCard = screen.getByText('Greedy').closest('.algorithm-card');
            fireEvent.click(greedyCard!);

            expect(mockSetConfig).toHaveBeenCalledWith({
                ...configWithTwo,
                algorithms: ['random'] // 'greedy' wurde entfernt
            });
        });
    });

    describe('Spiel Steuerung und Interaktionen', () => {
        it('sollte onStartGame aufrufen beim Klick auf Start-Button', () => {
            render(
                <ConfigPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={false}
                />
            );
            fireEvent.click(screen.getByText('Spiel starten!'));
            expect(mockOnStartGame).toHaveBeenCalledTimes(1);
        });

        it('sollte onStopGame aufrufen beim Klick auf Stop-Button', () => {
            render(
                <ConfigPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={true}
                />
            );
            fireEvent.click(screen.getByText('Spiel abbrechen'));
            expect(mockOnStopGame).toHaveBeenCalledTimes(1);
        });

        it('sollte onStopGame aufrufen, wenn eine Konfiguration geändert wird, während das Spiel läuft', () => {
            render(
                <ConfigPanel
                    config={defaultConfig}
                    setConfig={mockSetConfig}
                    onStartGame={mockOnStartGame}
                    onStopGame={mockOnStopGame}
                    gameStarted={true} // Spiel läuft
                />
            );
            const gaussianButton = screen.getByRole('button', { name: 'Gaussian' });
            fireEvent.click(gaussianButton);

            // Zuerst wird das Spiel gestoppt...
            expect(mockOnStopGame).toHaveBeenCalledTimes(1);
            // ...dann wird die Konfiguration geändert.
            expect(mockSetConfig).toHaveBeenCalledWith({
                ...defaultConfig,
                banditType: 'gaussian'
            });
        });
    });
});