import {
  CharacterRole,
  ActionType,
  ACTION_DEFINITIONS,
  GameState,
  Player,
  InfluenceCard,
  GameSettings,
  GameAction,
  PublicGameState,
  PublicPlayer,
  EventLogEntry,
  GamePhase,
  Faction,
  PendingInfluenceLoss
} from '@hamster-coup/shared';
import { RNG } from './random.js';

export interface CreatePlayerInput {
  id: string;
  name: string;
  avatar: string;
  isAI?: boolean;
  aiPersonality?: Player['aiPersonality'];
  aiDifficulty?: Player['aiDifficulty'];
  faction?: Faction;
}

export function createInitialDeck(settings: GameSettings, rng: RNG): InfluenceCard[] {
  const cards: InfluenceCard[] = [];
  let cardIndex = 1;

  const roles = Object.entries(settings.enabledRoles)
    .filter(([_, enabled]) => enabled)
    .map(([role]) => role as CharacterRole);

  for (const role of roles) {
    for (let c = 0; c < settings.copiesPerRole; c++) {
      cards.push({
        id: `card_${role}_${cardIndex++}`,
        role,
        revealed: false
      });
    }
  }

  return rng.shuffle(cards);
}

export function createGame(
  settings: GameSettings,
  playerInputs: CreatePlayerInput[],
  seed?: number,
  roomCode = 'HAMSTER'
): GameState {
  if (playerInputs.length < settings.minPlayers || playerInputs.length > settings.maxPlayers) {
    throw new Error(`Player count must be between ${settings.minPlayers} and ${settings.maxPlayers}`);
  }

  const minCardsNeeded = playerInputs.length * 2;
  const enabledRolesCount = Object.values(settings.enabledRoles).filter(Boolean).length;
  const totalDeckCards = enabledRolesCount * settings.copiesPerRole;

  if (totalDeckCards < minCardsNeeded) {
    throw new Error(`Deck has only ${totalDeckCards} cards, but ${minCardsNeeded} are required for ${playerInputs.length} players.`);
  }

  const rng = new RNG(seed);
  const deck = createInitialDeck(settings, rng);

  const players: Record<string, Player> = {};
  const turnOrder: string[] = [];

  let redCount = 0;
  let blueCount = 0;

  for (const input of playerInputs) {
    const card1 = deck.pop();
    const card2 = deck.pop();
    if (!card1 || !card2) {
      throw new Error('Not enough cards in deck during setup');
    }

    let faction: Faction = 'neutral';
    if (settings.reformationEnabled) {
      if (input.faction && input.faction !== 'neutral') {
        faction = input.faction;
      } else {
        // Balance teams
        if (redCount <= blueCount) {
          faction = 'red';
          redCount++;
        } else {
          faction = 'blue';
          blueCount++;
        }
      }
    }

    players[input.id] = {
      id: input.id,
      name: input.name,
      avatar: input.avatar,
      isAI: !!input.isAI,
      aiPersonality: input.aiPersonality,
      aiDifficulty: input.aiDifficulty,
      acorns: settings.startingAcorns,
      faction,
      cards: [card1, card2],
      isAlive: true,
      connected: true
    };
    turnOrder.push(input.id);
  }

  const state: GameState = {
    id: `game_${Date.now()}_${rng.nextInt(1000, 9999)}`,
    roomCode,
    settings,
    phase: 'ACTION_SELECTION',
    turnPlayerIndex: 0,
    turnOrder,
    players,
    deck,
    courtTreasury: 0,
    passedPlayerIds: [],
    history: [
      {
        id: `log_init_${Date.now()}`,
        timestamp: Date.now(),
        messageTh: 'การประลองเริ่มขึ้นแล้ว! จงปกป้องอิทธิพลและครอบครองลูกโอ๊กทองคำ',
        messageEn: 'The match has begun! Protect your influence and claim the Golden Acorns.',
        type: 'system'
      }
    ],
    createdAt: Date.now(),
    turnCount: 1
  };

  validateInvariants(state);
  return state;
}

export function getCurrentTurnPlayer(state: GameState): Player {
  const currentId = state.turnOrder[state.turnPlayerIndex];
  return state.players[currentId];
}

export function getLivingPlayers(state: GameState): Player[] {
  return state.turnOrder.map((id) => state.players[id]).filter((p) => p && p.isAlive);
}

export function getLivingOpponents(state: GameState, playerId: string): Player[] {
  return getLivingPlayers(state).filter((p) => p.id !== playerId);
}

export function canTargetPlayerInFaction(
  state: GameState | PublicGameState,
  actor: Player | PublicPlayer,
  target: Player | PublicPlayer
): boolean {
  if (!state.settings.reformationEnabled || !state.settings.reformationFriendlyFireBlocked) {
    return true;
  }
  if (actor.faction === 'neutral' || target.faction === 'neutral') {
    return true;
  }
  if (actor.faction !== target.faction) {
    return true;
  }
  // If actor and target are on the SAME faction, check if all other living players are also on this faction!
  const livingOpponents = Object.values(state.players).filter((p) => p && p.isAlive && p.id !== actor.id);
  const differentFactionOpponents = livingOpponents.filter((p) => p.faction !== actor.faction);
  return differentFactionOpponents.length === 0;
}

