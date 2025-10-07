import { renderHook, act } from '@testing-library/react';
import { useGameLogic } from '../hooks/useGameLogic.tsx';

// --- Mocking mit Vitest ---
// Statt "jest.mock" wird "vi.mock" verwendet. Die Logik bleibt gleich.
vi.mock('../utils/banditSimulation', () => ({
    generateDrugProbabilities: vi.fn(() => [0.2, 0.8]), // [schlecht, gut]
    simulateDrugOutcome: vi.fn((drugIndex, probabilities) => {
        return probabilities[drugIndex] > 0.5;
    }),
    initializeDrugStats: vi.fn((numActions) => {
        const stats = {};
        for (let i = 0; i < numActions; i++) {
            stats[`drug${i}`] = { attempts: 0, successes: 0 };
        }
        return stats;
    }),
}));

vi.mock('../utils/algorithms', () => ({
    algorithms: {
        greedy: vi.fn(() => 0), // Mock-Algorithmus wählt immer die erste Option
    },
}));


// --- Test-Suite (bleibt 1:1 identisch zu Jest) ---
describe('useGameLogic', () => {
    const defaultConfig = {
        numActions: 2,
        numIterations: 10,
        banditType: 'bernoulli',
        algorithm: 'greedy',
    };

    it('sollte mit dem korrekten Initialzustand rendern', () => {
        const { result } = renderHook(() => useGameLogic(defaultConfig));
        expect(result.current.gameState.isPlaying).toBe(false);
        expect(result.current.gameState.currentPatient).toBe(0);
    });

    it('sollte das Spiel starten und den Zustand zurücksetzen', () => {
        const { result } = renderHook(() => useGameLogic(defaultConfig));
        act(() => {
            result.current.startGame();
        });
        expect(result.current.gameState.isPlaying).toBe(true);
    });

    // ... (alle anderen Testfälle von der Jest-Antwort können hier 1:1 eingefügt werden)
});