import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

function buildRanking(rows, key, query) {
  const map = {};
  rows.forEach(r => {
    const name = r[key] || 'Tanpa Data';
    if (!map[name]) map[name] = { name, total: 0, closed: 0 };
    map[name].total++;
    if (r.isClosed) map[name].closed++;
  });

  const q = query.trim().toLowerCase();
  return Object.values(map)
    .map(item => ({
      ...item,
      ach: item.total > 0 ? Number(((item.closed / item.total) * 100).toFixed(1)) : 0,
    }))
    .filter(item => !q || item.name.toLowerCase().includes(q))
    .sort((a, b) => b.ach - a.ach || b.total - a.total);
}

function AchProgressList({ title, subtitle, data, filterKey, onSelect }) {
  return (
    <div className="bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col min-w-0">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-slate-800 dark:text-slate-200 font-semibold text-sm">{title}</h3>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded">
          {data.length} Item
        </span>
      </div>
      <div className="h-56 overflow-y-auto custom-scrollbar space-y-1 pr-1">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
            Tidak ada data
          </div>
        ) : (
          data.map(item => {
            const barColor = item.ach >= 80 ? 'bg-emerald-500' : item.ach >= 50 ? 'bg-sky-400' : 'bg-amber-500';
            return (
              <button
                key={item.name}
                onClick={() => onSelect && onSelect(filterKey, item.name)}
                className="w-full text-left group flex items-center justify-between p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800/30 rounded transition-all"
                title={item.name}
              >
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate w-24 sm:w-28 shrink-0 pr-2">
                  {item.name}
                </span>
                <div className="flex-1 bg-slate-200 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${barColor} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${item.ach}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0 text-right pl-3">
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-12">
                    {item.closed}/{item.total}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 w-10">
                    {Math.round(item.ach)}%
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function AchClosedPanel({ filteredRows = [], onSelectGroupItem }) {
  const [query, setQuery] = useState('');

  const byDistrict = useMemo(() => buildRanking(filteredRows, 'district', query), [filteredRows, query]);
  const byBatch = useMemo(() => buildRanking(filteredRows, 'batchOrder', query), [filteredRows, query]);
  const bySubkon = useMemo(() => buildRanking(filteredRows, 'subkon', query), [filteredRows, query]);

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 font-semibold text-lg">Pencapaian Ach Closed</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tiga panel terpisah per District, Batch & Subkon (klik item untuk filter)</p>
        </div>
        <div className="relative shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama…"
            className="pl-8 pr-3 py-1.5 bg-slate-200 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/60 rounded-md text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/60 w-44"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <AchProgressList title="Per District" subtitle="% closed per district" data={byDistrict} filterKey="district" onSelect={onSelectGroupItem} />
        <AchProgressList title="Per Batch" subtitle="% closed per batch order" data={byBatch} filterKey="batchOrder" onSelect={onSelectGroupItem} />
        <AchProgressList title="Per Subkon" subtitle="% closed per subkontraktor" data={bySubkon} filterKey="subkon" onSelect={onSelectGroupItem} />
      </div>
    </div>
  );
}


