import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

// --- FIX 1: Manueller Import der Test-Matcher ---
// Da die globale setupTests.ts-Datei ignoriert wird, laden wir die Funktionen hier direkt.
// Das löst den "Invalid Chai property: toBeInTheDocument"-Fehler.
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

// --- FIX 2: Mocking der Recharts-Komponenten ---
// Wir mocken die Bibliothek und ersetzen den "ResponsiveContainer", der im Test Probleme macht.
// Das löst den "Unable to find an element"-Fehler, da die Grafik jetzt gerendert wird.
vi.mock('recharts', async (importOriginal) => {
    const originalModule = await importOriginal();
    return {
        ...originalModule,
        ResponsiveContainer: ({ children }) => (
            <div className="recharts-responsive-container" style={{ width: '800px', height: '500px' }}>
                {children}
            </div>
        ),
    };
});

// Der ResizeObserver-Mock ist nicht mehr nötig, da wir den ResponsiveContainer ersetzen.

// Mocking der Spiellogik-Abhängigkeiten bleibt gleich
vi.mock('../utils/banditSimulation', () => ({ /* ... Mocks wie zuvor ... */ }));
vi.mock('../utils/algorithms', () => ({ /* ... Mocks wie zuvor ... */ }));

// --- Test-App bleibt gleich ---
const TestApp = () => { /* ... TestApp-Komponente wie zuvor ... */ };


describe('PerformanceChart Integrationstest', () => {

    it('wird erst nach Klick auf "Spiel starten" angezeigt und hat die korrekten Achsenbeschriftungen', async () => {
        const user = userEvent.setup();
        render(<TestApp />);

        expect(screen.queryByText(/Performance Vergleich/)).not.toBeInTheDocument();

        const startButton = screen.getByRole('button', { name: /spiel starten/i });
        await user.click(startButton);

        const chartTitle = await screen.findByText(/Performance Vergleich: Sie vs. Greedy/);
        expect(chartTitle).toBeInTheDocument();

        const chartContainer = chartTitle.closest('.performance-card');
        expect(chartContainer).not.toBeNull();

        const chart = within(chartContainer!);
        expect(await chart.findByText('Runde (Tasse)')).toBeInTheDocument();
        expect(await chart.findByText('Kumulierter Erfolg (Gerettete Tassen)')).toBeInTheDocument();
    });

    it('reagiert auf Klicks und zeigt die Legende der Daten an', async () => {
        const user = userEvent.setup();
        render(<TestApp />);

        await user.click(screen.getByRole('button', { name: /spiel starten/i }));

        const beanButton = await screen.findByRole('button', { name: 'Bohne 1' });
        await user.click(beanButton);

        const chartTitle = await screen.findByText(/Performance Vergleich/);
        const chartContainer = chartTitle.closest('.performance-card');
        const chart = within(chartContainer!);

        expect(await chart.findByText('Ihre Performance')).toBeInTheDocument();
        expect(await chart.findByText('Greedy Algorithmus')).toBeInTheDocument();
    });
});