import {
  CharacterRole,
  GameState,
  GameAction,
  AIPersonality,
  AIDifficulty,
  Player,
  ACTION_DEFINITIONS
} from '@hamster-coup/shared';
import {
  getLegalActions,
  getEligibleResponders,
  RNG
} from '@hamster-coup/game-engine';

export interface AIResponseDecision {
  type: 'pass' | 'challenge' | 'block';
  claimedRole?: CharacterRole;
}

export class HamsterAI {
  /**
   * Card counting: Count how many copies of a role are known to this AI player.
   * Legitimate information ONLY:
   * - Publicly revealed cards on table
   * - AI's own hidden & revealed cards
   * - Inspected card if this AI was the inspector
   */
  static getKnownRoleCount(state: GameState, aiPlayerId: string, role: CharacterRole): number {
    let count = 0;

    // 1. All revealed cards on table
    for (const player of Object.values(state.players)) {
      for (const card of player.cards) {
        if (card.revealed && card.role === role) {
          count++;
        }
      }
    }

    // 2. AI player's own unrevealed cards
    const aiPlayer = state.players[aiPlayerId];
    if (aiPlayer) {
      for (const card of aiPlayer.cards) {
        if (!card.revealed && card.role === role) {
          count++;
        }
      }
    }

    // 3. Inspected card if currently available to this AI
    if (state.inspectState && state.inspectState.inspectorId === aiPlayerId) {
      if (state.inspectState.inspectedCard?.role === role) {
        count++;
      }
    }

    return count;
  }

  /**
   * Estimates the probability that an opponent holding hidden cards actually has the claimed role.
   * Returns a value between 0.0 (impossible / 100% bluff) and 1.0.
   */
  static estimateHasRoleProbability(
    state: GameState,
    aiPlayerId: string,
    targetPlayerId: string,
    role: CharacterRole
  ): number {
    const totalCopies = state.settings.copiesPerRole;
    const knownCopies = this.getKnownRoleCount(state, aiPlayerId, role);
    const remainingUnknownCopies = Math.max(0, totalCopies - knownCopies);

    if (remainingUnknownCopies === 0) {
      // All copies are accounted for! Opponent CANNOT have it.
      return 0.0;
    }

    // Total unknown cards in the game (deck + opponents' hidden cards)
    const target = state.players[targetPlayerId];
    if (!target) return 0.5;

    const targetHiddenCount = target.cards.filter((c) => !c.revealed).length;
    let totalOpponentsHiddenCount = 0;
    for (const [id, p] of Object.entries(state.players)) {
      if (id !== aiPlayerId && p.isAlive) {
        totalOpponentsHiddenCount += p.cards.filter((c) => !c.revealed).length;
      }
    }
    const totalUnknownCards = state.deck.length + totalOpponentsHiddenCount;

    if (totalUnknownCards === 0) return 0.0;

    // Probability that target holds at least 1 copy of the remaining unknown copies
    const probNoneInOneDraw = Math.max(0, (totalUnknownCards - remainingUnknownCopies) / totalUnknownCards);
    const probNoneInTargetHand = Math.pow(probNoneInOneDraw, targetHiddenCount);
    return Math.max(0, Math.min(1, 1 - probNoneInTargetHand));
  }

  /**
   * Decide action on AI turn
   */
  static decideAction(state: GameState, aiPlayerId: string, rng: RNG): GameAction {
    const legalActions = getLegalActions(state, aiPlayerId);
    if (legalActions.length === 0) {
      throw new Error(`No legal actions available for AI ${aiPlayerId}`);
    }

    const ai = state.players[aiPlayerId];
    const personality: AIPersonality = ai.aiPersonality || 'strategic';
    const difficulty: AIDifficulty = ai.aiDifficulty || 'normal';

    // If only one action is legal (e.g. Mandatory Coup), return it
    if (legalActions.length === 1) {
      return legalActions[0];
    }

    // Score each legal action
    const scoredActions = legalActions.map((action) => {
      let score = 10;
      const def = ACTION_DEFINITIONS[action.type];
      const hasClaimedCard = action.claimedRole
        ? ai.cards.some((c) => !c.revealed && c.role === action.claimedRole)
        : true;

      // Base action scores
      switch (action.type) {
        case 'coup':
          score += 45;
          // Prioritize eliminating opponents with 1 influence left
          if (action.targetId) {
            const target = state.players[action.targetId];
            const targetLivingCards = target.cards.filter((c) => !c.revealed).length;
            if (targetLivingCards === 1) score += 20;
            // Target the richest threat
            score += target.acorns * 3;
          }
          break;

        case 'assassinate':
          score += 35;
          if (action.targetId) {
            const target = state.players[action.targetId];
            const targetLivingCards = target.cards.filter((c) => !c.revealed).length;
            if (targetLivingCards === 1) score += 25;
            score += target.acorns * 2;
          }
          break;

        case 'tax':
          score += 30;
          break;

        case 'steal':
          score += 25;
          if (action.targetId) {
            const target = state.players[action.targetId];
            score += Math.min(2, target.acorns) * 8;
          }
          break;

        case 'exchange':
          // Useful if AI has poor cards or duplicates
          score += 18;
          break;

        case 'inquisitor_inspect':
          score += 22;
          break;

        case 'foreign_aid':
          score += 20;
          break;

        case 'income':
          score += 15;
          break;

        case 'convert_self':
          score += 10;
          break;

        case 'convert_other':
          score += 12;
          break;
      }

      // Truth vs Bluff evaluation
      if (action.claimedRole) {
        if (hasClaimedCard) {
          score += 25; // Truthful claims are safe
        } else {
          // Bluffing!
          const knownCopies = this.getKnownRoleCount(state, aiPlayerId, action.claimedRole);
          const copiesRiskPenalty = knownCopies * 15;
          score -= copiesRiskPenalty;

          // Personality bluff tendencies
          if (personality === 'deceptive') score += 18;
          else if (personality === 'aggressive') score += 10;
          else if (personality === 'cautious') score -= 25;
          else if (personality === 'defensive') score -= 15;

          // Difficulty bluff sanity: In Hard, do NOT bluff if 2 copies are known!
          if (difficulty === 'hard' && knownCopies >= 2) {
            score -= 100;
          }
        }
      }

      // Add small RNG noise to prevent robotic repetition
      const noise = rng.next() * (difficulty === 'easy' ? 20 : 5);
      return { action, score: score + noise };
    });

    scoredActions.sort((a, b) => b.score - a.score);
    return scoredActions[0].action;
  }

