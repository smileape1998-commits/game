import { Server, Socket } from 'socket.io';
import {
  GameSettings,
  GameState,
  GameAction,
  CharacterRole,
  DEFAULT_SETTINGS,
  RoomInfo,
  RoomParticipant,
  InfluenceCard,
  AIPersonality,
  AIDifficulty
} from '@hamster-coup/shared';
import {
  createGame,
  applyAction,
  applyResponse,
  resolveInfluenceLoss,
  resolveExchange,
  resolveInspectDecision,
  serializePublicState,
  getCurrentTurnPlayer,
  getEligibleResponders,
  RNG
} from '@hamster-coup/game-engine';
import { HamsterAI } from '@hamster-coup/game-ai';

interface InternalPlayer {
  id: string;
  name: string;
  avatar: string;
  socketId?: string;
  isHost: boolean;
  isReady: boolean;
  isAI: boolean;
  aiPersonality?: AIPersonality;
  aiDifficulty?: AIDifficulty;
  connected: boolean;
}

interface Room {
  code: string;
  hostId: string;
  settings: GameSettings;
  players: InternalPlayer[];
  gameState?: GameState;
  inGame: boolean;
  rng: RNG;
  aiTimeoutTimer?: NodeJS.Timeout;
}

export class RoomManager {
  private rooms = new Map<string, Room>();
  private socketToPlayer = new Map<string, { roomCode: string; playerId: string }>();

  constructor(private io: Server) {}

  generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return this.rooms.has(code) ? this.generateRoomCode() : code;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  getSocketInfo(socketId: string): { roomCode: string; playerId: string } | undefined {
    return this.socketToPlayer.get(socketId);
  }

  createRoom(
    socket: Socket,
    playerName: string,
    avatar: string,
    customSettings?: Partial<GameSettings>
  ): { code: string; playerId: string } {
    // If this socket was already in a room, cleanly leave it first
    const prev = this.socketToPlayer.get(socket.id);
    if (prev) {
      this.leaveRoom(prev.roomCode, prev.playerId, socket);
    }

    const code = this.generateRoomCode();
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const host: InternalPlayer = {
      id: playerId,
      name: playerName,
      avatar,
      socketId: socket.id,
      isHost: true,
      isReady: true,
      isAI: false,
      connected: true
    };

    const room: Room = {
      code,
      hostId: playerId,
      settings: { ...DEFAULT_SETTINGS, ...customSettings },
      players: [host],
      inGame: false,
      rng: new RNG()
    };

    this.rooms.set(code, room);
    this.socketToPlayer.set(socket.id, { roomCode: code, playerId });
    socket.join(code);

    this.broadcastRoomUpdate(room);
    return { code, playerId };
  }

  joinRoom(
    socket: Socket,
    code: string,
    playerName: string,
    avatar: string
  ): { success: boolean; playerId?: string; error?: string } {
    const room = this.getRoom(code);
    if (!room) {
      return { success: false, error: 'ไม่พบห้องที่ระบุ (Room not found)' };
    }

    if (room.inGame) {
      return { success: false, error: 'เกมกำลังดำเนินอยู่ (Game already in progress)' };
    }

    if (room.players.length >= room.settings.maxPlayers) {
      return { success: false, error: 'ห้องเต็มแล้ว (Room is full)' };
    }

    // If this socket was already in a room, cleanly leave it first
    const prev = this.socketToPlayer.get(socket.id);
    if (prev) {
      this.leaveRoom(prev.roomCode, prev.playerId, socket);
    }

    const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newPlayer: InternalPlayer = {
      id: playerId,
      name: playerName,
      avatar,
      socketId: socket.id,
      isHost: false,
      isReady: false,
      isAI: false,
      connected: true
    };

    room.players.push(newPlayer);
    this.socketToPlayer.set(socket.id, { roomCode: room.code, playerId });
    socket.join(room.code);

    this.broadcastRoomUpdate(room);
    return { success: true, playerId };
  }

