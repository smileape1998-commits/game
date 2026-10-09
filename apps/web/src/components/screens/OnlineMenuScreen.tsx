import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../state/gameStore';
import { sounds } from '../../audio/soundEffects';
import { Globe, ArrowLeft, PlusCircle, LogIn, AlertCircle } from 'lucide-react';

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
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
          ออนไลน์มัลติเพลเยอร์
        </span>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border-2 border-blue-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-glow-blue">
            <Globe size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">ห้องเล่นออนไลน์</h2>
            <p className="text-xs text-slate-400">เล่นกับเพื่อนข้ามอุปกรณ์ผ่านเครือข่ายอินเทอร์เน็ต</p>
          </div>
        </div>

        {serverError && (
          <div className="mb-5 bg-red-950/80 border border-red-500 text-red-200 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Create Room Button */}
        <div className="space-y-4">
          <button
            onClick={handleCreate}
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base shadow-lg flex items-center justify-center gap-2 transition"
          >
            <PlusCircle size={20} /> สร้างห้องใหม่ (Create Room)
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-500 font-bold">หรือ</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Join Room Form */}
          <form onSubmit={handleJoin} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                ใส่รหัสห้อง 4 หลัก (Room Code):
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="เช่น AB12"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-lg text-amber-300 font-mono font-black tracking-widest focus:outline-none focus:border-blue-400"
              />
            </div>

            <button
              type="submit"
              disabled={code.trim().length < 4}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-sm transition flex items-center justify-center gap-2
                ${
                  code.trim().length >= 4
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 shadow-md'
                    : 'bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                }`}
            >
              <LogIn size={18} /> เข้าร่วมห้อง (Join Room)
            </button>
          </form>
        </div>
      </motion.div>

      <div className="text-center text-xs text-slate-500">
        เซิร์ฟเวอร์เป็นศูนย์กลางคำนวณและตรวจสอบข้อมูลลับอย่างปลอดภัย
      </div>
    </div>
  );
};
