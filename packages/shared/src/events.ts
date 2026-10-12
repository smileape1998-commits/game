import { z } from 'zod';
import { CharacterRole } from './characters.js';
import { ActionType } from './actions.js';
import { GameSettings, PublicGameState, InfluenceCard } from './models.js';

export const RoomCreateSchema = z.object({
  playerName: z.string().min(1).max(24),
  avatar: z.string().min(1),
  settings: z.custom<Partial<GameSettings>>().optional()
});

export const RoomJoinSchema = z.object({
  roomCode: z.string().min(4).max(8).toUpperCase(),
  playerName: z.string().min(1).max(24),
  avatar: z.string().min(1)
});

export const GameActionSchema = z.object({
  type: z.custom<ActionType>(),
  actorId: z.string(),
  targetId: z.string().optional(),
  claimedRole: z.custom<CharacterRole>().optional()
});

export const GameResponseSchema = z.object({
  type: z.enum(['pass', 'challenge', 'block']),
  claimedRole: z.custom<CharacterRole>().optional()
});

export const RevealInfluenceSchema = z.object({
  cardId: z.string()
});

export const ExchangeSelectSchema = z.object({
  keptCardIds: z.array(z.string())
});

export const InspectDecisionSchema = z.object({
  forceExchange: z.boolean()
});

export interface RoomParticipant {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  isAI: boolean;
  connected: boolean;
}

export interface RoomInfo {
  code: string;
  hostId: string;
  players: RoomParticipant[];
  settings: GameSettings;
  inGame: boolean;
}

export interface ServerToClientEvents {
  'room:update': (room: RoomInfo) => void;
  'game:state': (state: PublicGameState, myCards: InfluenceCard[]) => void;
  'game:error': (message: string) => void;
  'game:notification': (message: string) => void;
  'room:kicked': (message: string) => void;
}

export interface ClientToServerEvents {
  'room:create': (payload: z.infer<typeof RoomCreateSchema>, callback: (res: { success: boolean; roomCode?: string; error?: string }) => void) => void;
  'room:join': (payload: z.infer<typeof RoomJoinSchema>, callback: (res: { success: boolean; error?: string }) => void) => void;
  'room:leave': () => void;
  'room:ready': (ready: boolean) => void;
  'room:add_ai': (personality?: string, difficulty?: string) => void;
  'room:remove_player': (playerId: string) => void;
  'room:settings': (settings: GameSettings) => void;
  'game:start': () => void;
  'game:action': (action: z.infer<typeof GameActionSchema>) => void;
  'game:respond': (response: z.infer<typeof GameResponseSchema>) => void;
  'game:reveal_influence': (payload: z.infer<typeof RevealInfluenceSchema>) => void;
  'game:exchange_select': (payload: z.infer<typeof ExchangeSelectSchema>) => void;
  'game:inspect_decision': (payload: z.infer<typeof InspectDecisionSchema>) => void;
  'game:rematch': () => void;
}
