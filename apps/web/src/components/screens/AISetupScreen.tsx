import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../state/gameStore';
import { AIPersonality, AIDifficulty } from '@hamster-coup/shared';
import { sounds } from '../../audio/soundEffects';
import { Bot, ArrowLeft, Play, ShieldAlert, Swords, Brain, Shield, ArrowRight } from 'lucide-react';

export const AISetupScreen: React.FC = () => {
  const { setView, startAIGame } = useGameStore();

  const [aiCount, setAiCount] = useState<number>(3); // 1 human + 3 AI = 4 total
  const [difficulty, setDifficulty] = useState<AIDifficulty>('normal');
  const [personality, setPersonality] = useState<AIPersonality>('strategic');

  const handleStart = () => {
    sounds.playCardFlip();
    startAIGame(aiCount, personality, difficulty);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col justify-between p-4 sm:p-8 select-none max-w-xl mx-auto font-sans relative">
      {/* Background Subtle Ambient Aura */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
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
          HAMSTER COUP / AI PRACTICE
        </span>
      </div>

      {/* Main Setup Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#101622] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto z-10"
      >
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">ตั้งค่าการต่อสู้กับบอท AI</h2>
            <p className="text-xs text-slate-400">กำหนดจำนวนคู่แข่ง ระดับความฉลาด และลักษณะนิสัย</p>
          </div>
        </div>

        {/* 1. Total Players Selection */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-300 block mb-2">
            จำนวนผู้เล่นทั้งหมด (รวมตัวคุณ): <span className="text-amber-400 font-extrabold">{aiCount + 1} คน</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((count) => (
              <button
                key={count}
                onClick={() => setAiCount(count)}
                className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                  aiCount === count
                    ? 'border-amber-400/80 bg-amber-950/50 text-amber-300 shadow-sm'
                    : 'border-slate-800 bg-[#0B0E14] text-slate-400 hover:border-slate-700'
                }`}
              >
                {count + 1} คน
              </button>
            ))}
          </div>
        </div>

        {/* 2. Difficulty Selection */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-300 block mb-2">
            ระดับความยากของ AI (Difficulty):
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setDifficulty('easy')}
              className={`p-3 rounded-2xl border text-xs font-bold transition text-center ${
                difficulty === 'easy'
                  ? 'border-amber-400/80 bg-amber-950/50 text-amber-300 shadow-sm'
                  : 'border-slate-800 bg-[#0B0E14] text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>🌱 ง่าย (Easy)</div>
              <div className="text-[10px] text-slate-500 font-normal mt-0.5">เล่นตามสัญชาตญาณ</div>
            </button>
            <button
              onClick={() => setDifficulty('normal')}
              className={`p-3 rounded-2xl border text-xs font-bold transition text-center ${
                difficulty === 'normal'
                  ? 'border-amber-400/80 bg-amber-950/50 text-amber-300 shadow-sm'
                  : 'border-slate-800 bg-[#0B0E14] text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>⚔️ ทั่วไป (Normal)</div>
              <div className="text-[10px] text-slate-500 font-normal mt-0.5">ประเมินความเสี่ยง</div>
            </button>
            <button
              onClick={() => setDifficulty('hard')}
              className={`p-3 rounded-2xl border text-xs font-bold transition text-center ${
                difficulty === 'hard'
                  ? 'border-amber-400/80 bg-amber-950/50 text-amber-300 shadow-sm'
                  : 'border-slate-800 bg-[#0B0E14] text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>🧠 เซียน (Hard)</div>
              <div className="text-[10px] text-slate-500 font-normal mt-0.5">นับไพ่และวิเคราะห์</div>
            </button>
          </div>
        </div>

        {/* 3. AI Personality */}
        <div className="mb-6">
          <label className="text-xs font-bold text-slate-300 block mb-2">
            ลักษณะนิสัยหลักของ AI (Personality):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(
              [
                { id: 'strategic', name: '🧠 วางแผนกลยุทธ์', desc: 'สมดุลและรอบคอบ' },
                { id: 'aggressive', name: '⚔️ ดุดันดั่งโจร', desc: 'ชอบปล้นและสังหาร' },
                { id: 'deceptive', name: '🎭 จอมลวงตา', desc: 'ชอบบลัฟหลอกล่อ' },
                { id: 'cautious', name: '🛡️ ระมัดระวัง', desc: 'ท้าทายเมื่อมั่นใจ' },
                { id: 'defensive', name: '🏰 เน้นป้องกัน', desc: 'ปกป้องอิทธิพล' }
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setPersonality(item.id)}
                className={`p-2.5 rounded-2xl border text-left transition ${
                  personality === item.id
                    ? 'border-amber-400/80 bg-amber-950/50 text-amber-300 shadow-sm'
                    : 'border-slate-800 bg-[#0B0E14] text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{item.name}</div>
                <div className="text-[10px] text-slate-500">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Start Match Button */}
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/15 flex items-center justify-center gap-2 transition"
        >
          <Play size={18} />
          <span>เริ่มการประลองทันที (Enter Practice Arena)</span>
          <ArrowRight size={16} />
        </button>
      </motion.div>

      <div className="text-center text-xs text-slate-500 z-10">
        AI ใช้กฎและข้อมูลสาธารณะแบบเดียวกับผู้เล่นจริง ไม่มีการโกงอ่านไพ่ลับ
      </div>
    </div>
  );
};