  addAI(
    roomCode: string,
    requesterId: string,
    personality: AIPersonality = 'strategic',
    difficulty: AIDifficulty = 'normal'
  ) {
    const room = this.getRoom(roomCode);
    if (!room || room.inGame) return;
    if (room.hostId !== requesterId) return;
    if (room.players.length >= room.settings.maxPlayers) return;

    const hamsterNames = ['บ๊อบบี้', 'โมจิ', 'ชีสเค้ก', 'ถั่วลิสง', 'ทองม้วน', 'คุ๊กกี้'];
    const usedNames = new Set(room.players.map((p) => p.name));
    const availableName = hamsterNames.find((n) => !usedNames.has(n)) || `แฮมสเตอร์ AI ${room.players.length + 1}`;

    const aiId = `ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const aiPlayer: InternalPlayer = {
      id: aiId,
      name: availableName,
      avatar: `hamster_${(room.players.length % 6) + 1}`,
      isHost: false,
      isReady: true,
      isAI: true,
      aiPersonality: personality,
      aiDifficulty: difficulty,
      connected: true
    };

    room.players.push(aiPlayer);
    this.broadcastRoomUpdate(room);
  }

  leaveRoom(roomCode: string, playerId: string, socket?: Socket) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    const idx = room.players.findIndex((p) => p.id === playerId);
    if (idx === -1) return;

    const player = room.players[idx];

    if (!room.inGame) {
      // In lobby: remove player completely
      room.players.splice(idx, 1);
      if (player.socketId) {
        this.socketToPlayer.delete(player.socketId);
      }
      const sock = socket || (player.socketId ? this.io.sockets.sockets.get(player.socketId) : undefined);
      if (sock) {
        sock.leave(room.code);
      }

      // If host left, transfer host to next connected human player or delete room if empty
      if (player.isHost) {
        const nextHuman = room.players.find((p) => !p.isAI && p.connected);
        if (nextHuman) {
          nextHuman.isHost = true;
          room.hostId = nextHuman.id;
          this.broadcastRoomUpdate(room);
        } else {
          // No more human players left in room -> destroy room!
          if (room.aiTimeoutTimer) {
            clearTimeout(room.aiTimeoutTimer);
          }
          this.rooms.delete(room.code);
          return;
        }
      } else {
        this.broadcastRoomUpdate(room);
      }
    } else {
      // In game: mark disconnected
      player.connected = false;
      player.socketId = undefined;
      if (room.gameState && room.gameState.players[player.id]) {
        room.gameState.players[player.id].connected = false;
      }
      if (player.socketId) {
        this.socketToPlayer.delete(player.socketId);
      }
      this.broadcastRoomUpdate(room);
      this.broadcastGameState(room);
    }
  }

  removePlayer(roomCode: string, requesterId: string, targetId: string) {
    const room = this.getRoom(roomCode);
    if (!room || room.inGame) return;
    if (room.hostId !== requesterId) return;
    if (targetId === requesterId) return;

    const idx = room.players.findIndex((p) => p.id === targetId);
    if (idx !== -1) {
      const removed = room.players.splice(idx, 1)[0];
      if (removed.socketId) {
        this.socketToPlayer.delete(removed.socketId);
        this.io.to(removed.socketId).emit('room:kicked', 'คุณถูกเตะออกจากห้องโดยหัวหน้าห้อง');
        const kickedSocket = this.io.sockets.sockets.get(removed.socketId);
        if (kickedSocket) {
          kickedSocket.leave(room.code);
        }
      }
      this.broadcastRoomUpdate(room);
    }
  }

  setReady(roomCode: string, playerId: string, isReady: boolean) {
    const room = this.getRoom(roomCode);
    if (!room || room.inGame) return;

    const player = room.players.find((p) => p.id === playerId);
    if (player && !player.isHost) {
      player.isReady = isReady;
      this.broadcastRoomUpdate(room);
    }
  }

  updateSettings(roomCode: string, requesterId: string, settings: GameSettings) {
    const room = this.getRoom(roomCode);
    if (!room || room.inGame) return;
    if (room.hostId !== requesterId) return;

    room.settings = settings;
    this.broadcastRoomUpdate(room);
  }

  startGame(roomCode: string, requesterId: string) {
    const room = this.getRoom(roomCode);
    if (!room || room.inGame) return;
    if (room.hostId !== requesterId) return;

    if (room.players.length < room.settings.minPlayers) {
      this.emitErrorToPlayer(requesterId, `ต้องมีผู้เล่นอย่างน้อย ${room.settings.minPlayers} คน (Minimum ${room.settings.minPlayers} players needed)`);
      return;
    }

    // Check if non-host human players are ready
    const allReady = room.players.every((p) => p.isHost || p.isAI || p.isReady);
    if (!allReady) {
      this.emitErrorToPlayer(requesterId, 'ผู้เล่นทุกคนยังไม่พร้อม (Not all players are ready)');
      return;
    }

    try {
      const playerInputs = room.players.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isAI: p.isAI,
        aiPersonality: p.aiPersonality,
        aiDifficulty: p.aiDifficulty
      }));

      room.gameState = createGame(room.settings, playerInputs, undefined, room.code);
      room.inGame = true;

      this.broadcastGameState(room);
      this.processAITurnIfNeeded(room);
    } catch (err: any) {
      this.emitErrorToPlayer(requesterId, err.message || 'ไม่สามารถเริ่มเกมได้');
    }
  }

  handleAction(roomCode: string, playerId: string, action: GameAction) {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState || !room.inGame) return;

    try {
      applyAction(room.gameState, action);
      this.broadcastGameState(room);
      this.processAITurnIfNeeded(room);
    } catch (err: any) {
      this.emitErrorToPlayer(playerId, err.message);
    }
  }

  handleResponse(
    roomCode: string,
    playerId: string,
    response: { type: 'pass' | 'challenge' | 'block'; claimedRole?: CharacterRole }
  ) {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState || !room.inGame) return;

    try {
      applyResponse(room.gameState, playerId, response);
      this.broadcastGameState(room);
      this.processAITurnIfNeeded(room);
    } catch (err: any) {
      this.emitErrorToPlayer(playerId, err.message);
    }
  }

  handleInfluenceLoss(roomCode: string, playerId: string, cardId: string) {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState || !room.inGame) return;

    try {
      resolveInfluenceLoss(room.gameState, playerId, cardId);
      this.broadcastGameState(room);
      this.processAITurnIfNeeded(room);
    } catch (err: any) {
      this.emitErrorToPlayer(playerId, err.message);
    }
  }

  handleExchangeSelect(roomCode: string, playerId: string, keptCardIds: string[]) {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState || !room.inGame) return;

    try {
      resolveExchange(room.gameState, keptCardIds);
      this.broadcastGameState(room);
      this.processAITurnIfNeeded(room);
    } catch (err: any) {
      this.emitErrorToPlayer(playerId, err.message);
    }
  }

  handleInspectDecision(roomCode: string, playerId: string, forceExchange: boolean) {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState || !room.inGame) return;

    try {
      resolveInspectDecision(room.gameState, forceExchange);
      this.broadcastGameState(room);
      this.processAITurnIfNeeded(room);
    } catch (err: any) {
      this.emitErrorToPlayer(playerId, err.message);
    }
  }

  handleRematch(roomCode: string, requesterId: string) {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState || !room.inGame) return;

    try {
      const playerInputs = room.players.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isAI: p.isAI,
        aiPersonality: p.aiPersonality,
        aiDifficulty: p.aiDifficulty
      }));

      room.gameState = createGame(room.settings, playerInputs, undefined, room.code);
      this.broadcastGameState(room);
      this.processAITurnIfNeeded(room);
    } catch (err: any) {
      this.emitErrorToPlayer(requesterId, err.message);
    }
  }

  handleDisconnect(socketId: string) {
    const info = this.socketToPlayer.get(socketId);
    if (!info) return;

    this.leaveRoom(info.roomCode, info.playerId);
    this.socketToPlayer.delete(socketId);
  }

  /**
   * Automatically process AI turn or AI responses asynchronously
   */
  private processAITurnIfNeeded(room: Room) {
    if (!room.gameState || room.gameState.phase === 'GAME_OVER') return;

    if (room.aiTimeoutTimer) {
      clearTimeout(room.aiTimeoutTimer);
      room.aiTimeoutTimer = undefined;
    }

    const state = room.gameState;

    // 1. AI is the turn player in ACTION_SELECTION
    if (state.phase === 'ACTION_SELECTION') {
      const current = getCurrentTurnPlayer(state);
      if (current && current.isAI && current.isAlive) {
        room.aiTimeoutTimer = setTimeout(() => {
          try {
            if (!room.gameState || room.gameState.phase !== 'ACTION_SELECTION') return;
            const action = HamsterAI.decideAction(room.gameState, current.id, room.rng);
            applyAction(room.gameState, action);
            this.broadcastGameState(room);
            this.processAITurnIfNeeded(room);
          } catch (e) {
            console.error('AI Action error:', e);
          }
        }, 800);
        return;
      }
    }

    // 2. AI needs to respond in CHALLENGE_WINDOW, BLOCK_WINDOW, or BLOCK_CHALLENGE_WINDOW
    if (
      state.phase === 'CHALLENGE_WINDOW' ||
      state.phase === 'BLOCK_WINDOW' ||
      state.phase === 'BLOCK_CHALLENGE_WINDOW'
    ) {
      const eligible = getEligibleResponders(state);
      const pendingAI = eligible.find((id) => {
        const p = state.players[id];
        return p && p.isAI && p.isAlive && !state.passedPlayerIds.includes(id);
      });

      if (pendingAI) {
        room.aiTimeoutTimer = setTimeout(() => {
          try {
            if (!room.gameState) return;
            const response = HamsterAI.decideResponse(room.gameState, pendingAI, room.rng);
            applyResponse(room.gameState, pendingAI, response);
            this.broadcastGameState(room);
            this.processAITurnIfNeeded(room);
          } catch (e) {
            console.error('AI Response error:', e);
          }
        }, 700);
        return;
      }
    }

    // 3. AI needs to lose influence
    if (state.phase === 'INFLUENCE_SELECTION' && state.pendingInfluenceLoss) {
      const lossPlayerId = state.pendingInfluenceLoss.playerId;
      const p = state.players[lossPlayerId];
      if (p && p.isAI && p.isAlive) {
        room.aiTimeoutTimer = setTimeout(() => {
          try {
            if (!room.gameState) return;
            const cardId = HamsterAI.decideInfluenceLoss(room.gameState, p.id, room.rng);
            resolveInfluenceLoss(room.gameState, p.id, cardId);
            this.broadcastGameState(room);
            this.processAITurnIfNeeded(room);
          } catch (e) {
            console.error('AI Influence loss error:', e);
          }
        }, 600);
        return;
      }
    }

    // 4. AI in EXCHANGE_SELECTION
    if (state.phase === 'EXCHANGE_SELECTION' && state.exchangeState) {
      const p = state.players[state.exchangeState.playerId];
      if (p && p.isAI && p.isAlive) {
        room.aiTimeoutTimer = setTimeout(() => {
          try {
            if (!room.gameState) return;
            const keptIds = HamsterAI.decideExchangeCards(room.gameState, p.id, room.rng);
            resolveExchange(room.gameState, keptIds);
            this.broadcastGameState(room);
            this.processAITurnIfNeeded(room);
          } catch (e) {
            console.error('AI Exchange error:', e);
          }
        }, 800);
        return;
      }
    }

    // 5. AI in INSPECT_CARD_VIEW
    if (state.phase === 'INSPECT_CARD_VIEW' && state.inspectState) {
      const p = state.players[state.inspectState.inspectorId];
      if (p && p.isAI && p.isAlive) {
        room.aiTimeoutTimer = setTimeout(() => {
          try {
            if (!room.gameState) return;
            const forceExchange = HamsterAI.decideInspectAction(room.gameState, p.id, room.rng);
            resolveInspectDecision(room.gameState, forceExchange);
            this.broadcastGameState(room);
            this.processAITurnIfNeeded(room);
          } catch (e) {
            console.error('AI Inspect error:', e);
          }
        }, 800);
        return;
      }
    }
  }

  broadcastRoomUpdate(room: Room) {
    const roomInfo: RoomInfo = {
      code: room.code,
      hostId: room.hostId,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isHost: p.isHost,
        isReady: p.isReady,
        isAI: p.isAI,
        connected: p.connected
      })),
      settings: room.settings,
      inGame: room.inGame
    };

    this.io.to(room.code).emit('room:update', roomInfo);
  }

  broadcastGameState(room: Room) {
    if (!room.gameState) return;

    for (const player of room.players) {
      if (!player.isAI && player.socketId) {
        const publicState = serializePublicState(room.gameState, player.id);
        const myPlayerObj = room.gameState.players[player.id];
        const myCards: InfluenceCard[] = myPlayerObj ? myPlayerObj.cards : [];

        this.io.to(player.socketId).emit('game:state', publicState, myCards);
      }
    }
  }

  emitErrorToPlayer(playerId: string, message: string) {
    for (const room of this.rooms.values()) {
      const p = room.players.find((pl) => pl.id === playerId);
      if (p && p.socketId) {
        this.io.to(p.socketId).emit('game:error', message);
        return;
      }
    }
  }
}
