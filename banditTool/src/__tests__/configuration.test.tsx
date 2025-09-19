import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';

// Die zu testende Komponente importieren
import ConfigurationPanel from '../components/configuration'; // Passe den Pfad ggf. an

// Eine Gruppe von Tests für die ConfigurationPanel-Komponente
describe('ConfigurationPanel', () => {

    // Ein Standard-Konfigurationsobjekt für die Tests
    const initialConfig = {
        numDrugs: 10,
        numPatients: 100,
        banditType: 'bernoulli',
        algorithm: 'greedy',
    };

    // Testfall 1: Überprüft, ob die Komponente mit den Startwerten korrekt angezeigt wird.
    test('sollte mit initialen Werten korrekt rendern', () => {
        // Arrange: Rendere die Komponente mit den Start-Props
        render(<ConfigurationPanel config={initialConfig} setConfig={() => {}} />);

        // Assert: Überprüfe, ob die Elemente auf dem Bildschirm sind und die richtigen Werte haben
        expect(screen.getByRole('heading', { name: /konfiguration/i })).toBeInTheDocument();

        // Überprüfe die Zahlen-Eingabefelder
        expect(screen.getByRole('spinbutton', { name: /anzahl medikamente/i })).toHaveValue(initialConfig.numDrugs);
        expect(screen.getByRole('spinbutton', { name: /anzahl patienten/i })).toHaveValue(initialConfig.numPatients);

        // Überprüfe die Dropdown-Menüs (Selects)
        expect(screen.getByRole('combobox', { name: /bandit typ/i })).toHaveValue(initialConfig.banditType);
        expect(screen.getByRole('combobox', { name: /algorithmus/i })).toHaveValue(initialConfig.algorithm);
    });

    // Testfall 2: Überprüft, ob das Ändern eines Zahlenfelds die setConfig-Funktion korrekt aufruft.
    test('sollte setConfig aufrufen, wenn die Anzahl der Medikamente geändert wird', async () => {
        // Arrange: Erstelle eine Mock-Funktion, um Aufrufe zu verfolgen
        const mockSetConfig = vi.fn();
        render(<ConfigurationPanel config={initialConfig} setConfig={mockSetConfig} />);

        // Act: Simuliere eine Benutzereingabe
        const drugInput = screen.getByRole('spinbutton', { name: /anzahl medikamente/i });
        await userEvent.clear(drugInput); // Feld leeren
        await userEvent.type(drugInput, '25'); // Neuen Wert eintippen

        // Assert: Überprüfe, ob die Mock-Funktion mit den richtigen Daten aufgerufen wurde
        expect(mockSetConfig).toHaveBeenCalled();
        expect(mockSetConfig).toHaveBeenCalledWith({ ...initialConfig, numDrugs: 25 });
    });

    // Testfall 3: Überprüft, ob das Ändern eines Schiebereglers die setConfig-Funktion korrekt aufruft.
    test('sollte setConfig aufrufen, wenn der Patienten-Slider geändert wird', () => {
        // Arrange
        const mockSetConfig = vi.fn();
        render(<ConfigurationPanel config={initialConfig} setConfig={mockSetConfig} />);

        // Act: Simuliere eine Änderung am Schieberegler
        const patientSlider = screen.getByRole('slider', { name: /anzahl patienten/i });
        fireEvent.change(patientSlider, { target: { value: '500' } });

        // Assert
        expect(mockSetConfig).toHaveBeenCalledWith({ ...initialConfig, numPatients: 500 });
    });

    // Testfall 4: Überprüft, ob das Ändern eines Dropdown-Menüs die setConfig-Funktion korrekt aufruft.
    test('sollte setConfig aufrufen, wenn der Algorithmus geändert wird', async () => {
        // Arrange
        const mockSetConfig = vi.fn();
        render(<ConfigurationPanel config={initialConfig} setConfig={mockSetConfig} />);

        // Act: Simuliere die Auswahl einer neuen Option
        const algorithmSelect = screen.getByRole('combobox', { name: /algorithmus/i });
        await userEvent.selectOptions(algorithmSelect, 'epsilon-greedy');

        // Assert
        expect(mockSetConfig).toHaveBeenCalledWith({ ...initialConfig, algorithm: 'epsilon-greedy' });
    });
});