export function getLegalActions(state: GameState | PublicGameState, playerId: string): GameAction[] {
  if (state.phase !== 'ACTION_SELECTION') {
    return [];
  }

  const turnPlayerId =
    'turnPlayerId' in state
      ? state.turnPlayerId
      : state.turnOrder[state.turnPlayerIndex];

  if (turnPlayerId !== playerId) {
    return [];
  }

  const player = state.players[playerId];
  if (!player || !player.isAlive) {
    return [];
  }

  const actions: GameAction[] = [];
  const opponents = Object.values(state.players).filter((p) => p && p.isAlive && p.id !== playerId);

  // Mandatory Coup rule
  if (player.acorns >= state.settings.mandatoryCoupThreshold) {
    for (const opp of opponents) {
      if (canTargetPlayerInFaction(state, player, opp)) {
        actions.push({
          type: 'coup',
          actorId: player.id,
          targetId: opp.id
        });
      }
    }
    return actions;
  }

  // 1. Income (always legal)
  actions.push({
    type: 'income',
    actorId: player.id
  });

  // 2. Foreign Aid
  actions.push({
    type: 'foreign_aid',
    actorId: player.id
  });

  // 3. Coup
  if (player.acorns >= state.settings.coupCost) {
    for (const opp of opponents) {
      if (canTargetPlayerInFaction(state, player, opp)) {
        actions.push({
          type: 'coup',
          actorId: player.id,
          targetId: opp.id
        });
      }
    }
  }

  // 4. Tax (The Duke)
  if (state.settings.enabledRoles.duke) {
    actions.push({
      type: 'tax',
      actorId: player.id,
      claimedRole: 'duke'
    });
  }

  // 5. Assassinate (The Assassin)
  if (state.settings.enabledRoles.assassin && player.acorns >= state.settings.assassinCost) {
    for (const opp of opponents) {
      if (canTargetPlayerInFaction(state, player, opp)) {
        actions.push({
          type: 'assassinate',
          actorId: player.id,
          targetId: opp.id,
          claimedRole: 'assassin'
        });
      }
    }
  }

  // 6. Steal (The Captain)
  if (state.settings.enabledRoles.captain) {
    for (const opp of opponents) {
      if (opp.acorns > 0 && canTargetPlayerInFaction(state, player, opp)) {
        actions.push({
          type: 'steal',
          actorId: player.id,
          targetId: opp.id,
          claimedRole: 'captain'
        });
      }
    }
  }

  const deckCount = 'deckCount' in state ? state.deckCount : state.deck.length;

  // 7. Exchange (The Ambassador)
  if (state.settings.enabledRoles.ambassador && deckCount > 0) {
    actions.push({
      type: 'exchange',
      actorId: player.id,
      claimedRole: 'ambassador'
    });
  }

  // 8. Inquisitor actions
  if (state.settings.enabledRoles.inquisitor) {
    // Inspect
    for (const opp of opponents) {
      const oppHiddenCardsCount =
        'influenceCount' in opp
          ? opp.influenceCount
          : (opp as Player).cards.filter((c) => !c.revealed).length;

      if (oppHiddenCardsCount > 0 && canTargetPlayerInFaction(state, player, opp)) {
        actions.push({
          type: 'inquisitor_inspect',
          actorId: player.id,
          targetId: opp.id,
          claimedRole: 'inquisitor'
        });
      }
    }
    // Exchange
    if (deckCount > 0) {
      actions.push({
        type: 'inquisitor_exchange',
        actorId: player.id,
        claimedRole: 'inquisitor'
      });
    }
  }

  // 9. Reformation conversions
  if (state.settings.reformationEnabled) {
    if (player.acorns >= state.settings.convertSelfCost) {
      actions.push({
        type: 'convert_self',
        actorId: player.id
      });
    }
    if (player.acorns >= state.settings.convertOtherCost) {
      for (const opp of opponents) {
        actions.push({
          type: 'convert_other',
          actorId: player.id,
          targetId: opp.id
        });
      }
    }
  }

  return actions;
}

function addEventLog(
  state: GameState,
  entry: Omit<EventLogEntry, 'id' | 'timestamp'>
) {
  state.history.unshift({
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    ...entry
  });
  if (state.history.length > 100) {
    state.history.pop();
  }
}

