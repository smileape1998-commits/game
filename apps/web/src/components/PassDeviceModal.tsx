import React from 'react';
import { motion } from 'framer-motion';
import { sounds } from '../audio/soundEffects';
import { Smartphone, Eye, ShieldCheck } from 'lucide-react';

interface PassDeviceModalProps {
  nextPlayerName: string;
  onReady: () => void;
}

export const PassDeviceModal: React.FC<PassDeviceModalProps> = ({
  nextPlayerName,
  onReady
}) => {
  const handleProceed = () => {
    sounds.playCardFlip();
    onReady();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-950 border-2 border-amber-500/80 flex items-center justify-center text-amber-400 mb-4 shadow-glow-gold animate-bounce">
          <Smartphone size={32} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs text-amber-300 font-semibold mb-3 border border-amber-600/40">
          <ShieldCheck size={14} /> โหมดเล่นเครื่องเดียวกัน (Pass & Play)
        </div>

        <h3 className="text-2xl font-extrabold text-white mb-2">
          ส่งต่ออุปกรณ์ให้
        </h3>
        <div className="text-2xl sm:text-3xl font-black text-amber-400 mb-4 tracking-wide">
          {nextPlayerName}
        </div>

        <p className="text-xs text-slate-400 mb-6 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          🔒 ไพ่และข้อมูลลับถูกซ่อนไว้เพื่อความยุติธรรม กรุณาส่งต่ออุปกรณ์ให้ {nextPlayerName} และกดปุ่มด้านล่างเมื่อพร้อมเล่น
        </p>

        <button
          onClick={handleProceed}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base transition shadow-glow-gold flex items-center justify-center gap-2"
        >
          <Eye size={20} /> แตะเมื่อ {nextPlayerName} พร้อมเล่น
        </button>
      </motion.div>
    </div>
  );
};
