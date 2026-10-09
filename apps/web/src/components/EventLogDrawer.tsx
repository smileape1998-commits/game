import React, { useState } from 'react';
import { EventLogEntry } from '@hamster-coup/shared';
import { History, ChevronUp, ChevronDown } from 'lucide-react';

export const EventLogDrawer: React.FC<{ logs: EventLogEntry[] }> = ({ logs }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition"
      >
        <div className="flex items-center gap-1.5 text-amber-400">
          <History size={14} />
          <span>ประวัติการเล่น ({logs.length})</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          {logs[0] && (
            <span className="truncate max-w-[200px] sm:max-w-[300px] text-slate-300 font-normal">
              {logs[0].messageTh}
            </span>
          )}
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </button>

      {isOpen && (
        <div className="max-h-48 overflow-y-auto p-2.5 border-t border-slate-800/80 space-y-1.5">
          {logs.map((log) => {
            const badgeColor =
              log.type === 'challenge'
                ? 'bg-red-950 text-red-400 border-red-800'
                : log.type === 'block'
                ? 'bg-blue-950 text-blue-400 border-blue-800'
                : log.type === 'elimination'
                ? 'bg-purple-950 text-purple-400 border-purple-800'
                : 'bg-slate-800 text-slate-300 border-slate-700';

            return (
              <div
                key={log.id}
                className="text-[11px] p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2"
              >
                <span
                  className={`text-[9px] font-bold px-1 py-0.5 rounded border uppercase shrink-0 ${badgeColor}`}
                >
                  {log.type}
                </span>
                <span className="text-slate-200 leading-tight">
                  {log.messageTh}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
