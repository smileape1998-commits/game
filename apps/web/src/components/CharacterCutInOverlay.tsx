import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterRole, CHARACTERS, PublicGameState } from '@hamster-coup/shared';
import { sounds } from '../audio/soundEffects';
import { GoldenAcornIcon } from './CharacterArtwork';
import {
  Sparkles,
  Zap,
  Shield,
  Crosshair,
  Crown,
  Swords,
  Coins,
  Repeat,
  Search,
  Flame
} from 'lucide-react';

export interface CutInEvent {
  id: string;
  role: CharacterRole;
  actorName: string;
  actionTitleTh: string;
  actionSubtitleTh: string;
  quoteTh: string;
  themeColor: string;
  themeAccent: string;
  icon: React.ReactNode;
  soundType: 'tax' | 'slash' | 'steal' | 'shield' | 'card' | 'challenge';
}

const ROLE_CUTIN_DATA: Record<
  CharacterRole,
  {
    quoteTh: string;
    themeColor: string;
    themeAccent: string;
    soundType: CutInEvent['soundType'];
    icon: React.ReactNode;
  }
> = {
  duke: {
    quoteTh: 'อำนาจและความมั่งคั่ง ย่อมเป็นของผู้ที่เตรียมพร้อม!',
    themeColor: 'from-amber-500 via-yellow-600 to-amber-950',
    themeAccent: '#F59E0B',
    soundType: 'tax',
    icon: <Crown size={32} className="text-amber-300" />
  },
  captain: {
    quoteTh: 'ของที่อยู่ในกระเป๋าเจ้า บัดนี้เป็นของข้าแล้ว!',
    themeColor: 'from-sky-500 via-cyan-600 to-blue-950',
    themeAccent: '#06B6D4',
    soundType: 'steal',
    icon: <Coins size={32} className="text-cyan-300" />
  },
  assassin: {
    quoteTh: 'ไม่มีเสียงกรีดร้อง... มีแต่ความเงียบงันในเงามืด!',
    themeColor: 'from-red-600 via-rose-700 to-stone-950',
    themeAccent: '#EF4444',
    soundType: 'slash',
    icon: <Crosshair size={32} className="text-red-300" />
  },
  contessa: {
    quoteTh: 'ไม่มีคมมีดเล่มใด อาจเอื้อมแตะต้องราชสำนักได้!',
    themeColor: 'from-pink-500 via-rose-600 to-purple-950',
    themeAccent: '#EC4899',
    soundType: 'shield',
    icon: <Shield size={32} className="text-pink-300" />
  },
  ambassador: {
    quoteTh: 'ความจริงและคำลวง ล้วนเป็นเพียงหมากบนกระดาน!',
    themeColor: 'from-emerald-500 via-teal-600 to-emerald-950',
    themeAccent: '#10B981',
    soundType: 'card',
    icon: <Repeat size={32} className="text-emerald-300" />
  },
  inquisitor: {
    quoteTh: 'ความลับอันดำมืดของเจ้า ไม่อาจพ้นสายตาของข้า!',
    themeColor: 'from-purple-500 via-violet-600 to-indigo-950',
    themeAccent: '#A855F7',
    soundType: 'shield',
    icon: <Search size={32} className="text-purple-300" />
  }
};

interface CharacterCutInOverlayProps {
  publicGameState: PublicGameState;
  activeViewerPlayerId: string;
}

