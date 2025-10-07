import { render, screen } from '@testing-library/react';
import PerformanceChart from '../components/performanceChart.tsx';

// --- Setup: Mock für ResizeObserver (wichtig für recharts) ---
const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);


// --- Test-Suite für die PerformanceChart Komponente ---
describe('PerformanceChart', () => {

    // Testdaten für die Simulation
    const mockPerformanceData = [
        { patient: 1, playerSavedLives: 1, algorithmSavedLives: 0 },
        { patient: 2, playerSavedLives: 1, algorithmSavedLives: 1 },
    ];

    const defaultConfig = {
        numIterations: 10,
        algorithm: 'greedy',
    };

    // Test 1: Rendert die Komponente mit Daten korrekt?
    it('sollte den Titel und die Legenden-Einträge korrekt rendern, wenn Daten vorhanden sind', () => {
        // Arrange: Komponente mit Mock-Daten rendern
        render(
            <PerformanceChart
                algorithmPerformance={mockPerformanceData}
                config={defaultConfig}
            />
        );

        // Act & Assert: Überprüfen, ob die Texte im Dokument sichtbar sind
        // 1. Überprüfe den Titel
        expect(screen.getByText(/Performance Vergleich: Sie vs. Greedy/)).toBeInTheDocument();

        // 2. Überprüfe die Legenden-Einträge, die von den <Line> Komponenten generiert werden
        expect(screen.getByText('Ihre Performance')).toBeInTheDocument();
        expect(screen.getByText('Greedy Algorithmus')).toBeInTheDocument();
    });

    // Test 2: Was passiert, wenn keine Daten vorhanden sind?
    it('sollte auch ohne Performancedaten rendern und den Titel anzeigen (Platzhalter-Logik)', () => {
        // Arrange: Komponente mit einem leeren Array für die Performance-Daten rendern
        render(
            <PerformanceChart
                algorithmPerformance={[]}
                config={defaultConfig}
            />
        );

        // Act & Assert: Der Titel sollte trotzdem sichtbar sein
        expect(screen.getByText('Performance Vergleich: Sie vs. Greedy')).toBeInTheDocument();

        // Die Legenden-Einträge sollten auch im leeren Zustand vorhanden sein
        expect(screen.getByText('Ihre Performance')).toBeInTheDocument();
        expect(screen.getByText('Greedy Algorithmus')).toBeInTheDocument();
    });

    // Test 3: Funktioniert die Formatierung des Algorithmus-Namens?
    it('sollte einen Algorithmus-Namen mit Bindestrich korrekt formatieren', () => {
        // Arrange: Eine Konfiguration mit einem anderen Algorithmus-Namen
        const configWithHyphen = {
            numIterations: 10,
            algorithm: 'epsilon-greedy',
        };

        render(
            <PerformanceChart
                algorithmPerformance={mockPerformanceData}
                config={configWithHyphen}
            />
        );

        // Act & Assert: Überprüfe den formatierten Namen im Titel und in der Legende
        expect(screen.getByText('Performance Vergleich: Sie vs. Epsilon greedy')).toBeInTheDocument();
        expect(screen.getByText('Epsilon greedy Algorithmus')).toBeInTheDocument();
    });
});