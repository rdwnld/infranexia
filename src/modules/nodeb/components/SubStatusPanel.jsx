import React, { useMemo } from 'react';

export function SubStatusPanel({ filteredRows = [], activeProgres = null, onSelectProgres }) {
  const ranking = useMemo(() => {
    const counts = {};
    filteredRows.forEach(r => {
      const key = r.progresLapangan || 'UNKNOWN';
      counts[key] = (counts[key] || 0) + 1;
    });

    const total = filteredRows.length || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        pct: ((count / total) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredRows]);

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 font-semibold text-lg">Progres Lapangan Ranking</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Daftar tahapan progres paling banyak (klik item untuk filter)</p>
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
          {ranking.length} Kategori
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-72 pr-1 custom-scrollbar">
        {ranking.map((item, idx) => {
          const isSelected = activeProgres === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onSelectProgres && onSelectProgres('progresLapangan', item.name)}
              className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-sky-100 dark:bg-sky-950/70 border-sky-500 border-2'
                  : 'bg-slate-200 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-16 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-sky-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, item.pct * 2)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 w-10 text-right">
                  {item.count}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