export const CharacterCutInOverlay: React.FC<CharacterCutInOverlayProps> = ({
  publicGameState,
  activeViewerPlayerId
}) => {
  const [currentCutIn, setCurrentCutIn] = useState<CutInEvent | null>(null);
  const lastProcessedEventId = useRef<string | null>(null);

  useEffect(() => {
    const latestEvent = publicGameState.history[0];
    if (!latestEvent || latestEvent.id === lastProcessedEventId.current) return;
    lastProcessedEventId.current = latestEvent.id;

    const text = (latestEvent.messageTh || '').toLowerCase();
    const actor = latestEvent.actorId ? publicGameState.players[latestEvent.actorId]?.name : 'ผู้เล่น';
    const target = latestEvent.targetId ? publicGameState.players[latestEvent.targetId]?.name : '';

    let role: CharacterRole | null = null;
    let actionTitle = '';
    let actionSubtitle = '';

    if (text.includes('เก็บภาษี') || text.includes('tax')) {
      role = 'duke';
      actionTitle = 'ROYAL TAXATION • เก็บภาษีหลวง';
      actionSubtitle = `${actor} สั่งการเก็บภาษี +3 ลูกโอ๊กทองคำ`;
    } else if (text.includes('ลอบสังหาร') || text.includes('assassin')) {
      role = 'assassin';
      actionTitle = 'SHADOW ASSASSINATION • ลอบสังหาร';
      actionSubtitle = `${actor} ส่งมือสังหารจัดการ ${target || 'เป้าหมาย'}`;
    } else if (text.includes('ขโมย') || text.includes('steal')) {
      role = 'captain';
      actionTitle = 'PIRATE HEIST • ปล้นสะดม';
      actionSubtitle = `${actor} บุกปล้น 2 ลูกโอ๊กจาก ${target || 'คู่แข่ง'}`;
    } else if (text.includes('ขัดขวาง') || text.includes('block') || text.includes('สกัดกั้น')) {
      if (text.includes('ท่านหญิง') || text.includes('contessa')) {
        role = 'contessa';
        actionTitle = 'ROYAL AEGIS • บาเรียท่านหญิง';
        actionSubtitle = `${actor} อ้างท่านหญิง สกัดกั้นการลอบสังหาร!`;
      } else if (text.includes('เจ้าพระยา') || text.includes('duke')) {
        role = 'duke';
        actionTitle = 'ROYAL EDICT • เจ้าพระยาสกัดกั้น';
        actionSubtitle = `${actor} อ้างเจ้าพระยา บล็อก Foreign Aid!`;
      } else if (text.includes('ขุนโจร') || text.includes('captain')) {
        role = 'captain';
        actionTitle = 'PIRATE GUARD • ขุนโจรต้านขโมย';
        actionSubtitle = `${actor} อ้างขุนโจร บล็อกการปล้นเหรียญ!`;
      } else if (text.includes('ราชทูต') || text.includes('ambassador')) {
        role = 'ambassador';
        actionTitle = 'DIPLOMATIC IMMUNITY • ราชทูตสกัดกั้น';
        actionSubtitle = `${actor} อ้างราชทูต ป้องกันการขโมย!`;
      } else if (text.includes('ผู้ไต่สวน') || text.includes('inquisitor')) {
        role = 'inquisitor';
        actionTitle = 'INQUISITION SHIELD • ผู้ไต่สวนสกัดกั้น';
        actionSubtitle = `${actor} อ้างผู้ไต่สวน ป้องกันการขโมย!`;
      }
    } else if (text.includes('สลับไพ่') || text.includes('exchange')) {
      if (text.includes('ผู้ไต่สวน') || text.includes('inquisitor')) {
        role = 'inquisitor';
        actionTitle = 'DEEP INVESTIGATION • สืบสวนสลับไพ่';
        actionSubtitle = `${actor} ใช้ความสามารถสืบสวนกองกลาง`;
      } else {
        role = 'ambassador';
        actionTitle = 'DIPLOMATIC SHUFFLE • สลับไพ่ราชสำนัก';
        actionSubtitle = `${actor} เจรจาเปลี่ยนไพ่ลับกับกองกลาง`;
      }
    } else if (text.includes('แอบดูไพ่') || text.includes('สืบสวน') || text.includes('inspect')) {
      role = 'inquisitor';
      actionTitle = 'INTERROGATION • ไต่สวนเปิดไพ่';
      actionSubtitle = `${actor} บังคับตรวจสอบไพ่ลับของ ${target || 'เป้าหมาย'}`;
    }

    if (role) {
      const data = ROLE_CUTIN_DATA[role];
      const cutIn: CutInEvent = {
        id: `${latestEvent.id}_cutin`,
        role,
        actorName: actor,
        actionTitleTh: actionTitle,
        actionSubtitleTh: actionSubtitle,
        quoteTh: data.quoteTh,
        themeColor: data.themeColor,
        themeAccent: data.themeAccent,
        icon: data.icon,
        soundType: data.soundType
      };

      // Play tailored sound effect
      if (data.soundType === 'tax') sounds.playCoinShower();
      else if (data.soundType === 'slash') sounds.playSlash();
      else if (data.soundType === 'steal') sounds.playSwoosh();
      else if (data.soundType === 'shield') sounds.playShieldDeflect();
      else if (data.soundType === 'card') sounds.playCardFlip();

      setCurrentCutIn(cutIn);

      // Dismiss after 2 seconds
      const timer = setTimeout(() => {
        setCurrentCutIn(null);
      }, 2100);
      return () => clearTimeout(timer);
    }
  }, [publicGameState.history, publicGameState.players]);

  if (!currentCutIn) return null;

  const charDef = CHARACTERS[currentCutIn.role];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden select-none">
        {/* Darkened Cinematic Backdrop with Speed Lines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]"
        >
          {/* Animated Anime Speed Lines Canvas / SVG */}
          <div className="absolute inset-0 opacity-25 overflow-hidden">
            <div className="w-[200%] h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(255,255,255,0.06)_20px,rgba(255,255,255,0.06)_40px)] animate-[pulse_1.2s_ease-in-out_infinite]" />
          </div>
        </motion.div>

        {/* 2.5D Diagonal Cut-In Stage */}
        <motion.div
          key={currentCutIn.id}
          initial={{ x: '-110%', skewX: -12, opacity: 0 }}
          animate={{ x: '0%', skewX: -12, opacity: 1 }}
          exit={{ x: '110%', skewX: -12, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          className="relative w-full max-w-5xl h-64 sm:h-72 my-auto"
        >
          {/* Main Diagonal Slanted Banner Ribbon */}
          <div
            className={`w-full h-full bg-gradient-to-r ${currentCutIn.themeColor} border-y-4 border-amber-300 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex items-center justify-between px-6 sm:px-14 relative overflow-hidden`}
            style={{
              boxShadow: `0 0 50px ${currentCutIn.themeAccent}60, inset 0 0 30px rgba(0,0,0,0.5)`
            }}
          >
            {/* Ambient Background Energy Waves */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_70%)] pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

            {/* Left Content Column (Unskewed text) */}
            <div className="skew-x-12 z-20 max-w-md sm:max-w-xl text-white">
              {/* Action Category Badge */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1 rounded-lg bg-black/40 border border-white/20">
                  {currentCutIn.icon}
                </span>
                <span className="text-xs sm:text-sm font-black tracking-widest text-amber-300 uppercase drop-shadow">
                  {currentCutIn.actionTitleTh}
                </span>
              </div>

              {/* Actor & Action Headline */}
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                {currentCutIn.actionSubtitleTh}
              </h2>

              {/* Comic Speech Quote Line */}
              <div className="mt-3 relative pl-3.5 border-l-4 border-amber-400/90 text-xs sm:text-sm font-bold text-amber-100 italic drop-shadow">
                "{currentCutIn.quoteTh}"
              </div>

              {/* Role Sub-Tag */}
              <div className="mt-2 flex items-center gap-2 text-[11px] font-extrabold text-white/80">
                <span className="bg-black/50 px-2.5 py-0.5 rounded-full border border-white/20">
                  {charDef.nameTh}
                </span>
                <span className="text-amber-300 flex items-center gap-1">
                  <Sparkles size={12} /> Hamster Royal Court
                </span>
              </div>
            </div>

            {/* Right Character 2.5D Pop-Out Cutout Illustration */}
            <div className="skew-x-12 relative z-30 flex items-center justify-center">
              {/* Outer Golden Glow Ring behind Character */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="absolute w-56 sm:w-72 h-56 sm:h-72 rounded-full blur-xl pointer-events-none"
                style={{ backgroundColor: `${currentCutIn.themeAccent}50` }}
              />

              {/* Character Cutout Card Frame */}
              <motion.div
                initial={{ scale: 0.6, y: 30, rotateZ: 8 }}
                animate={{ scale: 1.15, y: -8, rotateZ: -3 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                className="relative w-44 sm:w-56 h-60 sm:h-72 rounded-3xl overflow-hidden border-4 border-amber-300 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-slate-900 group"
              >
                {/* Character Authentic Portrait */}
                <img
                  src={charDef.image}
                  alt={charDef.nameTh}
                  className="w-full h-full object-cover object-top filter brightness-105 contrast-110"
                />

                {/* Comic Cut-In Edge Flash */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-white/10 pointer-events-none" />

                {/* Animated Light Sweep Flash across character */}
                <div className="card-foil-sheen" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
