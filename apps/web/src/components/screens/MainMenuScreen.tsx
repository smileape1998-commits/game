import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../state/gameStore';
import { GoldenAcornIcon } from '../CharacterArtwork';
import { sounds } from '../../audio/soundEffects';
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
  Edit2
} from 'lucide-react';

type MainMenuTab = 'home' | 'play' | 'cards' | 'rules' | 'settings';

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
      {/* Background Subtle Ambient Aura */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 left-10 w-[500px] h-[500px] bg-blue-500/[0.02] rounded-full blur-[140px] pointer-events-none" />

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
                      {/* Ambient Golden Glowing Rings with Breathing Pulse */}
                      <motion.div
                        animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.5, 0.25] }}
                        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
                        className="absolute inset-0 m-auto w-64 h-64 rounded-full border border-amber-500/40 bg-amber-500/10 blur-sm pointer-events-none"
                      />
                      <motion.div
                        animate={{ scale: [1.06, 0.96, 1.06], opacity: [0.15, 0.35, 0.15] }}
                        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                        className="absolute inset-0 m-auto w-52 h-52 rounded-full border border-amber-500/30 pointer-events-none"
                      />

                      {/* Card 1: Duke (Tilted Left + Continuous gentle sway) */}
                      <motion.div
                        animate={{ rotate: [-9, -7, -9], y: [-4, 6, -4] }}
                        transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
                        whileHover={{ rotate: -3, scale: 1.08, y: -8, zIndex: 20 }}
                        className="absolute left-4 top-4 w-44 h-64 rounded-2xl bg-[#141C2B] border border-amber-500/40 p-4 shadow-2xl flex flex-col justify-between cursor-pointer"
                        onClick={() => selectTab('cards')}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black text-amber-400/80">D</span>
                          <Crown size={16} className="text-amber-400" />
                        </div>
                        <div className="flex flex-col items-center my-auto">
                          <div className="w-20 h-20 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner">
                            🐹
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                            TAX
                          </div>
                          <div className="text-base font-black text-white">Duke</div>
                          <div className="text-[10px] text-slate-400 truncate">Take 3 acorns</div>
                        </div>
                      </motion.div>

                      {/* Card 2: Captain (Tilted Right + Continuous gentle sway) */}
                      <motion.div
                        animate={{ rotate: [11, 9, 11], y: [6, -4, 6] }}
                        transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut' }}
                        whileHover={{ rotate: 3, scale: 1.08, y: -8, zIndex: 20 }}
                        className="absolute right-4 top-8 w-44 h-64 rounded-2xl bg-[#101724] border border-sky-500/40 p-4 shadow-2xl flex flex-col justify-between cursor-pointer"
                        onClick={() => selectTab('cards')}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black text-sky-400/80">C</span>
                          <Swords size={16} className="text-sky-400" />
                        </div>
                        <div className="flex flex-col items-center my-auto">
                          <div className="w-20 h-20 rounded-full bg-sky-950/60 border border-sky-500/40 flex items-center justify-center text-3xl shadow-inner">
                            🦫
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-sky-400 uppercase tracking-widest">
                            STEAL
                          </div>
                          <div className="text-base font-black text-white">Captain</div>
                          <div className="text-[10px] text-slate-400 truncate">Steal 2 acorns</div>
                        </div>
                      </motion.div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-2">
                  {/* 1. Duke */}
                  <div className="bg-[#101622] border border-amber-500/30 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/60 transition shadow-sm">
                    <span className="absolute -right-2 -top-4 text-7xl font-black text-amber-500/10 pointer-events-none">
                      D
                    </span>
                    <div className="flex items-center justify-between mb-4 z-10">
                      <span className="text-xs font-black text-amber-400 tracking-widest uppercase">
                        TAX
                      </span>
                      <Crown size={18} className="text-amber-400" />
                    </div>
                    <div className="flex flex-col items-center my-4 z-10">
                      <div className="w-20 h-20 rounded-full bg-amber-950/50 border border-amber-500/40 flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition">
                        👑
                      </div>
                    </div>
                    <div className="z-10">
                      <h4 className="text-xl font-black text-white">Duke</h4>
                      <p className="text-[11px] text-amber-300/80 font-semibold mb-2">
                        Power favors the prepared.
                      </p>
                      <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-2.5">
                        <div className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span><strong>แอ็กชัน:</strong> เก็บภาษี 3 เหรียญ</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span><strong>บล็อก:</strong> ขัดขวาง Foreign Aid</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Captain */}
                  <div className="bg-[#101622] border border-sky-500/30 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-sky-500/60 transition shadow-sm">
                    <span className="absolute -right-2 -top-4 text-7xl font-black text-sky-500/10 pointer-events-none">
                      C
                    </span>
                    <div className="flex items-center justify-between mb-4 z-10">
                      <span className="text-xs font-black text-sky-400 tracking-widest uppercase">
                        STEAL
                      </span>
                      <Swords size={18} className="text-sky-400" />
                    </div>
                    <div className="flex flex-col items-center my-4 z-10">
                      <div className="w-20 h-20 rounded-full bg-sky-950/50 border border-sky-500/40 flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition">
                        🦫
                      </div>
                    </div>
                    <div className="z-10">
                      <h4 className="text-xl font-black text-white">Captain</h4>
                      <p className="text-[11px] text-sky-300/80 font-semibold mb-2">
                        A clever paw finds every purse.
                      </p>
                      <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-2.5">
                        <div className="flex items-start gap-1.5">
                          <span className="text-sky-400 font-bold">•</span>
                          <span><strong>แอ็กชัน:</strong> ขโมย 2 เหรียญจากผู้เล่นอื่น</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-sky-400 font-bold">•</span>
                          <span><strong>บล็อก:</strong> ป้องกันการถูกขโมยเหรียญ</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Ambassador */}
                  <div className="bg-[#101622] border border-emerald-500/30 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/60 transition shadow-sm">
                    <span className="absolute -right-2 -top-4 text-7xl font-black text-emerald-500/10 pointer-events-none">
                      A
                    </span>
                    <div className="flex items-center justify-between mb-4 z-10">
                      <span className="text-xs font-black text-emerald-400 tracking-widest uppercase">
                        EXCHANGE
                      </span>
                      <Repeat size={18} className="text-emerald-400" />
                    </div>
                    <div className="flex flex-col items-center my-4 z-10">
                      <div className="w-20 h-20 rounded-full bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition">
                        🐹
                      </div>
                    </div>
                    <div className="z-10">
                      <h4 className="text-xl font-black text-white">Ambassador</h4>
                      <p className="text-[11px] text-emerald-300/80 font-semibold mb-2">
                        Every secret has a price.
                      </p>
                      <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-2.5">
                        <div className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span><strong>แอ็กชัน:</strong> จั่ว 2 ใบ สับเปลี่ยนคืนกอง</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span><strong>บล็อก:</strong> ป้องกันการถูกขโมยเหรียญ</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Assassin */}
                  <div className="bg-[#101622] border border-red-500/30 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-red-500/60 transition shadow-sm">
                    <span className="absolute -right-2 -top-4 text-7xl font-black text-red-500/10 pointer-events-none">
                      S
                    </span>
                    <div className="flex items-center justify-between mb-4 z-10">
                      <span className="text-xs font-black text-red-400 tracking-widest uppercase">
                        ASSASSINATE
                      </span>
                      <Crosshair size={18} className="text-red-400" />
                    </div>
                    <div className="flex flex-col items-center my-4 z-10">
                      <div className="w-20 h-20 rounded-full bg-red-950/50 border border-red-500/40 flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition">
                        🦔
                      </div>
                    </div>
                    <div className="z-10">
                      <h4 className="text-xl font-black text-white">Assassin</h4>
                      <p className="text-[11px] text-red-300/80 font-semibold mb-2">
                        Silence is worth three acorns.
                      </p>
                      <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-2.5">
                        <div className="flex items-start gap-1.5">
                          <span className="text-red-400 font-bold">•</span>
                          <span><strong>แอ็กชัน:</strong> จ่าย 3 เหรียญ สังหารไพ่ 1 ใบ</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-red-400 font-bold">•</span>
                          <span><strong>บล็อก:</strong> ไม่สามารถบล็อกได้</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Contessa */}
                  <div className="bg-[#101622] border border-purple-500/30 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/60 transition shadow-sm">
                    <span className="absolute -right-2 -top-4 text-7xl font-black text-purple-500/10 pointer-events-none">
                      C
                    </span>
                    <div className="flex items-center justify-between mb-4 z-10">
                      <span className="text-xs font-black text-purple-400 tracking-widest uppercase">
                        PROTECT
                      </span>
                      <ShieldCheck size={18} className="text-purple-400" />
                    </div>
                    <div className="flex flex-col items-center my-4 z-10">
                      <div className="w-20 h-20 rounded-full bg-purple-950/50 border border-purple-500/40 flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition">
                        🐹
                      </div>
                    </div>
                    <div className="z-10">
                      <h4 className="text-xl font-black text-white">Contessa</h4>
                      <p className="text-[11px] text-purple-300/80 font-semibold mb-2">
                        No dagger touches the royal court.
                      </p>
                      <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-2.5">
                        <div className="flex items-start gap-1.5">
                          <span className="text-purple-400 font-bold">•</span>
                          <span><strong>แอ็กชัน:</strong> ไม่มีแอ็กชันโจมตี</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-purple-400 font-bold">•</span>
                          <span><strong>บล็อก:</strong> ป้องกันการลอบสังหารของ Assassin</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
    </div>
  );
};
