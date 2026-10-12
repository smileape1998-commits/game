import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GamePhase,
  CurrentActionState,
  BlockState,
  PublicPlayer,
  CharacterRole,
  CHARACTERS,
  ACTION_DEFINITIONS
} from '@hamster-coup/shared';
import { CharacterArtwork } from './CharacterArtwork';
import { sounds } from '../audio/soundEffects';
import { Shield, AlertTriangle, Check, ShieldAlert, Swords } from 'lucide-react';

interface ResponseModalProps {
  phase: GamePhase;
  currentAction?: CurrentActionState;
  currentBlock?: BlockState;
  players: Record<string, PublicPlayer>;
  myPlayerId: string;
  isEligibleToRespond: boolean;
  hasPassed: boolean;
  onRespond: (response: {
    type: 'pass' | 'challenge' | 'block';
    claimedRole?: CharacterRole;
  }) => void;
}

export const ResponseModal: React.FC<ResponseModalProps> = ({
  phase,
  currentAction,
  currentBlock,
  players,
  myPlayerId,
  isEligibleToRespond,
  hasPassed,
  onRespond
}) => {
  const [isChallenged, setIsChallenged] = React.useState(false);

  React.useEffect(() => {
    setIsChallenged(false);
  }, [phase, currentAction?.action?.type, currentBlock?.claimedRole]);

  if (
    phase !== 'CHALLENGE_WINDOW' &&
    phase !== 'BLOCK_WINDOW' &&
    phase !== 'BLOCK_CHALLENGE_WINDOW'
  ) {
    return null;
  }

  const actor = currentAction ? players[currentAction.sourceId] : undefined;
  const target = currentAction?.targetId ? players[currentAction.targetId] : undefined;
  const blocker = currentBlock ? players[currentBlock.blockerId] : undefined;

  const actionDef = currentAction
    ? ACTION_DEFINITIONS[currentAction.action.type]
    : undefined;

  const handleChallenge = () => {
    setIsChallenged(true);
    sounds.playChallenge();
    onRespond({ type: 'challenge' });
  };

  const handleBlock = (role: CharacterRole) => {
    sounds.playBlock();
    onRespond({ type: 'block', claimedRole: role });
  };

  const handlePass = () => {
    sounds.playCardFlip();
    onRespond({ type: 'pass' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative overflow-hidden"
      >
        {/* Glowing Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600" />

        {/* Phase 1: CHALLENGE WINDOW */}
        {phase === 'CHALLENGE_WINDOW' && currentAction && actor && (
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-base sm:text-lg mb-3">
              <AlertTriangle size={22} className="text-amber-400" />
              <span>หน้าต่างท้าทาย (Challenge Window)</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-4 flex items-center gap-4">
              {currentAction.claimedRole && (
                <div className="shrink-0">
                  <CharacterArtwork role={currentAction.claimedRole} size={64} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-400 font-medium">ผู้เล่นกำลังกระทำ:</div>
                <div className="text-sm sm:text-base font-bold text-slate-100 truncate">
                  <span className="text-amber-300">{actor.name}</span> อ้างบทบาท{' '}
                  <span className="text-amber-400 font-extrabold">
                    {currentAction.claimedRole
                      ? CHARACTERS[currentAction.claimedRole].nameTh
                      : ''}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  การกระทำ: {actionDef?.nameTh}
                  {target && (
                    <span className="text-slate-400"> (เป้าหมาย: {target.name})</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 mb-5 leading-relaxed bg-slate-800/40 border border-slate-700/50 p-2.5 rounded-xl">
              💡 <span className="font-semibold text-slate-200">เดิมพันการท้าทาย:</span>{' '}
              หากคุณท้าทายและเขาไม่มีไพ่นั้นจริง เขาจะเสีย 1 อิทธิพลและแอ็กชันถูกยกเลิก! แต่ถ้าเขามีไพ่จริง คุณจะเสีย 1 อิทธิพลแทน!
            </div>

            {isEligibleToRespond ? (
              hasPassed ? (
                <div className="text-center py-2 text-sm font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-xl">
                  ✓ คุณได้กดยอมรับแล้ว (รอผู้เล่นอื่นตัดสินใจ...)
                </div>
              ) : isChallenged ? (
                <div className="text-center py-3 text-sm font-bold text-amber-300 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>⚔️ คุณได้ส่งคำท้าทายแล้ว! กำลังตรวจสอบไพ่...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handlePass}
                    className="py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Check size={18} />
                    ยอมรับ / ผ่าน (Allow)
                  </button>
                  <button
                    onClick={handleChallenge}
                    className="py-3 px-4 rounded-xl border border-red-500 bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm transition shadow-glow-red flex items-center justify-center gap-1.5"
                  >
                    <Swords size={18} />
                    ท้าทาย! (Challenge)
                  </button>
                </div>
              )
            ) : (
              <div className="text-center py-2 text-sm text-slate-400">
                คุณกำลังเป็นผู้กระทำ กำลังรอการตอบสนองจากผู้เล่นอื่น...
              </div>
            )}
          </div>
        )}

        {/* Phase 2: BLOCK WINDOW */}
        {phase === 'BLOCK_WINDOW' && currentAction && actor && (
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-extrabold text-base sm:text-lg mb-3">
              <Shield size={22} className="text-blue-400" />
              <span>หน้าต่างขัดขวาง (Block Window)</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-4">
              <div className="text-xs text-slate-400 font-medium">การกระทำที่สามารถกันได้:</div>
              <div className="text-sm sm:text-base font-bold text-slate-100 mt-1">
                <span className="text-amber-300">{actor.name}</span> กระทำ {actionDef?.nameTh}
                {target && (
                  <span className="text-slate-300"> ใส่ <span className="text-red-400 font-bold">{target.name}</span></span>
                )}
              </div>
            </div>

            {isEligibleToRespond ? (
              hasPassed ? (
                <div className="text-center py-2 text-sm font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-xl">
                  ✓ คุณไม่ขัดขวาง (ผ่าน)
                </div>
              ) : (
                <div>
                  <div className="text-xs text-slate-300 font-semibold mb-2">
                    เลือกตัวละครเพื่ออ้างสิทธิ์ขัดขวาง:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {currentAction.action.type === 'assassinate' && (
                      <button
                        onClick={() => handleBlock('contessa')}
                        className="p-2.5 rounded-xl border border-pink-500 bg-pink-950/80 hover:bg-pink-900/90 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow"
                      >
                        <CharacterArtwork role="contessa" size={34} />
                        <div className="text-left">
                          <div>อ้างเป็น รัชทายาท</div>
                          <div className="text-[10px] text-pink-300 font-normal">กันการลอบสังหาร</div>
                        </div>
                      </button>
                    )}

                    {currentAction.action.type === 'steal' && (
                      <>
                        <button
                          onClick={() => handleBlock('captain')}
                          className="p-2.5 rounded-xl border border-cyan-500 bg-cyan-950/80 hover:bg-cyan-900/90 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow"
                        >
                          <CharacterArtwork role="captain" size={34} />
                          <div className="text-left">
                            <div>อ้างเป็น ขุนโจร</div>
                            <div className="text-[10px] text-cyan-300 font-normal">กันการปล้น</div>
                          </div>
                        </button>
                        <button
                          onClick={() => handleBlock('ambassador')}
                          className="p-2.5 rounded-xl border border-emerald-500 bg-emerald-950/80 hover:bg-emerald-900/90 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow"
                        >
                          <CharacterArtwork role="ambassador" size={34} />
                          <div className="text-left">
                            <div>อ้างเป็น ราชทูต</div>
                            <div className="text-[10px] text-emerald-300 font-normal">กันการปล้น</div>
                          </div>
                        </button>
                      </>
                    )}

                    {currentAction.action.type === 'foreign_aid' && (
                      <button
                        onClick={() => handleBlock('duke')}
                        className="p-2.5 rounded-xl border border-amber-500 bg-amber-950/80 hover:bg-amber-900/90 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow"
                      >
                        <CharacterArtwork role="duke" size={34} />
                        <div className="text-left">
                          <div>อ้างเป็น เจ้าพระยา</div>
                          <div className="text-[10px] text-amber-300 font-normal">กันความช่วยเหลือต่างแดน</div>
                        </div>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handlePass}
                    className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm"
                  >
                    ไม่ขัดขวาง (ผ่าน / Pass)
                  </button>
                </div>
              )
            ) : (
              <div className="text-center py-2 text-sm text-slate-400">
                รอเป้าหมายหรือผู้เล่นอื่นตัดสินใจขัดขวาง...
              </div>
            )}
          </div>
        )}

        {/* Phase 3: BLOCK CHALLENGE WINDOW */}
        {phase === 'BLOCK_CHALLENGE_WINDOW' && currentBlock && blocker && (
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-extrabold text-base sm:text-lg mb-3">
              <ShieldAlert size={22} className="text-purple-400" />
              <span>ท้าทายการขัดขวาง (Block Challenge)</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-4 flex items-center gap-4">
              <div className="shrink-0">
                <CharacterArtwork role={currentBlock.claimedRole} size={64} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-400 font-medium">ผู้ขัดขวาง:</div>
                <div className="text-sm sm:text-base font-bold text-slate-100 truncate">
                  <span className="text-purple-300">{blocker.name}</span> อ้างบทบาท{' '}
                  <span className="text-purple-400 font-extrabold">
                    {CHARACTERS[currentBlock.claimedRole].nameTh}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  เพื่อยกเลิกการกระทำของ {actor?.name}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 mb-5 leading-relaxed bg-slate-800/40 border border-slate-700/50 p-2.5 rounded-xl">
              💡 <span className="font-semibold text-slate-200">เดิมพันการท้าทายการกัน:</span>{' '}
              หากคุณท้าทายแล้วเขาไม่มีไพ่กันจริง การกันจะล้มเหลวและเขาเสีย 1 อิทธิพล! แต่ถ้าเขามีไพ่จริง คุณจะเสีย 1 อิทธิพลแทน!
            </div>

            {isEligibleToRespond ? (
              hasPassed ? (
                <div className="text-center py-2 text-sm font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-xl">
                  ✓ คุณยอมรับการขัดขวางแล้ว
                </div>
              ) : isChallenged ? (
                <div className="text-center py-3 text-sm font-bold text-amber-300 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>⚔️ คุณได้ส่งคำท้าทายการกันแล้ว! กำลังตรวจสอบไพ่...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handlePass}
                    className="py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Check size={18} />
                    ยอมรับการกัน (Accept)
                  </button>
                  <button
                    onClick={handleChallenge}
                    className="py-3 px-4 rounded-xl border border-red-500 bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm transition shadow-glow-red flex items-center justify-center gap-1.5"
                  >
                    <Swords size={18} />
                    ท้าทายการกัน! (Challenge)
                  </button>
                </div>
              )
            ) : (
              <div className="text-center py-2 text-sm text-slate-400">
                คุณคือผู้ขัดขวาง กำลังรอให้คู่แข่งตัดสินใจว่าจะท้าทายหรือไม่...
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
