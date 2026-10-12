import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GameAction,
  ActionType,
  ACTION_DEFINITIONS,
  GameSettings,
  PublicPlayer
} from '@hamster-coup/shared';
import { GoldenAcornIcon, CharacterArtwork } from './CharacterArtwork';
import { sounds } from '../audio/soundEffects';
import {
  Coins,
  HandCoins,
  Sword,
  Crown,
  Skull,
  Crosshair,
  Repeat,
  Search,
  Shield,
  Shuffle,
  Users
} from 'lucide-react';

interface ActionDrawerProps {
  myAcorns: number;
  legalActions: GameAction[];
  settings: GameSettings;
  opponents: PublicPlayer[];
  onExecuteAction: (action: GameAction) => void;
}

export const ActionDrawer: React.FC<ActionDrawerProps> = ({
  myAcorns,
  legalActions,
  settings,
  opponents,
  onExecuteAction
}) => {
  const [selectedPendingAction, setSelectedPendingAction] = useState<ActionType | null>(null);

  const isMandatoryCoup = myAcorns >= settings.mandatoryCoupThreshold;

  const playActionSound = (type: ActionType) => {
    switch (type) {
      case 'tax':
        sounds.playCoinShower();
        break;
      case 'coup':
      case 'assassinate':
        sounds.playSlash();
        break;
      case 'steal':
        sounds.playSwoosh();
        break;
      case 'exchange':
      case 'inquisitor_exchange':
      case 'inquisitor_inspect':
        sounds.playCardFlip();
        break;
      case 'income':
      case 'foreign_aid':
      default:
        sounds.playCoin();
        break;
    }
  };

  const handleActionClick = (type: ActionType) => {
    playActionSound(type);
    const def = ACTION_DEFINITIONS[type];

    if (def.isTargeted) {
      // Enter target selection mode
      setSelectedPendingAction(type);
    } else {
      // Execute untargeted action immediately
      setSelectedPendingAction(null);
      const action = legalActions.find((a) => a.type === type);
      if (action) {
        onExecuteAction(action);
      }
    }
  };

  const handleTargetSelect = (targetId: string) => {
    if (!selectedPendingAction) return;
    playActionSound(selectedPendingAction);

    const action = legalActions.find(
      (a) => a.type === selectedPendingAction && a.targetId === targetId
    );
    if (action) {
      onExecuteAction(action);
    }
    setSelectedPendingAction(null);
  };

  // Group actions
  const basicActionTypes: ActionType[] = ['income', 'foreign_aid', 'coup'];
  const roleActionTypes: ActionType[] = [
    'tax',
    'assassinate',
    'steal',
    'exchange',
    'inquisitor_inspect',
    'inquisitor_exchange'
  ];
  const reformationTypes: ActionType[] = ['convert_self', 'convert_other'];

  const getActionAvailable = (type: ActionType) => {
    return legalActions.some((a) => a.type === type);
  };

  return (
    <div className="bg-[#0D121C]/95 border-t border-slate-800 shadow-2xl backdrop-blur-md p-4 sm:p-5 rounded-t-3xl">
      {/* Mandatory Coup Banner */}
      {isMandatoryCoup && (
        <div className="mb-3 bg-red-950/70 border border-red-500/60 text-red-200 px-3.5 py-2 rounded-2xl text-center text-xs sm:text-sm font-bold animate-pulse flex items-center justify-center gap-2">
          <Skull size={18} className="text-red-400" />
          <span>คุณมีลูกโอ๊กทองคำ 10 เม็ดขึ้นไป! ต้องก่อรัฐประหาร (Coup) เท่านั้น</span>
        </div>
      )}

      {/* Target Selection Sub-menu */}
      {selectedPendingAction && (
        <div className="mb-3 bg-[#101622] border border-amber-500/60 rounded-2xl p-3.5 shadow-lg">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
              <Crosshair size={16} />
              เลือกเป้าหมายสำหรับ: {ACTION_DEFINITIONS[selectedPendingAction].nameTh}
            </span>
            <button
              onClick={() => setSelectedPendingAction(null)}
              className="text-xs bg-[#162030] hover:bg-[#1f2b42] px-2.5 py-1 rounded-xl text-slate-300 font-bold transition"
            >
              ยกเลิก
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {opponents
              .filter((opp) => opp.isAlive)
              .map((opp) => {
                const isLegalTarget = legalActions.some(
                  (a) => a.type === selectedPendingAction && a.targetId === opp.id
                );
                return (
                  <button
                    key={opp.id}
                    disabled={!isLegalTarget}
                    onClick={() => handleTargetSelect(opp.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5
                      ${
                        isLegalTarget
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer'
                          : 'bg-[#0B0E14] text-slate-600 border border-slate-800 opacity-50 cursor-not-allowed'
                      }`}
                  >
                    <span>{opp.name}</span>
                    <span className="text-[10px] bg-slate-950/70 px-1.5 py-0.5 rounded-lg text-amber-300 flex items-center gap-0.5 font-bold">
                      <GoldenAcornIcon size={12} /> {opp.acorns}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {/* Income */}
        <ActionButton
          type="income"
          icon={<Coins size={16} className="text-amber-400" />}
          label="รับเงิน (Income)"
          desc="+1 ลูกโอ๊ก (ไม่ถูกกัน)"
          cost={0}
          disabled={!getActionAvailable('income')}
          onClick={() => handleActionClick('income')}
        />

        {/* Foreign Aid */}
        <ActionButton
          type="foreign_aid"
          icon={<HandCoins size={16} className="text-amber-300" />}
          label="ขอความช่วยเหลือ"
          desc="+2 ลูกโอ๊ก (เจ้าพระยากันได้)"
          cost={0}
          disabled={!getActionAvailable('foreign_aid')}
          onClick={() => handleActionClick('foreign_aid')}
        />

        {/* Coup */}
        <ActionButton
          type="coup"
          icon={<Sword size={16} className="text-red-400" />}
          label="รัฐประหาร (Coup)"
          desc="ทำลาย 1 อิทธิพลทันที"
          cost={settings.coupCost}
          highlight={isMandatoryCoup}
          disabled={!getActionAvailable('coup')}
          onClick={() => handleActionClick('coup')}
        />

        {/* Tax (The Duke) */}
        {settings.enabledRoles.duke && (
          <ActionButton
            type="tax"
            icon={<Crown size={16} className="text-amber-400" />}
            label="เก็บภาษี (เจ้าพระยา)"
            desc="+3 ลูกโอ๊กทองคำ"
            cost={0}
            roleTag="เจ้าพระยา"
            roleColor="#EAB308"
            disabled={!getActionAvailable('tax')}
            onClick={() => handleActionClick('tax')}
          />
        )}

        {/* Assassinate (The Assassin) */}
        {settings.enabledRoles.assassin && (
          <ActionButton
            type="assassinate"
            icon={<Skull size={16} className="text-blue-400" />}
            label="ลอบสังหาร"
            desc="เป้าหมายเสีย 1 อิทธิพล"
            cost={settings.assassinCost}
            roleTag="มือสังหาร"
            roleColor="#3B82F6"
            disabled={!getActionAvailable('assassinate')}
            onClick={() => handleActionClick('assassinate')}
          />
        )}

        {/* Steal (The Captain) */}
        {settings.enabledRoles.captain && (
          <ActionButton
            type="steal"
            icon={<Crosshair size={16} className="text-cyan-400" />}
            label="ปล้นสะดม (ขุนโจร)"
            desc="ขโมย 2 ลูกโอ๊ก"
            cost={0}
            roleTag="ขุนโจร"
            roleColor="#06B6D4"
            disabled={!getActionAvailable('steal')}
            onClick={() => handleActionClick('steal')}
          />
        )}

        {/* Exchange (The Ambassador) */}
        {settings.enabledRoles.ambassador && (
          <ActionButton
            type="exchange"
            icon={<Repeat size={16} className="text-emerald-400" />}
            label="แลกเปลี่ยน (ราชทูต)"
            desc="จั่ว 2 ใบเลือกเปลี่ยน"
            cost={0}
            roleTag="ราชทูต"
            roleColor="#10B981"
            disabled={!getActionAvailable('exchange')}
            onClick={() => handleActionClick('exchange')}
          />
        )}

        {/* Inspect (The Inquisitor) */}
        {settings.enabledRoles.inquisitor && (
          <ActionButton
            type="inquisitor_inspect"
            icon={<Search size={16} className="text-purple-400" />}
            label="ตรวจค้นไพ่ (ผู้ตรวจการ)"
            desc="แอบดูไพ่คู่แข่ง 1 ใบ"
            cost={0}
            roleTag="ผู้ตรวจการ"
            roleColor="#A855F7"
            disabled={!getActionAvailable('inquisitor_inspect')}
            onClick={() => handleActionClick('inquisitor_inspect')}
          />
        )}

        {/* Exchange Single (The Inquisitor) */}
        {settings.enabledRoles.inquisitor && (
          <ActionButton
            type="inquisitor_exchange"
            icon={<Shuffle size={16} className="text-purple-300" />}
            label="เปลี่ยนเดี่ยว (ผู้ตรวจการ)"
            desc="จั่ว 1 ใบสลับเข้ากอง"
            cost={0}
            roleTag="ผู้ตรวจการ"
            roleColor="#A855F7"
            disabled={!getActionAvailable('inquisitor_exchange')}
            onClick={() => handleActionClick('inquisitor_exchange')}
          />
        )}

        {/* Reformation: Convert Self */}
        {settings.reformationEnabled && (
          <ActionButton
            type="convert_self"
            icon={<Users size={16} className="text-indigo-400" />}
            label="เปลี่ยนฝ่ายตนเอง"
            desc="สลับทีม แดง <-> น้ำเงิน"
            cost={settings.convertSelfCost}
            disabled={!getActionAvailable('convert_self')}
            onClick={() => handleActionClick('convert_self')}
          />
        )}

        {/* Reformation: Convert Other */}
        {settings.reformationEnabled && (
          <ActionButton
            type="convert_other"
            icon={<Users size={16} className="text-pink-400" />}
            label="เปลี่ยนฝ่ายผู้อื่น"
            desc="เปลี่ยนสีทีมของคู่แข่ง"
            cost={settings.convertOtherCost}
            disabled={!getActionAvailable('convert_other')}
            onClick={() => handleActionClick('convert_other')}
          />
        )}
      </div>
    </div>
  );
};

interface ActionButtonProps {
  type: ActionType;
  icon: React.ReactNode;
  label: string;
  desc: string;
  cost: number;
  roleTag?: string;
  roleColor?: string;
  disabled: boolean;
  highlight?: boolean;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  desc,
  cost,
  roleTag,
  roleColor,
  disabled,
  highlight = false,
  onClick
}) => {
  return (
    <motion.button
      disabled={disabled}
      onClick={onClick}
      whileHover={!disabled ? { y: -2, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={`relative text-left p-3 rounded-2xl border transition-colors flex flex-col justify-between select-none
        ${
          disabled
            ? 'bg-[#0B0E14]/40 border-slate-900 text-slate-600 opacity-40 cursor-not-allowed'
            : highlight
            ? 'bg-red-950/70 border-red-500/80 ring-2 ring-red-400 text-white hover:bg-red-900 shadow-lg cursor-pointer'
            : 'bg-[#101622] border-slate-800 text-slate-200 hover:border-amber-400/80 hover:bg-[#151D2C] shadow-sm cursor-pointer'
        }`}
    >
      <div className="flex items-center justify-between w-full mb-1">
        <div className="flex items-center gap-1.5 font-bold text-xs truncate">
          {icon}
          <span className="truncate">{label}</span>
        </div>
        {cost > 0 && (
          <span className="text-[10px] font-extrabold text-amber-400 bg-amber-950/70 border border-amber-600/40 px-1 py-0.5 rounded flex items-center gap-0.5">
            <GoldenAcornIcon size={12} /> {cost}
          </span>
        )}
      </div>

      <div className="text-[10px] text-slate-400 truncate">{desc}</div>

      {roleTag && (
        <div
          className="mt-1 text-[9px] font-semibold px-1 rounded inline-block self-start"
          style={{
            backgroundColor: `${roleColor}25`,
            color: roleColor,
            border: `1px solid ${roleColor}60`
          }}
        >
          {roleTag}
        </div>
      )}
    </motion.button>
  );
};