  /**
   * Decide response in response windows
   */
  static decideResponse(state: GameState, aiPlayerId: string, rng: RNG): AIResponseDecision {
    const ai = state.players[aiPlayerId];
    const personality: AIPersonality = ai.aiPersonality || 'strategic';
    const difficulty: AIDifficulty = ai.aiDifficulty || 'normal';

    if (state.phase === 'CHALLENGE_WINDOW') {
      const actorId = state.currentAction?.sourceId;
      const claimedRole = state.currentAction?.claimedRole;
      if (!actorId || !claimedRole) {
        return { type: 'pass' };
      }

      // Probability actor has the role
      const probHasRole = this.estimateHasRoleProbability(state, aiPlayerId, actorId, claimedRole);

      // If actor definitely DOES NOT have the role (prob == 0), 100% CHALLENGE!
      if (probHasRole === 0.0) {
        return { type: 'challenge' };
      }

      // Challenge thresholds based on difficulty & personality
      let challengeThreshold = 0.35; // Challenge if probHasRole <= threshold
      if (difficulty === 'easy') {
        return rng.next() < 0.15 ? { type: 'challenge' } : { type: 'pass' };
      }

      if (personality === 'cautious') challengeThreshold = 0.2;
      else if (personality === 'aggressive') challengeThreshold = 0.45;
      else if (personality === 'strategic') challengeThreshold = 0.35;

      // If AI is down to 1 life, be more cautious about losing life
      const myLife = ai.cards.filter((c) => !c.revealed).length;
      if (myLife === 1) {
        challengeThreshold -= 0.15;
      }

      // High stakes actions (e.g. Assassination targeted at someone)
      if (state.currentAction?.action.type === 'assassinate') {
        if (state.currentAction.targetId === aiPlayerId) {
          // If targeted by assassination and have no Contessa, challenging may be only survival chance!
          const hasContessa = ai.cards.some((c) => !c.revealed && c.role === 'contessa');
          if (!hasContessa) {
            challengeThreshold += 0.2;
          }
        }
      }

      if (probHasRole <= challengeThreshold) {
        return { type: 'challenge' };
      }

      return { type: 'pass' };
    }

    if (state.phase === 'BLOCK_WINDOW') {
      const actionType = state.currentAction?.action.type;
      const targetId = state.currentAction?.targetId;

      if (actionType === 'assassinate' && targetId === aiPlayerId) {
        // Targeted by Assassination!
        const hasContessa = ai.cards.some((c) => !c.revealed && c.role === 'contessa');
        if (hasContessa) {
          // Always truthfully block with Contessa
          return { type: 'block', claimedRole: 'contessa' };
        }

        // Doesn't have Contessa -> should we bluff block?
        const myLife = ai.cards.filter((c) => !c.revealed).length;
        if (myLife === 1) {
          // If we have 1 life left, taking the assassination means death. Bluffing gives a chance to survive if they pass!
          const bluffChance = personality === 'cautious' ? 0.4 : 0.8;
          if (rng.next() < bluffChance) {
            return { type: 'block', claimedRole: 'contessa' };
          }
        } else {
          // 2 lives left: bluff Contessa with moderate chance
          const bluffChance = personality === 'deceptive' ? 0.6 : 0.25;
          if (rng.next() < bluffChance) {
            return { type: 'block', claimedRole: 'contessa' };
          }
        }
        return { type: 'pass' };
      }

      if (actionType === 'steal' && targetId === aiPlayerId) {
        const hasCaptain = ai.cards.some((c) => !c.revealed && c.role === 'captain');
        const hasAmbassador = ai.cards.some((c) => !c.revealed && c.role === 'ambassador');
        const hasInquisitor = state.settings.inquisitorCanBlockSteal &&
          ai.cards.some((c) => !c.revealed && c.role === 'inquisitor');

        if (hasCaptain) return { type: 'block', claimedRole: 'captain' };
        if (hasAmbassador) return { type: 'block', claimedRole: 'ambassador' };
        if (hasInquisitor) return { type: 'block', claimedRole: 'inquisitor' };

        // Bluff block steal?
        if (ai.acorns >= 4 && (personality === 'deceptive' || personality === 'aggressive')) {
          return rng.next() < 0.4 ? { type: 'block', claimedRole: 'captain' } : { type: 'pass' };
        }
        return { type: 'pass' };
      }

      if (actionType === 'foreign_aid') {
        const hasDuke = ai.cards.some((c) => !c.revealed && c.role === 'duke');
        if (hasDuke) {
          return { type: 'block', claimedRole: 'duke' };
        }
        if (personality === 'aggressive' && rng.next() < 0.3) {
          return { type: 'block', claimedRole: 'duke' };
        }
        return { type: 'pass' };
      }

      return { type: 'pass' };
    }

    if (state.phase === 'BLOCK_CHALLENGE_WINDOW') {
      const blockerId = state.currentBlock?.blockerId;
      const claimedRole = state.currentBlock?.claimedRole;
      if (!blockerId || !claimedRole) return { type: 'pass' };

      const probHasRole = this.estimateHasRoleProbability(state, aiPlayerId, blockerId, claimedRole);
      if (probHasRole === 0.0) {
        // Definitely bluffing
        return { type: 'challenge' };
      }

      // If AI is the original actor whose assassination/steal was blocked
      const isOriginalActor = state.currentAction?.sourceId === aiPlayerId;
      const challengeThreshold = isOriginalActor ? 0.35 : 0.15;

      if (probHasRole <= challengeThreshold) {
        return { type: 'challenge' };
      }

      return { type: 'pass' };
    }

    return { type: 'pass' };
  }

