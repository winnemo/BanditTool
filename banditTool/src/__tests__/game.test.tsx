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

    // Testfall 1: Dieser Test ist bereits korrekt.
    test('sollte null rendern, wenn das Spiel weder läuft noch beendet ist', () => {
        const mockGameState = { isPlaying: false };
        const { container } = render(
            <GameInterface
                gameState={mockGameState}
                config={mockConfig}
                isGameComplete={false}
            />
        );
        expect(container).toBeEmptyDOMElement();
    });

    // Testfall 2: Korrigierte Assertions
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

        expect(screen.getByRole('heading', { name: /Spiel beendet!/i })).toBeInTheDocument();

        // KORREKTUR: Finde das Element über einen statischen Teil und prüfe dann den gesamten Inhalt.
        const summaryElement = screen.getByText(/Patienten gerettet/i);
        expect(summaryElement).toHaveTextContent('Sie haben 7 von 10 Patienten gerettet');

        const rateElement = screen.getByText(/Erfolgsrate:/i);
        expect(rateElement).toHaveTextContent('Erfolgsrate: 70.0%');
    });

    // Testfall 3: Korrigierte Assertions
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

        // KORREKTUR: Finde die Elemente über statische Teile.
        const patientElement = screen.getByText(/Patient/i);
        expect(patientElement).toHaveTextContent('Patient 5 von 10');

        const livesElement = screen.getByText(/Gerettete Leben:/i);
        expect(livesElement).toHaveTextContent('Gerettete Leben: 2');

        const drugButtons = screen.getAllByRole('button', { name: /Medikament \d/i });
        expect(drugButtons).toHaveLength(mockConfig.numDrugs);

        const drug1SuccessRate = screen.getByText(/Erfolgsrate: 50.0%/i);
        expect(drug1SuccessRate).toBeInTheDocument();
    });

    // Testfall 4: Dieser Test ist bereits korrekt.
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

        const secondDrugButton = screen.getByRole('button', { name: /medikament 2/i });
        await userEvent.click(secondDrugButton);

        expect(mockOnDrugChoice).toHaveBeenCalledTimes(1);
        expect(mockOnDrugChoice).toHaveBeenCalledWith(1);
    });
});