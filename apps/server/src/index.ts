import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { RoomManager } from './roomManager.js';
import {
  RoomCreateSchema,
  RoomJoinSchema,
  GameActionSchema,
  GameResponseSchema,
  RevealInfluenceSchema,
  ExchangeSelectSchema,
  InspectDecisionSchema
} from '@hamster-coup/shared';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDistPath = path.resolve(__dirname, '../../web/dist');

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

if (fs.existsSync(webDistPath)) {
  app.use(express.static(webDistPath));
}

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

const roomManager = new RoomManager(io);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    game: 'Hamster Coup: Golden Acorns Server',
    timestamp: Date.now()
  });
});

// Room metadata inspection endpoint
app.get('/api/rooms/:code', (req, res) => {
  const room = roomManager.getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  return res.json({
    code: room.code,
    inGame: room.inGame,
    playerCount: room.players.length,
    maxPlayers: room.settings.maxPlayers
  });
});

io.on('connection', (socket) => {
  let currentRoomCode: string | null = null;
  let currentPlayerId: string | null = null;

  socket.on('room:create', (payload, callback) => {
    try {
      const parsed = RoomCreateSchema.parse(payload);
      const { code, playerId } = roomManager.createRoom(
        socket,
        parsed.playerName,
        parsed.avatar,
        parsed.settings
      );
      currentRoomCode = code;
      currentPlayerId = playerId;
      if (typeof callback === 'function') {
        callback({ success: true, roomCode: code, playerId });
      }
    } catch (err: any) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message || 'Failed to create room' });
      }
    }
  });

  socket.on('room:join', (payload, callback) => {
    try {
      const parsed = RoomJoinSchema.parse(payload);
      const result = roomManager.joinRoom(
        socket,
        parsed.roomCode,
        parsed.playerName,
        parsed.avatar
      );
      if (result.success && result.playerId) {
        currentRoomCode = parsed.roomCode.toUpperCase();
        currentPlayerId = result.playerId;
      }
      if (typeof callback === 'function') {
        callback(result);
      }
    } catch (err: any) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message || 'Failed to join room' });
      }
    }
  });

  socket.on('room:ready', (ready: boolean) => {
    if (currentRoomCode && currentPlayerId) {
      roomManager.setReady(currentRoomCode, currentPlayerId, ready);
    }
  });

  socket.on('room:add_ai', (personality, difficulty) => {
    if (currentRoomCode && currentPlayerId) {
      roomManager.addAI(currentRoomCode, currentPlayerId, personality, difficulty);
    }
  });

  socket.on('room:remove_player', (targetId: string) => {
    if (currentRoomCode && currentPlayerId) {
      roomManager.removePlayer(currentRoomCode, currentPlayerId, targetId);
    }
  });

  socket.on('room:settings', (settings) => {
    if (currentRoomCode && currentPlayerId) {
      roomManager.updateSettings(currentRoomCode, currentPlayerId, settings);
    }
  });

  socket.on('game:start', () => {
    if (currentRoomCode && currentPlayerId) {
      roomManager.startGame(currentRoomCode, currentPlayerId);
    }
  });

  socket.on('game:action', (rawAction) => {
    if (currentRoomCode && currentPlayerId) {
      try {
        const action = GameActionSchema.parse(rawAction);
        roomManager.handleAction(currentRoomCode, currentPlayerId, action);
      } catch (err: any) {
        socket.emit('game:error', err.message);
      }
    }
  });

  socket.on('game:respond', (rawResponse) => {
    if (currentRoomCode && currentPlayerId) {
      try {
        const response = GameResponseSchema.parse(rawResponse);
        roomManager.handleResponse(currentRoomCode, currentPlayerId, response);
      } catch (err: any) {
        socket.emit('game:error', err.message);
      }
    }
  });

  socket.on('game:reveal_influence', (rawPayload) => {
    if (currentRoomCode && currentPlayerId) {
      try {
        const payload = RevealInfluenceSchema.parse(rawPayload);
        roomManager.handleInfluenceLoss(currentRoomCode, currentPlayerId, payload.cardId);
      } catch (err: any) {
        socket.emit('game:error', err.message);
      }
    }
  });

  socket.on('game:exchange_select', (rawPayload) => {
    if (currentRoomCode && currentPlayerId) {
      try {
        const payload = ExchangeSelectSchema.parse(rawPayload);
        roomManager.handleExchangeSelect(currentRoomCode, currentPlayerId, payload.keptCardIds);
      } catch (err: any) {
        socket.emit('game:error', err.message);
      }
    }
  });

  socket.on('game:inspect_decision', (rawPayload) => {
    if (currentRoomCode && currentPlayerId) {
      try {
        const payload = InspectDecisionSchema.parse(rawPayload);
        roomManager.handleInspectDecision(currentRoomCode, currentPlayerId, payload.forceExchange);
      } catch (err: any) {
        socket.emit('game:error', err.message);
      }
    }
  });

  socket.on('game:rematch', () => {
    if (currentRoomCode && currentPlayerId) {
      roomManager.handleRematch(currentRoomCode, currentPlayerId);
    }
  });

  socket.on('disconnect', () => {
    roomManager.handleDisconnect(socket.id);
  });
});

if (fs.existsSync(webDistPath)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
}

httpServer.listen(PORT, () => {
  console.log(`[Hamster Coup Server] Running on http://localhost:${PORT}`);
});

export { app, httpServer, io };
