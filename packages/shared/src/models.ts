import { CharacterRole } from './characters.js';
import { ActionType } from './actions.js';

export type Faction = 'red' | 'blue' | 'neutral';

export type AIPersonality = 'cautious' | 'aggressive' | 'deceptive' | 'defensive' | 'strategic';
export type AIDifficulty = 'easy' | 'normal' | 'hard';

export interface InfluenceCard {
  id: string;
  role: CharacterRole;
  revealed: boolean;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isAI: boolean;
  aiPersonality?: AIPersonality;
  aiDifficulty?: AIDifficulty;
  acorns: number;
  faction: Faction;
  cards: InfluenceCard[];
  isAlive: boolean;
  connected: boolean;
}

export interface PublicPlayer {
  id: string;
  name: string;
  avatar: string;
  isAI: boolean;
  aiPersonality?: AIPersonality;
  aiDifficulty?: AIDifficulty;
  acorns: number;
  faction: Faction;
  influenceCount: number; // hidden living cards
  revealedCards: InfluenceCard[]; // cards flipped face-up
  isAlive: boolean;
  connected: boolean;
}

export type GamePhase =
  | 'LOBBY'
  | 'ACTION_SELECTION'
  | 'CHALLENGE_WINDOW'
  | 'BLOCK_WINDOW'
  | 'BLOCK_CHALLENGE_WINDOW'
  | 'INFLUENCE_SELECTION'
  | 'EXCHANGE_SELECTION'
  | 'INSPECT_CARD_VIEW'
  | 'GAME_OVER';

export interface GameSettings {
  minPlayers: number;
  maxPlayers: number;
  startingAcorns: number;
  mandatoryCoupThreshold: number;
  coupCost: number;
  assassinCost: number;
  captainStealAmount: number;
  copiesPerRole: number;
  enabledRoles: Record<CharacterRole, boolean>;
  refundAssassinOnChallengeFail: boolean;
  inquisitorCanBlockSteal: boolean;
  reformationEnabled: boolean;
  reformationFriendlyFireBlocked: boolean;
  convertSelfCost: number;
  convertOtherCost: number;
  responseTimeoutSeconds: number;
  preset: 'classic' | 'standard' | 'reformation' | 'custom';
}

export interface GameAction {
  type: ActionType;
  actorId: string;
  targetId?: string;
  claimedRole?: CharacterRole;
}

export interface CurrentActionState {
  action: GameAction;
  sourceId: string;
  targetId?: string;
  claimedRole?: CharacterRole;
}

export interface BlockState {
  blockerId: string;
  claimedRole: CharacterRole;
}

export interface ChallengeState {
  challengerId: string;
  targetId: string; // the player being challenged
  claimedRole: CharacterRole;
  isBlockChallenge: boolean;
}

export interface PendingInfluenceLoss {
  playerId: string;
  reason: 'coup' | 'assassination' | 'challenge_lost' | 'block_challenge_lost';
  nextPhaseAfterLoss?: GamePhase;
}

export interface ExchangeState {
  playerId: string;
  drawnCards: InfluenceCard[];
  originalCards: InfluenceCard[];
  keepCount: number;
}

export interface InspectState {
  inspectorId: string;
  targetId: string;
  inspectedCard?: InfluenceCard; // Only visible to inspector!
}

export interface EventLogEntry {
  id: string;
  timestamp: number;
  messageTh: string;
  messageEn: string;
  type: 'action' | 'challenge' | 'block' | 'reveal' | 'elimination' | 'system';
  actorId?: string;
  targetId?: string;
  role?: CharacterRole;
}

export interface GameState {
  id: string;
  roomCode: string;
  settings: GameSettings;
  phase: GamePhase;
  turnPlayerIndex: number;
  turnOrder: string[]; // player IDs
  players: Record<string, Player>;
  deck: InfluenceCard[];
  courtTreasury: number; // reformation almshouse/pool if used, or central acorns
  currentAction?: CurrentActionState;
  currentBlock?: BlockState;
  currentChallenge?: ChallengeState;
  pendingInfluenceLoss?: PendingInfluenceLoss;
  exchangeState?: ExchangeState;
  inspectState?: InspectState;
  passedPlayerIds: string[]; // players who passed during response window
  timerEndTime?: number;
  winnerPlayerId?: string;
  winningFaction?: Faction;
  history: EventLogEntry[];
  createdAt: number;
  turnCount: number;
}

export interface PublicGameState {
  id: string;
  roomCode: string;
  settings: GameSettings;
  phase: GamePhase;
  turnPlayerId: string;
  turnOrder: string[];
  players: Record<string, PublicPlayer>;
  deckCount: number;
  courtTreasury: number;
  currentAction?: CurrentActionState;
  currentBlock?: BlockState;
  currentChallenge?: ChallengeState;
  pendingInfluenceLoss?: PendingInfluenceLoss;
  // If the viewer is the exchanging player, their drawn cards are visible to them only
  exchangeDrawnCards?: InfluenceCard[];
  // If the viewer is the inspector, inspected card is visible to them only
  inspectedCard?: InfluenceCard;
  passedPlayerIds: string[];
  timerEndTime?: number;
  winnerPlayerId?: string;
  winningFaction?: Faction;
  history: EventLogEntry[];
  turnCount: number;
}
