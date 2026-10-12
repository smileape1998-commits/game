import { describe, it, expect } from 'vitest';
import {
  createGame,
  getLegalActions,
  applyAction,
  applyResponse,
  resolveInfluenceLoss,
  resolveExchange,
  serializePublicState,
  validateInvariants
} from '../src/engine.js';
import {
  PRESET_STANDARD,
  PRESET_REFORMATION,
  DEFAULT_SETTINGS
} from '@hamster-coup/shared';

describe('Hamster Coup Game Engine', () => {
  const players = [
    { id: 'p1', name: 'Pip (Human)', avatar: 'hamster1' },
    { id: 'p2', name: 'Barnaby (AI)', avatar: 'hamster2', isAI: true },
    { id: 'p3', name: 'Cheeks (AI)', avatar: 'hamster3', isAI: true }
  ];

  it('initializes game state correctly and validates invariants', () => {
    const state = createGame(DEFAULT_SETTINGS, players, 12345);

    expect(state.turnOrder).toHaveLength(3);
    expect(state.phase).toBe('ACTION_SELECTION');
    expect(state.players['p1'].acorns).toBe(2);
    expect(state.players['p1'].cards).toHaveLength(2);
    expect(state.players['p2'].cards).toHaveLength(2);
    expect(state.players['p3'].cards).toHaveLength(2);

    // Standard preset has 6 roles * 3 copies = 18 cards
    // 3 players * 2 cards = 6 cards dealt, remaining deck = 12 cards
    expect(state.deck).toHaveLength(12);

    expect(() => validateInvariants(state)).not.toThrow();
  });

  it('enforces Income action (+1 acorn, turn advances)', () => {
    const state = createGame(DEFAULT_SETTINGS, players, 12345);
    const turn1PlayerId = state.turnOrder[state.turnPlayerIndex];
    expect(turn1PlayerId).toBe('p1');

    applyAction(state, { type: 'income', actorId: 'p1' });

    expect(state.players['p1'].acorns).toBe(3);
    expect(state.turnOrder[state.turnPlayerIndex]).toBe('p2');
    expect(state.phase).toBe('ACTION_SELECTION');
  });

  it('enforces Mandatory Coup when a player has 10+ acorns', () => {
    const state = createGame(DEFAULT_SETTINGS, players, 12345);
    state.players['p1'].acorns = 10;

    const legalActions = getLegalActions(state, 'p1');
    expect(legalActions.length).toBeGreaterThan(0);
    // Every single legal action MUST be a Coup
    expect(legalActions.every((a) => a.type === 'coup')).toBe(true);

    // Cannot take income
    expect(() => applyAction(state, { type: 'income', actorId: 'p1' })).toThrow(/Illegal action/);

    // Coup against p2
    applyAction(state, { type: 'coup', actorId: 'p1', targetId: 'p2' });
    expect(state.players['p1'].acorns).toBe(3); // 10 - 7 = 3
    expect(state.phase).toBe('INFLUENCE_SELECTION');
    expect(state.pendingInfluenceLoss?.playerId).toBe('p2');
  });

  it('handles Tax (Duke) and challenge correctly when proven', () => {
    const state = createGame(DEFAULT_SETTINGS, players, 12345);
    // Force p1 to hold a Duke
    state.players['p1'].cards[0].role = 'duke';

    applyAction(state, { type: 'tax', actorId: 'p1', claimedRole: 'duke' });
    expect(state.phase).toBe('CHALLENGE_WINDOW');

    // p2 challenges p1
    applyResponse(state, 'p2', { type: 'challenge' }, 9999);

    // p1 has Duke, so p2 loses challenge and must select influence loss
    expect(state.phase).toBe('INFLUENCE_SELECTION');
    expect(state.pendingInfluenceLoss?.playerId).toBe('p2');

    // p2 selects their first card to reveal
    const p2CardId = state.players['p2'].cards[0].id;
    resolveInfluenceLoss(state, 'p2', p2CardId);

    // After challenge resolution, Tax resolves! p1 gains 3 acorns (2 + 3 = 5)
    expect(state.players['p1'].acorns).toBe(5);
    expect(state.turnOrder[state.turnPlayerIndex]).toBe('p2');
  });

  it('handles Tax (Duke) challenge when bluffing (challenge succeeds)', () => {
    const state = createGame(DEFAULT_SETTINGS, players, 12345);
    // Force p1 to hold NO Duke
    state.players['p1'].cards[0].role = 'assassin';
    state.players['p1'].cards[1].role = 'captain';

    applyAction(state, { type: 'tax', actorId: 'p1', claimedRole: 'duke' });
    expect(state.phase).toBe('CHALLENGE_WINDOW');

    // p2 challenges p1
    applyResponse(state, 'p2', { type: 'challenge' });

    // p1 was bluffing! p1 must lose influence
    expect(state.phase).toBe('INFLUENCE_SELECTION');
    expect(state.pendingInfluenceLoss?.playerId).toBe('p1');

    const p1CardId = state.players['p1'].cards[0].id;
    resolveInfluenceLoss(state, 'p1', p1CardId);

    // Action was cancelled! p1 does NOT get acorns
    expect(state.players['p1'].acorns).toBe(2);
    expect(state.turnOrder[state.turnPlayerIndex]).toBe('p2');
  });

  it('handles Steal (Captain) and Ambassador block', () => {
    const state = createGame(DEFAULT_SETTINGS, players, 12345);
    // p1 steals from p2
    applyAction(state, { type: 'steal', actorId: 'p1', targetId: 'p2', claimedRole: 'captain' });
    expect(state.phase).toBe('CHALLENGE_WINDOW');

    // p2 and p3 pass challenge
    applyResponse(state, 'p2', { type: 'pass' });
    applyResponse(state, 'p3', { type: 'pass' });

    // Moves to BLOCK_WINDOW (only target p2 can block)
    expect(state.phase).toBe('BLOCK_WINDOW');

    // p2 blocks claiming Ambassador
    applyResponse(state, 'p2', { type: 'block', claimedRole: 'ambassador' });
    expect(state.phase).toBe('BLOCK_CHALLENGE_WINDOW');

    // p1 passes block challenge (accepts block)
    applyResponse(state, 'p1', { type: 'pass' });
    applyResponse(state, 'p3', { type: 'pass' });

    // Block holds! Steal cancelled, acorns unchanged
    expect(state.players['p1'].acorns).toBe(2);
    expect(state.players['p2'].acorns).toBe(2);
    expect(state.turnOrder[state.turnPlayerIndex]).toBe('p2');
  });

  it('handles Ambassador card exchange flow', () => {
    const state = createGame(DEFAULT_SETTINGS, players, 12345);
    applyAction(state, { type: 'exchange', actorId: 'p1', claimedRole: 'ambassador' });

    // p2 and p3 pass challenge
    applyResponse(state, 'p2', { type: 'pass' });
    applyResponse(state, 'p3', { type: 'pass' });

    expect(state.phase).toBe('EXCHANGE_SELECTION');
    expect(state.exchangeState?.drawnCards).toHaveLength(2);
    expect(state.exchangeState?.keepCount).toBe(2);

    const pool = [
      ...state.players['p1'].cards.filter((c) => !c.revealed),
      ...state.exchangeState!.drawnCards
    ];

    // Pick 2 cards to keep
    const keptIds = [pool[0].id, pool[2].id];
    resolveExchange(state, keptIds);

    expect(state.players['p1'].cards.filter((c) => !c.revealed)).toHaveLength(2);
    expect(state.phase).toBe('ACTION_SELECTION');
    expect(state.turnOrder[state.turnPlayerIndex]).toBe('p2');
  });

  it('handles Reformation team restrictions and conversion', () => {
    const state = createGame(PRESET_REFORMATION, [
      { id: 'p1', name: 'Pip', avatar: 'h1', faction: 'red' },
      { id: 'p2', name: 'Barnaby', avatar: 'h2', faction: 'red' },
      { id: 'p3', name: 'Cheeks', avatar: 'h3', faction: 'blue' }
    ], 12345);

    expect(state.players['p1'].faction).toBe('red');
    expect(state.players['p2'].faction).toBe('red');
    expect(state.players['p3'].faction).toBe('blue');

    const p1Actions = getLegalActions(state, 'p1');
    // Cannot assassinate or steal from teammate p2 because enemy p3 is still alive!
    state.players['p1'].acorns = 7;
    const legalCoupTargets = getLegalActions(state, 'p1')
      .filter((a) => a.type === 'coup')
      .map((a) => a.targetId);

    expect(legalCoupTargets).toContain('p3');
    expect(legalCoupTargets).not.toContain('p2');

    // Convert self
    applyAction(state, { type: 'convert_self', actorId: 'p1' });
    expect(state.players['p1'].faction).toBe('blue');
    expect(state.players['p1'].acorns).toBe(6); // 7 - 1 = 6
  });

  it('masks secret cards in serializePublicState', () => {
    const state = createGame(DEFAULT_SETTINGS, players, 12345);

    // Serialize for spectator (no viewer ID)
    const publicState = serializePublicState(state);
    // Should NOT expose raw card roles of players
    expect((publicState.players['p1'] as any).cards).toBeUndefined();
    expect(publicState.players['p1'].influenceCount).toBe(2);
    expect(publicState.players['p1'].revealedCards).toHaveLength(0);

    // Deck cards should not be exposed, only deckCount
    expect((publicState as any).deck).toBeUndefined();
    expect(publicState.deckCount).toBe(12);
  });

  it('computes legal actions correctly from PublicGameState (including Tax / Duke)', () => {
    const state = createGame(DEFAULT_SETTINGS, players, 12345);
    const publicState = serializePublicState(state, 'p1');

    const legalActions = getLegalActions(publicState, 'p1');
    const actionTypes = legalActions.map((a) => a.type);

    // Tax (duke) must be legal
    expect(actionTypes).toContain('tax');
    expect(actionTypes).toContain('income');
    expect(actionTypes).toContain('foreign_aid');

    const taxAction = legalActions.find((a) => a.type === 'tax');
    expect(taxAction).toEqual({
      type: 'tax',
      actorId: 'p1',
      claimedRole: 'duke'
    });
  });

  describe('Ambassador (Exchange) Challenge Lifecycle & Single Influence Handling', () => {
    it('handles Ambassador challenged and proven when challenger has only 1 influence card', () => {
      // 3 players so the match does not immediately end when challenger is eliminated
      const state = createGame(DEFAULT_SETTINGS, players, 4321);
      // Give p1 an Ambassador
      state.players['p1'].cards[0].role = 'ambassador';
      // Set p2 to only 1 unrevealed card
      state.players['p2'].cards[0].revealed = true;

      expect(state.players['p2'].cards.filter((c) => !c.revealed)).toHaveLength(1);

      // p1 plays Ambassador
      applyAction(state, { type: 'exchange', actorId: 'p1', claimedRole: 'ambassador' });
      expect(state.phase).toBe('CHALLENGE_WINDOW');

      // p2 challenges p1
      applyResponse(state, 'p2', { type: 'challenge' });

      // p1 has Ambassador, so p2 loses challenge!
      // Since p2 had only 1 card left, p2 is automatically eliminated!
      expect(state.players['p2'].isAlive).toBe(false);

      // p1 was proven! p1's exchange action must still execute (enters EXCHANGE_SELECTION)
      expect(state.phase).toBe('EXCHANGE_SELECTION');
      expect(state.exchangeState?.drawnCards).toHaveLength(2);
      expect(state.exchangeState?.keepCount).toBe(2);

      // p1 completes exchange
      const livingCards = state.players['p1'].cards.filter((c) => !c.revealed);
      const pool = [...livingCards, ...state.exchangeState!.drawnCards];
      resolveExchange(state, [pool[0].id, pool[1].id]);

      // Turn advances to p3 (p2 is eliminated)
      expect(state.phase).toBe('ACTION_SELECTION');
      expect(state.turnOrder[state.turnPlayerIndex]).toBe('p3');
      expect(() => validateInvariants(state)).not.toThrow();
    });

    it('handles Ambassador challenged and proven when challenger has 2 influence cards', () => {
      const state = createGame(DEFAULT_SETTINGS, players, 5678);
      state.players['p1'].cards[0].role = 'ambassador';

      applyAction(state, { type: 'exchange', actorId: 'p1', claimedRole: 'ambassador' });
      expect(state.phase).toBe('CHALLENGE_WINDOW');

      // p2 challenges
      applyResponse(state, 'p2', { type: 'challenge' });

      // p2 has 2 cards, must select influence to lose
      expect(state.phase).toBe('INFLUENCE_SELECTION');
      expect(state.pendingInfluenceLoss?.playerId).toBe('p2');
      expect(state.pendingInfluenceLoss?.reason).toBe('challenge_lost');

      const p2CardToLose = state.players['p2'].cards[0].id;
      resolveInfluenceLoss(state, 'p2', p2CardToLose);

      // p2 lost 1 card and is still alive
      expect(state.players['p2'].cards.filter((c) => !c.revealed)).toHaveLength(1);
      expect(state.players['p2'].isAlive).toBe(true);

      // p1 proceeds with exchange
      expect(state.phase).toBe('EXCHANGE_SELECTION');
      expect(state.exchangeState?.drawnCards).toHaveLength(2);

      const livingCards = state.players['p1'].cards.filter((c) => !c.revealed);
      const pool = [...livingCards, ...state.exchangeState!.drawnCards];
      resolveExchange(state, [pool[1].id, pool[2].id]);

      // Exchange finished, turn advances to p2
      expect(state.phase).toBe('ACTION_SELECTION');
      expect(state.turnOrder[state.turnPlayerIndex]).toBe('p2');
      expect(() => validateInvariants(state)).not.toThrow();
    });

    it('handles Ambassador challenged when actor was bluffing with 1 influence card', () => {
      const state = createGame(DEFAULT_SETTINGS, players, 9999);
      // Ensure p1 does NOT hold Ambassador
      state.players['p1'].cards[0].role = 'assassin';
      state.players['p1'].cards[1].role = 'contessa';
      // p1 has only 1 unrevealed card left
      state.players['p1'].cards[1].revealed = true;
      expect(state.players['p1'].cards.filter((c) => !c.revealed)).toHaveLength(1);

      applyAction(state, { type: 'exchange', actorId: 'p1', claimedRole: 'ambassador' });
      expect(state.phase).toBe('CHALLENGE_WINDOW');

      // p2 challenges p1
      applyResponse(state, 'p2', { type: 'challenge' });

      // p1 was bluffing and only had 1 card left -> automatically revealed and eliminated!
      expect(state.players['p1'].isAlive).toBe(false);

      // Action cancelled, turn advances immediately to p2
      expect(state.phase).toBe('ACTION_SELECTION');
      expect(state.turnOrder[state.turnPlayerIndex]).toBe('p2');
      expect(state.currentAction).toBeUndefined();
      expect(state.exchangeState).toBeUndefined();
      expect(() => validateInvariants(state)).not.toThrow();
    });

    it('handles Ambassador challenged when actor was bluffing with 2 influence cards', () => {
      const state = createGame(DEFAULT_SETTINGS, players, 9999);
      state.players['p1'].cards[0].role = 'duke';
      state.players['p1'].cards[1].role = 'captain';

      applyAction(state, { type: 'exchange', actorId: 'p1', claimedRole: 'ambassador' });
      expect(state.phase).toBe('CHALLENGE_WINDOW');

      applyResponse(state, 'p2', { type: 'challenge' });

      // p1 must select which card to lose
      expect(state.phase).toBe('INFLUENCE_SELECTION');
      expect(state.pendingInfluenceLoss?.playerId).toBe('p1');

      resolveInfluenceLoss(state, 'p1', state.players['p1'].cards[0].id);

      // p1 lost 1 card, action cancelled, turn advances to p2
      expect(state.players['p1'].cards.filter((c) => !c.revealed)).toHaveLength(1);
      expect(state.phase).toBe('ACTION_SELECTION');
      expect(state.turnOrder[state.turnPlayerIndex]).toBe('p2');
      expect(state.currentAction).toBeUndefined();
      expect(state.exchangeState).toBeUndefined();
      expect(() => validateInvariants(state)).not.toThrow();
    });

    it('handles Coup against player with 1 influence card and advances turn properly', () => {
      const state = createGame(DEFAULT_SETTINGS, players, 1111);
      state.players['p1'].acorns = 7;
      state.players['p2'].cards[0].revealed = true; // p2 has 1 card left

      applyAction(state, { type: 'coup', actorId: 'p1', targetId: 'p2' });

      // p2 had only 1 card, coup automatically reveals it and eliminates p2!
      expect(state.players['p2'].isAlive).toBe(false);
      // Turn must advance automatically to p3
      expect(state.phase).toBe('ACTION_SELECTION');
      expect(state.turnOrder[state.turnPlayerIndex]).toBe('p3');
      expect(state.currentAction).toBeUndefined();
      expect(() => validateInvariants(state)).not.toThrow();
    });

    it('handles 3-player response window when first player passes and second challenges', () => {
      const state = createGame(DEFAULT_SETTINGS, players, 2222);
      state.players['p1'].cards[0].role = 'ambassador';

      applyAction(state, { type: 'exchange', actorId: 'p1', claimedRole: 'ambassador' });
      expect(state.phase).toBe('CHALLENGE_WINDOW');

      // p2 passes
      applyResponse(state, 'p2', { type: 'pass' });
      expect(state.passedPlayerIds).toContain('p2');
      expect(state.phase).toBe('CHALLENGE_WINDOW');

      // p3 challenges
      applyResponse(state, 'p3', { type: 'challenge' });

      // p3 must select card to lose (p1 had ambassador)
      expect(state.phase).toBe('INFLUENCE_SELECTION');
      expect(state.pendingInfluenceLoss?.playerId).toBe('p3');

      resolveInfluenceLoss(state, 'p3', state.players['p3'].cards[0].id);

      // After influence loss, p1 proceeds to exchange
      expect(state.phase).toBe('EXCHANGE_SELECTION');
      expect(state.exchangeState?.drawnCards).toHaveLength(2);

      const livingCards = state.players['p1'].cards.filter((c) => !c.revealed);
      const pool = [...livingCards, ...state.exchangeState!.drawnCards];
      resolveExchange(state, [pool[0].id, pool[1].id]);

      // Turn advances to p2!
      expect(state.phase).toBe('ACTION_SELECTION');
      expect(state.turnOrder[state.turnPlayerIndex]).toBe('p2');
      expect(state.passedPlayerIds).toHaveLength(0);
      expect(() => validateInvariants(state)).not.toThrow();
    });
  });
});

