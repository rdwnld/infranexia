import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';

export function QeRelokSubStatusPanel({ filteredRows = [] }) {
  const ranking = useMemo(() => {
    const counts = {};
    filteredRows.forEach(r => {
      const status = r.detailStatus || r.statusProgres || 'UNKNOWN';
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredRows]);

  const total = filteredRows.length;

  if (ranking.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-base sm:text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Detail Status Ranking (Top 10)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Distribusi detail status / kendala LOP QE Relok
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {ranking.map((item, idx) => {
          const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
          return (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-600 dark:text-slate-400 shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 shrink-0">
                  {item.count.toLocaleString('id-ID')} <span className="font-normal text-slate-500 text-[10px]">({pct}%)</span>
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
