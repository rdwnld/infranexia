import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

export function SubStatusPanel({ filteredRows = [] }) {
  const [query, setQuery] = useState('');

  const ranking = useMemo(() => {
    const counts = {};
    filteredRows.forEach(r => {
      const key = r.subStatus || 'UNKNOWN';
      counts[key] = (counts[key] || 0) + 1;
    });

    const total = filteredRows.length || 1;
    const q = query.trim().toLowerCase();
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        pct: ((count / total) * 100).toFixed(1),
      }))
      .filter(item => !q || item.name.toLowerCase().includes(q))
      .sort((a, b) => b.count - a.count);
  }, [filteredRows, query]);

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 font-semibold text-lg">Sub Status Ranking</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Detail sub-status dari order (klik untuk filter)</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari sub status…"
              className="pl-8 pr-3 py-1.5 bg-slate-200 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/60 rounded-md text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/60 w-40"
            />
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
            {ranking.length} Kategori
          </span>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-72 pr-1 custom-scrollbar">
        {ranking.map((item, idx) => (
          <button
            key={item.name}
            className="w-full p-2.5 rounded-lg border bg-slate-200 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left transition-all flex items-center justify-between"
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
        ))}
      </div>
    </div>
  );
}