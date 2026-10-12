import { describe, it, expect, vi, afterEach } from 'vitest';
import { DEFAULT_SETTINGS } from '@hamster-coup/shared';
import { useGameStore } from '../apps/web/src/state/gameStore';

afterEach(() => useGameStore.getState().exitToMenu());

describe('Temporary frontend defect reproduction', () => {
  it.each([
    ['tax', 'CHALLENGE_WINDOW'],
    ['foreign_aid', 'BLOCK_WINDOW']
  ])('local %s keeps control with the ineligible actor', (type, phase) => {
    useGameStore.getState().setSettings({ ...DEFAULT_SETTINGS });
    useGameStore.getState().startLocalGame(['A', 'B']);
    const actorId = useGameStore.getState().activeViewerPlayerId;
    useGameStore.getState().dispatchAction({ type, actorId, ...(type === 'tax' ? { claimedRole: 'duke' } : {}) } as any);
    const actual = useGameStore.getState();
    expect(actual.gameState?.phase).toBe(phase);
    expect(actual.activeViewerPlayerId).toBe(actorId);
    expect(actual.showPassDeviceModal).toBe(false);
    expect(actual.publicGameState?.currentAction?.sourceId).toBe(actorId);
    console.log(JSON.stringify({ action: type, phase: actual.gameState?.phase, viewer: actual.activeViewerPlayerId, curtain: actual.showPassDeviceModal }));
  });

  it('local coup keeps control with the attacker while the victim must reveal', () => {
    useGameStore.getState().setSettings({ ...DEFAULT_SETTINGS, startingAcorns: 7 });
    useGameStore.getState().startLocalGame(['A', 'B']);
    const actorId = useGameStore.getState().activeViewerPlayerId;
    const victimId = Object.keys(useGameStore.getState().gameState!.players).find(id => id !== actorId)!;
    useGameStore.getState().dispatchAction({ type: 'coup', actorId, targetId: victimId });
    const actual = useGameStore.getState();
    expect(actual.gameState?.phase).toBe('INFLUENCE_SELECTION');
    expect(actual.gameState?.pendingInfluenceLoss?.playerId).toBe(victimId);
    expect(actual.activeViewerPlayerId).toBe(actorId);
    expect(actual.showPassDeviceModal).toBe(false);
    console.log(JSON.stringify({ action: 'coup', phase: actual.gameState?.phase, viewer: actual.activeViewerPlayerId, victim: victimId, curtain: actual.showPassDeviceModal }));
  });

  it('online exit does not leave the server room', () => {
    const emit = vi.fn();
    useGameStore.setState({ gameMode: 'online', socket: { emit } as any });
    useGameStore.getState().exitToMenu();
    expect(useGameStore.getState().view).toBe('main_menu');
    expect(emit).not.toHaveBeenCalled();
    expect(useGameStore.getState().socket).not.toBeNull();
    useGameStore.setState({ socket: null });
  });
});
