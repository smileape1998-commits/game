import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicGameState, PublicPlayer, ActionType } from '@hamster-coup/shared';
import { GoldenAcornIcon } from './CharacterArtwork';
import { sounds } from '../audio/soundEffects';
import {
  Crown,
  Swords,
  Shield,
  Zap,
  Crosshair,
  Repeat,
  Skull,
  Coins,
  Sparkles
} from 'lucide-react';

interface FlyingCoin {
  id: string;
  startX: number; // percentage or px
  startY: number;
  endX: number;
  endY: number;
  delay: number;
}

interface FloatingBadge {
  id: string;
  playerId: string;
  amount: number;
  x: number;
  y: number;
}

interface ActionFXOverlayProps {
  publicGameState: PublicGameState;
  activeViewerPlayerId: string;
  onScreenShake?: () => void;
}

export const ActionFXOverlay: React.FC<ActionFXOverlayProps> = ({
  publicGameState,
  activeViewerPlayerId,
  onScreenShake
}) => {
  const [flyingCoins, setFlyingCoins] = useState<FlyingCoin[]>([]);
  const [floatingBadges, setFloatingBadges] = useState<FloatingBadge[]>([]);

  const prevAcornsRef = useRef<Record<string, number>>({});
  const prevEventIdRef = useRef<string | null>(null);
  const prevPhaseRef = useRef<string>(publicGameState.phase);

  // Approximate screen position coordinates for player zones
  const getPlayerScreenCoords = (playerId: string): { x: number; y: number } => {
    if (playerId === activeViewerPlayerId) {
      // Current viewer is at bottom center
      return { x: 50, y: 78 };
    }
    // Opponents are at top
    const opponents = Object.values(publicGameState.players).filter(
      (p) => p.id !== activeViewerPlayerId
    );
    const idx = opponents.findIndex((p) => p.id === playerId);
    if (idx === -1) return { x: 50, y: 50 };
    const step = 80 / Math.max(opponents.length, 1);
    const x = 15 + idx * step + step / 2;
    return { x: Math.min(Math.max(x, 15), 85), y: 18 };
  };

  // 1. Detect Acorn gains / losses across all players
  useEffect(() => {
    const players = publicGameState.players;
    const newFlyingCoins: FlyingCoin[] = [];
    const newBadges: FloatingBadge[] = [];

    Object.values(players).forEach((p) => {
      const prev = prevAcornsRef.current[p.id];
      if (prev !== undefined && p.acorns !== prev) {
        const diff = p.acorns - prev;
        const coords = getPlayerScreenCoords(p.id);

        // Badge popup
        newBadges.push({
          id: `${p.id}_${Date.now()}_${Math.random()}`,
          playerId: p.id,
          amount: diff,
          x: coords.x,
          y: coords.y
        });

        // Flying coins animation
        if (diff > 0) {
          const coinCount = Math.min(Math.abs(diff), 5);
          for (let i = 0; i < coinCount; i++) {
            newFlyingCoins.push({
              id: `coin_${p.id}_${Date.now()}_${i}`,
              startX: 50 + (Math.random() * 10 - 5),
              startY: 45 + (Math.random() * 6 - 3),
              endX: coords.x + (Math.random() * 4 - 2),
              endY: coords.y,
              delay: i * 0.1
            });
          }
        }
      }
      prevAcornsRef.current[p.id] = p.acorns;
    });

    if (newBadges.length > 0) {
      setFloatingBadges((prev) => [...prev, ...newBadges]);
      setTimeout(() => {
        setFloatingBadges((prev) =>
          prev.filter((b) => !newBadges.some((nb) => nb.id === b.id))
        );
      }, 1600);
    }

    if (newFlyingCoins.length > 0) {
      setFlyingCoins((prev) => [...prev, ...newFlyingCoins]);
      setTimeout(() => {
        setFlyingCoins((prev) =>
          prev.filter((fc) => !newFlyingCoins.some((nfc) => nfc.id === fc.id))
        );
      }, 1400);
    }
  }, [publicGameState.players, activeViewerPlayerId]);

  // 2. Detect Action & Event Execution from History
  useEffect(() => {
    const latestEvent = publicGameState.history[0];
    if (!latestEvent || latestEvent.id === prevEventIdRef.current) return;
    prevEventIdRef.current = latestEvent.id;

    const text = (latestEvent.messageTh || '').toLowerCase();

    if (text.includes('รัฐประหาร') || text.includes('coup') || text.includes('ลอบสังหาร') || text.includes('assassin') || text.includes('สูญเสียอิทธิพล') || text.includes('ตกรอบ')) {
      if (onScreenShake) onScreenShake();
    }
  }, [publicGameState.history, onScreenShake]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none">


      {/* 2. Flying Golden Acorns (Currency Transfer Flight) */}
      <AnimatePresence>
        {flyingCoins.map((fc) => (
          <motion.div
            key={fc.id}
            initial={{
              left: `${fc.startX}%`,
              top: `${fc.startY}%`,
              scale: 0.5,
              opacity: 0
            }}
            animate={{
              left: `${fc.endX}%`,
              top: `${fc.endY}%`,
              scale: [0.5, 1.25, 0.9],
              opacity: [0, 1, 1, 0.8]
            }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{
              duration: 0.85,
              delay: fc.delay,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-50 pointer-events-none drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]"
          >
            <GoldenAcornIcon size={26} />
            {/* Sparkle particle trail */}
            <div className="absolute -inset-1 rounded-full bg-amber-400/30 blur-sm pointer-events-none" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 3. Floating Delta Badges (+1, +2, +3, -2, -7) */}
      <AnimatePresence>
        {floatingBadges.map((badge) => {
          const isPositive = badge.amount > 0;
          return (
            <motion.div
              key={badge.id}
              initial={{
                left: `${badge.x}%`,
                top: `${badge.y}%`,
                opacity: 0,
                scale: 0.6,
                y: 0
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1.25, 1.1, 0.8],
                y: isPositive ? -48 : -32
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 font-black text-sm sm:text-base px-3 py-1 rounded-full shadow-2xl flex items-center gap-1.5 z-50 border pointer-events-none ${
                isPositive
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-300 shadow-amber-400/60'
                  : 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-400 shadow-red-500/60'
              }`}
            >
              <span>{isPositive ? `+${badge.amount}` : badge.amount}</span>
              <GoldenAcornIcon size={16} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
