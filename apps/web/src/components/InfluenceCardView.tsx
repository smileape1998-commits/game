import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    // Face-Down Card Back with 3D feel and gentle hover tilt
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        whileHover={
          selectable
            ? { scale: 1.08, y: -6, rotateZ: -1 }
            : { scale: 1.03, y: -3 }
        }
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        onClick={selectable ? onClick : undefined}
        className={`relative rounded-2xl border-2 transition-all flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer
          ${size === 'sm' ? 'w-20 h-28' : size === 'lg' ? 'w-48 h-72' : 'w-32 h-48'}
          ${selectable ? 'hover:border-amber-400 hover:shadow-glow-gold' : 'cursor-default'}
          ${selected ? 'ring-4 ring-amber-400 border-amber-300 shadow-glow-gold-lg' : 'border-amber-800/80'}
          bg-gradient-to-b from-slate-900 via-[#181109] to-slate-950 shadow-2xl`}
      >
        {/* Ornate Card Back Pattern */}
        <div className="absolute inset-2 border border-amber-600/40 rounded-xl flex flex-col items-center justify-center p-2 bg-slate-950/40">
          <div className="w-12 h-12 rounded-full border border-amber-500/50 flex items-center justify-center bg-amber-950/60 shadow-inner">
            <GoldenAcornIcon size={size === 'sm' ? 20 : 28} />
          </div>
          <span className="text-[10px] font-black text-amber-400/90 tracking-widest uppercase mt-2">
            HAMSTER
          </span>
          <span className="text-[8px] text-amber-500/80 font-extrabold tracking-wider">COUP</span>
        </div>

        {/* Gloss Sheen Reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
      </motion.div>
    );
  }

  const def = CHARACTERS[card.role];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 10 }}
      animate={
        isRevealedLost
          ? { scale: 1, opacity: 0.6, rotateZ: 0, filter: 'grayscale(95%) brightness(0.7)' }
          : { scale: 1, opacity: 1, y: 0 }
      }
      whileHover={
        !isRevealedLost
          ? selectable
            ? { scale: 1.08, y: -8, rotateZ: -1.5, zIndex: 20 }
            : { scale: 1.04, y: -4, zIndex: 10 }
          : {}
      }
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      onClick={selectable ? onClick : undefined}
      className={`relative rounded-2xl border-2 transition-all overflow-hidden select-none flex flex-col justify-between
        ${size === 'sm' ? 'w-24 h-36' : size === 'lg' ? 'w-48 h-72' : 'w-32 sm:w-36 h-48 sm:h-52'}
        ${selectable ? 'cursor-pointer hover:border-amber-300 hover:shadow-glow-gold' : 'cursor-default'}
        ${selected ? 'ring-4 ring-amber-400 border-amber-300 shadow-glow-gold-lg' : 'border-amber-600/70 shadow-xl'}
        ${isRevealedLost ? 'border-red-900/60' : 'bg-slate-950'}`}
      style={{
        boxShadow: selected
          ? `0 0 25px ${def.color}90`
          : `0 8px 22px rgba(0,0,0,0.65)`
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
          <div className="relative mt-auto bg-slate-950/85 backdrop-blur-[2px] border-t border-amber-500/40 px-1 py-1 text-center">
            <div className="text-[10px] sm:text-xs font-black text-amber-300 truncate">
              {def.nameTh}
            </div>
            <div className="text-[8px] sm:text-[9px] text-slate-300 truncate opacity-90 font-medium">
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

      {/* Gloss Sheen Reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Revealed / Eliminated Stamp with Entrance Pop Animation */}
      {isRevealedLost && (
        <div className="absolute inset-0 bg-red-950/70 rounded flex items-center justify-center backdrop-blur-[1px] z-10">
          <motion.div
            initial={{ scale: 2, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: -4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="bg-red-900/95 border-2 border-red-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-xl shadow-2xl uppercase tracking-wider text-center"
          >
            สูญเสียอิทธิพล
          </motion.div>
        </div>
      )}

      {/* Corner Selected Star with Pulsing Sparkle */}
      {selected && (
        <div className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 rounded-full p-1 shadow-lg shadow-amber-500/50 animate-pulse z-10">
          <Sparkles size={13} />
        </div>
      )}
    </motion.div>
  );
};
