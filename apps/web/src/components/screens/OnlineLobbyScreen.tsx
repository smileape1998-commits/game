import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../state/gameStore';
import { sounds } from '../../audio/soundEffects';
import {
  Users,
  Copy,
  Check,
  Crown,
  Bot,
  Play,
  LogOut,
  Plus,
  Sliders,
  CheckCircle2,
  Clock,
  Layers,
  UserX,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const OnlineLobbyScreen: React.FC = () => {
  const {
    roomInfo,
    activeViewerPlayerId,
    leaveOnlineRoom,
    toggleReady,
    addOnlineAI,
    kickOnlinePlayer,
    startOnlineGame,
    setShowRulesModal,
    setShowCardSelectionModal
  } = useGameStore();

  const [copied, setCopied] = useState(false);

  if (!roomInfo) {
    return null;
  }

  const isHost = roomInfo.hostId === activeViewerPlayerId;
  const me = roomInfo.players.find((p) => p.id === activeViewerPlayerId);
  const canStart =
    isHost &&
    roomInfo.players.length >= roomInfo.settings.minPlayers &&
    roomInfo.players.every((p) => p.isHost || p.isAI || p.isReady);

  const copyRoomCode = () => {
    sounds.playCoin();
    navigator.clipboard.writeText(roomInfo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalSeats = roomInfo.settings.maxPlayers || 6;
  const emptySeatsCount = Math.max(0, totalSeats - roomInfo.players.length);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col justify-between p-4 sm:p-8 select-none relative overflow-x-hidden font-sans">
      {/* Background Subtle Ambient Aura */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-500/[0.03] rounded-full blur-[160px] pointer-events-none" />

      {/* Top Utility Bar */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between z-10">
        <button
          onClick={() => {
            sounds.playCardFlip();
            leaveOnlineRoom();
          }}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-400 transition bg-[#101622] border border-slate-800 hover:border-red-900/60 px-4 py-2 rounded-xl"
        >
          <LogOut size={15} /> ออกจากห้อง
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sounds.playCardFlip();
              setShowCardSelectionModal(true);
            }}
            className="flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-950/40 border border-amber-600/50 hover:border-amber-500 px-4 py-2 rounded-xl transition shadow-sm"
          >
            <Layers size={14} /> เลือกการ์ด ({Object.values(roomInfo.settings.enabledRoles).filter(Boolean).length}/6)
          </button>

          {isHost && (
            <button
              onClick={() => {
                sounds.playCardFlip();
                setShowRulesModal(true);
              }}
              className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-[#101622] border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl transition"
            >
              <Sliders size={14} /> กติกา
            </button>
          )}
        </div>
      </div>

      {/* Central Content */}
      <div className="max-w-4xl w-full mx-auto my-auto py-6 sm:py-8 z-10 space-y-8">
        {/* Emblem & Title Header */}
        <div className="text-center space-y-2">
          {/* Circular Crown Medallion */}
          <div className="w-16 h-16 rounded-full bg-amber-950/60 border-2 border-amber-500/50 mx-auto flex items-center justify-center text-2xl shadow-xl shadow-amber-950/50 relative">
            <span className="text-amber-400">👑</span>
            <div className="absolute inset-0 rounded-full border border-amber-500/20 scale-125 pointer-events-none" />
          </div>

          <div className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase pt-1">
            A GAME OF BLUFF, POWER & TINY PAWS
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wider">
            HAMSTER <span className="text-amber-400">COUP</span>
          </h1>
          <div className="text-[10px] font-black tracking-widest text-amber-400/90 uppercase">
            GOLDEN ACORNS
          </div>
        </div>

        {/* Central Room Code Pill */}
        <div className="max-w-md mx-auto bg-[#101622] border border-slate-800 rounded-3xl p-3 sm:px-6 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              ROOM CODE
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-amber-400 tracking-wider">
              {roomInfo.code}
            </span>
            <button
              onClick={copyRoomCode}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 transition"
              title="คัดลอกรหัสห้อง"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div className="flex items-center gap-2 text-xs font-black tracking-wider text-slate-300">
            <Users size={16} className="text-slate-400" />
            <span>
              {roomInfo.players.length}/{totalSeats}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline uppercase">
              JOINED
            </span>
          </div>
        </div>

        {/* Section Bar: Royal Court */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-black tracking-widest text-slate-400 uppercase px-1">
            <span>ROYAL COURT</span>
            <span className="text-[11px] text-slate-400 font-semibold normal-case">
              {roomInfo.players.length < roomInfo.settings.minPlayers
                ? `ต้องการผู้เล่นอย่างน้อย ${roomInfo.settings.minPlayers} คน`
                : canStart
                ? 'ทุกคนพร้อมแล้ว พร้อมเริ่มเกม!'
                : 'รอผู้เล่นเตรียมพร้อม...'}
            </span>
          </div>

          {/* 6-Seat Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {/* Active Players */}
            {roomInfo.players.map((p) => {
              const isPlayerHost = p.id === roomInfo.hostId;
              const isMe = p.id === activeViewerPlayerId;
              const isReady = isPlayerHost || p.isAI || p.isReady;

              return (
                <div
                  key={p.id}
                  className={`bg-[#101622] rounded-3xl p-4 flex items-center justify-between transition border ${
                    isMe
                      ? 'border-amber-500/60 shadow-lg shadow-amber-950/20'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0 shadow-inner">
                      {p.isAI ? '🤖' : '🐹'}
                    </div>

                    <div className="min-w-0">
                      {isPlayerHost && (
                        <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                          <Crown size={11} /> HOST
                        </div>
                      )}
                      <div className="text-sm font-black text-white truncate">
                        {p.name} {isMe && <span className="text-xs text-amber-400 font-normal">(คุณ)</span>}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {p.isAI ? 'AI noble' : 'Hamster noble'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Ready status */}
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isReady ? 'bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-pulse' : 'bg-slate-600'
                        }`}
                      />
                      <span className={isReady ? 'text-emerald-400' : 'text-slate-400'}>
                        {isReady ? 'Ready' : 'Waiting'}
                      </span>
                    </div>

                    {/* Host Kick Button */}
                    {isHost && !isMe && (
                      <button
                        onClick={() => {
                          sounds.playCardFlip();
                          kickOnlinePlayer(p.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition"
                        title={p.isAI ? 'ลบ AI' : 'เตะผู้เล่น'}
                      >
                        <UserX size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty Slots */}
            {Array.from({ length: emptySeatsCount }).map((_, index) => (
              <div
                key={`empty-${index}`}
                onClick={() => {
                  if (isHost) {
                    sounds.playCardFlip();
                    addOnlineAI();
                  }
                }}
                className={`bg-[#0D121C]/60 border border-dashed border-slate-800 rounded-3xl p-4 flex items-center justify-center gap-2 transition ${
                  isHost
                    ? 'hover:border-amber-500/50 hover:bg-[#121926] cursor-pointer group text-slate-400 hover:text-amber-300'
                    : 'text-slate-600'
                }`}
              >
                <div className="w-8 h-8 rounded-full border border-dashed border-slate-700 flex items-center justify-center text-xs group-hover:border-amber-500/50">
                  <Plus size={14} />
                </div>
                <span className="text-xs font-bold">
                  {isHost ? 'Add AI bot' : 'Empty seat'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => {
              sounds.playCardFlip();
              leaveOnlineRoom();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#121824] hover:bg-[#182030] border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm"
          >
            <LogOut size={16} />
            <span>Leave room</span>
          </button>

          {isHost ? (
            <button
              disabled={!canStart}
              onClick={() => {
                sounds.playCardFlip();
                startOnlineGame();
              }}
              className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition shadow-xl ${
                canStart
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/20 cursor-pointer'
                  : 'bg-slate-800/80 border border-slate-700/60 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Crown size={18} />
              <span>START MATCH</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                sounds.playCoin();
                toggleReady();
              }}
              className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition shadow-xl ${
                me?.isReady
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {me?.isReady ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>READY (คลิกเพื่อยกเลิก)</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>READY TO PLAY</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
          <Sparkles size={13} className="text-amber-400" />
          <span>Invite friends using the room code above</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-400 py-2">
        Hamster Coup • Golden Acorns Court
      </footer>
    </div>
  );
};