export function applyAction(state: GameState, action: GameAction, seed?: number): GameState {
  if (state.phase !== 'ACTION_SELECTION') {
    throw new Error(`Cannot perform action in phase ${state.phase}`);
  }

  const actor = state.players[action.actorId];
  if (!actor || !actor.isAlive) {
    throw new Error('Actor is invalid or eliminated');
  }

  const currentTurnPlayer = getCurrentTurnPlayer(state);
  if (currentTurnPlayer.id !== actor.id) {
    throw new Error('It is not this player’s turn');
  }

  const legalActions = getLegalActions(state, actor.id);
  const isLegal = legalActions.some(
    (la) => la.type === action.type && la.targetId === action.targetId
  );

  if (!isLegal) {
    throw new Error(`Illegal action: ${action.type}`);
  }

  // Deduct costs
  if (action.type === 'coup') {
    actor.acorns -= state.settings.coupCost;
  } else if (action.type === 'assassinate') {
    actor.acorns -= state.settings.assassinCost;
  } else if (action.type === 'convert_self') {
    actor.acorns -= state.settings.convertSelfCost;
    state.courtTreasury += state.settings.convertSelfCost;
  } else if (action.type === 'convert_other') {
    actor.acorns -= state.settings.convertOtherCost;
    state.courtTreasury += state.settings.convertOtherCost;
  }

  state.currentAction = {
    action,
    sourceId: actor.id,
    targetId: action.targetId,
    claimedRole: action.claimedRole
  };
  state.passedPlayerIds = [];

  const target = action.targetId ? state.players[action.targetId] : undefined;
  const def = ACTION_DEFINITIONS[action.type];

  addEventLog(state, {
    type: 'action',
    actorId: actor.id,
    targetId: target?.id,
    role: action.claimedRole,
    messageTh: `${actor.name} ดำเนินการ: ${def.nameTh}${target ? ` (เป้าหมาย: ${target.name})` : ''}`,
    messageEn: `${actor.name} performs: ${def.nameEn}${target ? ` (Target: ${target.name})` : ''}`
  });

  // Action branch
  if (action.type === 'income') {
    actor.acorns += 1;
    advanceTurn(state);
  } else if (action.type === 'convert_self') {
    actor.faction = actor.faction === 'red' ? 'blue' : 'red';
    addEventLog(state, {
      type: 'system',
      actorId: actor.id,
      messageTh: `${actor.name} ได้เปลี่ยนฝ่ายเป็น ${actor.faction === 'red' ? 'ฝ่ายแดง' : 'ฝ่ายน้ำเงิน'}`,
      messageEn: `${actor.name} converted allegiance to ${actor.faction.toUpperCase()} team`
    });
    advanceTurn(state);
  } else if (action.type === 'convert_other' && target) {
    target.faction = target.faction === 'red' ? 'blue' : 'red';
    addEventLog(state, {
      type: 'system',
      actorId: actor.id,
      targetId: target.id,
      messageTh: `${actor.name} บังคับให้ ${target.name} เปลี่ยนฝ่ายเป็น ${target.faction === 'red' ? 'ฝ่ายแดง' : 'ฝ่ายน้ำเงิน'}`,
      messageEn: `${actor.name} forced ${target.name} to convert to ${target.faction.toUpperCase()} team`
    });
    advanceTurn(state);
  } else if (action.type === 'coup' && target) {
    // Unblockable, unchallengeable: target loses influence
    requestInfluenceLoss(state, target.id, 'coup');
  } else if (action.type === 'foreign_aid') {
    // Cannot be challenged, but CAN be blocked by Duke!
    state.phase = 'BLOCK_WINDOW';
    state.passedPlayerIds = [];
  } else {
    // Character claimed actions: opens challenge window!
    state.phase = 'CHALLENGE_WINDOW';
    state.passedPlayerIds = [];
  }

  validateInvariants(state);
  return state;
}

export function getEligibleResponders(state: GameState): string[] {
  const living = getLivingPlayers(state);
  if (state.phase === 'CHALLENGE_WINDOW') {
    // Anyone other than actor can challenge
    const actorId = state.currentAction?.sourceId;
    return living.filter((p) => p.id !== actorId).map((p) => p.id);
  } else if (state.phase === 'BLOCK_WINDOW') {
    // For targeted actions (Assassinate, Steal), ONLY target can block
    if (state.currentAction?.targetId) {
      return [state.currentAction.targetId];
    }
    // For untargeted blockable actions (Foreign Aid), any living opponent can block
    const actorId = state.currentAction?.sourceId;
    return living.filter((p) => p.id !== actorId).map((p) => p.id);
  } else if (state.phase === 'BLOCK_CHALLENGE_WINDOW') {
    // Anyone other than the blocker can challenge the block (especially the original actor)
    const blockerId = state.currentBlock?.blockerId;
    return living.filter((p) => p.id !== blockerId).map((p) => p.id);
  }
  return [];
}

