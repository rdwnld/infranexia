import React, { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

export function FocusListPanel({ filteredRows = [] }) {
  const focusItems = useMemo(() => {
    // Top-5 open orders with oldest aging bucket
    return filteredRows
      .filter(r => !r.isClosed && r.agingBucket)
      .sort((a, b) => b.agingBucket.localeCompare(a.agingBucket))
      .slice(0, 5);
  }, [filteredRows]);

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 font-semibold text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" /> Fokus List (Early Warning)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Top-5 order open dengan aging tertua yang butuh perhatian</p>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        {focusItems.length > 0 ? (
          focusItems.map(item => (
            <div
              key={item.id}
              className="p-3 bg-rose-100 dark:bg-rose-950/20 border border-rose-900/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.namaLop}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>District: <strong className="text-slate-700 dark:text-slate-300">{item.district}</strong></span>
                  <span>•</span>
                  <span>Subkon: <strong className="text-slate-700 dark:text-slate-300">{item.subkon}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                  {item.stage}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 font-mono">
                  {item.agingBucket.replace(/^[0-9]\./, '')}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">Tidak ada order open tertunda.</p>
        )}
      </div>
    </div>
  );
}
