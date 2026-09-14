import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { STAGES, STAGE_SEQUENCE } from '../hem.stageRules';

export function DistrictMatrixPanel({ filteredRows = [], onSelectMatrixCell }) {
  const [query, setQuery] = useState('');

  const matrix = useMemo(() => {
    const map = {};
    filteredRows.forEach(r => {
      const dist = r.district || 'UNKNOWN';
      if (!map[dist]) {
        map[dist] = { district: dist, total: 0 };
        STAGE_SEQUENCE.forEach(s => (map[dist][s] = 0));
      }
      if (map[dist][r.stage] !== undefined) {
        map[dist][r.stage]++;
      }
      map[dist].total++;
    });

    const q = query.trim().toLowerCase();
    return Object.values(map)
      .filter(row => !q || row.district.toLowerCase().includes(q))
      .sort((a, b) => a.district.localeCompare(b.district));
  }, [filteredRows, query]);

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg mb-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 font-semibold text-lg">Matrix Status per District</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tabel silang District × Tahap Progres (klik angka cell untuk filter)</p>
        </div>
        <div className="relative shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari district…"
            className="pl-8 pr-3 py-1.5 bg-slate-200 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/60 rounded-md text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/60 w-44"
          />
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider bg-slate-100 dark:bg-slate-950/60">
              <th className="p-2.5">District</th>
              {STAGE_SEQUENCE.map(stage => (
                <th key={stage} className="p-2.5 text-center shrink-0">
                  {stage}
                </th>
              ))}
              <th className="p-2.5 text-right font-bold text-slate-800 dark:text-slate-200">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
            {matrix.map(row => (
              <tr key={row.district} className="hover:bg-slate-200 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{row.district}</td>
                {STAGE_SEQUENCE.map(stage => {
                  const val = row[stage] || 0;
                  return (
                    <td key={stage} className="p-2.5 text-center font-mono">
                      {val > 0 ? (
                        <button
                          onClick={() => onSelectMatrixCell && onSelectMatrixCell(row.district, stage)}
                          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                            stage === STAGES.GOLIVE_UT
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/40'
                              : stage === STAGES.APPROVED_DROP || stage === STAGES.PROPOSED_DROP
                              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 hover:bg-rose-500/40'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-sky-500/30 hover:text-sky-700 dark:hover:text-sky-200'
                          }`}
                        >
                          {val}
                        </button>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  );
                })}
                <td className="p-2.5 text-right font-mono font-bold text-sky-600 dark:text-sky-400">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
