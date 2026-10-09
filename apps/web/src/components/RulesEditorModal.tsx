import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GameSettings,
  PRESET_CLASSIC,
  PRESET_STANDARD,
  PRESET_REFORMATION,
  CHARACTERS,
  CharacterRole
} from '@hamster-coup/shared';
import { X, Sliders, Check, RotateCcw } from 'lucide-react';

interface RulesEditorModalProps {
  currentSettings: GameSettings;
  onSave: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const RulesEditorModal: React.FC<RulesEditorModalProps> = ({
  currentSettings,
  onSave,
  onClose
}) => {
  const [settings, setSettings] = useState<GameSettings>({ ...currentSettings });

  const applyPreset = (preset: 'classic' | 'standard' | 'reformation') => {
    if (preset === 'classic') setSettings({ ...PRESET_CLASSIC });
    else if (preset === 'standard') setSettings({ ...PRESET_STANDARD });
    else if (preset === 'reformation') setSettings({ ...PRESET_REFORMATION });
  };

  const toggleRole = (role: CharacterRole) => {
    const updated = {
      ...settings.enabledRoles,
      [role]: !settings.enabledRoles[role]
    };
    // Ensure at least 3 roles remain enabled
    const activeCount = Object.values(updated).filter(Boolean).length;
    if (activeCount < 3) return;

    setSettings({
      ...settings,
      enabledRoles: updated,
      preset: 'custom'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-5 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-lg">
            <Sliders size={22} />
            <span>ปรับแต่งกติกาและระบบเกม (Rules & Settings)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-300 block mb-2">
            เลือกรูปแบบกติกาสำเร็จรูป (Presets):
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => applyPreset('classic')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition text-center
                ${
                  settings.preset === 'classic'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
            >
              <div>🏛️ Classic Coup</div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">5 ตัวละครดั้งเดิม</div>
            </button>
            <button
              onClick={() => applyPreset('standard')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition text-center
                ${
                  settings.preset === 'standard'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
            >
              <div>🐹 Hamster Standard</div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">รวมผู้ตรวจการ (6 บทบาท)</div>
            </button>
            <button
              onClick={() => applyPreset('reformation')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition text-center
                ${
                  settings.preset === 'reformation'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
            >
              <div>⚔️ Reformation (ก๊ก)</div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">ระบบทีมสีแดง/น้ำเงิน</div>
            </button>
          </div>
        </div>

        {/* Enabled Character Roles */}
        <div className="mb-5 bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
          <label className="text-xs font-bold text-slate-300 block mb-2">
            ตัวละครที่เปิดใช้งาน (Enabled Characters):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.keys(CHARACTERS).map((roleKey) => {
              const role = roleKey as CharacterRole;
              const def = CHARACTERS[role];
              const isEnabled = settings.enabledRoles[role];
              return (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`p-2 rounded-xl border text-left transition flex items-center justify-between
                    ${
                      isEnabled
                        ? 'border-amber-500/80 bg-slate-800 text-white'
                        : 'border-slate-800 bg-slate-900/40 text-slate-500 opacity-60'
                    }`}
                >
                  <div className="text-xs font-bold truncate">
                    <span>{def.nameTh}</span>
                    <span className="block text-[9px] font-normal text-slate-400">{def.nameEn}</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isEnabled ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    {isEnabled ? '✓' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Numeric Game Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
            <label className="text-xs text-slate-300 font-medium block mb-1">
              ลูกโอ๊กทองคำเริ่มต้น (Starting Acorns):
            </label>
            <input
              type="number"
              min={1}
              max={6}
              value={settings.startingAcorns}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  startingAcorns: parseInt(e.target.value) || 2,
                  preset: 'custom'
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
            <label className="text-xs text-slate-300 font-medium block mb-1">
              เกณฑ์บังคับรัฐประหาร (Mandatory Coup):
            </label>
            <input
              type="number"
              min={7}
              max={15}
              value={settings.mandatoryCoupThreshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  mandatoryCoupThreshold: parseInt(e.target.value) || 10,
                  preset: 'custom'
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
            <label className="text-xs text-slate-300 font-medium block mb-1">
              ค่าใช้จ่ายรัฐประหาร (Coup Cost):
            </label>
            <input
              type="number"
              min={5}
              max={10}
              value={settings.coupCost}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  coupCost: parseInt(e.target.value) || 7,
                  preset: 'custom'
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
            <label className="text-xs text-slate-300 font-medium block mb-1">
              ค่าลอบสังหาร (Assassin Cost):
            </label>
            <input
              type="number"
              min={2}
              max={5}
              value={settings.assassinCost}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  assassinCost: parseInt(e.target.value) || 3,
                  preset: 'custom'
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Reformation Options */}
        <div className="mb-6 bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-200">
              ระบบก๊กฝ่าย (Reformation Factions Red/Blue)
            </span>
            <input
              type="checkbox"
              checked={settings.reformationEnabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  reformationEnabled: e.target.checked,
                  preset: 'custom'
                })
              }
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </div>
          <div className="text-[11px] text-slate-400 leading-relaxed">
            ผู้เล่นจะถูกแบ่งเป็นทีมสีแดงและน้ำเงิน ไม่สามารถโจมตีเพื่อนร่วมทีมได้ สามารถจ่ายลูกโอ๊กเพื่อแปรพักตร์หรือบังคับผู้อื่นเปลี่ยนฝ่ายได้
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => {
              onSave(settings);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition shadow-glow-gold flex items-center gap-1.5"
          >
            <Check size={16} /> บันทึกการตั้งค่า
          </button>
        </div>
      </motion.div>
    </div>
  );
};
