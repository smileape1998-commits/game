import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import express from 'express';
import { RoomManager } from '../src/roomManager.js';
import {
  RoomCreateSchema,
  RoomJoinSchema,
  PublicGameState,
  InfluenceCard
} from '@hamster-coup/shared';

describe('Server Integration & Real-time Socket Communication', () => {
  let httpServer: any;
  let ioServer: Server;
  let roomManager: RoomManager;
  let port: number;

  beforeAll(async () => {
    const app = express();
    httpServer = createServer(app);
    ioServer = new Server(httpServer);
    roomManager = new RoomManager(ioServer);

    ioServer.on('connection', (socket) => {
      let currentRoomCode: string | null = null;
      let currentPlayerId: string | null = null;

      socket.on('room:create', (payload, callback) => {
        const parsed = RoomCreateSchema.parse(payload);
        const { code, playerId } = roomManager.createRoom(
          socket,
          parsed.playerName,
          parsed.avatar,
          parsed.settings
        );
        currentRoomCode = code;
        currentPlayerId = playerId;
        if (callback) callback({ success: true, roomCode: code, playerId });
      });

      socket.on('room:join', (payload, callback) => {
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
        if (callback) callback(result);
      });

      socket.on('room:add_ai', () => {
        if (currentRoomCode && currentPlayerId) {
          roomManager.addAI(currentRoomCode, currentPlayerId);
        }
      });

      socket.on('room:ready', (ready) => {
        if (currentRoomCode && currentPlayerId) {
          roomManager.setReady(currentRoomCode, currentPlayerId, ready);
        }
      });

      socket.on('game:start', () => {
        if (currentRoomCode && currentPlayerId) {
          roomManager.startGame(currentRoomCode, currentPlayerId);
        }
      });
    });

    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        port = httpServer.address().port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    ioServer.close();
    httpServer.close();
  });

  it('allows creating room, joining, adding AI, and starting game with isolated secret states', async () => {
    const client1: ClientSocket = Client(`http://localhost:${port}`);
    const client2: ClientSocket = Client(`http://localhost:${port}`);

    await new Promise<void>((resolve) => {
      let c1Connected = false;
      let c2Connected = false;
      client1.on('connect', () => {
        c1Connected = true;
        if (c2Connected) resolve();
      });
      client2.on('connect', () => {
        c2Connected = true;
        if (c1Connected) resolve();
      });
    });

    // Client 1 creates room
    const createRes: any = await new Promise((resolve) => {
      client1.emit(
        'room:create',
        { playerName: 'Pip', avatar: 'h1' },
        (res: any) => resolve(res)
      );
    });

    expect(createRes.success).toBe(true);
    const roomCode = createRes.roomCode;
    expect(roomCode).toBeDefined();

    // Client 2 joins room
    const joinRes: any = await new Promise((resolve) => {
      client2.emit(
        'room:join',
        { roomCode, playerName: 'Barnaby', avatar: 'h2' },
        (res: any) => resolve(res)
      );
    });
    expect(joinRes.success).toBe(true);

    // Client 2 sets ready
    client2.emit('room:ready', true);

    // Start game promise
    const client1GameStatePromise = new Promise<{ state: PublicGameState; cards: InfluenceCard[] }>((resolve) => {
      client1.on('game:state', (state, cards) => {
        resolve({ state, cards });
      });
    });

    const client2GameStatePromise = new Promise<{ state: PublicGameState; cards: InfluenceCard[] }>((resolve) => {
      client2.on('game:state', (state, cards) => {
        resolve({ state, cards });
      });
    });

    // Client 1 starts game
    client1.emit('game:start');

    const [c1Data, c2Data] = await Promise.all([
      client1GameStatePromise,
      client2GameStatePromise
    ]);

    // Check that both clients received public game state
    expect(c1Data.state.phase).toBe('ACTION_SELECTION');
    expect(c2Data.state.phase).toBe('ACTION_SELECTION');

    // Crucial security check: Client 1 receives Client 1's cards, Client 2 receives Client 2's cards!
    expect(c1Data.cards).toHaveLength(2);
    expect(c2Data.cards).toHaveLength(2);
    // Client 1's private cards are different from Client 2's
    const c1CardIds = c1Data.cards.map((c) => c.id);
    const c2CardIds = c2Data.cards.map((c) => c.id);
    expect(c1CardIds.some((id) => c2CardIds.includes(id))).toBe(false);

    // Check public player mask: neither client receives the opponent's unrevealed card roles
    expect((c1Data.state.players[joinRes.playerId] as any).cards).toBeUndefined();

    client1.disconnect();
    client2.disconnect();
  });
});