export function applyResponse(
  state: GameState,
  playerId: string,
  response: { type: 'pass' | 'challenge' | 'block'; claimedRole?: CharacterRole },
  seed?: number
): GameState {
  const player = state.players[playerId];
  if (!player || !player.isAlive) {
    throw new Error('Invalid or eliminated responder');
  }

  const rng = new RNG(seed);

  if (state.phase === 'CHALLENGE_WINDOW') {
    if (response.type === 'challenge') {
      const actorId = state.currentAction?.sourceId;
      const claimedRole = state.currentAction?.claimedRole;
      if (!actorId || !claimedRole) {
        throw new Error('No valid action claim to challenge');
      }
      return executeChallenge(state, player.id, actorId, claimedRole, false, rng);
    } else if (response.type === 'pass') {
      if (!state.passedPlayerIds.includes(player.id)) {
        state.passedPlayerIds.push(player.id);
      }
      const eligible = getEligibleResponders(state);
      if (eligible.every((id) => state.passedPlayerIds.includes(id))) {
        // Everyone passed the challenge window!
        state.passedPlayerIds = [];
        const actionType = state.currentAction?.action.type;
        const def = actionType ? ACTION_DEFINITIONS[actionType] : undefined;

        if (def?.canBeBlocked) {
          state.phase = 'BLOCK_WINDOW';
        } else {
          resolveActionEffect(state, rng);
        }
      }
    }
  } else if (state.phase === 'BLOCK_WINDOW') {
    if (response.type === 'block') {
      if (!response.claimedRole) {
        throw new Error('Block response must specify claimed role');
      }
      const actionType = state.currentAction?.action.type;
      const def = actionType ? ACTION_DEFINITIONS[actionType] : undefined;
      let validBlockingRoles = def?.blockingRoles || [];
      if (actionType === 'steal' && state.settings.inquisitorCanBlockSteal) {
        validBlockingRoles = [...validBlockingRoles, 'inquisitor'];
      }

      if (!validBlockingRoles.includes(response.claimedRole)) {
        throw new Error(`Role ${response.claimedRole} cannot block action ${actionType}`);
      }

      state.currentBlock = {
        blockerId: player.id,
        claimedRole: response.claimedRole
      };
      state.phase = 'BLOCK_CHALLENGE_WINDOW';
      state.passedPlayerIds = [];

      addEventLog(state, {
        type: 'block',
        actorId: player.id,
        role: response.claimedRole,
        messageTh: `${player.name} ขัดขวางด้วยการอ้างบทบาท ${response.claimedRole}`,
        messageEn: `${player.name} blocks claiming ${response.claimedRole}`
      });
    } else if (response.type === 'pass') {
      if (!state.passedPlayerIds.includes(player.id)) {
        state.passedPlayerIds.push(player.id);
      }
      const eligible = getEligibleResponders(state);
      if (eligible.every((id) => state.passedPlayerIds.includes(id))) {
        // Everyone passed blocking window -> action resolves!
        resolveActionEffect(state, rng);
      }
    }
  } else if (state.phase === 'BLOCK_CHALLENGE_WINDOW') {
    if (response.type === 'challenge') {
      const blockerId = state.currentBlock?.blockerId;
      const claimedRole = state.currentBlock?.claimedRole;
      if (!blockerId || !claimedRole) {
        throw new Error('No valid block claim to challenge');
      }
      return executeChallenge(state, player.id, blockerId, claimedRole, true, rng);
    } else if (response.type === 'pass') {
      if (!state.passedPlayerIds.includes(player.id)) {
        state.passedPlayerIds.push(player.id);
      }
      const eligible = getEligibleResponders(state);
      if (eligible.every((id) => state.passedPlayerIds.includes(id))) {
        // Block was not challenged: Block stands! Action is cancelled.
        addEventLog(state, {
          type: 'system',
          messageTh: 'การขัดขวางสำเร็จ! การกระทำถูกยกเลิก',
          messageEn: 'Block succeeded! The action was cancelled.'
        });
        state.currentAction = undefined;
        state.currentBlock = undefined;
        advanceTurn(state);
      }
    }
  } else {
    throw new Error(`Cannot respond in phase ${state.phase}`);
  }

  validateInvariants(state);
  return state;
}

