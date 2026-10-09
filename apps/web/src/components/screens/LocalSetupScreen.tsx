import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../state/gameStore';
import { sounds } from '../../audio/soundEffects';
import { Users, ArrowLeft, Play, Plus, Trash2, Smartphone } from 'lucide-react';

export const LocalSetupScreen: React.FC = () => {
  const { setView, startLocalGame } = useGameStore();

  const [players, setPlayers] = useState<string[]>([
    'ผู้เล่น 1 (Pip)',
    'ผู้เล่น 2 (Mochi)',
    'ผู้เล่น 3 (Cheeks)'
  ]);

  const handleAddPlayer = () => {
    if (players.length < 6) {
      sounds.playCardFlip();
      setPlayers([...players, `ผู้เล่น ${players.length + 1}`]);
    }
  };

  const handleRemovePlayer = (index: number) => {
    if (players.length > 2) {
      sounds.playCardFlip();
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const handleNameChange = (index: number, val: string) => {
    const updated = [...players];
    updated[index] = val;
    setPlayers(updated);
  };

  const handleStart = () => {
    sounds.playCardFlip();
    startLocalGame(players);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8 select-none max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playCardFlip();
            setView('main_menu');
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={16} /> ย้อนกลับ
        </button>
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
          โหมดเล่นเครื่องเดียวกัน (Pass & Play)
        </span>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-glow-gold">
            <Users size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">ตั้งค่าผู้เล่นเครื่องเดียวกัน</h2>
            <p className="text-xs text-slate-400">รองรับ 2–6 ผู้เล่น แชร์อุปกรณ์เครื่องเดียว</p>
          </div>
        </div>

        <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-3 mb-5 flex items-start gap-2.5 text-xs text-amber-200">
          <Smartphone size={18} className="shrink-0 text-amber-400 mt-0.5" />
          <span>
            ระบบจะแสดงหน้าต่างส่งต่ออุปกรณ์และซ่อนไพ่ลับระหว่างตาเล่น เพื่อป้องกันไม่ให้ผู้เล่นคนอื่นแอบดูไพ่ของคุณ
          </span>
        </div>

        {/* Players List */}
        <div className="space-y-2.5 mb-6">
          {players.map((name, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </div>
              <input
                type="text"
                value={name}
                maxLength={24}
                onChange={(e) => handleNameChange(idx, e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-bold focus:outline-none focus:border-amber-400"
                placeholder={`ชื่อผู้เล่น ${idx + 1}`}
              />
              {players.length > 2 && (
                <button
                  onClick={() => handleRemovePlayer(idx)}
                  className="p-2 text-slate-500 hover:text-red-400 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}

          {players.length < 6 && (
            <button
              onClick={handleAddPlayer}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-amber-400 text-slate-400 hover:text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Plus size={16} /> เพิ่มผู้เล่น ({players.length}/6)
            </button>
          )}
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-glow-gold flex items-center justify-center gap-2 transition"
        >
          <Play size={20} /> เริ่มการประลอง
        </button>
      </motion.div>

      <div className="text-center text-xs text-slate-500">
        Hamster Coup • Local Pass & Play Mode
      </div>
    </div>
  );
};
