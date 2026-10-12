import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { InfluenceCard, CHARACTERS } from '@hamster-coup/shared';
import { CharacterArtwork, GoldenAcornIcon } from './CharacterArtwork';
import { Sparkles, Eye } from 'lucide-react';

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
  const [imgError, setImgError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!triedFallback && card) {
      setTriedFallback(true);
      const def = CHARACTERS[card.role];
      const parts = def.image.split('/');
      const fileName = parts.pop() || '';
      const altFileName =
        fileName.charAt(0) === fileName.charAt(0).toUpperCase()
          ? fileName.charAt(0).toLowerCase() + fileName.slice(1)
          : fileName.charAt(0).toUpperCase() + fileName.slice(1);
      e.currentTarget.src = [...parts, altFileName].join('/');
    } else {
      setImgError(true);
    }
  };

  if (isFaceDown || !card) {
    // Face-Down Card Back
    return (
      <motion.div
        whileHover={selectable ? { scale: 1.05, y: -4 } : {}}
        onClick={selectable ? onClick : undefined}
        className={`relative rounded-2xl border-2 transition-all flex flex-col items-center justify-center overflow-hidden select-none
          ${size === 'sm' ? 'w-20 h-28' : size === 'lg' ? 'w-48 h-72' : 'w-32 h-48'}
          ${selectable ? 'cursor-pointer hover:border-amber-400' : 'cursor-default'}
          ${selected ? 'ring-4 ring-amber-400 border-amber-300' : 'border-amber-800/80'}
          bg-gradient-to-b from-slate-900 via-amber-950/50 to-slate-950 shadow-2xl`}
      >
        {/* Ornate Card Back Pattern */}
        <div className="absolute inset-2 border border-amber-600/40 rounded-xl flex flex-col items-center justify-center p-2 bg-slate-950/40">
          <div className="w-12 h-12 rounded-full border border-amber-500/50 flex items-center justify-center bg-amber-950/60 shadow-inner">
            <GoldenAcornIcon size={size === 'sm' ? 20 : 28} />
          </div>
          <span className="text-[10px] font-black text-amber-400/80 tracking-widest uppercase mt-2">
            HAMSTER
          </span>
          <span className="text-[8px] text-amber-500/70 font-bold">COUP</span>
        </div>
      </motion.div>
    );
  }

  const def = CHARACTERS[card.role];

  return (
    <motion.div
      whileHover={selectable ? { scale: 1.05, y: -4 } : {}}
      onClick={selectable ? onClick : undefined}
      className={`relative rounded-2xl border-2 transition-all overflow-hidden select-none flex flex-col justify-between
        ${size === 'sm' ? 'w-24 h-36' : size === 'lg' ? 'w-48 h-72' : 'w-32 sm:w-36 h-48 sm:h-52'}
        ${selectable ? 'cursor-pointer hover:border-amber-300' : 'cursor-default'}
        ${selected ? 'ring-4 ring-amber-400 border-amber-300 shadow-glow-gold' : 'border-amber-600/70 shadow-xl'}
        ${isRevealedLost ? 'grayscale opacity-60 border-red-900/60' : 'bg-slate-950'}`}
      style={{
        boxShadow: selected
          ? `0 0 20px ${def.color}80`
          : `0 6px 18px rgba(0,0,0,0.6)`
      }}
    >
      {/* If official image is available and not errored, render authentic card image */}
      {!imgError ? (
        <div className="relative w-full h-full flex flex-col justify-between">
          <img
            src={def.image}
            alt={def.nameTh}
            className="absolute inset-0 w-full h-full object-cover"
            onError={handleImgError}
          />

          {/* Semi-transparent ability overlay strip at bottom for quick reading */}
          <div className="relative mt-auto bg-slate-950/85 backdrop-blur-[2px] border-t border-amber-500/40 px-1 py-0.5 text-center">
            <div className="text-[10px] font-bold text-amber-300 truncate">
              {def.nameTh}
            </div>
            <div className="text-[8px] text-slate-300 truncate opacity-90">
              {def.actionsTh.length > 0
                ? def.actionsTh[0].split(':')[0]
                : def.blocksTh[0]?.split('(')[0] || 'ป้องกัน'}
            </div>
          </div>
        </div>
      ) : (
        // Fallback vector card layout
        <div className="flex flex-col justify-between h-full p-2 bg-gradient-to-b from-slate-900 to-slate-950">
          <div
            className="rounded-t-lg px-2 py-0.5 text-center"
            style={{ backgroundColor: `${def.color}25`, borderBottom: `1px solid ${def.color}60` }}
          >
            <span className="font-bold text-xs text-white drop-shadow">
              {def.nameTh}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center my-1">
            <CharacterArtwork role={card.role} size={size === 'sm' ? 50 : 75} />
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded p-1 text-[9px] text-amber-300 text-center truncate">
            {def.actionsTh[0]?.split(':')[0] || 'ป้องกัน'}
          </div>
        </div>
      )}

      {/* Revealed / Eliminated Stamp */}
      {isRevealedLost && (
        <div className="absolute inset-0 bg-red-950/60 rounded flex items-center justify-center backdrop-blur-[1px]">
          <div className="bg-red-900/95 border border-red-500 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-wider">
            สูญเสียอิทธิพล
          </div>
        </div>
      )}

      {/* Corner Selected Star */}
      {selected && (
        <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 rounded-full p-1 shadow-lg animate-pulse">
          <Sparkles size={12} />
        </div>
      )}
    </motion.div>
  );
};