function executeChallenge(
  state: GameState,
  challengerId: string,
  targetId: string,
  claimedRole: CharacterRole,
  isBlockChallenge: boolean,
  rng: RNG
): GameState {
  const challenger = state.players[challengerId];
  const target = state.players[targetId];

  state.currentChallenge = {
    challengerId,
    targetId,
    claimedRole,
    isBlockChallenge
  };

  addEventLog(state, {
    type: 'challenge',
    actorId: challenger.id,
    targetId: target.id,
    role: claimedRole,
    messageTh: `${challenger.name} ท้าทาย ${target.name} ที่อ้างบทบาท ${claimedRole}!`,
    messageEn: `${challenger.name} challenges ${target.name} claiming ${claimedRole}!`
  });

  // Check if target possesses the claimed role in unrevealed cards
  const matchingCardIndex = target.cards.findIndex(
    (c) => !c.revealed && c.role === claimedRole
  );

  if (matchingCardIndex !== -1) {
    // TARGET HAS THE CARD -> CHALLENGE FAILS!
    // Target temporarily reveals card, gets replacement from deck, challenger loses influence.
    const provenCard = target.cards[matchingCardIndex];
    addEventLog(state, {
      type: 'reveal',
      actorId: target.id,
      role: claimedRole,
      messageTh: `${target.name} พิสูจน์ความจริง! มีไพ่ ${claimedRole} อยู่จริง ไพ่จะถูกสลับเข้ากองและจั่วใบใหม่`,
      messageEn: `${target.name} proved their claim with ${claimedRole}! Card returned to deck and replaced.`
    });

    // Return proven card to deck, shuffle, and deal replacement to target
    target.cards.splice(matchingCardIndex, 1);
    state.deck.push({ ...provenCard, revealed: false });
    rng.shuffle(state.deck);

    const replacement = state.deck.pop();
    if (replacement) {
      target.cards.push(replacement);
    }

    // Challenger loses 1 influence
    requestInfluenceLoss(state, challenger.id, isBlockChallenge ? 'block_challenge_lost' : 'challenge_lost');
  } else {
    // TARGET WAS BLUFFING -> CHALLENGE SUCCEEDS!
    addEventLog(state, {
      type: 'system',
      actorId: target.id,
      messageTh: `${target.name} พูดปด! ไม่ได้ถือไพ่ ${claimedRole}`,
      messageEn: `${target.name} was bluffing! They do not hold ${claimedRole}.`
    });

    // Challenged player loses 1 influence
    requestInfluenceLoss(state, target.id, isBlockChallenge ? 'block_challenge_lost' : 'challenge_lost');
  }

  validateInvariants(state);
  return state;
}

function requestInfluenceLoss(
  state: GameState,
  playerId: string,
  reason: PendingInfluenceLoss['reason']
) {
  const player = state.players[playerId];
  const unrevealed = player.cards.filter((c) => !c.revealed);

  if (unrevealed.length <= 1) {
    // Automatically reveal the last unrevealed card if only 1 remains
    if (unrevealed.length === 1) {
      resolveInfluenceLoss(state, playerId, unrevealed[0].id);
      return;
    }
  }

  state.phase = 'INFLUENCE_SELECTION';
  state.pendingInfluenceLoss = {
    playerId,
    reason
  };
}

export function resolveInfluenceLoss(
  state: GameState,
  playerId: string,
  cardId: string,
  seed?: number
): GameState {
  const player = state.players[playerId];
  if (!player) throw new Error('Player not found');

  const card = player.cards.find((c) => c.id === cardId && !c.revealed);
  if (!card) throw new Error('Card not found or already revealed');

  card.revealed = true;

  addEventLog(state, {
    type: 'reveal',
    actorId: player.id,
    role: card.role,
    messageTh: `${player.name} สูญเสียอิทธิพลและเปิดเผยไพ่: ${card.role}`,
    messageEn: `${player.name} lost influence and revealed: ${card.role}`
  });

  const remaining = player.cards.filter((c) => !c.revealed);
  if (remaining.length === 0) {
    player.isAlive = false;
    addEventLog(state, {
      type: 'elimination',
      actorId: player.id,
      messageTh: `${player.name} สูญเสียอิทธิพลทั้งหมดและถูกกำจัดออกจากเกม!`,
      messageEn: `${player.name} lost all influence and is eliminated!`
    });
  }

  // Check victory condition
  const victory = checkVictory(state);
  if (victory.isOver) {
    state.phase = 'GAME_OVER';
    state.winnerPlayerId = victory.winnerPlayerId;
    state.winningFaction = victory.winningFaction;
    addEventLog(state, {
      type: 'system',
      messageTh: victory.messageTh,
      messageEn: victory.messageEn
    });
    validateInvariants(state);
    return state;
  }

  const reason = state.pendingInfluenceLoss?.reason;
  state.pendingInfluenceLoss = undefined;

  const rng = new RNG(seed);

  // Resume lifecycle after challenge or attack resolution
  if (reason === 'coup') {
    // Coup done
    state.currentAction = undefined;
    advanceTurn(state);
  } else if (reason === 'assassination') {
    // Assassination done
    state.currentAction = undefined;
    state.currentBlock = undefined;
    advanceTurn(state);
  } else if (reason === 'challenge_lost') {
    const challenge = state.currentChallenge;
    state.currentChallenge = undefined;

    if (challenge && challenge.targetId === playerId) {
      // Challenged player lost (bluffed on action) -> action cancelled
      state.currentAction = undefined;
      advanceTurn(state);
    } else {
      // Challenger lost (action proven true!) -> proceed with action
      const actionType = state.currentAction?.action.type;
      const def = actionType ? ACTION_DEFINITIONS[actionType] : undefined;
      if (def?.canBeBlocked) {
        state.phase = 'BLOCK_WINDOW';
        state.passedPlayerIds = [];
      } else {
        resolveActionEffect(state, rng);
      }
    }
  } else if (reason === 'block_challenge_lost') {
    const challenge = state.currentChallenge;
    state.currentChallenge = undefined;

    if (challenge && challenge.targetId === playerId) {
      // Blocker lost (bluffed on block) -> block cancelled, action resolves!
      state.currentBlock = undefined;
      resolveActionEffect(state, rng);
    } else {
      // Challenger of the block lost -> block holds! Action cancelled.
      state.currentAction = undefined;
      state.currentBlock = undefined;
      advanceTurn(state);
    }
  }

  validateInvariants(state);
  return state;
}

