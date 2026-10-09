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
  Clock
} from 'lucide-react';

export const OnlineLobbyScreen: React.FC = () => {
  const {
    roomInfo,
    activeViewerPlayerId,
    leaveOnlineRoom,
    toggleReady,
    addOnlineAI,
    startOnlineGame,
    setShowRulesModal
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

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8 select-none max-w-2xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playCardFlip();
            leaveOnlineRoom();
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-400 transition"
        >
          <LogOut size={16} /> ออกจากห้อง
        </button>

        {isHost && (
          <button
            onClick={() => {
              sounds.playCardFlip();
              setShowRulesModal(true);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-slate-900 border border-amber-600/50 px-3 py-1.5 rounded-xl shadow"
          >
            <Sliders size={14} /> กติกาห้อง: {roomInfo.settings.preset.toUpperCase()}
          </button>
        )}
      </div>

      {/* Main Lobby Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto"
      >
        {/* Room Code Display Banner */}
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
            รหัสห้องสำหรับเชิญเพื่อน (Room Code)
          </span>
          <div className="inline-flex items-center gap-3 bg-slate-950 border border-amber-500/80 rounded-2xl px-5 py-2.5 shadow-inner">
            <span className="text-3xl sm:text-4xl font-mono font-black text-amber-400 tracking-wider">
              {roomInfo.code}
            </span>
            <button
              onClick={copyRoomCode}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow"
              title="คัดลอกรหัสห้อง"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        {/* Player List Card */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-bold">
            <span>ผู้เล่นในห้อง ({roomInfo.players.length}/{roomInfo.settings.maxPlayers})</span>
            <span>สถานะ</span>
          </div>

          {roomInfo.players.map((p) => {
            const isPlayerHost = p.id === roomInfo.hostId;
            return (
              <div
                key={p.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100">
                      <span>{p.name}</span>
                      {isPlayerHost && (
                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-semibold">
                          <Crown size={10} /> หัวหน้าห้อง
                        </span>
                      )}
                      {p.isAI && (
                        <span className="bg-sky-950 text-sky-400 border border-sky-800 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-semibold">
                          <Bot size={10} /> AI
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  {isPlayerHost || p.isAI ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={16} /> พร้อม
                    </span>
                  ) : p.isReady ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={16} /> พร้อมแล้ว
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Clock size={16} /> ยังไม่พร้อม
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add AI Button (Host only) */}
          {isHost && roomInfo.players.length < roomInfo.settings.maxPlayers && (
            <button
              onClick={() => {
                sounds.playCardFlip();
                addOnlineAI();
              }}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-amber-400 text-slate-400 hover:text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Plus size={16} /> เพิ่มบอท AI ({roomInfo.players.length}/{roomInfo.settings.maxPlayers})
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2">
          {isHost ? (
            <button
              disabled={!canStart}
              onClick={() => {
                sounds.playCardFlip();
                startOnlineGame();
              }}
              className={`w-full py-4 rounded-2xl font-black text-base transition flex items-center justify-center gap-2 shadow-lg
                ${
                  canStart
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-glow-gold'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
            >
              <Play size={20} />
              {roomInfo.players.length < roomInfo.settings.minPlayers
                ? `ต้องการผู้เล่นอย่างน้อย ${roomInfo.settings.minPlayers} คน`
                : !canStart
                ? 'รอผู้เล่นทุกคนกดพร้อม...'
                : 'เริ่มเกมทันที! (Start Game)'}
            </button>
          ) : (
            <button
              onClick={() => {
                sounds.playCoin();
                toggleReady();
              }}
              className={`w-full py-4 rounded-2xl font-black text-base transition flex items-center justify-center gap-2 shadow-lg
                ${
                  me?.isReady
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-glow-gold'
                }`}
            >
              {me?.isReady ? '✓ พร้อมแล้ว (กดยกเลิก)' : 'กดพร้อมเล่น (Ready)'}
            </button>
          )}
        </div>
      </motion.div>

      <div className="text-center text-xs text-slate-500">
        Hamster Coup • ห้องจะเริ่มเล่นเมื่อหัวหน้าห้องกดปุ่ม
      </div>
    </div>
  );
};
