import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CHARACTERS, CharacterRole } from '@hamster-coup/shared';
import { CharacterArtwork, GoldenAcornIcon } from './CharacterArtwork';
import { X, BookOpen, Swords, Shield, Coins, Users } from 'lucide-react';

export const HowToPlayModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'characters' | 'bluffing' | 'reformation'>('basics');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-5 sm:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-lg">
            <BookOpen size={22} />
            <span>คู่มือการเล่น (How to Play & Character Codex)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-5 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('basics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap
              ${activeTab === 'basics' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            <Coins size={14} /> พื้นฐานและเป้าหมาย
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap
              ${activeTab === 'characters' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            🐹 สารานุกรมตัวละคร
          </button>
          <button
            onClick={() => setActiveTab('bluffing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap
              ${activeTab === 'bluffing' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            <Swords size={14} /> การบลัฟและท้าทาย
          </button>
          <button
            onClick={() => setActiveTab('reformation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap
              ${activeTab === 'reformation' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            <Users size={14} /> ระบบก๊ก (Reformation)
          </button>
        </div>

        {/* Tab 1: Basics */}
        {activeTab === 'basics' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <h4 className="font-extrabold text-amber-400 text-base mb-1">
                เป้าหมายของเกม
              </h4>
              <p>
                ผู้เล่นทุกคนจะเริ่มต้นด้วย <span className="text-amber-300 font-bold">ไพ่อิทธิพลลับ 2 ใบ</span> และ <span className="text-amber-300 font-bold">ลูกโอ๊กทองคำ 2 เม็ด</span> ผู้ที่สามารถกำจัดอิทธิพลของศัตรูทั้งหมดและอยู่รอดเป็นคนสุดท้าย (หรือทีมสุดท้าย) จะเป็นผู้ชนะในอาณาจักรแฮมสเตอร์!
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="font-extrabold text-amber-400 text-base mb-1">
                การกระทำพื้นฐานในแต่ละรอบ
              </h4>
              <div>
                • <strong className="text-white">รับเงิน (Income):</strong> รับ 1 ลูกโอ๊กทองคำจากคลังกลาง (ไม่สามารถถูกขัดขวางหรือท้าทายได้)
              </div>
              <div>
                • <strong className="text-white">ขอความช่วยเหลือ (Foreign Aid):</strong> รับ 2 ลูกโอ๊กทองคำ (สามารถถูกขัดขวางโดยผู้เล่นที่อ้างเป็นเจ้าพระยา)
              </div>
              <div>
                • <strong className="text-white">รัฐประหาร (Coup):</strong> จ่าย 7 ลูกโอ๊กทองคำ บังคับให้เป้าหมาย 1 คนสูญเสีย 1 อิทธิพลทันที (ไม่สามารถขัดขวางหรือท้าทายได้)
              </div>
              <div className="text-red-400 font-bold bg-red-950/50 p-2 rounded-lg border border-red-900/60 mt-2">
                ⚠️ กฎบังคับรัฐประหาร: หากผู้เล่นเริ่มรอบด้วยลูกโอ๊ก 10 เม็ดขึ้นไป จะต้องทำ "รัฐประหาร (Coup)" เท่านั้น!
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Characters */}
        {activeTab === 'characters' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(CHARACTERS).map((char) => (
              <div
                key={char.id}
                className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex gap-3 items-start"
              >
                <div className="shrink-0">
                  <CharacterArtwork role={char.id} size={58} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-sm text-white flex items-center justify-between">
                    <span>{char.nameTh}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{char.nameEn}</span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold mb-1">
                    {char.titleTh}
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-0.5">
                    {char.actionsTh.map((act, i) => (
                      <div key={i} className="text-amber-200/90 font-medium">• {act}</div>
                    ))}
                    {char.blocksTh.map((blk, i) => (
                      <div key={i} className="text-pink-300 font-medium">• {blk}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Bluffing & Challenges */}
        {activeTab === 'bluffing' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <h4 className="font-extrabold text-amber-400 text-base mb-1">
                ศิลปะการบลัฟ (Bluffing)
              </h4>
              <p>
                คุณสามารถอ้างว่าเป็นบทบาทตัวละครใดก็ได้ แม้คุณจะไม่มีไพ่นั้นอยู่ในมือ! แต่ระวังไว้... ผู้เล่นคนอื่นมีสิทธิ์ "ท้าทาย (Challenge)" ได้ทุกเมื่อเมื่อคุณอ้างบทบาท
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-red-950/40 border border-red-800/80 p-3.5 rounded-2xl">
                <div className="font-extrabold text-red-400 text-sm mb-1">
                  1. ถ้าผู้เล่นบลัฟ (ไม่มีไพ่จริง)
                </div>
                <p className="text-xs text-slate-300">
                  การท้าทายสำเร็จ! ผู้เล่นที่พูดปดจะต้องเลือกเปิดเผยไพ่ 1 ใบในมือเพื่อสูญเสียอิทธิพล และแอ็กชันนั้นจะถูกยกเลิกทันที
                </p>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-800/80 p-3.5 rounded-2xl">
                <div className="font-extrabold text-emerald-400 text-sm mb-1">
                  2. ถ้าผู้เล่นมีไพ่จริง (พิสูจน์ได้)
                </div>
                <p className="text-xs text-slate-300">
                  การท้าทายล้มเหลว! ผู้ท้าทายจะเสีย 1 อิทธิพลทันที ส่วนผู้เล่นที่มีไพ่จริงจะสับไพ่นั้นคืนเข้ากองกลางและจั่วใบใหม่ขึ้นมาแทน จากนั้นแอ็กชันจะดำเนินต่อไป
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Reformation */}
        {activeTab === 'reformation' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <h4 className="font-extrabold text-indigo-400 text-base mb-1">
                ระบบก๊กฝ่าย (Reformation Factions)
              </h4>
              <p>
                ผู้เล่นทุกคนจะสังกัด <span className="text-red-400 font-bold">ทีมสีแดง (Red)</span> หรือ <span className="text-blue-400 font-bold">ทีมสีน้ำเงิน (Blue)</span>
              </p>
              <div className="mt-2 space-y-1">
                <div>• <strong className="text-white">ห้ามยิงพวกเดียวกัน:</strong> คุณไม่สามารถรัฐประหาร, ลอบสังหาร หรือปล้นผู้เล่นที่อยู่สีเดียวกันได้</div>
                <div>• <strong className="text-white">การแปรพักตร์:</strong> จ่าย 1 ลูกโอ๊กทองคำเพื่อเปลี่ยนฝ่ายตนเอง หรือจ่าย 2 ลูกโอ๊กเพื่อบังคับให้คู่แข่งเปลี่ยนฝ่าย</div>
                <div>• <strong className="text-white">ชัยชนะของทีม:</strong> เมื่อทีมตรงข้ามตกรอบทั้งหมด สมาชิกทีมที่เหลือรอดทั้งหมดจะชนะร่วมกัน!</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
