import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Faction, PublicPlayer } from '@hamster-coup/shared';
import { GoldenAcornIcon } from './CharacterArtwork';
import { sounds } from '../audio/soundEffects';
import { Trophy, RefreshCw, Home, Users } from 'lucide-react';

interface GameOverModalProps {
  winnerPlayerId?: string;
  winningFaction?: Faction;
  players: Record<string, PublicPlayer>;
  turnCount: number;
  onRematch: () => void;
  onExitToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winnerPlayerId,
  winningFaction,
  players,
  turnCount,
  onRematch,
  onExitToMenu
}) => {
  const winner = winnerPlayerId ? players[winnerPlayerId] : undefined;

  useEffect(() => {
    sounds.playVictory();
    // Fire festive fireworks
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);
    } catch (e) {
      // safe fallback if confetti canvas fails
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-amber-300 flex items-center justify-center text-slate-950 mb-4 shadow-glow-gold">
          <Trophy size={40} />
        </div>

        <h2 className="text-sm font-bold tracking-widest text-amber-400 uppercase mb-1">
          การประลองสิ้นสุดลงแล้ว!
        </h2>

        {winningFaction && winningFaction !== 'neutral' ? (
          <div>
            <div className="text-3xl font-black text-white mb-2">
              ชัยชนะของ
            </div>
            <div
              className={`text-3xl font-extrabold mb-3 ${
                winningFaction === 'red' ? 'text-red-400' : 'text-blue-400'
              }`}
            >
              {winningFaction === 'red' ? '👑 ทีมสีแดง (Red Team)' : '👑 ทีมสีน้ำเงิน (Blue Team)'}
            </div>
          </div>
        ) : winner ? (
          <div>
            <div className="text-2xl font-bold text-slate-200 mb-1">
              ผู้ชนะเลิศเพียงหนึ่งเดียว
            </div>
            <div className="text-3xl sm:text-4xl font-black text-amber-400 mb-3 tracking-wide">
              {winner.name}
            </div>
          </div>
        ) : (
          <div className="text-2xl font-bold text-slate-200 mb-3">
            เสมอ! (Draw)
          </div>
        )}

        {/* Stats card */}
        <div className="bg-[#0B0E14] border border-slate-800 rounded-2xl p-3 my-4 flex justify-around text-xs text-slate-300">
          <div>
            <div className="text-slate-400">จำนวนรอบ</div>
            <div className="text-base font-extrabold text-amber-300">{turnCount} รอบ</div>
          </div>
          <div>
            <div className="text-slate-400">รางวัลสูงสุด</div>
            <div className="text-base font-extrabold text-amber-400 flex items-center justify-center gap-1">
              <GoldenAcornIcon size={16} /> บัลลังก์ทองคำ
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              sounds.playCardFlip();
              onRematch();
            }}
            className="btn-shimmer-container py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm transition flex items-center justify-center gap-1.5 shadow-xl shadow-amber-500/20"
          >
            <RefreshCw size={16} /> เล่นใหม่อีกครั้ง
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sounds.playCardFlip();
              onExitToMenu();
            }}
            className="py-3.5 px-4 rounded-2xl border border-slate-700 bg-[#162030] hover:bg-[#1f2b42] text-slate-200 font-bold text-sm transition flex items-center justify-center gap-1.5"
          >
            <Home size={16} /> กลับเมนูหลัก
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
