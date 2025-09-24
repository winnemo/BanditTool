import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

// Die zu testende Komponente importieren
import ConfigurationPanel from '../components/configuration.tsx';

// Eine Gruppe von Tests für die ConfigurationPanel-Komponente
describe('ConfigurationPanel', () => {

    // Ein Standard-Konfigurationsobjekt für die Tests
    const initialConfig = {
        numActions: 10,
        numIterations: 100,
        banditType: 'bernoulli',
        algorithm: 'greedy',
    };

    // Testfall 1: Überprüft, ob die Komponente mit den Startwerten korrekt angezeigt wird.
    test('sollte mit initialen Werten korrekt rendern', () => {
        // Arrange: Rendere die Komponente mit den Start-Props
        render(<ConfigurationPanel config={initialConfig} setConfig={() => {}} />);

        // Assert: Überprüfe, ob die Elemente auf dem Bildschirm sind und die richtigen Werte haben
        expect(screen.getByRole('heading', { name: /konfiguration/i })).toBeInTheDocument();

        // Überprüfe die spezifischen Input-Elemente anhand ihrer IDs
        const numActionsNumber = document.getElementById('numActions-number');
        const numActionsRange = document.getElementById('numActions-range');
        const numIterationsNumber = document.getElementById('numIterations-number');
        const numIterationsRange = document.getElementById('numIterations-range');
        const banditTypeSelect = document.getElementById('banditType');
        const algorithmSelect = document.getElementById('algorithm');

        expect(numActionsNumber).toHaveValue(10);
        expect(numActionsRange).toHaveValue('10');
        expect(numIterationsNumber).toHaveValue(100);
        expect(numIterationsRange).toHaveValue('100');
        expect(banditTypeSelect).toHaveValue('bernoulli');
        expect(algorithmSelect).toHaveValue('greedy');
    });

    // Testfall 2: Überprüft, ob das Ändern der Anzahl Medikamente (Number Input) funktioniert
    test('sollte setConfig aufrufen, wenn die Anzahl der Medikamente per Zahleneingabe geändert wird', () => {
        // Arrange
        const mockSetConfig = vi.fn();
        render(<ConfigurationPanel config={initialConfig} setConfig={mockSetConfig} />);

        // Act: Finde das spezifische Number-Input anhand seiner ID
        const drugNumberInput = document.getElementById('numActions-number');
        fireEvent.change(drugNumberInput, { target: { value: '25' } });

        // Assert
        expect(mockSetConfig).toHaveBeenCalledWith({ ...initialConfig, numActions: 25 });
    });

    // Testfall 3: Überprüft, ob das Ändern des Medikamente-Sliders funktioniert
    test('sollte setConfig aufrufen, wenn der Medikamente-Slider geändert wird', () => {
        // Arrange
        const mockSetConfig = vi.fn();
        render(<ConfigurationPanel config={initialConfig} setConfig={mockSetConfig} />);

        // Act: Finde den Range-Input anhand seiner ID
        const drugSlider = document.getElementById('numActions-range');
        fireEvent.change(drugSlider, { target: { value: '30' } });

        // Assert
        expect(mockSetConfig).toHaveBeenCalledWith({ ...initialConfig, numActions: 30 });
    });

    // Testfall 4: Überprüft, ob das Ändern der Patienten-Anzahl (Number Input) funktioniert
    test('sollte setConfig aufrufen, wenn die Patienten-Anzahl per Zahleneingabe geändert wird', () => {
        // Arrange
        const mockSetConfig = vi.fn();
        render(<ConfigurationPanel config={initialConfig} setConfig={mockSetConfig} />);

        // Act: Finde den Number-Input anhand seiner ID
        const patientNumberInput = document.getElementById('numIterations-number');
        fireEvent.change(patientNumberInput, { target: { value: '750' } });

        // Assert
        expect(mockSetConfig).toHaveBeenCalledWith({ ...initialConfig, numIterations: 750 });
    });

    // Testfall 6: Überprüft, ob das Ändern des Bandit-Typs funktioniert
    test('sollte setConfig aufrufen, wenn der Bandit-Typ geändert wird', async () => {
        // Arrange
        const mockSetConfig = vi.fn();
        render(<ConfigurationPanel config={initialConfig} setConfig={mockSetConfig} />);

        // Act: Finde das Select-Element anhand seiner ID
        const banditSelect = document.getElementById('banditType');
        await userEvent.selectOptions(banditSelect, 'gaussian');

        // Assert
        expect(mockSetConfig).toHaveBeenCalledWith({ ...initialConfig, banditType: 'gaussian' });
    });

    // Testfall 7: Überprüft, ob das Ändern des Algorithmus funktioniert
    test('sollte setConfig aufrufen, wenn der Algorithmus geändert wird', async () => {
        // Arrange
        const mockSetConfig = vi.fn();
        render(<ConfigurationPanel config={initialConfig} setConfig={mockSetConfig} />);

        // Act: Finde das Algorithmus-Select anhand seiner ID
        const algorithmSelect = document.getElementById('algorithm');
        await userEvent.selectOptions(algorithmSelect, 'epsilon-greedy');

        // Assert
        expect(mockSetConfig).toHaveBeenCalledWith({ ...initialConfig, algorithm: 'epsilon-greedy' });
    });

    // Testfall 8: Überprüft, ob alle Labels vorhanden sind
    test('sollte alle erforderlichen Labels anzeigen', () => {
        // Arrange
        render(<ConfigurationPanel config={initialConfig} setConfig={() => {}} />);

        // Assert: Überprüfe, ob alle Labels vorhanden sind
        expect(screen.getByText('Anzahl Medikamente')).toBeInTheDocument();
        expect(screen.getByText('Anzahl Patienten')).toBeInTheDocument();
        expect(screen.getByText('Bandit-Typ')).toBeInTheDocument();
        expect(screen.getByText('Algorithmus')).toBeInTheDocument();
    });

    // Testfall 9: Überprüft, ob alle Optionen in den Select-Elementen vorhanden sind
    test('sollte alle Optionen in den Dropdown-Menüs anzeigen', () => {
        // Arrange
        render(<ConfigurationPanel config={initialConfig} setConfig={() => {}} />);

        // Assert: Überprüfe Bandit-Typ Optionen
        const banditSelect = document.getElementById('banditType');
        expect(banditSelect.querySelector('option[value="bernoulli"]')).toBeInTheDocument();
        expect(banditSelect.querySelector('option[value="gaussian"]')).toBeInTheDocument();

        // Überprüfe Algorithmus Optionen
        const algorithmSelect = document.getElementById('algorithm');
        expect(algorithmSelect.querySelector('option[value="greedy"]')).toBeInTheDocument();
        expect(algorithmSelect.querySelector('option[value="epsilon-greedy"]')).toBeInTheDocument();
        expect(algorithmSelect.querySelector('option[value="random"]')).toBeInTheDocument();
    });
});