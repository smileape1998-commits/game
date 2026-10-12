import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import {
  GameState,
  PublicGameState,
  InfluenceCard,
  GameSettings,
  GameAction,
  CharacterRole,
  DEFAULT_SETTINGS,
  RoomInfo,
  PublicPlayer,
  Faction,
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
import { sounds } from '../audio/soundEffects';

export type AppView =
  | 'main_menu'
  | 'ai_setup'
  | 'local_setup'
  | 'online_menu'
  | 'online_lobby'
  | 'gameplay';

export interface GameStoreState {
  view: AppView;
  gameMode: 'ai' | 'local' | 'online';

  // Player Profile
  playerName: string;
  playerAvatar: string;

  // Settings
  settings: GameSettings;

  // Online Multiplayer State
  socket: Socket | null;
  roomInfo: RoomInfo | null;
  serverError: string | null;

  // Game Engine State
  gameState: GameState | null; // For local/AI
  publicGameState: PublicGameState | null; // For online or serialized view
  myCards: InfluenceCard[]; // Current active viewer's cards
  activeViewerPlayerId: string; // Current player viewing (changes in local pass-and-play)

  // Modals & UI Flags
  showRulesModal: boolean;
  showHowToPlayModal: boolean;
  showCardSelectionModal: boolean;
  showPassDeviceModal: boolean;
  passDeviceNextPlayerName: string;

  // Actions
  setView: (view: AppView) => void;
  setPlayerProfile: (name: string, avatar: string) => void;
  setSettings: (settings: GameSettings) => void;
  setShowRulesModal: (show: boolean) => void;
  setShowHowToPlayModal: (show: boolean) => void;
  setShowCardSelectionModal: (show: boolean) => void;
  dismissPassDeviceModal: () => void;

  // Game Starters
  startAIGame: (aiCount: number, personality: AIPersonality, difficulty: AIDifficulty) => void;
  startLocalGame: (playerNames: string[]) => void;

  // Online Actions
  connectSocket: () => void;
  createOnlineRoom: () => void;
  joinOnlineRoom: (code: string) => void;
  leaveOnlineRoom: () => void;
  toggleReady: () => void;
  addOnlineAI: (personality?: AIPersonality, difficulty?: AIDifficulty) => void;
  kickOnlinePlayer: (targetId: string) => void;
  startOnlineGame: () => void;

  // Gameplay Actions (dispatches to local engine or server socket)
  dispatchAction: (action: GameAction) => void;
  dispatchResponse: (response: { type: 'pass' | 'challenge' | 'block'; claimedRole?: CharacterRole }) => void;
  dispatchInfluenceLoss: (cardId: string) => void;
  dispatchExchange: (keptCardIds: string[]) => void;
  dispatchInspectDecision: (forceExchange: boolean) => void;
  dispatchRematch: () => void;
  exitToMenu: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => {
  let localAITimer: NodeJS.Timeout | null = null;

  const triggerLocalAIIfNeeded = () => {
    const { gameState, gameMode } = get();
    if (!gameState || gameMode !== 'ai' || gameState.phase === 'GAME_OVER') return;

    if (localAITimer) {
      clearTimeout(localAITimer);
      localAITimer = null;
    }

    const state = gameState;
    const rng = new RNG();

    // 1. AI Turn in ACTION_SELECTION
    if (state.phase === 'ACTION_SELECTION') {
      const current = getCurrentTurnPlayer(state);
      if (current && current.isAI && current.isAlive) {
        localAITimer = setTimeout(() => {
          try {
            const nextState = { ...get().gameState! };
            const action = HamsterAI.decideAction(nextState, current.id, rng);
            applyAction(nextState, action);
            updateLocalState(nextState);
            triggerLocalAIIfNeeded();
          } catch (e) {
            console.error('Local AI Action error:', e);
          }
        }, 850);
        return;
      }
    }

    // 2. AI in Response Windows
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
        localAITimer = setTimeout(() => {
          try {
            const nextState = { ...get().gameState! };
            const response = HamsterAI.decideResponse(nextState, pendingAI, rng);
            applyResponse(nextState, pendingAI, response);
            updateLocalState(nextState);
            triggerLocalAIIfNeeded();
          } catch (e) {
            console.error('Local AI Response error:', e);
          }
        }, 750);
        return;
      }
    }

    // 3. AI Influence Loss
    if (state.phase === 'INFLUENCE_SELECTION' && state.pendingInfluenceLoss) {
      const lossId = state.pendingInfluenceLoss.playerId;
      const p = state.players[lossId];
      if (p && p.isAI && p.isAlive) {
        localAITimer = setTimeout(() => {
          try {
            const nextState = { ...get().gameState! };
            const cardId = HamsterAI.decideInfluenceLoss(nextState, p.id, rng);
            resolveInfluenceLoss(nextState, p.id, cardId);
            updateLocalState(nextState);
            triggerLocalAIIfNeeded();
          } catch (e) {
            console.error('Local AI Influence Loss error:', e);
          }
        }, 650);
        return;
      }
    }

    // 4. AI Exchange
    if (state.phase === 'EXCHANGE_SELECTION' && state.exchangeState) {
      const p = state.players[state.exchangeState.playerId];
      if (p && p.isAI && p.isAlive) {
        localAITimer = setTimeout(() => {
          try {
            const nextState = { ...get().gameState! };
            const keptIds = HamsterAI.decideExchangeCards(nextState, p.id, rng);
            resolveExchange(nextState, keptIds);
            updateLocalState(nextState);
            triggerLocalAIIfNeeded();
          } catch (e) {
            console.error('Local AI Exchange error:', e);
          }
        }, 850);
        return;
      }
    }

    // 5. AI Inspect
    if (state.phase === 'INSPECT_CARD_VIEW' && state.inspectState) {
      const p = state.players[state.inspectState.inspectorId];
      if (p && p.isAI && p.isAlive) {
        localAITimer = setTimeout(() => {
          try {
            const nextState = { ...get().gameState! };
            const forceExchange = HamsterAI.decideInspectAction(nextState, p.id, rng);
            resolveInspectDecision(nextState, forceExchange);
            updateLocalState(nextState);
            triggerLocalAIIfNeeded();
          } catch (e) {
            console.error('Local AI Inspect error:', e);
          }
        }, 800);
        return;
      }
    }
  };

  const updateLocalState = (state: GameState) => {
    const { activeViewerPlayerId, gameMode } = get();
    const currentTurn = getCurrentTurnPlayer(state);

    let nextViewer = activeViewerPlayerId;
    let showHandoff = false;
    let handoffName = '';

    // In local pass & play mode: if turn player changes to a new living player, trigger pass device curtain!
    if (gameMode === 'local' && state.phase === 'ACTION_SELECTION') {
      if (currentTurn && currentTurn.id !== activeViewerPlayerId) {
        nextViewer = currentTurn.id;
        showHandoff = true;
        handoffName = currentTurn.name;
      }
    }

    const publicState = serializePublicState(state, nextViewer);
    const viewerPlayer = state.players[nextViewer];
    const myCards = viewerPlayer ? viewerPlayer.cards : [];

    set({
      gameState: state,
      publicGameState: publicState,
      myCards,
      activeViewerPlayerId: nextViewer,
      showPassDeviceModal: showHandoff,
      passDeviceNextPlayerName: handoffName
    });
  };

  return {
    view: 'main_menu',
    gameMode: 'ai',
    playerName: 'Pip (พรานโอ๊ก)',
    playerAvatar: 'hamster_1',
    settings: DEFAULT_SETTINGS,
    socket: null,
    roomInfo: null,
    serverError: null,
    gameState: null,
    publicGameState: null,
    myCards: [],
    activeViewerPlayerId: 'player_human',
    showRulesModal: false,
    showHowToPlayModal: false,
    showCardSelectionModal: false,
    showPassDeviceModal: false,
    passDeviceNextPlayerName: '',

    setView: (view) => set({ view }),
    setPlayerProfile: (name, avatar) => set({ playerName: name, playerAvatar: avatar }),
    setSettings: (settings) => set({ settings }),
    setShowRulesModal: (show) => set({ showRulesModal: show }),
    setShowHowToPlayModal: (show) => set({ showHowToPlayModal: show }),
    setShowCardSelectionModal: (show) => set({ showCardSelectionModal: show }),
    dismissPassDeviceModal: () => set({ showPassDeviceModal: false }),

    startAIGame: (aiCount, personality, difficulty) => {
      const { settings, playerName, playerAvatar } = get();
      const aiHamsterNames = ['บ๊อบบี้', 'โมจิ', 'ชีสเค้ก', 'ถั่วลิสง', 'ทองม้วน'];

      const players: {
        id: string;
        name: string;
        avatar: string;
        isAI: boolean;
        aiPersonality?: AIPersonality;
        aiDifficulty?: AIDifficulty;
      }[] = [
        { id: 'player_human', name: playerName, avatar: playerAvatar, isAI: false }
      ];

      for (let i = 0; i < aiCount; i++) {
        players.push({
          id: `player_ai_${i + 1}`,
          name: `${aiHamsterNames[i % aiHamsterNames.length]} (AI)`,
          avatar: `hamster_${((i + 1) % 6) + 1}`,
          isAI: true,
          aiPersonality: personality,
          aiDifficulty: difficulty
        });
      }

      const state = createGame(settings, players);
      set({
        gameMode: 'ai',
        view: 'gameplay',
        activeViewerPlayerId: 'player_human'
      });
      updateLocalState(state);
      triggerLocalAIIfNeeded();
    },

    startLocalGame: (playerNames) => {
      const { settings } = get();
      const players = playerNames.map((name, idx) => ({
        id: `local_p_${idx + 1}`,
        name: name.trim() || `ผู้เล่น ${idx + 1}`,
        avatar: `hamster_${(idx % 6) + 1}`,
        isAI: false
      }));

      const state = createGame(settings, players);
      set({
        gameMode: 'local',
        view: 'gameplay',
        activeViewerPlayerId: players[0].id
      });
      updateLocalState(state);
    },

    connectSocket: () => {
      if (get().socket) return;
      const socket = io('/', { transports: ['websocket', 'polling'] });

      socket.on('room:update', (roomInfo: RoomInfo) => {
        set({ roomInfo });
        if (roomInfo.inGame && get().view === 'online_lobby') {
          set({ view: 'gameplay' });
        }
      });

      socket.on('game:state', (publicState: PublicGameState, cards: InfluenceCard[]) => {
        set({
          publicGameState: publicState,
          myCards: cards,
          view: 'gameplay',
          gameMode: 'online'
        });
      });

      socket.on('game:error', (errorMsg: string) => {
        set({ serverError: errorMsg });
      });

      socket.on('room:kicked', (message: string) => {
        alert(message || 'คุณถูกเตะออกจากห้อง');
        set({ view: 'online_menu', roomInfo: null });
      });

      set({ socket });
    },

    createOnlineRoom: () => {
      get().connectSocket();
      const { socket, playerName, playerAvatar, settings } = get();
      if (!socket) return;

      socket.emit(
        'room:create',
        { playerName, avatar: playerAvatar, settings },
        (res: any) => {
          if (res.success) {
            set({
              view: 'online_lobby',
              activeViewerPlayerId: res.playerId,
              serverError: null
            });
          } else {
            set({ serverError: res.error });
          }
        }
      );
    },

    joinOnlineRoom: (code) => {
      get().connectSocket();
      const { socket, playerName, playerAvatar } = get();
      if (!socket) return;

      socket.emit(
        'room:join',
        { roomCode: code.toUpperCase().trim(), playerName, avatar: playerAvatar },
        (res: any) => {
          if (res.success) {
            set({
              view: 'online_lobby',
              activeViewerPlayerId: res.playerId,
              serverError: null
            });
          } else {
            set({ serverError: res.error });
          }
        }
      );
    },

    leaveOnlineRoom: () => {
      const { socket } = get();
      if (socket) {
        socket.emit('room:leave');
      }
      set({ view: 'online_menu', roomInfo: null });
    },

    toggleReady: () => {
      const { socket, roomInfo, activeViewerPlayerId } = get();
      if (!socket || !roomInfo) return;
      const me = roomInfo.players.find((p) => p.id === activeViewerPlayerId);
      socket.emit('room:ready', !me?.isReady);
    },

    addOnlineAI: (personality = 'strategic', difficulty = 'normal') => {
      const { socket } = get();
      if (socket) {
        socket.emit('room:add_ai', personality, difficulty);
      }
    },

    kickOnlinePlayer: (targetId: string) => {
      const { socket } = get();
      if (socket) {
        socket.emit('room:remove_player', targetId);
      }
    },

    startOnlineGame: () => {
      const { socket } = get();
      if (socket) {
        socket.emit('game:start');
      }
    },

    dispatchAction: (action) => {
      const { gameMode, socket, gameState } = get();
      if (gameMode === 'online' && socket) {
        socket.emit('game:action', action);
      } else if (gameState) {
        applyAction(gameState, action);
        updateLocalState(gameState);
        triggerLocalAIIfNeeded();
      }
    },

    dispatchResponse: (response) => {
      const { gameMode, socket, gameState, activeViewerPlayerId } = get();
      if (gameMode === 'online' && socket) {
        socket.emit('game:respond', response);
      } else if (gameState) {
        applyResponse(gameState, activeViewerPlayerId, response);
        updateLocalState(gameState);
        triggerLocalAIIfNeeded();
      }
    },

    dispatchInfluenceLoss: (cardId) => {
      const { gameMode, socket, gameState, activeViewerPlayerId } = get();
      if (gameMode === 'online' && socket) {
        socket.emit('game:reveal_influence', { cardId });
      } else if (gameState) {
        const lossId = gameState.pendingInfluenceLoss?.playerId || activeViewerPlayerId;
        resolveInfluenceLoss(gameState, lossId, cardId);
        updateLocalState(gameState);
        triggerLocalAIIfNeeded();
      }
    },

    dispatchExchange: (keptCardIds) => {
      const { gameMode, socket, gameState } = get();
      if (gameMode === 'online' && socket) {
        socket.emit('game:exchange_select', { keptCardIds });
      } else if (gameState) {
        resolveExchange(gameState, keptCardIds);
        updateLocalState(gameState);
        triggerLocalAIIfNeeded();
      }
    },

    dispatchInspectDecision: (forceExchange) => {
      const { gameMode, socket, gameState } = get();
      if (gameMode === 'online' && socket) {
        socket.emit('game:inspect_decision', { forceExchange });
      } else if (gameState) {
        resolveInspectDecision(gameState, forceExchange);
        updateLocalState(gameState);
        triggerLocalAIIfNeeded();
      }
    },

    dispatchRematch: () => {
      const { gameMode, socket, gameState, settings } = get();
      if (gameMode === 'online' && socket) {
        socket.emit('game:rematch');
      } else if (gameState) {
        const players = Object.values(gameState.players).map((p) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          isAI: p.isAI,
          aiPersonality: p.aiPersonality,
          aiDifficulty: p.aiDifficulty,
          faction: p.faction
        }));
        const nextState = createGame(settings, players);
        updateLocalState(nextState);
        triggerLocalAIIfNeeded();
      }
    },

    exitToMenu: () => {
      if (localAITimer) {
        clearTimeout(localAITimer);
        localAITimer = null;
      }
      set({
        view: 'main_menu',
        gameState: null,
        publicGameState: null,
        myCards: []
      });
    }
  };
});
