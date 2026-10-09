import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { InfluenceCard } from '@hamster-coup/shared';
import { InfluenceCardView } from './InfluenceCardView';
import { sounds } from '../audio/soundEffects';
import { Repeat } from 'lucide-react';

interface ExchangeModalProps {
  drawnCards: InfluenceCard[];
  myLivingCards: InfluenceCard[];
  keepCount: number;
  onConfirmExchange: (keptCardIds: string[]) => void;
}

export const ExchangeModal: React.FC<ExchangeModalProps> = ({
  drawnCards,
  myLivingCards,
  keepCount,
  onConfirmExchange
}) => {
  const pool = [...myLivingCards, ...drawnCards];
  const [selectedIds, setSelectedIds] = useState<string[]>(
    myLivingCards.map((c) => c.id).slice(0, keepCount)
  );

  const toggleSelect = (id: string) => {
    sounds.playCardFlip();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length < keepCount) {
        setSelectedIds([...selectedIds, id]);
      } else {
        // Replace oldest selection
        setSelectedIds([...selectedIds.slice(1), id]);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedIds.length !== keepCount) return;
    sounds.playCardFlip();
    onConfirmExchange(selectedIds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 max-w-xl w-full shadow-2xl relative text-center"
      >
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950 border border-emerald-500/80 flex items-center justify-center text-emerald-400 mb-2">
          <Repeat size={24} />
        </div>

        <h3 className="text-xl font-extrabold text-emerald-400 mb-1">
          แลกเปลี่ยนไพ่ (Exchange Cards)
        </h3>
        <p className="text-xs text-slate-300 mb-4">
          เลือกเก็บไพ่ไว้ <span className="text-amber-400 font-bold">{keepCount}</span> ใบ (ไพ่ที่ไม่ถูกเลือกจะสับกลับเข้ากองกลาง)
        </p>

        {/* Card Pool Selection */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {pool.map((card) => (
            <InfluenceCardView
              key={card.id}
              card={card}
              selectable
              selected={selectedIds.includes(card.id)}
              onClick={() => toggleSelect(card.id)}
              size="sm"
            />
          ))}
        </div>

        <div className="text-xs text-slate-400 mb-4">
          เลือกแล้ว: <span className="text-emerald-400 font-bold">{selectedIds.length}</span> / {keepCount} ใบ
        </div>

        <button
          disabled={selectedIds.length !== keepCount}
          onClick={handleConfirm}
          className={`w-full py-3 rounded-xl font-extrabold text-sm transition shadow-lg
            ${
              selectedIds.length === keepCount
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/40'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
        >
          ยืนยันการแลกเปลี่ยนไพ่ (Confirm Keep)
        </button>
      </motion.div>
    </div>
  );
};
