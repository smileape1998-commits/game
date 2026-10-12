import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../state/gameStore';
import { sounds } from '../../audio/soundEffects';
import { Globe, ArrowLeft, PlusCircle, LogIn, AlertCircle, ChevronRight, Crown } from 'lucide-react';

export const OnlineMenuScreen: React.FC = () => {
  const { setView, createOnlineRoom, joinOnlineRoom, serverError } = useGameStore();
  const [code, setCode] = useState('');

  const handleCreate = () => {
    sounds.playCardFlip();
    createOnlineRoom();
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length >= 4) {
      sounds.playCardFlip();
      joinOnlineRoom(code.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col justify-between p-4 sm:p-8 select-none max-w-xl mx-auto font-sans relative">
      {/* Background Subtle Ambient Aura */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={() => {
            sounds.playCardFlip();
            setView('main_menu');
          }}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition bg-[#101622] border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl"
        >
          <ArrowLeft size={16} /> ย้อนกลับ
        </button>
        <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest">
          HAMSTER COUP / ONLINE
        </span>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#101622] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto z-10"
      >
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">ห้องประลองออนไลน์</h2>
            <p className="text-xs text-slate-400">เล่นกับเพื่อนข้ามอุปกรณ์ผ่านอินเทอร์เน็ตแบบเรียลไทม์</p>
          </div>
        </div>

        {serverError && (
          <div className="mb-5 bg-red-950/60 border border-red-500/60 text-red-200 px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Create Room Button */}
        <div className="space-y-4">
          <button
            onClick={handleCreate}
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/15 flex items-center justify-center gap-2 transition"
          >
            <Crown size={18} /> สร้างห้องใหม่ (Create Private Room)
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-500 font-bold uppercase tracking-wider">หรือเข้าร่วมห้อง</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Join Room Form */}
          <form onSubmit={handleJoin} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5">
                ใส่รหัสห้อง (Room Code):
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={8}
                placeholder="เช่น HAMSTER"
                className="w-full bg-[#0B0E14] border border-slate-700/80 rounded-2xl px-4 py-3.5 text-center text-xl text-amber-300 font-mono font-black tracking-widest focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={code.trim().length < 4}
              className={`w-full py-3.5 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2
                ${
                  code.trim().length >= 4
                    ? 'bg-[#182234] hover:bg-[#202c42] text-white border border-slate-700 shadow-md cursor-pointer'
                    : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                }`}
            >
              <LogIn size={18} /> เข้าร่วมห้อง (Join Table)
            </button>
          </form>
        </div>
      </motion.div>

      <div className="text-center text-xs text-slate-500 z-10">
        Hamster Coup • เซิร์ฟเวอร์ดูแลการประลองและรักษาความลับของไพ่อย่างยุติธรรม
      </div>
    </div>
  );
};
