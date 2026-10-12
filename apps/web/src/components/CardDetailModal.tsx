import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterRole, CHARACTERS } from '@hamster-coup/shared';
import { GoldenAcornIcon } from './CharacterArtwork';
import { sounds } from '../audio/soundEffects';
import {
  X,
  Sparkles,
  RotateCw,
  Crown,
  Swords,
  Repeat,
  Crosshair,
  ShieldCheck,
  Search,
  Lightbulb,
  Shield
} from 'lucide-react';

interface CardDetailModalProps {
  role: CharacterRole | null;
  onClose: () => void;
}

const ROLE_ICONS: Record<CharacterRole, React.ReactNode> = {
  duke: <Crown size={20} className="text-amber-400" />,
  captain: <Swords size={20} className="text-sky-400" />,
  ambassador: <Repeat size={20} className="text-emerald-400" />,
  assassin: <Crosshair size={20} className="text-red-400" />,
  contessa: <ShieldCheck size={20} className="text-pink-400" />,
  inquisitor: <Search size={20} className="text-purple-400" />
};

const BLUFF_TIPS: Record<CharacterRole, string> = {
  duke: 'เก็บภาษี 3 เหรียญตั้งแต่รอบแรกๆ เป็นการเคลื่อนไหวที่นิยมมากเพราะสะสมเหรียญเร็วที่สุด แต่อาจถูกผู้เล่นอื่นท้าทาย (Challenge) หากสงสัยว่าคุณไม่ได้ถือการ์ดนี้จริง',
  captain: 'ขโมย 2 เหรียญจากผู้เล่นที่มีเหรียญเยอะเพื่อสกัดดาวรุ่ง ระวังคู่แข่งที่อาจอ้างตนเป็น Captain หรือ Ambassador เพื่อบล็อกคุณ',
  ambassador: 'เหมาะสำหรับการสลับไพ่เมื่อถือการ์ดที่ไม่ต้องการ และสามารถอ้างสิทธิ์เพื่อบล็อกการขโมยของ Captain ได้อย่างแนบเนียน',
  assassin: 'จ่าย 3 เหรียญสังหารไพ่ฝ่ายตรงข้าม เป็นท่าที่กดดันที่สุด แต่ระวังเป้าหมายอาจบลัฟว่าถือ Contessa เพื่อบล็อกการโจมตีของคุณ',
  contessa: 'การ์ดป้องกันชีวิตชั้นยอด ผู้เล่นมักบลัฟว่ามี Contessa เสมอเมื่อถูก Assassin เล็ง เพราะหากบล็อกสำเร็จ Assassin จะเสีย 3 เหรียญฟรี',
  inquisitor: 'ความสามารถในการสืบสวนและแอบดูไพ่ลับ 1 ใบของคู่แข่ง ทำให้คุณรู้ความจริงว่าเขากำลังโกหกหรือไม่'
};

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ role, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!role) return null;

  const def = CHARACTERS[role];
  const bluffTip = BLUFF_TIPS[role];

  const handleFlip = () => {
    sounds.playCardFlip();
    setIsFlipped(!isFlipped);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
        {/* Animated modal card box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-4xl bg-[#0F1624] border border-amber-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl overflow-hidden my-auto"
        >
          {/* Ambient Corner Glow */}
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none opacity-20 blur-3xl"
            style={{ backgroundColor: def.color }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full pointer-events-none opacity-15 blur-3xl"
            style={{ backgroundColor: def.colorSecondary }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-400 hover:text-white flex items-center justify-center transition z-20"
          >
            <X size={18} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left Column: 3D Flippable Card Stage */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div
                className="perspective-1000 cursor-pointer group w-64 sm:w-72 h-96 sm:h-[420px]"
                onClick={handleFlip}
                title="คลิกเพื่อพลิกการ์ด 3D"
              >
                <motion.div
                  className="relative w-full h-full transform-style-3d transition-transform duration-700"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {/* FRONT FACE */}
                  <div className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden border-2 border-amber-500/60 shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col justify-between p-3.5 group-hover:shadow-glow-gold transition-shadow">
                    {/* Top bar */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5">
                        {ROLE_ICONS[role]}
                        <span
                          className="text-xs font-black tracking-widest uppercase"
                          style={{ color: def.color }}
                        >
                          {def.id.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs font-black text-amber-300/80">
                        {def.titleEn}
                      </span>
                    </div>

                    {/* Character Portrait Art Frame */}
                    <div className="relative w-full flex-1 my-2 rounded-2xl overflow-hidden border border-amber-500/40 bg-slate-950 shadow-inner flex items-center justify-center card-foil-container">
                      <img
                        src={def.image}
                        alt={def.nameTh}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Holographic foil sweep */}
                      <div className="card-foil-sheen" />
                      {/* Dark gradient base */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                    </div>

                    {/* Bottom identity tag */}
                    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 text-center">
                      <div className="text-base font-black text-white flex items-center justify-center gap-2">
                        <span>{def.nameEn}</span>
                        <span className="text-xs font-bold text-amber-400">({def.nameTh})</span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5 truncate font-medium">
                        {def.titleTh}
                      </div>
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl overflow-hidden border-2 border-amber-500/80 shadow-2xl bg-gradient-to-b from-[#181109] via-slate-950 to-[#0e0904] flex flex-col items-center justify-center p-6 text-center select-none">
                    <div className="absolute inset-2 border border-amber-500/30 rounded-2xl flex flex-col items-center justify-center p-4">
                      {/* Royal Golden Acorn Seal */}
                      <div className="w-20 h-20 rounded-full border-2 border-amber-400/80 bg-amber-950/80 flex items-center justify-center shadow-glow-gold-lg mb-3">
                        <GoldenAcornIcon size={46} />
                      </div>
                      <div className="text-lg font-black text-amber-300 tracking-wider">
                        HAMSTER COUP
                      </div>
                      <div className="text-[11px] font-extrabold tracking-widest text-amber-500 uppercase mt-0.5">
                        GOLDEN ACORNS COURT
                      </div>
                      <div className="w-16 h-0.5 bg-amber-500/40 my-3 rounded-full" />
                      <div className="text-xs text-slate-400 leading-relaxed font-serif italic max-w-[200px]">
                        "Your role is a secret. Your ambition is not."
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Flip Hint Button */}
              <button
                onClick={handleFlip}
                className="mt-3.5 px-4 py-1.5 rounded-full bg-slate-900 border border-amber-500/40 text-amber-300 hover:text-white hover:border-amber-400 text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <RotateCw size={13} className="animate-spin-slow" />
                <span>{isFlipped ? 'ดูหน้าการ์ด (Flip to Front)' : 'ดูหลังการ์ด 3D (Flip to Back)'}</span>
              </button>
            </div>

            {/* Right Column: Character Codex & Gameplay Guide */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${def.color}25`, color: def.color }}
                  >
                    ROYAL COURT CODEX
                  </span>
                  <span className="text-xs text-slate-400">• บทบาทลับราชสำนัก</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-2">
                  <span>{def.nameEn}</span>
                  <span className="text-lg font-bold text-amber-400">({def.nameTh})</span>
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-amber-300/90 mt-0.5">
                  {def.titleTh} • {def.titleEn}
                </p>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
                  {def.descriptionTh}
                </p>
              </div>

              {/* Abilities Grid */}
              <div className="space-y-2.5">
                <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} /> ความสามารถประจำตำแหน่ง (Abilities)
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {/* Action */}
                  <div className="bg-[#121A28] border border-slate-800 rounded-2xl p-3">
                    <div className="text-xs font-black text-amber-300 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>แอ็กชันโจมตี / เสริมกำลัง (Action)</span>
                    </div>
                    {def.actionsTh.length > 0 ? (
                      def.actionsTh.map((act, i) => (
                        <div key={i} className="text-xs text-slate-200 pl-3 border-l-2 border-amber-500/40 my-1">
                          {act}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 pl-3 italic">
                        ไม่มีแอ็กชันโจมตีในรอบของตนเอง
                      </div>
                    )}
                  </div>

                  {/* Block */}
                  <div className="bg-[#121A28] border border-slate-800 rounded-2xl p-3">
                    <div className="text-xs font-black text-pink-300 mb-1 flex items-center gap-1.5">
                      <Shield size={13} className="text-pink-400" />
                      <span>ความสามารถป้องกัน / ขัดขวาง (Block Counteraction)</span>
                    </div>
                    {def.blocksTh.length > 0 ? (
                      def.blocksTh.map((blk, i) => (
                        <div key={i} className="text-xs text-slate-200 pl-3 border-l-2 border-pink-500/40 my-1">
                          {blk}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 pl-3 italic">
                        ไม่สามารถขัดขวางหรือบล็อกการโจมตีใดๆ ได้
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bluff Strategy Tip */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Lightbulb size={18} />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-300 mb-0.5">
                    เคล็ดลับการบลัฟและกลยุทธ์ (Bluffing Strategy)
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    {bluffTip}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
