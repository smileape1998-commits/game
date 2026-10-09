import { describe, it, expect } from 'vitest';
import { createGame, applyAction, RNG } from '@hamster-coup/game-engine';
import { DEFAULT_SETTINGS, CharacterRole } from '@hamster-coup/shared';
import { HamsterAI } from '../src/ai.js';

describe('Hamster Game AI', () => {
  const players = [
    { id: 'p1', name: 'Pip', avatar: 'h1', isAI: false },
    { id: 'p2', name: 'Barnaby (AI)', avatar: 'h2', isAI: true, aiPersonality: 'strategic' as const, aiDifficulty: 'hard' as const },
    { id: 'p3', name: 'Cheeks (AI)', avatar: 'h3', isAI: true, aiPersonality: 'cautious' as const, aiDifficulty: 'normal' as const }
  ];

  it('selects legal actions and enforces mandatory Coup at 10 acorns', () => {
    const rng = new RNG(42);
    const state = createGame(DEFAULT_SETTINGS, players, 100);

    // Give p1 10 acorns
    state.players['p1'].acorns = 10;
    const action = HamsterAI.decideAction(state, 'p1', rng);
    expect(action.type).toBe('coup');
    expect(action.targetId).toBeDefined();
  });

  it('detects 100% bluffs through card counting without reading opponent secrets', () => {
    const rng = new RNG(42);
    const state = createGame(DEFAULT_SETTINGS, players, 100);

    // AI holds 2 Dukes
    state.players['p2'].cards[0].role = 'duke';
    state.players['p2'].cards[1].role = 'duke';

    // 1 Duke was previously revealed by p3
    state.players['p3'].cards[0].role = 'duke';
    state.players['p3'].cards[0].revealed = true;

    // Total copies of Duke in game = 3. AI knows all 3 are accounted for!
    const knownCopies = HamsterAI.getKnownRoleCount(state, 'p2', 'duke');
    expect(knownCopies).toBe(3);

    const prob = HamsterAI.estimateHasRoleProbability(state, 'p2', 'p1', 'duke');
    expect(prob).toBe(0.0);

    // Pip (p1) claims Tax (Duke)
    state.phase = 'ACTION_SELECTION';
    applyAction(state, { type: 'tax', actorId: 'p1', claimedRole: 'duke' });

    // Barnaby (p2) responds: since prob is 0, Barnaby MUST challenge!
    const decision = HamsterAI.decideResponse(state, 'p2', rng);
    expect(decision.type).toBe('challenge');
  });

  it('blocks assassination truthfully when holding Contessa', () => {
    const rng = new RNG(42);
    const state = createGame(DEFAULT_SETTINGS, players, 100);

    // Give p1 acorns for assassination
    state.players['p1'].acorns = 3;
    // Give p2 a Contessa
    state.players['p2'].cards[0].role = 'contessa';

    applyAction(state, { type: 'assassinate', actorId: 'p1', targetId: 'p2', claimedRole: 'assassin' });

    // In CHALLENGE_WINDOW, p2 passes (or might challenge)
    // Advance to BLOCK_WINDOW
    state.phase = 'BLOCK_WINDOW';

    const decision = HamsterAI.decideResponse(state, 'p2', rng);
    expect(decision.type).toBe('block');
    expect(decision.claimedRole).toBe('contessa');
  });

  it('is deterministic when using a fixed RNG seed', () => {
    const state = createGame(DEFAULT_SETTINGS, players, 100);
    const rng1 = new RNG(999);
    const rng2 = new RNG(999);

    const action1 = HamsterAI.decideAction(state, 'p1', rng1);
    const action2 = HamsterAI.decideAction(state, 'p1', rng2);

    expect(action1).toEqual(action2);
  });
});
