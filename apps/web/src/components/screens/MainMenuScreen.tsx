import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../state/gameStore';
import { GoldenAcornIcon } from '../CharacterArtwork';
import { sounds } from '../../audio/soundEffects';
import { CharacterRole, CHARACTERS } from '@hamster-coup/shared';
import { CardDetailModal } from '../CardDetailModal';
import {
  Crown,
  Swords,
  Layers,
  HelpCircle,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  ChevronRight,
  Shield,
  Bot,
  Users,
  Globe,
  Sparkles,
  X,
  ArrowRight,
  Coins,
  Eye,
  Crosshair,
  Repeat,
  ShieldCheck,
  Check,
  Edit2,
  Search
} from 'lucide-react';

type MainMenuTab = 'home' | 'play' | 'cards' | 'rules' | 'settings';

const AmbientGoldenSparks: React.FC = () => {
  const sparks = [
    { id: 1, left: '12%', top: '22%', delay: '0s', size: 3 },
    { id: 2, left: '26%', top: '68%', delay: '2.5s', size: 2 },
    { id: 3, left: '44%', top: '18%', delay: '4s', size: 4 },
    { id: 4, left: '58%', top: '82%', delay: '1.2s', size: 2.5 },
    { id: 5, left: '72%', top: '32%', delay: '3.1s', size: 3.5 },
    { id: 6, left: '85%', top: '74%', delay: '5.2s', size: 2 },
    { id: 7, left: '92%', top: '16%', delay: '1.8s', size: 3 },
    { id: 8, left: '6%', top: '78%', delay: '4.5s', size: 2.5 },
    { id: 9, left: '38%', top: '52%', delay: '2s', size: 3 },
    { id: 10, left: '78%', top: '48%', delay: '3.7s', size: 2 }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {sparks.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-particle-drift"
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: s.delay
          }}
        />
      ))}
    </div>
  );
};

const COLLECTION_ROLES: Array<{
  role: CharacterRole;
  letter: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  borderClass: string;
  hoverGlowClass: string;
  portraitBorder: string;
  quote: string;
  actionTitle: string;
  blockTitle: string;
}> = [
  {
    role: 'duke',
    letter: 'D',
    badge: 'TAX',
    badgeColor: 'text-amber-400',
    icon: <Crown size={18} className="text-amber-400" />,
    borderClass: 'border-amber-500/30 hover:border-amber-500/80',
    hoverGlowClass: 'hover:shadow-glow-gold',
    portraitBorder: 'border-amber-500/40 group-hover:border-amber-400 bg-amber-950/40',
    quote: 'Power favors the prepared.',
    actionTitle: 'เก็บภาษี 3 เหรียญ',
    blockTitle: 'ขัดขวาง Foreign Aid'
  },
  {
    role: 'captain',
    letter: 'C',
    badge: 'STEAL',
    badgeColor: 'text-sky-400',
    icon: <Swords size={18} className="text-sky-400" />,
    borderClass: 'border-sky-500/30 hover:border-sky-500/80',
    hoverGlowClass: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.35)]',
    portraitBorder: 'border-sky-500/40 group-hover:border-sky-400 bg-sky-950/40',
    quote: 'A clever paw finds every purse.',
    actionTitle: 'ขโมย 2 เหรียญ',
    blockTitle: 'ป้องกันการขโมยเหรียญ'
  },
  {
    role: 'ambassador',
    letter: 'A',
    badge: 'EXCHANGE',
    badgeColor: 'text-emerald-400',
    icon: <Repeat size={18} className="text-emerald-400" />,
    borderClass: 'border-emerald-500/30 hover:border-emerald-500/80',
    hoverGlowClass: 'hover:shadow-glow-emerald',
    portraitBorder: 'border-emerald-500/40 group-hover:border-emerald-400 bg-emerald-950/40',
    quote: 'Every secret has a price.',
    actionTitle: 'จั่ว 2 สับคืนกอง',
    blockTitle: 'ป้องกันการขโมยเหรียญ'
  },
  {
    role: 'assassin',
    letter: 'S',
    badge: 'ASSASSINATE',
    badgeColor: 'text-red-400',
    icon: <Crosshair size={18} className="text-red-400" />,
    borderClass: 'border-red-500/30 hover:border-red-500/80',
    hoverGlowClass: 'hover:shadow-glow-red',
    portraitBorder: 'border-red-500/40 group-hover:border-red-400 bg-red-950/40',
    quote: 'Silence is worth three acorns.',
    actionTitle: 'จ่าย 3 สังหารไพ่ 1 ใบ',
    blockTitle: 'ไม่สามารถบล็อกได้'
  },
  {
    role: 'contessa',
    letter: 'C',
    badge: 'PROTECT',
    badgeColor: 'text-pink-400',
    icon: <ShieldCheck size={18} className="text-pink-400" />,
    borderClass: 'border-pink-500/30 hover:border-pink-500/80',
    hoverGlowClass: 'hover:shadow-[0_0_25px_rgba(236,72,153,0.35)]',
    portraitBorder: 'border-pink-500/40 group-hover:border-pink-400 bg-pink-950/40',
    quote: 'No dagger touches the royal court.',
    actionTitle: 'ไม่มีแอ็กชันโจมตี',
    blockTitle: 'ป้องกันการลอบสังหาร'
  },
  {
    role: 'inquisitor',
    letter: 'I',
    badge: 'INSPECT',
    badgeColor: 'text-purple-400',
    icon: <Search size={18} className="text-purple-400" />,
    borderClass: 'border-purple-500/30 hover:border-purple-500/80',
    hoverGlowClass: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.35)]',
    portraitBorder: 'border-purple-500/40 group-hover:border-purple-400 bg-purple-950/40',
    quote: 'No secret escapes the vigilant.',
    actionTitle: 'แอบดูไพ่คู่แข่ง หรือสลับไพ่',
    blockTitle: 'ป้องกันการขโมยเหรียญ'
  }
];