function resolveActionEffect(state: GameState, rng: RNG) {
  const current = state.currentAction;
  if (!current) {
    advanceTurn(state);
    return;
  }

  const actor = state.players[current.sourceId];
  const target = current.targetId ? state.players[current.targetId] : undefined;

  switch (current.action.type) {
    case 'foreign_aid': {
      actor.acorns += 2;
      addEventLog(state, {
        type: 'action',
        actorId: actor.id,
        messageTh: `${actor.name} ได้รับ 2 ลูกโอ๊กทองคำจากความช่วยเหลือต่างแดน`,
        messageEn: `${actor.name} receives 2 Golden Acorns from Foreign Aid`
      });
      state.currentAction = undefined;
      state.currentBlock = undefined;
      advanceTurn(state);
      break;
    }
    case 'tax': {
      actor.acorns += 3;
      addEventLog(state, {
        type: 'action',
        actorId: actor.id,
        messageTh: `${actor.name} เก็บภาษี ได้รับ 3 ลูกโอ๊กทองคำ`,
        messageEn: `${actor.name} collects 3 Golden Acorns via Tax`
      });
      state.currentAction = undefined;
      advanceTurn(state);
      break;
    }
    case 'steal': {
      if (target) {
        const stealAmount = Math.min(state.settings.captainStealAmount, target.acorns);
        target.acorns -= stealAmount;
        actor.acorns += stealAmount;
        addEventLog(state, {
          type: 'action',
          actorId: actor.id,
          targetId: target.id,
          messageTh: `${actor.name} ปล้น ${stealAmount} ลูกโอ๊กทองคำจาก ${target.name}`,
          messageEn: `${actor.name} stole ${stealAmount} Golden Acorns from ${target.name}`
        });
      }
      state.currentAction = undefined;
      state.currentBlock = undefined;
      advanceTurn(state);
      break;
    }
    case 'assassinate': {
      if (target && target.isAlive) {
        addEventLog(state, {
          type: 'action',
          actorId: actor.id,
          targetId: target.id,
          messageTh: `${actor.name} ลอบสังหาร ${target.name} สำเร็จ!`,
          messageEn: `${actor.name} successfully assassinated ${target.name}!`
        });
        requestInfluenceLoss(state, target.id, 'assassination');
      } else {
        state.currentAction = undefined;
        advanceTurn(state);
      }
      break;
    }
    case 'exchange': {
      // Ambassador exchange: draw 2 cards
      const drawnCards: InfluenceCard[] = [];
      const drawCount = Math.min(2, state.deck.length);
      for (let i = 0; i < drawCount; i++) {
        const c = state.deck.pop();
        if (c) drawnCards.push(c);
      }
      const unrevealed = actor.cards.filter((c) => !c.revealed);

      state.phase = 'EXCHANGE_SELECTION';
      state.exchangeState = {
        playerId: actor.id,
        drawnCards,
        originalCards: unrevealed,
        keepCount: unrevealed.length
      };
      break;
    }
    case 'inquisitor_exchange': {
      // Inquisitor exchange: draw 1 card
      const drawnCards: InfluenceCard[] = [];
      const c = state.deck.pop();
      if (c) drawnCards.push(c);
      const unrevealed = actor.cards.filter((c) => !c.revealed);

      state.phase = 'EXCHANGE_SELECTION';
      state.exchangeState = {
        playerId: actor.id,
        drawnCards,
        originalCards: unrevealed,
        keepCount: unrevealed.length
      };
      break;
    }
    case 'inquisitor_inspect': {
      if (target) {
        const unrevealed = target.cards.filter((c) => !c.revealed);
        if (unrevealed.length > 0) {
          const inspectedCard = unrevealed[rng.nextInt(0, unrevealed.length - 1)];
          state.phase = 'INSPECT_CARD_VIEW';
          state.inspectState = {
            inspectorId: actor.id,
            targetId: target.id,
            inspectedCard
          };
          addEventLog(state, {
            type: 'action',
            actorId: actor.id,
            targetId: target.id,
            messageTh: `${actor.name} ตรวจค้นไพ่ลับของ ${target.name}`,
            messageEn: `${actor.name} privately inspected a card from ${target.name}`
          });
          return;
        }
      }
      state.currentAction = undefined;
      advanceTurn(state);
      break;
    }
    default: {
      state.currentAction = undefined;
      advanceTurn(state);
    }
  }
}

