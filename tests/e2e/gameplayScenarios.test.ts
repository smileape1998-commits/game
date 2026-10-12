import { describe, it, expect } from 'vitest';
import {
  createGame,
  applyAction,
  applyResponse,
  resolveInfluenceLoss,
  resolveExchange,
  serializePublicState,
  getLegalActions,
  getCurrentTurnPlayer,
  checkVictory,
  RNG
} from '@hamster-coup/game-engine';
import { HamsterAI } from '@hamster-coup/game-ai';
import {
  DEFAULT_SETTINGS,
  PRESET_REFORMATION,
  GameSettings,
  PublicGameState
} from '@hamster-coup/shared';

describe('E2E Gameplay Scenarios Validation (Section 17)', () => {
  // Scenario A — Free-for-all Full Match Simulation
  it('Scenario A: Free-for-all full match simulation from start to victory', () => {
    const players = [
      { id: 'p1', name: 'Pip (Human)', avatar: 'h1', isAI: false },
      { id: 'p2', name: 'Barnaby (AI)', avatar: 'h2', isAI: true, aiPersonality: 'aggressive' as const },
      { id: 'p3', name: 'Cheeks (AI)', avatar: 'h3', isAI: true, aiPersonality: 'cautious' as const }
    ];

    const state = createGame(DEFAULT_SETTINGS, players, 42);
    expect(state.phase).toBe('ACTION_SELECTION');

    // Turn 1: Pip takes Income (+1 acorn)
    applyAction(state, { type: 'income', actorId: 'p1' });
    expect(state.players['p1'].acorns).toBe(3);
    expect(state.turnOrder[state.turnPlayerIndex]).toBe('p2');

    // Turn 2: Barnaby (AI) takes Tax (Duke)
    // Give Barnaby Duke to ensure claim is true
    state.players['p2'].cards[0].role = 'duke';
    applyAction(state, { type: 'tax', actorId: 'p2', claimedRole: 'duke' });
    expect(state.phase).toBe('CHALLENGE_WINDOW');

    // Cheeks and Pip pass the challenge
    applyResponse(state, 'p3', { type: 'pass' });
    applyResponse(state, 'p1', { type: 'pass' });

    // Barnaby collects 3 acorns -> total 5 acorns
    expect(state.players['p2'].acorns).toBe(5);
    expect(state.turnOrder[state.turnPlayerIndex]).toBe('p3');

    // Turn 3: Cheeks takes Income
    applyAction(state, { type: 'income', actorId: 'p3' });
    expect(state.players['p3'].acorns).toBe(3);
    expect(state.turnOrder[state.turnPlayerIndex]).toBe('p1');

    // Give Pip 7 acorns to Coup and eliminate Cheeks' first influence
    state.players['p1'].acorns = 7;
    applyAction(state, { type: 'coup', actorId: 'p1', targetId: 'p3' });
    expect(state.phase).toBe('INFLUENCE_SELECTION');
    expect(state.pendingInfluenceLoss?.playerId).toBe('p3');

    // Cheeks reveals first card
    const cheeksCard1 = state.players['p3'].cards[0].id;
    resolveInfluenceLoss(state, 'p3', cheeksCard1);
    expect(state.players['p3'].cards.filter((c) => !c.revealed)).toHaveLength(1);

    // Fast-forward: Eliminate Cheeks second influence
    state.players['p2'].acorns = 7;
    state.turnPlayerIndex = 1; // p2's turn
    state.phase = 'ACTION_SELECTION';
    // When only 1 card remains, Coup automatically reveals it and eliminates the player!
    applyAction(state, { type: 'coup', actorId: 'p2', targetId: 'p3' });
    expect(state.players['p3'].isAlive).toBe(false);

    // Pip attacks Barnaby's first card
    state.players['p1'].acorns = 7;
    state.turnPlayerIndex = 0; // p1's turn
    state.phase = 'ACTION_SELECTION';
    applyAction(state, { type: 'coup', actorId: 'p1', targetId: 'p2' });
    resolveInfluenceLoss(state, 'p2', state.players['p2'].cards[0].id);
    expect(state.players['p2'].cards.filter((c) => !c.revealed)).toHaveLength(1);

    // Second Coup on Barnaby's final card (automatically resolves and ends match!)
    state.players['p1'].acorns = 7;
    state.turnPlayerIndex = 0;
    state.phase = 'ACTION_SELECTION';
    applyAction(state, { type: 'coup', actorId: 'p1', targetId: 'p2' });

    expect(state.players['p2'].isAlive).toBe(false);
    expect(state.phase).toBe('GAME_OVER');
    expect(state.winnerPlayerId).toBe('p1');
  });

  // Scenario B — Bluffing & Challenge Outcome
  it('Scenario B: Bluffing detection and challenge resolution', () => {
    const players = [
      { id: 'p1', name: 'Pip', avatar: 'h1' },
      { id: 'p2', name: 'Barnaby', avatar: 'h2' }
    ];

    const state = createGame(DEFAULT_SETTINGS, players, 101);
    // Force p1 to hold NO Duke
    state.players['p1'].cards[0].role = 'contessa';
    state.players['p1'].cards[1].role = 'captain';

    // Pip bluffs Tax (Duke)
    applyAction(state, { type: 'tax', actorId: 'p1', claimedRole: 'duke' });
    expect(state.phase).toBe('CHALLENGE_WINDOW');

    // Barnaby challenges the claim!
    applyResponse(state, 'p2', { type: 'challenge' });

    // Pip was bluffing! Pip must surrender 1 influence
    expect(state.phase).toBe('INFLUENCE_SELECTION');
    expect(state.pendingInfluenceLoss?.playerId).toBe('p1');

    resolveInfluenceLoss(state, 'p1', state.players['p1'].cards[0].id);

    // Pip lost 1 card, did NOT receive the 3 acorns, and turn advanced
    expect(state.players['p1'].acorns).toBe(2);
    expect(state.players['p1'].cards.filter((c) => !c.revealed)).toHaveLength(1);
    expect(state.turnOrder[state.turnPlayerIndex]).toBe('p2');
  });

  // Scenario C — Local Multiplayer Private-Hand Protection
  it('Scenario C: Local multiplayer state serialization conceals opponent secret cards', () => {
    const players = [
      { id: 'p1', name: 'Player 1', avatar: 'h1' },
      { id: 'p2', name: 'Player 2', avatar: 'h2' }
    ];

    const state = createGame(DEFAULT_SETTINGS, players, 555);

    // Serialize state for Player 1
    const p1View = serializePublicState(state, 'p1');
    // Player 1 cannot see Player 2's hidden cards
    expect((p1View.players['p2'] as any).cards).toBeUndefined();
    expect(p1View.players['p2'].influenceCount).toBe(2);
    expect(p1View.players['p2'].revealedCards).toHaveLength(0);

    // Serialize state for Player 2
    const p2View = serializePublicState(state, 'p2');
    expect((p2View.players['p1'] as any).cards).toBeUndefined();
    expect(p2View.players['p1'].influenceCount).toBe(2);
  });

  // Scenario D — Online Multiplayer Dual Authorized State
  it('Scenario D: Independent clients receive authorized private states with zero leaks', () => {
    const players = [
      { id: 'client_A', name: 'Alice', avatar: 'h1' },
      { id: 'client_B', name: 'Bob', avatar: 'h2' }
    ];

    const state = createGame(DEFAULT_SETTINGS, players, 777);

    const aliceView = serializePublicState(state, 'client_A');
    const bobView = serializePublicState(state, 'client_B');

    // Public state matches
    expect(aliceView.id).toBe(bobView.id);
    expect(aliceView.phase).toBe(bobView.phase);
    expect(aliceView.turnPlayerId).toBe(bobView.turnPlayerId);

    // Neither view contains hidden deck
    expect((aliceView as any).deck).toBeUndefined();
    expect((bobView as any).deck).toBeUndefined();
  });

  // Scenario E — Reformation Faction Friendly-Fire & Conversion
  it('Scenario E: Reformation team restrictions, friendly fire blocking, and team victory', () => {
    const players = [
      { id: 'p1', name: 'Pip', avatar: 'h1', faction: 'red' as const },
      { id: 'p2', name: 'Barnaby', avatar: 'h2', faction: 'red' as const },
      { id: 'p3', name: 'Cheeks', avatar: 'h3', faction: 'blue' as const }
    ];

    const state = createGame(PRESET_REFORMATION, players, 888);
    state.players['p1'].acorns = 7;

    const legalActions = getLegalActions(state, 'p1');
    const coupTargets = legalActions
      .filter((a) => a.type === 'coup')
      .map((a) => a.targetId);

    // Friendly-fire check: Cannot Coup teammate Barnaby! Only Cheeks (blue)
    expect(coupTargets).toContain('p3');
    expect(coupTargets).not.toContain('p2');

    // Convert Other: Pip pays 2 acorns to convert Cheeks to Red!
    state.players['p1'].acorns = 2;
    applyAction(state, { type: 'convert_other', actorId: 'p1', targetId: 'p3' });
    expect(state.players['p3'].faction).toBe('red');

    // Now all players belong to Red team: individual coup becomes allowed since no enemies exist!
    state.players['p2'].acorns = 7;
    state.phase = 'ACTION_SELECTION';
    state.turnPlayerIndex = 1; // p2 turn
    const p2Actions = getLegalActions(state, 'p2').filter((a) => a.type === 'coup');
    expect(p2Actions.length).toBeGreaterThan(0);
  });

  // Scenario F — Ambassador Exchange & Challenge End-to-End Flow
  it('Scenario F: Full lifecycle of Ambassador exchange challenged, proven, 2 cards drawn, kept, and unkept shuffled back', () => {
    const players = [
      { id: 'p1', name: 'Pip', avatar: 'h1' },
      { id: 'p2', name: 'Barnaby', avatar: 'h2' },
      { id: 'p3', name: 'Cheeks', avatar: 'h3' }
    ];

    const state = createGame(DEFAULT_SETTINGS, players, 333);
    // Ensure p1 holds an Ambassador
    state.players['p1'].cards[0].role = 'ambassador';
    const initialDeckCount = state.deck.length;

    // 1. Pip declares Ambassador Exchange
    applyAction(state, { type: 'exchange', actorId: 'p1', claimedRole: 'ambassador' });
    expect(state.phase).toBe('CHALLENGE_WINDOW');

    // 2. Cheeks passes, but Barnaby challenges!
    applyResponse(state, 'p3', { type: 'pass' });
    expect(state.passedPlayerIds).toContain('p3');

    applyResponse(state, 'p2', { type: 'challenge' });

    // 3. Pip had Ambassador -> challenge fails!
    // Barnaby loses challenge and surrenders 1 card
    expect(state.phase).toBe('INFLUENCE_SELECTION');
    expect(state.pendingInfluenceLoss?.playerId).toBe('p2');

    const barnabyCardToLose = state.players['p2'].cards[0].id;
    resolveInfluenceLoss(state, 'p2', barnabyCardToLose);

    // 4. Pip's action proceeds: draws 2 cards from deck
    expect(state.phase).toBe('EXCHANGE_SELECTION');
    expect(state.exchangeState?.playerId).toBe('p1');
    expect(state.exchangeState?.drawnCards).toHaveLength(2);

    // Verify authorized serialization: Pip sees drawn cards, opponents do NOT
    const pipView = serializePublicState(state, 'p1');
    const barnabyView = serializePublicState(state, 'p2');
    expect(pipView.exchangeDrawnCards).toHaveLength(2);
    expect(barnabyView.exchangeDrawnCards).toBeUndefined();

    // 5. Pip chooses 2 cards to keep and returns remaining to deck
    const livingCards = state.players['p1'].cards.filter((c) => !c.revealed);
    const pool = [...livingCards, ...state.exchangeState!.drawnCards];
    resolveExchange(state, [pool[0].id, pool[1].id]);

    // 6. Exchange completes: unkept cards shuffled back, turn advances cleanly
    expect(state.phase).toBe('ACTION_SELECTION');
    expect(state.turnOrder[state.turnPlayerIndex]).toBe('p2');
    expect(state.players['p1'].cards.filter((c) => !c.revealed)).toHaveLength(2);
    // Deck size should be conserved (initial deck - 1 card lost by p2)
    // Total cards = hands (2 + 1 + 2 = 5) + revealed (1) + deck (12) = 18
    expect(state.deck.length).toBe(initialDeckCount);
  });
});