export const MainMenuScreen: React.FC = () => {
  const {
    playerName,
    setPlayerProfile,
    setView,
    settings,
    setSettings,
    setShowRulesModal,
    setShowHowToPlayModal,
    setShowCardSelectionModal
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<MainMenuTab>('home');
  const [selectedInspectRole, setSelectedInspectRole] = useState<CharacterRole | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setPlayerProfile(nameInput.trim(), 'hamster_1');
    }
    setEditingName(false);
  };

  const selectTab = (tab: MainMenuTab) => {
    sounds.playCardFlip();
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col justify-between selection:bg-amber-500/30 select-none relative overflow-x-hidden font-sans">
      {/* Floating Golden Dust Particles (Compositor Accelerated) */}
      <AmbientGoldenSparks />

      {/* Background Subtle Ambient Aura (GPU friendly radial gradients without heavy blur filters) */}
      <div
        className="fixed top-0 right-1/4 w-[500px] h-[500px] pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)'
        }}
      />
      <div
        className="fixed bottom-0 left-10 w-[450px] h-[450px] pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)'
        }}
      />

      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 bg-[#0D121C]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between z-20 sticky top-0">
        {/* Left: Brand Logo & Title */}
        <div
          onClick={() => selectTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-950/50 group-hover:scale-105 transition">
            <Crown size={20} />
          </div>
          <div>
            <div className="text-sm sm:text-base font-black tracking-wider text-white group-hover:text-amber-300 transition">
              HAMSTER COUP
            </div>
            <div className="text-[10px] font-extrabold tracking-widest text-amber-400 uppercase">
              GOLDEN ACORNS
            </div>
          </div>
        </div>

        {/* Right: User Profile Badge & Sound */}
        <div className="flex items-center gap-3">
          {editingName ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/70 rounded-full px-3 py-1 shadow-lg">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={20}
                autoFocus
                className="bg-transparent text-xs sm:text-sm text-amber-300 font-bold focus:outline-none w-28 sm:w-36"
              />
              <button
                onClick={handleSaveName}
                className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full transition"
              >
                บันทึก
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-3 bg-[#131926] hover:bg-[#182030] border border-slate-800 hover:border-slate-700 rounded-full pl-1.5 pr-4 py-1.5 transition text-left group shadow-sm"
              title="คลิกเพื่อเปลี่ยนชื่อผู้เล่น"
            >
              <div className="w-8 h-8 rounded-full bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-300 font-black text-xs shrink-0 shadow-inner">
                {playerName.charAt(0) || 'P'}
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-amber-300 transition truncate max-w-[120px] sm:max-w-[160px]">
                  {playerName}
                </div>
                <div className="text-[10px] text-slate-400 -mt-0.5">Welcome to the court</div>
              </div>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-amber-400 flex items-center justify-center transition shrink-0"
            title="เปิด/ปิดเสียง"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </header>

      {/* Main Body (Sidebar + Content Hub) */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8 z-10">
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-60 lg:w-64 shrink-0 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-black tracking-widest text-slate-500 uppercase px-3 mb-3">
              THE ROYAL COURT
            </div>
            <nav className="space-y-1.5">
              {/* Home Tab */}
              <button
                onClick={() => selectTab('home')}
                className={`w-full px-4 py-3 rounded-2xl font-bold text-sm flex items-center justify-between transition ${
                  activeTab === 'home'
                    ? 'bg-amber-950/30 border border-amber-500/40 text-amber-300 font-extrabold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60 border border-transparent hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Crown size={18} className={activeTab === 'home' ? 'text-amber-400' : 'text-slate-400'} />
                  <span>Home</span>
                </div>
                <ChevronRight size={16} className={activeTab === 'home' ? 'text-amber-400/80' : 'text-slate-600'} />
              </button>

              {/* Play Tab */}
              <button
                onClick={() => selectTab('play')}
                className={`w-full px-4 py-3 rounded-2xl font-bold text-sm flex items-center justify-between transition ${
                  activeTab === 'play'
                    ? 'bg-amber-950/30 border border-amber-500/40 text-amber-300 font-extrabold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60 border border-transparent hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Swords size={18} className={activeTab === 'play' ? 'text-amber-400' : 'text-slate-400'} />
                  <span>Play</span>
                </div>
                <ChevronRight size={16} className={activeTab === 'play' ? 'text-amber-400/80' : 'text-slate-600'} />
              </button>

              {/* Card Collection Tab */}
              <button
                onClick={() => selectTab('cards')}
                className={`w-full px-4 py-3 rounded-2xl font-bold text-sm flex items-center justify-between transition ${
                  activeTab === 'cards'
                    ? 'bg-amber-950/30 border border-amber-500/40 text-amber-300 font-extrabold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60 border border-transparent hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers size={18} className={activeTab === 'cards' ? 'text-amber-400' : 'text-slate-400'} />
                  <span>Card Collection</span>
                </div>
                <span className="text-[11px] text-amber-400/90 font-bold bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {Object.values(settings.enabledRoles).filter(Boolean).length}/6
                </span>
              </button>

              {/* How to Play Tab */}
              <button
                onClick={() => selectTab('rules')}
                className={`w-full px-4 py-3 rounded-2xl font-bold text-sm flex items-center justify-between transition ${
                  activeTab === 'rules'
                    ? 'bg-amber-950/30 border border-amber-500/40 text-amber-300 font-extrabold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60 border border-transparent hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle size={18} className={activeTab === 'rules' ? 'text-amber-400' : 'text-slate-400'} />
                  <span>How to Play</span>
                </div>
                <ChevronRight size={16} className={activeTab === 'rules' ? 'text-amber-400/80' : 'text-slate-600'} />
              </button>

              {/* Settings Tab */}
              <button
                onClick={() => selectTab('settings')}
                className={`w-full px-4 py-3 rounded-2xl font-bold text-sm flex items-center justify-between transition ${
                  activeTab === 'settings'
                    ? 'bg-amber-950/30 border border-amber-500/40 text-amber-300 font-extrabold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60 border border-transparent hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <SettingsIcon size={18} className={activeTab === 'settings' ? 'text-amber-400' : 'text-slate-400'} />
                  <span>Settings</span>
                </div>
                <ChevronRight size={16} className={activeTab === 'settings' ? 'text-amber-400/80' : 'text-slate-600'} />
              </button>
            </nav>
          </div>

          {/* Sidebar Bottom Quote */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-4 text-slate-500 text-xs border-t border-slate-900/80 mt-6">
            <Shield size={16} className="text-amber-500/50 shrink-0" />
            <span className="italic leading-snug">Small paws. Grand ambitions.</span>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {/* 1. HOME VIEW */}
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-10"
              >
                {/* Hero Row: Headline + 3D Card Artwork */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-2 lg:py-4">
                  {/* Headline and Primary Call to Action */}
                  <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
                    <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-amber-400 uppercase">
                      <span>✦ A LITTLE CHARM. A LOT OF DECEPTION.</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                      Trust no one. <br />
                      <span className="text-amber-400">Rule the court.</span>
                    </h1>

                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
                      A game of secret roles, bold bluffs, and golden acorns. Your next move could change everything.
                    </p>

                    {/* Primary CTA Button */}
                    <div className="pt-2">
                      <motion.button
                        whileHover={{ scale: 1.03, boxShadow: '0 0 35px rgba(245, 158, 11, 0.45)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => selectTab('play')}
                        className="btn-shimmer-container bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-base px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/20 flex items-center gap-3 transition"
                      >
                        <Swords size={20} className="text-slate-950" />
                        <span>Enter the court</span>
                        <ArrowRight size={18} className="text-slate-950 ml-1" />
                      </motion.button>

                      <div className="text-xs text-slate-400 mt-3 flex items-center gap-2 font-medium">
                        <span>2–6 players</span>
                        <span className="text-slate-600">•</span>
                        <span>15-minute matches</span>
                        <span className="text-slate-600">•</span>
                        <span>Endless bluffing</span>
                      </div>
                    </div>
                  </div>

                  {/* 3D Tilted Card Preview Display with Animated Golden Rings & Floating Sway */}
                  <div className="lg:col-span-5 flex justify-center items-center py-6">
                    <div className="relative w-72 h-80 flex items-center justify-center">
                      {/* Ambient Golden Glowing Rings with GPU Keyframe Pulse */}
                      <div className="absolute inset-0 m-auto w-64 h-64 rounded-full border border-amber-500/40 bg-amber-500/10 animate-hero-ring-1 pointer-events-none" />
                      <div className="absolute inset-0 m-auto w-52 h-52 rounded-full border border-amber-500/30 animate-hero-ring-2 pointer-events-none" />

                      {/* Card 1: Duke (Tilted Left + GPU Compositor Float) */}
                      <div
                        className="absolute left-4 top-4 w-44 h-64 rounded-2xl bg-[#141C2B] border border-amber-500/50 p-3.5 shadow-2xl flex flex-col justify-between cursor-pointer animate-hero-sway-left group hover:scale-105 hover:z-20 hover:border-amber-400 hover:shadow-glow-gold transition-all duration-300"
                        onClick={() => {
                          sounds.playCardFlip();
                          setSelectedInspectRole('duke');
                        }}
                        title="คลิกเพื่อตรวจสอบการ์ด 3D"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-black text-amber-400/90">D</span>
                          <Crown size={16} className="text-amber-400" />
                        </div>
                        <div className="relative w-24 h-24 mx-auto my-auto rounded-full overflow-hidden border-2 border-amber-500/50 shadow-inner bg-amber-950/60 group-hover:scale-105 group-hover:border-amber-400 transition-all duration-300 card-foil-container">
                          <img
                            src="/cards/duke.jpg"
                            alt="The Duke"
                            className="w-full h-full object-cover object-top"
                          />
                          <div className="card-foil-sheen" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center justify-between">
                            <span>TAX</span>
                            <span className="text-[9px] text-amber-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">ดู 3D ✨</span>
                          </div>
                          <div className="text-sm font-black text-white">Duke (เจ้าพระยา)</div>
                          <div className="text-[10px] text-slate-400 truncate">Take 3 acorns (เก็บภาษี)</div>
                        </div>
                      </div>

                      {/* Card 2: Captain (Tilted Right + GPU Compositor Float) */}
                      <div
                        className="absolute right-4 top-8 w-44 h-64 rounded-2xl bg-[#101724] border border-sky-500/50 p-3.5 shadow-2xl flex flex-col justify-between cursor-pointer animate-hero-sway-right group hover:scale-105 hover:z-20 hover:border-sky-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300"
                        onClick={() => {
                          sounds.playCardFlip();
                          setSelectedInspectRole('captain');
                        }}
                        title="คลิกเพื่อตรวจสอบการ์ด 3D"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-black text-sky-400/90">C</span>
                          <Swords size={16} className="text-sky-400" />
                        </div>
                        <div className="relative w-24 h-24 mx-auto my-auto rounded-full overflow-hidden border-2 border-sky-500/50 shadow-inner bg-sky-950/60 group-hover:scale-105 group-hover:border-sky-400 transition-all duration-300 card-foil-container">
                          <img
                            src="/cards/captain.jpg"
                            alt="The Captain"
                            className="w-full h-full object-cover object-top"
                          />
                          <div className="card-foil-sheen" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-sky-400 uppercase tracking-widest flex items-center justify-between">
                            <span>STEAL</span>
                            <span className="text-[9px] text-sky-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">ดู 3D ✨</span>
                          </div>
                          <div className="text-sm font-black text-white">Captain (ขุนโจร)</div>
                          <div className="text-[10px] text-slate-400 truncate">Steal 2 acorns (ปล้นเหรียญ)</div>
                        </div>
                      </div>

                      {/* Pill Badge at bottom of preview */}
                      <motion.div
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut' }}
                        className="absolute -bottom-2 bg-slate-900/90 border border-amber-500/50 rounded-full px-3 py-1 text-[10px] font-black tracking-widest text-amber-300 uppercase shadow-lg backdrop-blur-sm z-10"
                      >
                        FORTUNE FAVORS THE BOLD
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Section Header: Bottom Feature Cards */}
                <div>
                  <div className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4">
                    YOUR SEAT AT THE TABLE AWAITS
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    {/* Card 1: Gather your court */}
                    <motion.div
                      whileHover={{ y: -6, scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      onClick={() => selectTab('play')}
                      className="bg-[#101622] hover:bg-[#151D2C] border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 transition flex flex-col justify-between group cursor-pointer shadow-sm"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition">
                          <Users size={20} />
                        </div>
                        <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition mb-2">
                          Gather your court
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Bring your friends to a custom table or fill empty seats with cunning AI nobles.
                        </p>
                      </div>
                      <div className="mt-6 flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1.5 transition">
                        <span>Explore play modes</span>
                        <ChevronRight size={14} />
                      </div>
                    </motion.div>

                    {/* Card 2: Meet the nobles */}
                    <motion.div
                      whileHover={{ y: -6, scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      onClick={() => selectTab('cards')}
                      className="bg-[#101622] hover:bg-[#151D2C] border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 transition flex flex-col justify-between group cursor-pointer shadow-sm"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition">
                          <Crown size={20} />
                        </div>
                        <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition mb-2">
                          Meet the nobles
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Master the unique powers of the Duke, Assassin, Captain, Ambassador, and Contessa.
                        </p>
                      </div>
                      <div className="mt-6 flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:translate-x-1.5 transition">
                        <span>View cards</span>
                        <ChevronRight size={14} />
                      </div>
                    </motion.div>

                    {/* Card 3: Learn the art of bluffing */}
                    <motion.div
                      whileHover={{ y: -6, scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      onClick={() => selectTab('rules')}
                      className="bg-[#101622] hover:bg-[#151D2C] border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 transition flex flex-col justify-between group cursor-pointer shadow-sm"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition">
                          <Sparkles size={20} />
                        </div>
                        <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition mb-2">
                          Learn the art of bluffing
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Claim roles you don't possess, block greedy rivals, and strike before they suspect.
                        </p>
                      </div>
                      <div className="mt-6 flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1.5 transition">
                        <span>Read guide</span>
                        <ChevronRight size={14} />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. PLAY VIEW */}
            {activeTab === 'play' && (
              <motion.div
                key="play"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-[11px] font-black tracking-widest text-amber-400 uppercase mb-1">
                    HAMSTER COUP / PLAY
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Choose your table.
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Bring your friends, or take a look around the practice court.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {/* Option 1: Online Private Room */}
                  <div className="bg-[#101622] border border-slate-800 hover:border-amber-500/60 rounded-3xl p-6 flex flex-col justify-between transition group shadow-sm">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition">
                        <Globe size={24} />
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition mb-2">
                        Private room
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Create or join a room with friends. Add AI nobles to fill seats or battle online in real-time.
                      </p>
                    </div>

                    <div className="mt-8">
                      <button
                        onClick={() => {
                          sounds.playCardFlip();
                          setView('online_menu');
                        }}
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/10"
                      >
                        <span>Open room menu</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Option 2: AI Practice Court */}
                  <div className="bg-[#101622] border border-slate-800 hover:border-sky-500/60 rounded-3xl p-6 flex flex-col justify-between transition group shadow-sm">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-sky-950/40 border border-sky-500/40 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-105 transition">
                        <Bot size={24} />
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-sky-300 transition mb-2">
                        AI Practice court
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Play solo against cunning AI bots with customizable difficulty. Sharpen your bluffing strategy anytime.
                      </p>
                    </div>

                    <div className="mt-8">
                      <button
                        onClick={() => {
                          sounds.playCardFlip();
                          setView('ai_setup');
                        }}
                        className="w-full bg-[#182234] hover:bg-[#1f2b42] border border-sky-500/40 hover:border-sky-400 text-sky-300 hover:text-white font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition"
                      >
                        <span>Play with AI</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Option 3: Pass & Play */}
                  <div className="bg-[#101622] border border-slate-800 hover:border-emerald-500/60 rounded-3xl p-6 flex flex-col justify-between transition group shadow-sm">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition">
                        <Users size={24} />
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-emerald-300 transition mb-2">
                        Pass & Play
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Play on one device with 2 to 6 friends. Hand the device over each turn with screen hide guards.
                      </p>
                    </div>

                    <div className="mt-8">
                      <button
                        onClick={() => {
                          sounds.playCardFlip();
                          setView('local_setup');
                        }}
                        className="w-full bg-[#13231e] hover:bg-[#1a3029] border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-white font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition"
                      >
                        <span>Start Pass & Play</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. CARD COLLECTION VIEW */}
            {activeTab === 'cards' && (
              <motion.div
                key="cards"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-black tracking-widest text-amber-400 uppercase mb-1">
                      HAMSTER COUP / CARD COLLECTION
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      Meet the royal court.
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Your role is a secret. Your ambition is not.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playCardFlip();
                      setShowCardSelectionModal(true);
                    }}
                    className="self-start sm:self-center px-4 py-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition flex items-center gap-2"
                  >
                    <Layers size={15} />
                    <span>Configure Deck ({Object.values(settings.enabledRoles).filter(Boolean).length}/6)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pt-2">
                  {COLLECTION_ROLES.map((c, idx) => {
                    const char = CHARACTERS[c.role];
                    return (
                      <motion.div
                        key={c.role}
                        initial={{ opacity: 0, y: 28, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, delay: idx * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
                        whileHover={{ y: -8, scale: 1.025 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          sounds.playCardFlip();
                          setSelectedInspectRole(c.role);
                        }}
                        className={`bg-[#101622] border rounded-3xl p-4 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 shadow-md cursor-pointer select-none ${c.borderClass} ${c.hoverGlowClass}`}
                        title="คลิกเพื่อตรวจสอบการ์ด 3D"
                      >
                        <span className="absolute -right-2 -top-4 text-7xl font-black text-white/[0.04] pointer-events-none select-none transition-transform duration-300 group-hover:scale-110">
                          {c.letter}
                        </span>
                        <div className="flex items-center justify-between mb-2 z-10">
                          <span className={`text-xs font-black tracking-widest uppercase ${c.badgeColor}`}>
                            {c.badge}
                          </span>
                          {c.icon}
                        </div>

                        {/* Authentic Character Portrait with Holographic Foil */}
                        <div className={`relative w-full aspect-square rounded-2xl overflow-hidden border-2 shadow-lg my-2 z-10 card-foil-container transition-all duration-300 ${c.portraitBorder}`}>
                          <img
                            src={char.image}
                            alt={char.nameEn}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                          />
                          {/* Holographic foil sweep */}
                          <div className="card-foil-sheen" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-40 pointer-events-none" />
                        </div>

                        <div className="z-10 mt-1">
                          <div className="flex items-baseline justify-between">
                            <h4 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                              {char.nameEn.replace('The ', '')}
                            </h4>
                            <span className={`text-xs font-bold ${c.badgeColor}`}>{char.nameTh}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 group-hover:text-slate-300 font-medium mb-2 transition-colors truncate">
                            {c.quote}
                          </p>
                          <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-2.5">
                            <div className="flex items-start gap-1.5">
                              <span className={`${c.badgeColor} font-bold`}>•</span>
                              <span><strong>แอ็กชัน:</strong> {c.actionTitle}</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className={`${c.badgeColor} font-bold`}>•</span>
                              <span><strong>บล็อก:</strong> {c.blockTitle}</span>
                            </div>
                          </div>

                          {/* Interactive Inspection Hint Pill */}
                          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-amber-300 transition-colors">
                            <span className="flex items-center gap-1 font-semibold">
                              <Sparkles size={11} className="text-amber-400" /> คลิกดูการ์ด 3D
                            </span>
                            <ChevronRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 4. HOW TO PLAY VIEW */}
            {activeTab === 'rules' && (
              <motion.div
                key="rules"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-[11px] font-black tracking-widest text-amber-400 uppercase mb-1">
                    HAMSTER COUP / HOW TO PLAY
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    The art of deception.
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    The last player with influence standing wins.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Step 01 */}
                  <div className="bg-[#101622] border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row gap-5 items-start">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono shrink-0">
                      01
                    </span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white mb-1.5">
                        Protect your influence (ปกป้องอิทธิพลของคุณ)
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        เริ่มเกมผู้เล่นทุกคนจะได้การ์ดบทบาทลับ 2 ใบ และ 2 เหรียญ Golden Acorns
                        หากการ์ดถูกเปิดหงายทั้ง 2 ใบ คุณจะตกรอบทันที!
                      </p>
                    </div>
                  </div>

                  {/* Step 02 */}
                  <div className="bg-[#101622] border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row gap-5 items-start">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono shrink-0">
                      02
                    </span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white mb-1.5">
                        Take an action. Tell a story. (ลงมือทำ เล่าเรื่องจริงหรือสับขาหลอก)
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        ในเทิร์นของคุณ สามารถเลือกหยิบเหรียญ (Income 1 เหรียญ, Foreign Aid 2 เหรียญ),
                        อ้างบทบาทเพื่อใช้พลัง (Duke, Assassin, Captain, Ambassador), หรือจ่าย 7 เหรียญเพื่อก่อการรัฐประหาร (Coup) ซึ่งไม่สามารถป้องกันได้!
                        (หากมี 10 เหรียญขึ้นไป ต้องบังคับทำ Coup เสมอ)
                      </p>
                    </div>
                  </div>

                  {/* Step 03 */}
                  <div className="bg-[#101622] border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row gap-5 items-start">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono shrink-0">
                      03
                    </span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white mb-1.5">
                        Call their bluff (ท้าทายคำอ้างลวงโลก)
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        ผู้เล่นอื่นสามารถกด "Challenge" ท้าทายได้เสมอ หากผู้ถูกท้าทายมีไพ่ใบนั้นจริง ผู้ท้าทายจะเสียไพ่ 1 ใบ!
                        แต่หากผู้ถูกท้าทายโกหก ผู้ถูกท้าทายจะต้องเป็นฝ่ายเปิดหงายไพ่ 1 ใบแทน!
                      </p>
                    </div>
                  </div>

                  {/* Step 04 */}
                  <div className="bg-[#101622] border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row gap-5 items-start">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono shrink-0">
                      04
                    </span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white mb-1.5">
                        Keep the last secret (ครองบัลลังก์สุดท้าย)
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        ผู้เล่นคนสุดท้ายที่ยังเหลือการ์ดคว่ำอยู่ คือผู้พิชิตบัลลังก์ Hamster Coup!
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. SETTINGS VIEW */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-[11px] font-black tracking-widest text-amber-400 uppercase mb-1">
                    HAMSTER COUP / SETTINGS
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Make yourself at home.
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Preferences are saved on this device.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Setting 1: Sound */}
                  <div className="bg-[#101622] border border-slate-800 rounded-3xl p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        Sound preference (เสียงประกอบ)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Audio cues for actions, card flips, and timer notifications.
                      </p>
                    </div>
                    <button
                      onClick={toggleSound}
                      className={`px-5 py-2.5 rounded-full text-xs font-black transition border ${
                        soundEnabled
                          ? 'bg-amber-950/60 border-amber-500/80 text-amber-300 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      {soundEnabled ? 'On' : 'Off'}
                    </button>
                  </div>

                  {/* Setting 2: Menu animations */}
                  <div className="bg-[#101622] border border-slate-800 rounded-3xl p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        Menu animations (เอฟเฟกต์การเคลื่อนไหว)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Smooth transitions and card tilt effects.
                      </p>
                    </div>
                    <button
                      onClick={() => setAnimationsEnabled(!animationsEnabled)}
                      className={`px-5 py-2.5 rounded-full text-xs font-black transition border ${
                        animationsEnabled
                          ? 'bg-amber-950/60 border-amber-500/80 text-amber-300 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      {animationsEnabled ? 'On' : 'Off'}
                    </button>
                  </div>

                  {/* Setting 3: Game Rules Customizer */}
                  <div className="bg-[#101622] border border-slate-800 rounded-3xl p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        Game rules & timing (กติกาการเล่นและเวลา)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Adjust Coup threshold, challenge timers, and card distribution.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        sounds.playCardFlip();
                        setShowRulesModal(true);
                      }}
                      className="px-5 py-2.5 rounded-2xl text-xs font-black bg-[#162030] hover:bg-[#1c293e] border border-slate-700 text-slate-200 transition"
                    >
                      Configure rules
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer Quote Bar */}
      <footer className="border-t border-slate-900/80 bg-[#0B0E14] px-4 sm:px-8 py-3 text-[11px] text-slate-400 flex items-center justify-between z-10">
        <div className="font-extrabold tracking-widest text-slate-400">
          BLUFF BEAUTIFULLY. WIN ROYALLY.
        </div>
        <div className="text-slate-400">
          Golden Acorns • UI Clean Edition
        </div>
      </footer>

      {/* Interactive 3D Card Detail Modal */}
      {selectedInspectRole && (
        <CardDetailModal
          role={selectedInspectRole}
          onClose={() => setSelectedInspectRole(null)}
        />
      )}
    </div>
  );
};