export function resolveExchange(
  state: GameState,
  keptCardIds: string[],
  seed?: number
): GameState {
  if (state.phase !== 'EXCHANGE_SELECTION' || !state.exchangeState) {
    throw new Error('Not in exchange phase');
  }

  const { playerId, drawnCards, keepCount } = state.exchangeState;
  const player = state.players[playerId];

  if (keptCardIds.length !== keepCount) {
    throw new Error(`Must select exactly ${keepCount} cards to keep`);
  }

  const livingOriginal = player.cards.filter((c) => !c.revealed);
  const revealedCards = player.cards.filter((c) => c.revealed);
  const pool = [...livingOriginal, ...drawnCards];

  const keptCards: InfluenceCard[] = [];
  const returnedCards: InfluenceCard[] = [];

  for (const card of pool) {
    if (keptCardIds.includes(card.id)) {
      keptCards.push(card);
    } else {
      returnedCards.push({ ...card, revealed: false });
    }
  }

  if (keptCards.length !== keepCount) {
    throw new Error('Invalid kept card IDs provided');
  }

  // Update player cards
  player.cards = [...revealedCards, ...keptCards];

  // Return unkept cards to deck & shuffle
  const rng = new RNG(seed);
  state.deck.push(...returnedCards);
  rng.shuffle(state.deck);

  addEventLog(state, {
    type: 'action',
    actorId: player.id,
    messageTh: `${player.name} แลกเปลี่ยนไพ่และสับไพ่ที่เหลือกลับเข้ากองเสร็จสิ้น`,
    messageEn: `${player.name} completed card exchange and shuffled remaining cards back to the deck`
  });

  state.exchangeState = undefined;
  state.currentAction = undefined;
  advanceTurn(state);

  validateInvariants(state);
  return state;
}

export function resolveInspectDecision(
  state: GameState,
  forceExchange: boolean,
  seed?: number
): GameState {
  if (state.phase !== 'INSPECT_CARD_VIEW' || !state.inspectState) {
    throw new Error('Not in inspect phase');
  }

  const { inspectorId, targetId, inspectedCard } = state.inspectState;
  const inspector = state.players[inspectorId];
  const target = state.players[targetId];

  if (forceExchange && inspectedCard) {
    const cardIdx = target.cards.findIndex((c) => c.id === inspectedCard.id);
    if (cardIdx !== -1) {
      target.cards.splice(cardIdx, 1);
      const rng = new RNG(seed);
      state.deck.push({ ...inspectedCard, revealed: false });
      rng.shuffle(state.deck);
      const replacement = state.deck.pop();
      if (replacement) {
        target.cards.push(replacement);
      }
      addEventLog(state, {
        type: 'action',
        actorId: inspector.id,
        targetId: target.id,
        messageTh: `${inspector.name} บังคับให้ ${target.name} คืนไพ่ที่ตรวจเข้ากองและจั่วใบใหม่!`,
        messageEn: `${inspector.name} forced ${target.name} to exchange their inspected card!`
      });
    }
  } else {
    addEventLog(state, {
      type: 'action',
      actorId: inspector.id,
      targetId: target.id,
      messageTh: `${inspector.name} อนุญาตให้ ${target.name} เก็บไพ่เดิมไว้`,
      messageEn: `${inspector.name} allowed ${target.name} to keep their card`
    });
  }

  state.inspectState = undefined;
  state.currentAction = undefined;
  advanceTurn(state);

  validateInvariants(state);
  return state;
}

export function advanceTurn(state: GameState) {
  state.currentAction = undefined;
  state.currentBlock = undefined;
  state.currentChallenge = undefined;
  state.pendingInfluenceLoss = undefined;
  state.exchangeState = undefined;
  state.inspectState = undefined;
  state.passedPlayerIds = [];

  const victory = checkVictory(state);
  if (victory.isOver) {
    state.phase = 'GAME_OVER';
    state.winnerPlayerId = victory.winnerPlayerId;
    state.winningFaction = victory.winningFaction;
    addEventLog(state, {
      type: 'system',
      messageTh: victory.messageTh,
      messageEn: victory.messageEn
    });
    return;
  }

  // Find next living player
  let nextIdx = (state.turnPlayerIndex + 1) % state.turnOrder.length;
  let attempts = 0;
  while (!state.players[state.turnOrder[nextIdx]].isAlive && attempts < state.turnOrder.length) {
    nextIdx = (nextIdx + 1) % state.turnOrder.length;
    attempts++;
  }

  state.turnPlayerIndex = nextIdx;
  state.turnCount++;
  state.phase = 'ACTION_SELECTION';

  const nextPlayer = getCurrentTurnPlayer(state);
  addEventLog(state, {
    type: 'system',
    actorId: nextPlayer.id,
    messageTh: `รอบที่ ${state.turnCount}: ตาของ ${nextPlayer.name}`,
    messageEn: `Turn ${state.turnCount}: ${nextPlayer.name}'s turn`
  });
}

