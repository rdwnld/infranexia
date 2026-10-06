import React, { useMemo } from 'react';
import { Activity, Filter } from 'lucide-react';

export function QeStatusDeploymentPanel({ filteredRows = [], activeStatus, onSelectStatus }) {
  const statusCounts = useMemo(() => {
    const counts = {};
    filteredRows.forEach(r => {
      const st = r.statusProgres || 'UNKNOWN';
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]);
  }, [filteredRows]);

  const total = filteredRows.length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Status Progres QE Relok</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Distribusi status pengerjaan LOP</p>
          </div>
        </div>
        {activeStatus && (
          <button
            onClick={() => onSelectStatus('statusProgres', null)}
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium inline-flex items-center gap-1"
          >
            <Filter className="w-3 h-3" /> Reset Filter ({activeStatus})
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
        {statusCounts.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Tidak ada data status</p>
        ) : (
          statusCounts.map(([st, count], idx) => {
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            const isSelected = activeStatus === st;
            const isClosed = st.includes('CLOSED');
            const isDrop = st.includes('DROP');

            let barColor = 'bg-sky-500';
            if (isClosed) barColor = 'bg-emerald-500';
            else if (isDrop) barColor = 'bg-rose-500';
            else if (idx % 2 === 1) barColor = 'bg-indigo-500';

            return (
              <div
                key={st}
                onClick={() => onSelectStatus('statusProgres', st)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                    {st}
                  </span>
                  <span className="font-mono text-slate-600 dark:text-slate-400 shrink-0">
                    {count} LOP <strong className="text-slate-900 dark:text-slate-100">({pct}%)</strong>
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${barColor} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
