import React from 'react';
import { motion } from 'framer-motion';
import { InfluenceCard, CHARACTERS } from '@hamster-coup/shared';
import { CharacterArtwork, GoldenAcornIcon } from './CharacterArtwork';
import { EyeOff, ShieldAlert, Sparkles } from 'lucide-react';

interface CardViewProps {
  card?: InfluenceCard;
  isFaceDown?: boolean;
  isRevealedLost?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const InfluenceCardView: React.FC<CardViewProps> = ({
  card,
  isFaceDown = false,
  isRevealedLost = false,
  selectable = false,
  selected = false,
  onClick,
  size = 'md'
}) => {
  if (isFaceDown || !card) {
    // Face-Down Card Back
    return (
      <motion.div
        whileHover={selectable ? { scale: 1.05, y: -4 } : {}}
        onClick={selectable ? onClick : undefined}
        className={`relative rounded-xl border-2 transition-all flex flex-col items-center justify-center overflow-hidden select-none
          ${size === 'sm' ? 'w-20 h-28' : size === 'lg' ? 'w-44 h-64' : 'w-32 h-48'}
          ${selectable ? 'cursor-pointer hover:border-amber-400' : 'cursor-default'}
          ${selected ? 'ring-4 ring-amber-400 border-amber-300' : 'border-amber-800/80'}
          bg-gradient-to-b from-slate-900 via-amber-950/40 to-slate-950 shadow-2xl`}
      >
        {/* Ornate Card Back Pattern */}
        <div className="absolute inset-2 border border-amber-600/30 rounded-lg flex flex-col items-center justify-center p-2">
          <div className="w-12 h-12 rounded-full border border-amber-500/40 flex items-center justify-center bg-amber-950/50 shadow-inner">
            <GoldenAcornIcon size={size === 'sm' ? 20 : 28} />
          </div>
          <span className="text-[10px] font-bold text-amber-500/70 tracking-widest uppercase mt-2">
            HAMSTER
          </span>
          <span className="text-[8px] text-amber-600/60 font-medium">COUP</span>
        </div>
      </motion.div>
    );
  }

  const def = CHARACTERS[card.role];

  return (
    <motion.div
      whileHover={selectable ? { scale: 1.05, y: -4 } : {}}
      onClick={selectable ? onClick : undefined}
      className={`relative rounded-xl border-2 transition-all flex flex-col justify-between overflow-hidden select-none
        ${size === 'sm' ? 'w-24 h-36 p-1.5' : size === 'lg' ? 'w-48 h-72 p-3' : 'w-36 h-52 p-2'}
        ${selectable ? 'cursor-pointer' : 'cursor-default'}
        ${selected ? 'ring-4 ring-amber-400 border-amber-300 shadow-glow-gold' : 'border-amber-600/70 shadow-xl'}
        ${isRevealedLost ? 'grayscale opacity-60 border-red-900/60' : ''}
        bg-gradient-to-b from-slate-900 to-slate-950`}
      style={{
        boxShadow: selected
          ? `0 0 20px ${def.color}80`
          : `0 4px 15px rgba(0,0,0,0.6)`
      }}
    >
      {/* Role Color Header Banner */}
      <div
        className="rounded-t-lg px-2 py-1 text-center flex flex-col items-center"
        style={{ backgroundColor: `${def.color}25`, borderBottom: `1px solid ${def.color}60` }}
      >
        <span className="font-bold text-xs sm:text-sm tracking-wide text-white drop-shadow">
          {def.nameTh}
        </span>
        <span className="text-[10px] opacity-80 text-slate-300 font-medium tracking-tight">
          {def.nameEn}
        </span>
      </div>

      {/* Central Hamster Artwork */}
      <div className="flex-1 flex items-center justify-center my-1 relative">
        <CharacterArtwork
          role={card.role}
          size={size === 'sm' ? 55 : size === 'lg' ? 110 : 85}
        />
        {isRevealedLost && (
          <div className="absolute inset-0 bg-red-950/60 rounded flex items-center justify-center backdrop-blur-[1px]">
            <div className="bg-red-900/90 border border-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
              สูญเสียอิทธิพล
            </div>
          </div>
        )}
      </div>

      {/* Ability badge summary */}
      <div className="bg-slate-900/80 border border-slate-800 rounded p-1 text-[9px] leading-tight text-slate-300 text-center">
        {def.actionsTh.length > 0 ? (
          <div className="truncate text-amber-300 font-medium">
            {def.actionsTh[0].split(':')[0]}
          </div>
        ) : (
          <div className="truncate text-pink-300 font-medium">
            {def.blocksTh[0]?.split('(')[0] || 'ป้องกัน'}
          </div>
        )}
      </div>

      {/* Corner Status Badge */}
      {selected && (
        <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 rounded-full p-0.5 shadow">
          <Sparkles size={12} />
        </div>
      )}
    </motion.div>
  );
};
