import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../state/gameStore';
import { AIPersonality, AIDifficulty } from '@hamster-coup/shared';
import { sounds } from '../../audio/soundEffects';
import { Bot, ArrowLeft, Play, ShieldAlert, Swords, Brain, Shield } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8 select-none max-w-xl mx-auto">
      {/* Top Header */}
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
          โหมดเล่นกับ AI
        </span>
      </div>

      {/* Main Setup Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-glow-gold">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">ตั้งค่าการต่อสู้กับบอท AI</h2>
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
                className={`py-2 rounded-xl text-xs font-bold transition border
                  ${
                    aiCount === count
                      ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-glow-gold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
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
              className={`p-2.5 rounded-xl border text-xs font-bold transition text-center
                ${
                  difficulty === 'easy'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
            >
              <div>🌱 ง่าย (Easy)</div>
              <div className="text-[10px] text-slate-400 font-normal">เล่นตามสัญชาตญาณ</div>
            </button>
            <button
              onClick={() => setDifficulty('normal')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition text-center
                ${
                  difficulty === 'normal'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
            >
              <div>⚔️ ทั่วไป (Normal)</div>
              <div className="text-[10px] text-slate-400 font-normal">ประเมินความเสี่ยง</div>
            </button>
            <button
              onClick={() => setDifficulty('hard')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition text-center
                ${
                  difficulty === 'hard'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
            >
              <div>🧠 เซียน (Hard)</div>
              <div className="text-[10px] text-slate-400 font-normal">นับไพ่และคำนวณโอกาส</div>
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
                className={`p-2 rounded-xl border text-left transition
                  ${
                    personality === item.id
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
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
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-glow-gold flex items-center justify-center gap-2 transition"
        >
          <Play size={20} /> เริ่มการประลองทันที
        </button>
      </motion.div>

      <div className="text-center text-xs text-slate-500">
        AI ใช้กฎและข้อมูลสาธารณะแบบเดียวกับผู้เล่นจริง ไม่มีการโกงอ่านไพ่ลับ
      </div>
    </div>
  );
};
