import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

// Die zu testende Komponente importieren
import ControlButtons from '../components/controlButtons';

describe('ControlButtons', () => {

    // Testfall 1: Überprüft das grundlegende Rendern der Buttons
    test('sollte beide Buttons korrekt rendern', () => {
        // Arrange: Rendere die Komponente mit Dummy-Props
        render(
            <ControlButtons
                onStartGame={() => {}}
                onShowPlot={() => {}}
                hasGameData={false}
            />
        );

        // Assert: Prüfe, ob beide Buttons im Dokument vorhanden sind
        expect(screen.getByRole('button', { name: /spiel starten/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /graphen anzeigen/i })).toBeInTheDocument();
    });

    // Testfall 2: Überprüft die Klick-Funktionalität des Start-Buttons
    test('sollte onStartGame aufrufen, wenn der Start-Button geklickt wird', async () => {
        // Arrange: Erstelle eine Mock-Funktion und rendere die Komponente damit
        const mockOnStartGame = vi.fn();
        render(<ControlButtons onStartGame={mockOnStartGame} />);

        // Act: Simuliere einen Benutzerklick auf den Start-Button
        const startButton = screen.getByRole('button', { name: /spiel starten/i });
        await userEvent.click(startButton);

        // Assert: Prüfe, ob die Mock-Funktion genau einmal aufgerufen wurde
        expect(mockOnStartGame).toHaveBeenCalledTimes(1);
    });

    // Testfall 3: Stellt sicher, dass der Graphen-Button deaktiviert ist, wenn keine Daten vorhanden sind
    test('sollte den Graphen-Button deaktivieren, wenn hasGameData false ist', () => {
        // Arrange
        render(<ControlButtons hasGameData={false} />);

        // Act
        const plotButton = screen.getByRole('button', { name: /graphen anzeigen/i });

        // Assert
        expect(plotButton).toBeDisabled();
    });

    // Testfall 4: Stellt sicher, dass der Graphen-Button aktiv ist, wenn Daten vorhanden sind
    test('sollte den Graphen-Button aktivieren, wenn hasGameData true ist', () => {
        // Arrange
        render(<ControlButtons hasGameData={true} />);

        // Act
        const plotButton = screen.getByRole('button', { name: /graphen anzeigen/i });

        // Assert
        expect(plotButton).not.toBeDisabled();
    });

    // Testfall 5: Überprüft die Klick-Funktionalität des Graphen-Buttons, wenn er aktiv ist
    test('sollte onShowPlot aufrufen, wenn der aktive Graphen-Button geklickt wird', async () => {
        // Arrange
        const mockOnShowPlot = vi.fn();
        render(<ControlButtons onShowPlot={mockOnShowPlot} hasGameData={true} />);

        // Act
        const plotButton = screen.getByRole('button', { name: /graphen anzeigen/i });
        await userEvent.click(plotButton);

        // Assert
        expect(mockOnShowPlot).toHaveBeenCalledTimes(1);
    });
});