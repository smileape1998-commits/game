import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  InfluenceCard,
  PendingInfluenceLoss,
  PublicPlayer
} from '@hamster-coup/shared';
import { InfluenceCardView } from './InfluenceCardView';
import { sounds } from '../audio/soundEffects';
import { Skull, AlertCircle } from 'lucide-react';

interface InfluenceLossModalProps {
  pendingLoss?: PendingInfluenceLoss;
  myPlayerId: string;
  myCards: InfluenceCard[];
  players: Record<string, PublicPlayer>;
  onSelectCardToLose: (cardId: string) => void;
}

export const InfluenceLossModal: React.FC<InfluenceLossModalProps> = ({
  pendingLoss,
  myPlayerId,
  myCards,
  players,
  onSelectCardToLose
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  if (!pendingLoss) return null;

  const isMe = pendingLoss.playerId === myPlayerId;
  const victim = players[pendingLoss.playerId];
  const livingCards = myCards.filter((c) => !c.revealed);

  const handleConfirm = () => {
    if (!selectedCardId) return;
    sounds.playElimination();
    onSelectCardToLose(selectedCardId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border-2 border-red-500 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-center"
      >
        <div className="w-14 h-14 mx-auto rounded-full bg-red-950 border border-red-500/80 flex items-center justify-center text-red-400 mb-3 shadow-glow-red">
          <Skull size={28} />
        </div>

        <h3 className="text-xl font-extrabold text-red-400 mb-1">
          สูญเสียอิทธิพล! (Lose Influence)
        </h3>

        {isMe ? (
          <div>
            <p className="text-xs text-slate-300 mb-4">
              คุณต้องเลือกไพ่ในมือ 1 ใบเพื่อเปิดเผยและสูญเสียอิทธิพล
            </p>

            <div className="flex justify-center gap-3 mb-6">
              {livingCards.map((card) => (
                <InfluenceCardView
                  key={card.id}
                  card={card}
                  selectable
                  selected={selectedCardId === card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  size="md"
                />
              ))}
            </div>

            <button
              disabled={!selectedCardId}
              onClick={handleConfirm}
              className={`w-full py-3 rounded-xl font-extrabold text-sm transition shadow-lg
                ${
                  selectedCardId
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-glow-red'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
            >
              ยืนยันการเปิดเผยไพ่ (Confirm Sacrifice)
            </button>
          </div>
        ) : (
          <div className="py-6">
            <p className="text-sm font-bold text-slate-200">
              <span className="text-amber-400">{victim?.name || 'ผู้เล่น'}</span> กำลังเลือกไพ่ที่จะเปิดเผย...
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
