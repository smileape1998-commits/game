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

interface ActionBanner {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  bannerType: 'coup' | 'assassinate' | 'steal' | 'tax' | 'challenge' | 'block' | 'exchange' | 'elimination';
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
  const [activeBanner, setActiveBanner] = useState<ActionBanner | null>(null);

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
    const actor = latestEvent.actorId ? publicGameState.players[latestEvent.actorId]?.name : 'ผู้เล่น';
    const target = latestEvent.targetId ? publicGameState.players[latestEvent.targetId]?.name : '';

    let banner: ActionBanner | null = null;

    if (text.includes('รัฐประหาร') || text.includes('coup')) {
      banner = {
        id: latestEvent.id,
        title: 'COUP DE GRÂCE!',
        subtitle: `${actor} ทำรัฐประหาร ${target ? `ใส่ ${target}` : ''} (-7 ลูกโอ๊ก)`,
        icon: <Swords size={38} className="text-amber-400" />,
        color: 'from-amber-600 via-red-600 to-amber-700',
        glowColor: 'rgba(239, 68, 68, 0.6)',
        bannerType: 'coup'
      };
      sounds.playSlash();
      if (onScreenShake) onScreenShake();
    } else if (text.includes('ลอบสังหาร') || text.includes('assassin')) {
      banner = {
        id: latestEvent.id,
        title: 'ASSASSINATION!',
        subtitle: `${actor} สั่งลอบสังหาร ${target ? `ใส่ ${target}` : ''}`,
        icon: <Crosshair size={38} className="text-red-400" />,
        color: 'from-red-600 via-rose-700 to-slate-900',
        glowColor: 'rgba(244, 63, 94, 0.6)',
        bannerType: 'assassinate'
      };
      sounds.playSlash();
      if (onScreenShake) onScreenShake();
    } else if (text.includes('ขโมย') || text.includes('steal')) {
      banner = {
        id: latestEvent.id,
        title: 'PIRATE STEAL!',
        subtitle: `${actor} ขโมย 2 ลูกโอ๊กจาก ${target || 'คู่แข่ง'}`,
        icon: <Coins size={38} className="text-sky-400" />,
        color: 'from-sky-600 via-cyan-600 to-blue-900',
        glowColor: 'rgba(6, 182, 212, 0.6)',
        bannerType: 'steal'
      };
      sounds.playSwoosh();
    } else if (text.includes('เก็บภาษี') || text.includes('tax')) {
      banner = {
        id: latestEvent.id,
        title: 'ROYAL TAX COLLECTED!',
        subtitle: `${actor} เก็บภาษีราชสำนัก (+3 ลูกโอ๊ก)`,
        icon: <Crown size={38} className="text-amber-400" />,
        color: 'from-amber-500 via-yellow-500 to-amber-700',
        glowColor: 'rgba(245, 158, 11, 0.6)',
        bannerType: 'tax'
      };
      sounds.playCoinShower();
    } else if (text.includes('ท้าทาย') || text.includes('challenge')) {
      banner = {
        id: latestEvent.id,
        title: 'CHALLENGE INITIATED!',
        subtitle: `${actor} ท้าทายจับโกหก!`,
        icon: <Zap size={38} className="text-yellow-300" />,
        color: 'from-yellow-500 via-amber-600 to-red-600',
        glowColor: 'rgba(234, 179, 8, 0.7)',
        bannerType: 'challenge'
      };
      sounds.playChallenge();
    } else if (text.includes('ขัดขวาง') || text.includes('block') || text.includes('สกัดกั้น')) {
      banner = {
        id: latestEvent.id,
        title: 'DEFLECTION SHIELD!',
        subtitle: `${actor} ขัดขวางการกระทำสำเร็จ`,
        icon: <Shield size={38} className="text-sky-300" />,
        color: 'from-cyan-600 via-sky-600 to-indigo-900',
        glowColor: 'rgba(56, 189, 248, 0.6)',
        bannerType: 'block'
      };
      sounds.playShieldDeflect();
    } else if (text.includes('สลับไพ่') || text.includes('exchange')) {
      banner = {
        id: latestEvent.id,
        title: 'COURT EXCHANGE!',
        subtitle: `${actor} สลับไพ่กับกองกลาง`,
        icon: <Repeat size={38} className="text-emerald-400" />,
        color: 'from-emerald-600 via-teal-600 to-slate-900',
        glowColor: 'rgba(16, 185, 129, 0.5)',
        bannerType: 'exchange'
      };
      sounds.playCardFlip();
    } else if (text.includes('สูญเสียอิทธิพล') || text.includes('ตกรอบ') || text.includes('eliminated')) {
      banner = {
        id: latestEvent.id,
        title: 'INFLUENCE LOST!',
        subtitle: latestEvent.messageTh,
        icon: <Skull size={38} className="text-red-400" />,
        color: 'from-red-700 via-neutral-900 to-black',
        glowColor: 'rgba(239, 68, 68, 0.7)',
        bannerType: 'elimination'
      };
      sounds.playElimination();
      if (onScreenShake) onScreenShake();
    }

    if (banner) {
      setActiveBanner(banner);
      setTimeout(() => {
        setActiveBanner(null);
      }, 2200);
    }
  }, [publicGameState.history, publicGameState.players, onScreenShake]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none">
      {/* 1. Cinematic Action Impact Banner */}
      <AnimatePresence>
        {activeBanner && (
          <motion.div
            key={activeBanner.id}
            initial={{ opacity: 0, scale: 0.75, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.15, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center"
          >
            {/* Ambient Shockwave Glow Behind Banner */}
            <div
              className="absolute -inset-6 rounded-full blur-2xl opacity-70 animate-gold-shockwave pointer-events-none"
              style={{ backgroundColor: activeBanner.glowColor }}
            />

            {/* Main Action Banner Ribbon */}
            <div
              className={`relative bg-gradient-to-r ${activeBanner.color} border-2 border-white/40 px-8 py-3.5 rounded-3xl shadow-2xl flex items-center gap-4 text-white backdrop-blur-md`}
              style={{ boxShadow: `0 0 35px ${activeBanner.glowColor}` }}
            >
              <div className="p-2.5 rounded-2xl bg-black/40 border border-white/20 shadow-inner">
                {activeBanner.icon}
              </div>
              <div className="text-left">
                <div className="text-[11px] font-black tracking-widest text-white/90 uppercase flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-300" />
                  {activeBanner.title}
                </div>
                <div className="text-base sm:text-lg font-black text-white drop-shadow-md">
                  {activeBanner.subtitle}
                </div>
              </div>
            </div>

            {/* Slash Swipe Overlay Effect */}
            {(activeBanner.bannerType === 'coup' || activeBanner.bannerType === 'assassinate') && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[140%] h-3 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-slash-swipe rotate-[-12deg]" />
              </div>
            )}

            {/* Shield Pulse Overlay Effect */}
            {activeBanner.bannerType === 'block' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 rounded-full border-4 border-sky-400 bg-sky-400/20 animate-shield-pulse" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
