import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicPlayer, Faction } from '@hamster-coup/shared';
import { GoldenAcornIcon } from './CharacterArtwork';
import { InfluenceCardView } from './InfluenceCardView';
import { Bot, Crown, WifiOff, Skull, Crosshair } from 'lucide-react';

interface PlayerPanelProps {
  player: PublicPlayer;
  isTurn: boolean;
  isTargetable?: boolean;
  onSelectAsTarget?: () => void;
  isCurrentViewer?: boolean;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  isTurn,
  isTargetable = false,
  onSelectAsTarget,
  isCurrentViewer = false
}) => {
  const isDead = !player.isAlive;
  const [acornDelta, setAcornDelta] = useState<number | null>(null);
  const prevAcorns = useRef(player.acorns);

  useEffect(() => {
    if (prevAcorns.current !== player.acorns) {
      const diff = player.acorns - prevAcorns.current;
      if (diff !== 0) {
        setAcornDelta(diff);
        const timer = setTimeout(() => setAcornDelta(null), 1400);
        return () => clearTimeout(timer);
      }
    }
    prevAcorns.current = player.acorns;
  }, [player.acorns]);

  return (
    <motion.div
      animate={isTurn ? { scale: [1, 1.03, 1] } : {}}
      transition={isTurn ? { repeat: Infinity, duration: 2.2 } : {}}
      className={`relative rounded-3xl border transition-all p-3.5 flex flex-col justify-between select-none
        ${isDead ? 'bg-[#0B0E14]/80 border-slate-800/60 opacity-50' : 'bg-[#101622] border-slate-800 shadow-xl'}
        ${isTurn ? 'border-amber-400/90 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/10' : ''}
        ${isTargetable ? 'ring-2 ring-red-500 cursor-pointer hover:border-red-400 hover:scale-105' : ''}
        ${player.faction === 'red' ? 'border-l-4 border-l-red-500' : ''}
        ${player.faction === 'blue' ? 'border-l-4 border-l-blue-500' : ''}
        min-w-[170px] sm:min-w-[200px] max-w-[240px]`}
      onClick={isTargetable ? onSelectAsTarget : undefined}
    >
      {/* Target Crosshair Button overlay */}
      {isTargetable && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg animate-bounce">
          <Crosshair size={12} /> เลือกเป้าหมาย
        </div>
      )}

      {/* Top row: Avatar, Name, Badges */}
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg border-2 shadow-inner
              ${isDead ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-gradient-to-tr from-amber-600 to-amber-400 border-amber-300 text-slate-950'}
              ${player.faction === 'red' ? 'ring-2 ring-red-500' : ''}
              ${player.faction === 'blue' ? 'ring-2 ring-blue-500' : ''}`}
          >
            {player.name.charAt(0)}
          </div>
          {player.isAI && (
            <div className="absolute -bottom-1 -right-1 bg-sky-900 border border-sky-400 text-sky-200 rounded-full p-0.5">
              <Bot size={11} />
            </div>
          )}
          {!player.connected && (
            <div className="absolute -top-1 -right-1 bg-red-900 border border-red-400 text-red-200 rounded-full p-0.5">
              <WifiOff size={11} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-bold text-sm text-slate-100 truncate">
              {player.name}
            </span>
            {isCurrentViewer && (
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded">
                คุณ
              </span>
            )}
          </div>

          {/* Faction and Status */}
          <div className="flex items-center gap-1 text-[10px]">
            {player.faction !== 'neutral' && (
              <span
                className={`font-semibold px-1 rounded ${
                  player.faction === 'red'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-blue-950 text-blue-400 border border-blue-800'
                }`}
              >
                {player.faction === 'red' ? 'ทีมแดง' : 'ทีมน้ำเงิน'}
              </span>
            )}
            {isDead && (
              <span className="flex items-center gap-0.5 text-red-400 font-bold">
                <Skull size={10} /> ตกรอบ
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle row: Acorn Currency Counter */}
      <div className="relative my-2 bg-[#0B0E14] border border-slate-800/80 rounded-2xl px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-200">
          <GoldenAcornIcon size={18} />
          <span>ลูกโอ๊กทองคำ</span>
        </div>
        <div className="relative flex items-center gap-0.5 font-black text-sm text-amber-400">
          <span>{player.acorns}</span>
          <AnimatePresence>
            {acornDelta !== null && (
              <motion.span
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -20, scale: 1.15 }}
                exit={{ opacity: 0, y: -30, scale: 0.7 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`absolute -top-1 right-0 text-[10px] font-black px-1.5 py-0.2 rounded-full pointer-events-none shadow-md z-20 ${
                  acornDelta > 0
                    ? 'bg-amber-400 text-slate-950 shadow-amber-400/50'
                    : 'bg-red-500 text-white shadow-red-500/50'
                }`}
              >
                {acornDelta > 0 ? `+${acornDelta}` : acornDelta}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom row: Influence Cards Status */}
      <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-800/80">
        {/* Living Hidden Cards */}
        {Array.from({ length: player.influenceCount }).map((_, idx) => (
          <InfluenceCardView key={`hidden_${idx}`} isFaceDown size="sm" />
        ))}
        {/* Revealed Dead Cards */}
        {player.revealedCards.map((card) => (
          <InfluenceCardView
            key={card.id}
            card={card}
            isRevealedLost
            size="sm"
          />
        ))}
      </div>
    </motion.div>
  );
};
