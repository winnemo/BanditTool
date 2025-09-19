import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

import GameInterface from '../components/game.tsx';

describe('GameInterface', () => {
    // Mock-Daten für die Tests
    const mockConfig = {
        numDrugs: 3,
        numPatients: 10,
    };

    // Testfall 1: Die Komponente sollte nichts rendern, wenn das Spiel nicht läuft.
    test('sollte null rendern, wenn das Spiel weder läuft noch beendet ist', () => {
        const mockGameState = { isPlaying: false };
        const { container } = render(
            <GameInterface
                gameState={mockGameState}
                config={mockConfig}
                isGameComplete={false}
            />
        );

        // Assert: Das gerenderte div sollte leer sein.
        expect(container).toBeEmptyDOMElement();
    });

    // Testfall 2: Die Komponente sollte den Endbildschirm anzeigen.
    test('sollte die Zusammenfassung anzeigen, wenn das Spiel beendet ist', () => {
        const mockGameState = {
            isPlaying: false,
            savedLives: 7,
        };
        render(
            <GameInterface
                gameState={mockGameState}
                config={mockConfig}
                isGameComplete={true}
            />
        );

        // Assert: Überprüfe, ob der Text und die berechnete Erfolgsrate korrekt sind.
        expect(screen.getByRole('heading', { name: /spiel beendet!/i })).toBeInTheDocument();
        expect(screen.getByText(/Sie haben 7 von 10 Patienten gerettet/i)).toBeInTheDocument();
        expect(screen.getByText(/Erfolgsrate: 70.0%/i)).toBeInTheDocument();
    });

    // Testfall 3: Die Komponente sollte die aktive Spielansicht korrekt rendern.
    test('sollte die aktive Spieloberfläche korrekt rendern', () => {
        const mockGameState = {
            isPlaying: true,
            currentPatient: 4,
            savedLives: 2,
            drugStats: {
                drug0: { attempts: 2, successes: 1 },
                drug1: { attempts: 3, successes: 1 },
            },
        };
        render(
            <GameInterface
                gameState={mockGameState}
                config={mockConfig}
                onDrugChoice={() => {}}
                isGameComplete={false}
            />
        );

        // Assert: Überprüfe die angezeigten Spielinformationen.
        expect(screen.getByRole('heading', { name: /Patient 5 von 10/i })).toBeInTheDocument();
        expect(screen.getByText(/Gerettete Leben: 2/i)).toBeInTheDocument();

        // Assert: Überprüfe, ob die richtige Anzahl an Medikamenten-Buttons angezeigt wird.
        const drugButtons = screen.getAllByRole('button', { name: /Medikament \d/i });
        expect(drugButtons).toHaveLength(mockConfig.numDrugs);

        // Assert: Überprüfe, ob eine der Statistiken korrekt angezeigt wird.
        expect(screen.getByText(/Versuche: 3/i)).toBeInTheDocument();
        expect(screen.getByText(/Erfolge: 1/i)).toBeInTheDocument();
        expect(screen.getByText(/Erfolgsrate: 50.0%/i)).toBeInTheDocument(); // Für Medikament 1
    });

    // Testfall 4: Überprüft die Klick-Interaktion auf einem Medikamenten-Button.
    test('sollte onDrugChoice mit dem korrekten Index aufrufen, wenn ein Button geklickt wird', async () => {
        const mockOnDrugChoice = vi.fn();
        const mockGameState = {
            isPlaying: true,
            currentPatient: 0,
            savedLives: 0,
            drugStats: {},
        };
        render(
            <GameInterface
                gameState={mockGameState}
                config={mockConfig}
                onDrugChoice={mockOnDrugChoice}
                isGameComplete={false}
            />
        );

        // Act: Klicke auf den zweiten Medikamenten-Button (Index 1)
        const secondDrugButton = screen.getByRole('button', { name: /medikament 2/i });
        await userEvent.click(secondDrugButton);

        // Assert: Überprüfe, ob die Callback-Funktion korrekt aufgerufen wurde.
        expect(mockOnDrugChoice).toHaveBeenCalledTimes(1);
        expect(mockOnDrugChoice).toHaveBeenCalledWith(1); // Index ist 0-basiert
    });
});