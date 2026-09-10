import React, { useMemo } from 'react';

export function BatchOrderPanel({ filteredRows = [], activeBatch = null, onSelectBatch }) {
  const batchStats = useMemo(() => {
    const map = {};
    filteredRows.forEach(r => {
      const b = r.batchOrder || 'Tanpa Batch';
      if (!map[b]) {
        map[b] = { name: b, total: 0, closed: 0, open: 0, kendala: 0, drop: 0 };
      }
      map[b].total++;
      if (r.statusLapangan === 'CLOSED') map[b].closed++;
      else if (r.statusLapangan === 'OPEN') map[b].open++;
      else if (r.statusLapangan === 'KENDALA') map[b].kendala++;
      else if (r.statusLapangan === 'DROP') map[b].drop++;
    });

    return Object.values(map)
      .map(b => ({
        ...b,
        achPct: b.total > 0 ? ((b.closed / b.total) * 100).toFixed(1) : '0.0',
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredRows]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Batch Order (WO)</h2>
          <p className="text-xs text-slate-400">Rekap pencapaian per gelombang order (klik baris untuk filter)</p>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-72 custom-scrollbar pr-1">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-900 z-10">
            <tr className="border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider">
              <th className="pb-2 pl-2">Batch Name</th>
              <th className="pb-2 text-right">Total</th>
              <th className="pb-2 text-right text-emerald-400">Closed</th>
              <th className="pb-2 text-right text-blue-400">Open</th>
              <th className="pb-2 text-right text-amber-400">Kendala</th>
              <th className="pb-2 text-right text-rose-400">Drop</th>
              <th className="pb-2 text-right pr-2">% Ach</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {batchStats.map(b => {
              const isSelected = activeBatch === b.name;
              return (
                <tr
                  key={b.name}
                  onClick={() => onSelectBatch && onSelectBatch('batchOrder', b.name)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-950/60 font-semibold text-sky-200'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <td className="py-2.5 pl-2 font-medium">{b.name}</td>
                  <td className="py-2.5 text-right font-mono font-semibold">{b.total}</td>
                  <td className="py-2.5 text-right font-mono text-emerald-400">{b.closed}</td>
                  <td className="py-2.5 text-right font-mono text-blue-400">{b.open}</td>
                  <td className="py-2.5 text-right font-mono text-amber-400">{b.kendala}</td>
                  <td className="py-2.5 text-right font-mono text-rose-400">{b.drop}</td>
                  <td className="py-2.5 text-right pr-2 font-mono font-bold text-emerald-400">
                    {b.achPct}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
