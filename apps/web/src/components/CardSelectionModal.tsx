import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CharacterRole,
  CHARACTERS,
  GameSettings,
  PRESET_CLASSIC,
  PRESET_STANDARD
} from '@hamster-coup/shared';
import { sounds } from '../audio/soundEffects';
import { CharacterArtwork } from './CharacterArtwork';
import { X, Check, Layers, Sparkles, Info, Shield, Swords, Coins } from 'lucide-react';

interface CardSelectionModalProps {
  settings: GameSettings;
  onSave: (newSettings: GameSettings) => void;
  onClose: () => void;
  isHost?: boolean;
}

export const CardSelectionModal: React.FC<CardSelectionModalProps> = ({
  settings: initialSettings,
  onSave,
  onClose,
  isHost = true
}) => {
  const [settings, setSettings] = useState<GameSettings>({ ...initialSettings });
  const [activePreviewRole, setActivePreviewRole] = useState<CharacterRole>('duke');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [retriedRoles, setRetriedRoles] = useState<Record<string, boolean>>({});

  const handleImageError = (role: CharacterRole, e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!retriedRoles[role]) {
      setRetriedRoles((prev) => ({ ...prev, [role]: true }));
      const def = CHARACTERS[role];
      const parts = def.image.split('/');
      const fileName = parts.pop() || '';
      const altFileName =
        fileName.charAt(0) === fileName.charAt(0).toUpperCase()
          ? fileName.charAt(0).toLowerCase() + fileName.slice(1)
          : fileName.charAt(0).toUpperCase() + fileName.slice(1);
      e.currentTarget.src = [...parts, altFileName].join('/');
    } else {
      setFailedImages((prev) => ({ ...prev, [role]: true }));
    }
  };

  const toggleRole = (role: CharacterRole) => {
    if (!isHost) return;
    sounds.playCardFlip();

    const updated = {
      ...settings.enabledRoles,
      [role]: !settings.enabledRoles[role]
    };

    // Require at least 3 roles to ensure game viability
    const enabledCount = Object.values(updated).filter(Boolean).length;
    if (enabledCount < 3) return;

    setSettings({
      ...settings,
      enabledRoles: updated,
      preset: 'custom'
    });
  };

  const handleApplyPreset = (type: 'classic' | 'standard') => {
    sounds.playCardFlip();
    if (type === 'classic') {
      setSettings({
        ...settings,
        enabledRoles: { ...PRESET_CLASSIC.enabledRoles },
        preset: 'classic'
      });
    } else {
      setSettings({
        ...settings,
        enabledRoles: { ...PRESET_STANDARD.enabledRoles },
        preset: 'standard'
      });
    }
  };

  const handleSave = () => {
    sounds.playCoin();
    onSave(settings);
    onClose();
  };

  const enabledCount = Object.values(settings.enabledRoles).filter(Boolean).length;
  const totalDeckCards = enabledCount * settings.copiesPerRole;
  const activeDef = CHARACTERS[activePreviewRole];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-4 sm:p-6 max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col justify-between"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-glow-gold">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                เลือกการ์ดตัวละครเข้าสู่กอง (Card Selection)
              </h2>
              <p className="text-xs text-slate-400">
                เลือกการ์ดที่ต้องการใช้ในการประลอง (เปิดใช้งาน: {enabledCount}/6 บทบาท • รวม {totalDeckCards} ใบ)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Presets Bar */}
        {isHost && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-bold text-slate-400 mr-1">ชุดการ์ดสำเร็จรูป:</span>
            <button
              onClick={() => handleApplyPreset('standard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5
                ${
                  settings.preset === 'standard' && enabledCount === 6
                    ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-glow-gold'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                }`}
            >
              <Sparkles size={14} /> ครบ 6 ตัวละคร (แนะนำ)
            </button>
            <button
              onClick={() => handleApplyPreset('classic')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5
                ${
                  settings.preset === 'classic' && enabledCount === 5
                    ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-glow-gold'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                }`}
            >
              <span>🏛️ คลาสสิก 5 ตัวละคร (ไม่รวมผู้ตรวจการ)</span>
            </button>
          </div>
        )}

        {/* Main Content Area: 6 Cards Grid + Detail Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
          {/* Left: 6 Interactive Cards Grid (8 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.keys(CHARACTERS).map((key) => {
              const role = key as CharacterRole;
              const def = CHARACTERS[role];
              const isEnabled = settings.enabledRoles[role];
              const isSelectedForPreview = activePreviewRole === role;

              return (
                <div
                  key={role}
                  onClick={() => {
                    setActivePreviewRole(role);
                    sounds.playCardFlip();
                  }}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all border-2 select-none flex flex-col justify-between
                    ${
                      isSelectedForPreview
                        ? 'ring-4 ring-amber-400 scale-[1.03] shadow-glow-gold'
                        : 'hover:scale-[1.01]'
                    }
                    ${
                      isEnabled
                        ? 'border-amber-500/80 bg-slate-950 shadow-xl'
                        : 'border-slate-800 bg-slate-950/40 opacity-45 grayscale'
                    }`}
                >
                  {/* Card Art Image */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                    {!failedImages[role] ? (
                      <img
                        src={def.image}
                        alt={def.nameTh}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => handleImageError(role, e)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-4">
                        <CharacterArtwork role={role} size={80} />
                      </div>
                    )}

                    {/* Enable / Disable Checkbox Toggle in top-right */}
                    {isHost && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRole(role);
                        }}
                        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition
                          ${
                            isEnabled
                              ? 'bg-amber-500 text-slate-950 border-2 border-amber-300'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        title={isEnabled ? 'ปิดใช้งานการ์ดนี้' : 'เปิดใช้งานการ์ดนี้'}
                      >
                        {isEnabled ? <Check size={14} strokeWidth={3} /> : '✕'}
                      </button>
                    )}

                    {!isEnabled && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-xs font-black bg-red-950/90 text-red-300 border border-red-700 px-2 py-1 rounded-lg shadow">
                          ไม่นำมาใช้
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Title Label */}
                  <div
                    className="p-2 text-center border-t"
                    style={{
                      backgroundColor: `${def.color}20`,
                      borderColor: `${def.color}40`
                    }}
                  >
                    <div className="text-xs font-extrabold text-white truncate drop-shadow">
                      {def.nameTh}
                    </div>
                    <div className="text-[10px] text-slate-300 opacity-90 truncate">
                      {def.nameEn}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Full Detail Inspector for the active selected card (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Selected Card Portrait Preview */}
              <div className="relative w-full aspect-[2/3] max-h-56 mx-auto rounded-2xl overflow-hidden border-2 border-amber-500 shadow-2xl mb-4 bg-slate-950 flex items-center justify-center">
                {!failedImages[activePreviewRole] ? (
                  <img
                    src={activeDef.image}
                    alt={activeDef.nameTh}
                    className="w-full h-full object-cover"
                    onError={(e) => handleImageError(activePreviewRole, e)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-6">
                    <CharacterArtwork role={activePreviewRole} size={110} />
                  </div>
                )}
              </div>

              {/* Character Details */}
              <div className="text-center mb-3">
                <h3 className="text-xl font-black text-white">{activeDef.nameTh}</h3>
                <h4 className="text-xs font-bold text-amber-400">{activeDef.titleTh} • {activeDef.nameEn}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {activeDef.descriptionTh}
                </p>
              </div>

              {/* Actions & Blocks breakdown */}
              <div className="space-y-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs">
                {activeDef.actionsTh.length > 0 && (
                  <div>
                    <span className="font-bold text-amber-300 flex items-center gap-1 mb-1">
                      <Swords size={13} /> แอ็กชัน (Action):
                    </span>
                    {activeDef.actionsTh.map((a, i) => (
                      <div key={i} className="text-slate-200 text-[11px] pl-3 border-l-2 border-amber-500/60">
                        {a}
                      </div>
                    ))}
                  </div>
                )}

                {activeDef.blocksTh.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <span className="font-bold text-pink-300 flex items-center gap-1 mb-1">
                      <Shield size={13} /> ป้องกัน (Block):
                    </span>
                    {activeDef.blocksTh.map((b, i) => (
                      <div key={i} className="text-slate-200 text-[11px] pl-3 border-l-2 border-pink-500/60">
                        {b}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Toggle state button for current inspected card */}
            {isHost && (
              <button
                onClick={() => toggleRole(activePreviewRole)}
                className={`w-full mt-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-md
                  ${
                    settings.enabledRoles[activePreviewRole]
                      ? 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-700'
                      : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700'
                  }`}
              >
                {settings.enabledRoles[activePreviewRole]
                  ? '✕ ถอดการ์ดนี้ออกจากสำรับ'
                  : '✓ เพิ่มการ์ดนี้เข้าสู่สำรับ'}
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {isHost ? 'เลือกเปิดหรือปิดการ์ดที่ต้องการใช้งานในสำรับ' : 'มุมมองตัวอย่างสำรับการ์ด'}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              ปิดหน้าต่าง
            </button>
            {isHost && (
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-glow-gold flex items-center gap-1.5"
              >
                <Check size={16} /> ยืนยันการเลือกการ์ด
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
