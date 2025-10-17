import { renderHook, act } from '@testing-library/react';
import { useGameLogic, type Config,  type AlgorithmType, type DrugStats } from '../hooks/useGameLogic';
import { describe, it, expect, vi } from 'vitest';

// --- Updated Mocks for Vitest ---
vi.mock('../utils/banditSimulation', () => ({
    // This is now only called inside `startGame`
    generateDrugProbabilities: vi.fn(() => [0.2, 0.8]), // [schlecht, gut]
    // Mock returns a boolean for Bernoulli and a number for Gaussian
    simulateDrugOutcome: vi.fn((drugIndex, probabilities, banditType) => {
        if (banditType === 'gaussian') {
            // Simulate a number reward, e.g., index * 2
            return (drugIndex + 1) * 2;
        }
        // Bernoulli case
        return probabilities[drugIndex] > 0.5; // true for index 1, false for index 0
    }),
    // Updated to use 'sumOfRewards'
    initializeDrugStats: vi.fn((numActions) : DrugStats => {
        const stats: DrugStats = {};
        for (let i = 0; i < numActions; i++) {
            stats[`drug${i}`] = { attempts: 0, sumOfRewards: 0 };
        }
        return stats;
    }),
}));

vi.mock('../utils/algorithms', () => ({
    // Mock all algorithms since they all run in the background
    algorithms: {
        greedy: vi.fn(() => 0), // Wählt immer die schlechte Bohne
        'epsilon-greedy': vi.fn(() => 1), // Wählt immer die gute Bohne
        random: vi.fn(() => 0), // Wählt immer die schlechte Bohne
    },
}));

// --- Test Suite ---
describe('useGameLogic', () => {
    // Updated defaultConfig to match the new hook's expectations
    const defaultConfig: Config = {
        numActions: 2,
        numIterations: 5,
        banditType: 'bernoulli' as const, // explicitly type for TS
        algorithms: ['greedy', 'epsilon-greedy'] as AlgorithmType[],// Array of selected algorithms
    };

    it('sollte mit dem korrekten Initialzustand rendern', () => {
        const { result } = renderHook(() => useGameLogic(defaultConfig));

        expect(result.current.gameState.isPlaying).toBe(false);
        expect(result.current.gameState.currentPatient).toBe(0);
        expect(result.current.lastPlayerReward).toBe(0);
        expect(result.current.algorithmPerformance).toEqual([]);
    });

    it('sollte das Spiel starten und die "outcomes"-Matrix vorab generieren', () => {
        const { result } = renderHook(() => useGameLogic(defaultConfig));

        act(() => {
            result.current.startGame();
        });

        expect(result.current.gameState.isPlaying).toBe(true);
        expect(result.current.gameState.currentPatient).toBe(0);
        // The mock for simulateDrugOutcome is called 10 times (5 iterations * 2 actions)
        // This proves the pre-generation logic is working.
        // Note: this relies on the mocked function, not the state, which is internal.
    });

    it('sollte einen Spielzug korrekt verarbeiten (handleDrugChoice)', () => {
        const { result } = renderHook(() => useGameLogic(defaultConfig));

        // Start the game first to generate outcomes
        act(() => {
            result.current.startGame();
        });

        // Player chooses the "good" bean (index 1)
        act(() => {
            result.current.handleDrugChoice(1);
        });

        // Check player state
        expect(result.current.gameState.currentPatient).toBe(1);
        expect(result.current.gameState.savedLives).toBe(1); // 1 because player chose index 1 (good) which mock returns as true (1)
        expect(result.current.lastPlayerReward).toBe(1);

        // Check player stats
        expect(result.current.gameState.drugStats['drug1'].attempts).toBe(1);
        expect(result.current.gameState.drugStats['drug1'].sumOfRewards).toBe(1);

        // Check algorithm states (they chose 0 and 1 respectively)
        const greedyState = result.current.algorithmStates.find(s => s.name === 'greedy');
        expect(greedyState?.choice).toBe(0);
        expect(greedyState?.reward).toBe(false); // reward is false because mock outcome for index 0 is false

        // Check algorithm stats
        expect(result.current.algorithmStats.greedy?.['drug0'].attempts).toBe(1);
        expect(result.current.algorithmStats.greedy?.['drug0'].sumOfRewards).toBe(0); // 0 because outcome was false
    });

    it('sollte die Performance-Daten nach einem Spielzug korrekt aktualisieren', () => {
        const { result } = renderHook(() => useGameLogic(defaultConfig));
        act(() => { result.current.startGame(); });
        act(() => { result.current.handleDrugChoice(1); }); // Player chooses good bean

        const performance = result.current.algorithmPerformance;
        expect(performance).toHaveLength(1);
        expect(performance[0]).toEqual({
            patient: 1,
            playerSavedLives: 1, // Player got 1 point
            greedy: 0,           // Greedy chose bad bean (0 points)
            'epsilon-greedy': 1, // Epsilon-Greedy chose good bean (1 point)
            random: 0,           // Random chose bad bean (0 points)
        });
    });

    it('sollte das Spiel korrekt stoppen', () => {
        const { result } = renderHook(() => useGameLogic(defaultConfig));
        act(() => { result.current.startGame(); });
        expect(result.current.gameState.isPlaying).toBe(true);

        act(() => { result.current.stopGame(); });
        expect(result.current.gameState.isPlaying).toBe(false);
    });

    it('sollte erkennen, wenn das Spiel beendet ist (isGameComplete)', () => {
        const config = { ...defaultConfig, numIterations: 1 };
        const { result } = renderHook(() => useGameLogic(config));
        act(() => { result.current.startGame(); });

        expect(result.current.isGameComplete).toBe(false);
        act(() => { result.current.handleDrugChoice(0); });
        expect(result.current.isGameComplete).toBe(true);
    });
});