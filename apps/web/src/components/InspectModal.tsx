import React from 'react';
import { motion } from 'framer-motion';
import { InfluenceCard, PublicPlayer } from '@hamster-coup/shared';
import { InfluenceCardView } from './InfluenceCardView';
import { sounds } from '../audio/soundEffects';
import { Search, RefreshCw, Check } from 'lucide-react';

interface InspectModalProps {
  inspectedCard?: InfluenceCard;
  inspectorId: string;
  targetId: string;
  myPlayerId: string;
  players: Record<string, PublicPlayer>;
  onInspectDecision: (forceExchange: boolean) => void;
}

export const InspectModal: React.FC<InspectModalProps> = ({
  inspectedCard,
  inspectorId,
  targetId,
  myPlayerId,
  players,
  onInspectDecision
}) => {
  const isInspector = inspectorId === myPlayerId;
  const inspector = players[inspectorId];
  const target = players[targetId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border-2 border-purple-500 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-center"
      >
        <div className="w-12 h-12 mx-auto rounded-full bg-purple-950 border border-purple-500/80 flex items-center justify-center text-purple-400 mb-2">
          <Search size={24} />
        </div>

        <h3 className="text-xl font-extrabold text-purple-400 mb-1">
          สืบสวนไพ่ลับ (Inquisitor Inspection)
        </h3>

        {isInspector && inspectedCard ? (
          <div>
            <p className="text-xs text-slate-300 mb-3">
              คุณตรวจพบไพ่ลับ 1 ใบของ <span className="text-amber-400 font-bold">{target?.name}</span>:
            </p>

            <div className="flex justify-center mb-5">
              <InfluenceCardView card={inspectedCard} size="md" />
            </div>

            <p className="text-xs text-slate-400 mb-4">
              คุณต้องการบังคับให้เขาคืนไพ่นี้เข้ากองและจั่วใหม่ หรือให้เขาเก็บไพ่นี้ไว้?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sounds.playCardFlip();
                  onInspectDecision(true);
                }}
                className="py-2.5 px-3 rounded-xl border border-purple-500 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <RefreshCw size={14} /> บังคับเปลี่ยนไพ่ (Force Redraw)
              </button>
              <button
                onClick={() => {
                  sounds.playCardFlip();
                  onInspectDecision(false);
                }}
                className="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Check size={14} /> ให้เก็บไพ่ไว้ (Keep)
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6">
            <p className="text-sm font-bold text-slate-200">
              <span className="text-purple-400">{inspector?.name}</span> กำลังตรวจค้นไพ่ลับของ{' '}
              <span className="text-amber-400">{target?.name}</span>...
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
