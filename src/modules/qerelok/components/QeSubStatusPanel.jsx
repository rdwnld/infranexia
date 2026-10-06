import React, { useMemo } from 'react';
import { Layers, Award, Filter } from 'lucide-react';

export function QeSubStatusPanel({ filteredRows = [], activeKlasifikasi, onSelectKlasifikasi }) {
  const klasifikasiStats = useMemo(() => {
    const map = {};
    filteredRows.forEach(r => {
      const kl = r.klasifikasiLop || 'STANDARD';
      map[kl] = (map[kl] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredRows]);

  const total = filteredRows.length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Klasifikasi LOP</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Distribusi kategori klasifikasi pekerjaan</p>
          </div>
        </div>
        {activeKlasifikasi && (
          <button
            onClick={() => onSelectKlasifikasi('klasifikasiLop', null)}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium inline-flex items-center gap-1"
          >
            <Filter className="w-3 h-3" /> Reset Filter ({activeKlasifikasi})
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
        {klasifikasiStats.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Tidak ada data klasifikasi</p>
        ) : (
          klasifikasiStats.map(([kl, count]) => {
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            const isSelected = activeKlasifikasi === kl;
            return (
              <div
                key={kl}
                onClick={() => onSelectKlasifikasi('klasifikasiLop', kl)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{kl}</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {count} LOP <strong className="text-slate-900 dark:text-slate-100">({pct}%)</strong>
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-300"
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
