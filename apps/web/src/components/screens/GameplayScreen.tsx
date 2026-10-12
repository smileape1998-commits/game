import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../state/gameStore';
import {
  CharacterRole,
  GameAction,
  PublicPlayer,
  ACTION_DEFINITIONS
} from '@hamster-coup/shared';
import { getLegalActions } from '@hamster-coup/game-engine';
import { PlayerPanel } from '../PlayerPanel';
import { InfluenceCardView } from '../InfluenceCardView';
import { ActionDrawer } from '../ActionDrawer';
import { ResponseModal } from '../ResponseModal';
import { InfluenceLossModal } from '../InfluenceLossModal';
import { ExchangeModal } from '../ExchangeModal';
import { InspectModal } from '../InspectModal';
import { PassDeviceModal } from '../PassDeviceModal';
import { GameOverModal } from '../GameOverModal';
import { EventLogDrawer } from '../EventLogDrawer';
import { GoldenAcornIcon } from '../CharacterArtwork';
import { sounds } from '../../audio/soundEffects';
import {
  LogOut,
  BookOpen,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
  Crown,
  Coins,
  Repeat
} from 'lucide-react';

export const GameplayScreen: React.FC = () => {
  const {
    publicGameState,
    gameState,
    myCards,
    activeViewerPlayerId,
    gameMode,
    dispatchAction,
    dispatchResponse,
    dispatchInfluenceLoss,
    dispatchExchange,
    dispatchInspectDecision,
    dispatchRematch,
    exitToMenu,
    showPassDeviceModal,
    passDeviceNextPlayerName,
    dismissPassDeviceModal,
    setShowHowToPlayModal
  } = useGameStore();

  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  if (!publicGameState) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        กำลังโหลดกระดานประลอง...
      </div>
    );
  }

  const state = publicGameState;
  const isMyTurn = state.turnPlayerId === activeViewerPlayerId;
  const me = state.players[activeViewerPlayerId];
  const opponents = Object.values(state.players).filter((p) => p.id !== activeViewerPlayerId);

  // Compute legal actions for the current viewer
  let viewerLegalActions: GameAction[] = [];
  if (isMyTurn && state.phase === 'ACTION_SELECTION') {
    viewerLegalActions = getLegalActions(gameState || state, activeViewerPlayerId);
  }

  // Check if current viewer is eligible to respond in challenge/block windows
  let isEligibleToRespond = false;
  if (state.phase === 'CHALLENGE_WINDOW') {
    isEligibleToRespond = state.currentAction?.sourceId !== activeViewerPlayerId && !!me?.isAlive;
  } else if (state.phase === 'BLOCK_WINDOW') {
    if (state.currentAction?.targetId) {
      isEligibleToRespond = state.currentAction.targetId === activeViewerPlayerId && !!me?.isAlive;
    } else {
      isEligibleToRespond = state.currentAction?.sourceId !== activeViewerPlayerId && !!me?.isAlive;
    }
  } else if (state.phase === 'BLOCK_CHALLENGE_WINDOW') {
    isEligibleToRespond = state.currentBlock?.blockerId !== activeViewerPlayerId && !!me?.isAlive;
  }

  const hasPassed = state.passedPlayerIds.includes(activeViewerPlayerId);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 select-none relative overflow-x-hidden">
      {/* Top Navigation Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playCardFlip();
              exitToMenu();
            }}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-red-400 transition"
          >
            <LogOut size={14} /> ออก
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2 text-xs">
            <span className="font-extrabold text-amber-400">
              รอบที่ {state.turnCount}
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Layers size={13} className="text-amber-400" />
              กองไพ่: {state.deckCount} ใบ
            </span>
            {state.courtTreasury > 0 && (
              <>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1 text-amber-300">
                  <Coins size={13} className="text-amber-400" />
                  คลังศาล: {state.courtTreasury}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playCardFlip();
              setShowHowToPlayModal(true);
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            title="คู่มือการเล่น"
          >
            <BookOpen size={16} />
          </button>
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            title="เปิด/ปิดเสียง"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Main Table Arena */}
      <div className="flex-1 flex flex-col justify-between p-3 sm:p-6 max-w-7xl mx-auto w-full relative z-10">
        {/* Opponents Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 my-2">
          {opponents.map((opp) => (
            <PlayerPanel
              key={opp.id}
              player={opp}
              isTurn={state.turnPlayerId === opp.id}
            />
          ))}
        </div>

        {/* Central Table Centerpiece / Event Announcement Banner */}
        <div className="my-auto py-4 text-center">
          <motion.div
            key={state.history[0]?.id || 'banner'}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-slate-900/90 border border-amber-600/60 rounded-3xl px-6 py-4 shadow-2xl backdrop-blur-md max-w-xl mx-auto"
          >
            {/* Turn Announcement */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                ตาเล่นปัจจุบัน:
              </span>
              <span className="text-sm font-black text-amber-400">
                {state.players[state.turnPlayerId]?.name || 'ผู้เล่น'}
              </span>
            </div>

            {/* Latest Action Message */}
            <div className="text-sm sm:text-base font-bold text-slate-100 mt-1">
              {state.history[0]?.messageTh || 'การประลองเริ่มต้นขึ้นแล้ว!'}
            </div>
          </motion.div>
        </div>

        {/* Event Log Floating Component */}
        <div className="mb-3 max-w-xl mx-auto w-full">
          <EventLogDrawer logs={state.history} />
        </div>

        {/* Player Bottom Bar (My Hand & Actions) */}
        <div className="mt-2 flex flex-col items-center">
          {/* Active Viewer Stats Strip */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-full px-5 py-2 mb-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 font-black text-sm text-amber-300">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                {me?.name.charAt(0) || 'P'}
              </div>
              <span>{me?.name || 'คุณ'}</span>
            </div>

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-center gap-1.5 font-black text-amber-400 text-base">
              <GoldenAcornIcon size={22} />
              <span>{me?.acorns || 0}</span>
              <span className="text-[11px] font-semibold text-slate-400 ml-1">ลูกโอ๊กทองคำ</span>
            </div>
          </div>

          {/* Living Influence Cards in Player's Hand */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3">
            {myCards.map((card) => (
              <InfluenceCardView
                key={card.id}
                card={card}
                isRevealedLost={card.revealed}
                size="md"
              />
            ))}
          </div>

          {/* Contextual Action Drawer (Only active when it is player's turn in ACTION_SELECTION) */}
          {isMyTurn && state.phase === 'ACTION_SELECTION' && me?.isAlive && (
            <div className="w-full max-w-4xl">
              <ActionDrawer
                myAcorns={me.acorns}
                legalActions={viewerLegalActions}
                settings={state.settings}
                opponents={opponents}
                onExecuteAction={(act) => dispatchAction(act)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Overlay Modals */}
      <AnimatePresence>
        {/* Challenge / Block Response Modal */}
        {(state.phase === 'CHALLENGE_WINDOW' ||
          state.phase === 'BLOCK_WINDOW' ||
          state.phase === 'BLOCK_CHALLENGE_WINDOW') && (
          <ResponseModal
            phase={state.phase}
            currentAction={state.currentAction}
            currentBlock={state.currentBlock}
            players={state.players}
            myPlayerId={activeViewerPlayerId}
            isEligibleToRespond={isEligibleToRespond}
            hasPassed={hasPassed}
            onRespond={(resp) => dispatchResponse(resp)}
          />
        )}

        {/* Influence Loss Modal */}
        {state.phase === 'INFLUENCE_SELECTION' && state.pendingInfluenceLoss && (
          <InfluenceLossModal
            pendingLoss={state.pendingInfluenceLoss}
            myPlayerId={activeViewerPlayerId}
            myCards={myCards}
            players={state.players}
            onSelectCardToLose={(cardId) => dispatchInfluenceLoss(cardId)}
          />
        )}

        {/* Exchange Modal (Ambassador / Inquisitor) */}
        {state.phase === 'EXCHANGE_SELECTION' &&
          state.exchangeDrawnCards &&
          state.exchangeDrawnCards.length > 0 && (
            <ExchangeModal
              drawnCards={state.exchangeDrawnCards}
              myLivingCards={myCards.filter((c) => !c.revealed)}
              keepCount={myCards.filter((c) => !c.revealed).length}
              onConfirmExchange={(keptIds) => dispatchExchange(keptIds)}
            />
          )}

        {/* Waiting indicator for other players during EXCHANGE_SELECTION */}
        {state.phase === 'EXCHANGE_SELECTION' &&
          (!state.exchangeDrawnCards || state.exchangeDrawnCards.length === 0) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border-2 border-emerald-500/80 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950 border border-emerald-500/80 flex items-center justify-center text-emerald-400 mb-3 animate-pulse">
                  <Repeat size={24} />
                </div>
                <h3 className="text-lg font-extrabold text-emerald-400 mb-1">
                  กำลังแลกเปลี่ยนไพ่ (Exchange in Progress)
                </h3>
                <p className="text-sm font-bold text-slate-200 mt-2">
                  <span className="text-amber-400">
                    {state.players[state.turnPlayerId]?.name || 'ผู้เล่น'}
                  </span>{' '}
                  กำลังดูไพ่ 2 ใบจากกองกลางเพื่อเลือกไพ่ใหม่ และสับไพ่ที่เหลือกลับเข้ากอง
                </p>
                <div className="mt-4 flex justify-center">
                  <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                </div>
              </motion.div>
            </div>
          )}

        {/* Inspect Modal (Inquisitor) */}
        {state.phase === 'INSPECT_CARD_VIEW' && state.currentAction && (
          <InspectModal
            inspectedCard={state.inspectedCard}
            inspectorId={state.currentAction.sourceId}
            targetId={state.currentAction.targetId || ''}
            myPlayerId={activeViewerPlayerId}
            players={state.players}
            onInspectDecision={(force) => dispatchInspectDecision(force)}
          />
        )}

        {/* Pass Device Modal (Local Multiplayer Curtain) */}
        {showPassDeviceModal && (
          <PassDeviceModal
            nextPlayerName={passDeviceNextPlayerName}
            onReady={dismissPassDeviceModal}
          />
        )}

        {/* Game Over Victory Modal */}
        {state.phase === 'GAME_OVER' && (
          <GameOverModal
            winnerPlayerId={state.winnerPlayerId}
            winningFaction={state.winningFaction}
            players={state.players}
            turnCount={state.turnCount}
            onRematch={dispatchRematch}
            onExitToMenu={exitToMenu}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
