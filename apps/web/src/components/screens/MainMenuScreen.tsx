import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../state/gameStore';
import { GoldenAcornIcon } from '../CharacterArtwork';
import { sounds } from '../../audio/soundEffects';
import {
  Bot,
  Users,
  Globe,
  Sliders,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Crown
} from 'lucide-react';

export const MainMenuScreen: React.FC = () => {
  const {
    playerName,
    setPlayerProfile,
    setView,
    setShowRulesModal,
    setShowHowToPlayModal
  } = useGameStore();

  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setPlayerProfile(nameInput.trim(), 'hamster_1');
    }
    setEditingName(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8 select-none relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {editingName ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/80 rounded-xl px-3 py-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={20}
                className="bg-transparent text-sm text-amber-300 font-bold focus:outline-none"
              />
              <button
                onClick={handleSaveName}
                className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-2 py-0.5 rounded"
              >
                บันทึก
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 rounded-xl px-3 py-1.5 transition"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                {playerName.charAt(0)}
              </div>
              <span className="text-xs font-bold text-slate-200">{playerName}</span>
              <span className="text-[10px] text-amber-400 font-medium">✎ แก้ไข</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playCardFlip();
              setShowRulesModal(true);
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 transition shadow"
            title="ปรับแต่งกติกา"
          >
            <Sliders size={18} />
          </button>
          <button
            onClick={() => {
              sounds.playCardFlip();
              setShowHowToPlayModal(true);
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 transition shadow"
            title="คู่มือการเล่น"
          >
            <BookOpen size={18} />
          </button>
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 transition shadow"
            title="เสียงประกอบ"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      {/* Hero Title Section */}
      <div className="text-center my-auto py-8 z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative inline-block mb-3"
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 border-4 border-amber-300 flex items-center justify-center shadow-glow-gold relative">
            <GoldenAcornIcon size={68} />
            <div className="absolute -top-3 -right-2 bg-red-600 border border-amber-300 text-white rounded-full p-1.5 shadow">
              <Crown size={16} />
            </div>
          </div>
        </motion.div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-xl font-['Cinzel',serif] uppercase">
          Hamster <span className="gold-gradient-text">Coup</span>
        </h1>
        <h2 className="text-base sm:text-xl font-extrabold text-amber-400 mt-1 tracking-wider">
          GOLDEN ACORNS • ชิงบัลลังก์ลูกโอ๊กทองคำ
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
          เกมการ์ดวางแผน บลัฟ ชิงไหวพริบ และสงครามแย่งชิงบัลลังก์อาณาจักรแฮมสเตอร์
        </p>

        {/* Game Mode Buttons Grid */}
        <div className="w-full max-w-sm mt-8 space-y-3">
          {/* Mode A: Play Against AI */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              sounds.playCardFlip();
              setView('ai_setup');
            }}
            className="w-full py-4 px-5 rounded-2xl border-2 border-amber-500/80 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-base shadow-glow-gold flex items-center justify-between transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-950/20 flex items-center justify-center">
                <Bot size={22} className="text-slate-950" />
              </div>
              <div className="text-left">
                <div>เล่นกับบอท AI</div>
                <div className="text-[11px] font-semibold opacity-90">โหมดเล่นคนเดียว 2–6 ผู้เล่น</div>
              </div>
            </div>
            <Sparkles size={18} />
          </motion.button>

          {/* Mode B: Local Multiplayer (Pass & Play) */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              sounds.playCardFlip();
              setView('local_setup');
            }}
            className="w-full py-3.5 px-5 rounded-2xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 hover:border-amber-400 text-white font-bold text-sm shadow-xl flex items-center justify-between transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                <Users size={20} />
              </div>
              <div className="text-left">
                <div>เล่นเครื่องเดียวกัน (Pass & Play)</div>
                <div className="text-[10px] text-slate-400 font-normal">แชร์จอเล่นกับเพื่อน 2–6 คน</div>
              </div>
            </div>
            <span className="text-xs text-amber-400 font-bold">2–6 คน</span>
          </motion.button>

          {/* Mode C: Online Multiplayer */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              sounds.playCardFlip();
              setView('online_menu');
            }}
            className="w-full py-3.5 px-5 rounded-2xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 hover:border-blue-400 text-white font-bold text-sm shadow-xl flex items-center justify-between transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400">
                <Globe size={20} />
              </div>
              <div className="text-left">
                <div>เล่นออนไลน์ (Online Multiplayer)</div>
                <div className="text-[10px] text-slate-400 font-normal">สร้างห้องหรือเข้าร่วมด้วยรหัสห้อง</div>
              </div>
            </div>
            <span className="text-xs text-blue-400 font-bold">สดแบบเรียลไทม์</span>
          </motion.button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[11px] text-slate-500 z-10">
        Hamster Coup: Golden Acorns v1.0 • ได้รับแรงบันดาลใจจาก Coup & Coup: Reformation
      </div>
    </div>
  );
};