  /**
   * Decide which influence card to lose/reveal
   */
  static decideInfluenceLoss(state: GameState, aiPlayerId: string, rng: RNG): string {
    const ai = state.players[aiPlayerId];
    const unrevealed = ai.cards.filter((c) => !c.revealed);
    if (unrevealed.length <= 1) {
      return unrevealed[0]?.id || '';
    }

    // Role priority to KEEP (higher score = want to keep more)
    const roleKeepValue: Record<CharacterRole, number> = {
      contessa: 50, // vital defensive shield
      assassin: 45, // powerful elimination
      duke: 40,     // great economy
      captain: 35,  // stealing & blocking steal
      inquisitor: 30,
      ambassador: 25
    };

    // Sort ascending by value (lowest value sacrificed first)
    unrevealed.sort((a, b) => roleKeepValue[a.role] - roleKeepValue[b.role]);
    return unrevealed[0].id;
  }

  /**
   * Decide which cards to keep in Ambassador / Inquisitor exchange
   */
  static decideExchangeCards(
    state: GameState,
    aiPlayerId: string,
    rng: RNG
  ): string[] {
    const ai = state.players[aiPlayerId];
    const exchange = state.exchangeState;
    if (!exchange) return [];

    const unrevealed = ai.cards.filter((c) => !c.revealed);
    const pool = [...unrevealed, ...exchange.drawnCards];

    // Priority rankings
    const roleValues: Record<CharacterRole, number> = {
      assassin: 50,
      contessa: 48,
      duke: 45,
      captain: 40,
      inquisitor: 35,
      ambassador: 30
    };

    // Prefer diverse hand over duplicates
    const selected: string[] = [];
    const chosenRoles = new Set<CharacterRole>();

    // Sort pool by value descending
    pool.sort((a, b) => roleValues[b.role] - roleValues[a.role]);

    for (const card of pool) {
      if (selected.length < exchange.keepCount && !chosenRoles.has(card.role)) {
        selected.push(card.id);
        chosenRoles.add(card.role);
      }
    }

    // Fill remaining if needed
    for (const card of pool) {
      if (selected.length < exchange.keepCount && !selected.includes(card.id)) {
        selected.push(card.id);
      }
    }

    return selected;
  }

  /**
   * Decide Inquisitor inspection force-exchange
   */
  static decideInspectAction(state: GameState, aiPlayerId: string, rng: RNG): boolean {
    const inspectedCard = state.inspectState?.inspectedCard;
    if (!inspectedCard) return false;

    // If opponent holds a dangerous role like Assassin or Duke, force them to return it!
    const dangerousRoles: CharacterRole[] = ['assassin', 'duke', 'captain'];
    return dangerousRoles.includes(inspectedCard.role);
  }
}