export function checkVictory(state: GameState): {
  isOver: boolean;
  winnerPlayerId?: string;
  winningFaction?: Faction;
  messageTh: string;
  messageEn: string;
} {
  const living = getLivingPlayers(state);

  if (living.length === 0) {
    return {
      isOver: true,
      messageTh: 'ไม่มีผู้รอดชีวิต เสมอ!',
      messageEn: 'No survivors! Match ends in a draw.'
    };
  }

  if (living.length === 1) {
    const winner = living[0];
    return {
      isOver: true,
      winnerPlayerId: winner.id,
      winningFaction: winner.faction,
      messageTh: `ชัยชนะเป็นของ ${winner.name}! เหลือรอดเป็นคนสุดท้ายในอาณาจักรแฮมสเตอร์`,
      messageEn: `${winner.name} wins! The last surviving hamster in the kingdom.`
    };
  }

  // If Reformation is enabled and all surviving players belong to the SAME faction
  if (state.settings.reformationEnabled) {
    const factions = new Set(living.map((p) => p.faction).filter((f) => f !== 'neutral'));
    if (factions.size === 1) {
      const winningFaction = living[0].faction;
      return {
        isOver: true,
        winningFaction,
        messageTh: `ชัยชนะของทีม ${winningFaction === 'red' ? 'สีแดง' : 'สีน้ำเงิน'}! ศัตรูพ่ายแพ้ทั้งหมดแล้ว`,
        messageEn: `Victory for ${winningFaction.toUpperCase()} team! All opposing faction members eliminated.`
      };
    }
  }

  return {
    isOver: false,
    messageTh: '',
    messageEn: ''
  };
}

export function serializePublicState(
  state: GameState,
  viewerPlayerId?: string
): PublicGameState {
  const publicPlayers: Record<string, PublicPlayer> = {};

  for (const [id, player] of Object.entries(state.players)) {
    publicPlayers[id] = {
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      isAI: player.isAI,
      aiPersonality: player.aiPersonality,
      aiDifficulty: player.aiDifficulty,
      acorns: player.acorns,
      faction: player.faction,
      influenceCount: player.cards.filter((c) => !c.revealed).length,
      revealedCards: player.cards.filter((c) => c.revealed),
      isAlive: player.isAlive,
      connected: player.connected
    };
  }

  const currentTurnPlayer = getCurrentTurnPlayer(state);

  return {
    id: state.id,
    roomCode: state.roomCode,
    settings: state.settings,
    phase: state.phase,
    turnPlayerId: currentTurnPlayer?.id || '',
    turnOrder: state.turnOrder,
    players: publicPlayers,
    deckCount: state.deck.length,
    courtTreasury: state.courtTreasury,
    currentAction: state.currentAction,
    currentBlock: state.currentBlock,
    currentChallenge: state.currentChallenge,
    pendingInfluenceLoss: state.pendingInfluenceLoss,
    exchangeDrawnCards:
      state.exchangeState && viewerPlayerId && state.exchangeState.playerId === viewerPlayerId
        ? state.exchangeState.drawnCards
        : undefined,
    inspectedCard:
      state.inspectState && viewerPlayerId && state.inspectState.inspectorId === viewerPlayerId
        ? state.inspectState.inspectedCard
        : undefined,
    passedPlayerIds: state.passedPlayerIds,
    timerEndTime: state.timerEndTime,
    winnerPlayerId: state.winnerPlayerId,
    winningFaction: state.winningFaction,
    history: state.history,
    turnCount: state.turnCount
  };
}

export function validateInvariants(state: GameState) {
  // 1. Acorns >= 0
  for (const p of Object.values(state.players)) {
    if (p.acorns < 0) {
      throw new Error(`Player ${p.name} has negative acorns (${p.acorns})`);
    }
    // 2. Living player has at least 1 living card
    const unrevealed = p.cards.filter((c) => !c.revealed);
    if (p.isAlive && unrevealed.length === 0) {
      throw new Error(`Living player ${p.name} has 0 living cards`);
    }
    // 3. Eliminated player has 0 living cards
    if (!p.isAlive && unrevealed.length > 0) {
      throw new Error(`Eliminated player ${p.name} still has unrevealed cards`);
    }
  }

  // 4. Card conservation: sum of all cards in players hands + deck = total cards
  const totalInHands = Object.values(state.players).reduce(
    (sum, p) => sum + p.cards.length,
    0
  );
  const totalDrawnInExchange = state.exchangeState ? state.exchangeState.drawnCards.length : 0;
  const totalCards = totalInHands + state.deck.length + totalDrawnInExchange;

  const enabledRolesCount = Object.values(state.settings.enabledRoles).filter(Boolean).length;
  const expectedTotal = enabledRolesCount * state.settings.copiesPerRole;

  if (totalCards !== expectedTotal) {
    throw new Error(
      `Card conservation violated! Expected ${expectedTotal} cards, found ${totalCards}`
    );
  }
}
