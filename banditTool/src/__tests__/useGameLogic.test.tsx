import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import { useGameLogic, type Config, type DrugStats } from '../hooks/useGameLogic';
import * as algorithmsModule from '../utils/algorithms';
import * as banditSimulation from '../utils/banditSimulation';

vi.mock('../utils/banditSimulation');

describe('useGameLogic Hook', () => {
    let defaultConfig: Config;
    let mockGreedy: Mock;
    let mockEpsilonGreedy: Mock;
    let mockUCB: Mock;

    beforeEach(() => {
        defaultConfig = {
            numActions: 3,
            numIterations: 10,
            banditType: 'bernoulli',
            algorithms: ['greedy', 'epsilon-greedy', 'ucb'],
        };

        vi.mocked(banditSimulation.initializeDrugStats).mockReturnValue({
            drug0: { attempts: 0, sumOfRewards: 0 },
            drug1: { attempts: 0, sumOfRewards: 0 },
            drug2: { attempts: 0, sumOfRewards: 0 },
        });

        vi.mocked(banditSimulation.generateDrugProbabilities).mockReturnValue([0.3, 0.7, 0.5]);
        vi.mocked(banditSimulation.simulateDrugOutcome).mockImplementation(
            (drugIndex: number) => drugIndex === 1
        );

        mockGreedy = vi.fn(() => 1);
        mockEpsilonGreedy = vi.fn(() => 0);
        mockUCB = vi.fn(() => 1);

        vi.spyOn(algorithmsModule.algorithms, 'greedy').mockImplementation(mockGreedy);
        vi.spyOn(algorithmsModule.algorithms, 'epsilon-greedy').mockImplementation(mockEpsilonGreedy);
        vi.spyOn(algorithmsModule.algorithms, 'ucb').mockImplementation(mockUCB);
        vi.spyOn(algorithmsModule.algorithms, 'random').mockImplementation(vi.fn(() => 2));
        vi.spyOn(algorithmsModule.algorithms, 'thompson').mockImplementation(vi.fn(() => 0));
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    describe('Initialisierung und Lifecycle', () => {
        it('sollte mit korrekten Initialwerten starten', () => {
            const { result } = renderHook(() => useGameLogic(defaultConfig));

            expect(result.current.gameState).toMatchObject({
                currentPatient: 0,
                savedLives: 0,
                isPlaying: false,
            });
            expect(result.current.isGameComplete).toBe(false);
            expect(result.current.algorithmPerformance).toEqual([]);
        });

        it('sollte Spiel starten und Outcomes vorgenerieren', () => {
            const { result } = renderHook(() => useGameLogic(defaultConfig));

            act(() => {
                result.current.startGame();
            });

            expect(result.current.gameState.isPlaying).toBe(true);
            expect(banditSimulation.generateDrugProbabilities).toHaveBeenCalledWith(3, 'bernoulli');
            expect(banditSimulation.simulateDrugOutcome).toHaveBeenCalledTimes(30); // 10 iterations * 3 drugs
        });

        it('sollte Spiel stoppen können', () => {
            const { result } = renderHook(() => useGameLogic(defaultConfig));

            act(() => {
                result.current.startGame();
                result.current.stopGame();
            });

            expect(result.current.gameState.isPlaying).toBe(false);
            expect(result.current.notification).toContain('Spiel beendet');
        });
    });

    describe('handleDrugChoice', () => {
        it('sollte nichts tun wenn Spiel nicht läuft', () => {
            const { result } = renderHook(() => useGameLogic(defaultConfig));

            act(() => {
                result.current.handleDrugChoice(0);
            });

            expect(result.current.gameState.currentPatient).toBe(0);
        });

        it('sollte Spieler-Statistiken korrekt aktualisieren', () => {
            const { result } = renderHook(() => useGameLogic(defaultConfig));

            act(() => {
                result.current.startGame();
                result.current.handleDrugChoice(1); // drug1 gibt true zurück
            });

            expect(result.current.gameState.currentPatient).toBe(1);
            expect(result.current.gameState.savedLives).toBe(1);
            expect(result.current.gameState.drugStats.drug1.attempts).toBe(1);
            expect(result.current.lastPlayerReward).toBe(1);
        });

        it('sollte Algorithmen simulieren und Performance tracken', () => {
            const { result } = renderHook(() => useGameLogic(defaultConfig));

            act(() => {
                result.current.startGame();
                result.current.handleDrugChoice(0);
            });

            expect(mockGreedy).toHaveBeenCalledWith(
                expect.any(Object),
                { numActions: 3, banditType: 'bernoulli' }
            );
            expect(mockEpsilonGreedy).toHaveBeenCalled();
            expect(mockUCB).toHaveBeenCalled();

            expect(result.current.algorithmPerformance).toHaveLength(1);
            expect(result.current.algorithmPerformance[0]).toHaveProperty('patient', 1);
        });

        it('sollte kumulative Performance korrekt berechnen', () => {
            const { result } = renderHook(() => useGameLogic(defaultConfig));

            act(() => {
                result.current.startGame();
                result.current.handleDrugChoice(1); // +1
                result.current.handleDrugChoice(1); // +1
            });

            expect(result.current.algorithmPerformance[1].playerSavedLives).toBe(2);
        });

        it('sollte bei max Iterationen stoppen', () => {
            const smallConfig = { ...defaultConfig, numIterations: 2 };
            const { result } = renderHook(() => useGameLogic(smallConfig));

            act(() => {
                result.current.startGame();
                result.current.handleDrugChoice(0);
                result.current.handleDrugChoice(0);
            });

            expect(result.current.isGameComplete).toBe(true);

            act(() => {
                result.current.handleDrugChoice(0);
            });

            expect(result.current.gameState.currentPatient).toBe(2); // unchanged
        });
    });

    describe('Bandit Types', () => {
        it('sollte Gaussian-Rewards korrekt verarbeiten', () => {
            const gaussianConfig: Config = { ...defaultConfig, banditType: 'gaussian' };
            vi.mocked(banditSimulation.simulateDrugOutcome).mockReturnValue(0.5);

            const { result } = renderHook(() => useGameLogic(gaussianConfig));

            act(() => {
                result.current.startGame();
                result.current.handleDrugChoice(0);
                result.current.handleDrugChoice(0);
            });

            expect(result.current.gameState.savedLives).toBe(1.0);
        });
    });

    describe('Edge Cases', () => {
        it('sollte mit vielen Drugs umgehen', () => {
            const manyDrugStats: DrugStats = {};
            for (let i = 0; i < 10; i++) {
                manyDrugStats[`drug${i}`] = { attempts: 0, sumOfRewards: 0 };
            }
            vi.mocked(banditSimulation.initializeDrugStats).mockReturnValue(manyDrugStats);

            const manyDrugsConfig = { ...defaultConfig, numActions: 10 };
            const { result } = renderHook(() => useGameLogic(manyDrugsConfig));

            act(() => {
                result.current.startGame();
                result.current.handleDrugChoice(5);
            });

            expect(result.current.gameState.drugStats.drug5.attempts).toBe(1);
        });
    });
});