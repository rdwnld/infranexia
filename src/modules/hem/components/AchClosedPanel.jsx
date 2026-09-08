import React, { useMemo } from 'react';

export function AchClosedPanel({
  filteredRows = [],
  groupBy = 'district', // 'district' | 'batchOrder' | 'subkon'
  onChangeGroupBy,
  onSelectGroupItem,
}) {
  const rankingData = useMemo(() => {
    const map = {};
    filteredRows.forEach(r => {
      const key = r[groupBy] || 'Tanpa Group';
      if (!map[key]) {
        map[key] = { name: key, total: 0, closed: 0 };
      }
      map[key].total++;
      if (r.isClosed) map[key].closed++;
    });

    return Object.values(map)
      .map(item => ({
        ...item,
        achPct: item.total > 0 ? ((item.closed / item.total) * 100).toFixed(1) : '0.0',
      }))
      .sort((a, b) => parseFloat(b.achPct) - parseFloat(a.achPct))
      .slice(0, 10);
  }, [filteredRows, groupBy]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Pencapaian Ach Closed</h2>
          <p className="text-xs text-slate-400">Peringkat % order selesai (klik item untuk filter)</p>
        </div>

        {/* Group By Selector Toggle */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 self-start">
          <button
            onClick={() => onChangeGroupBy && onChangeGroupBy('district')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              groupBy === 'district' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            District
          </button>
          <button
            onClick={() => onChangeGroupBy && onChangeGroupBy('batchOrder')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              groupBy === 'batchOrder' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Batch
          </button>
          <button
            onClick={() => onChangeGroupBy && onChangeGroupBy('subkon')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              groupBy === 'subkon' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Subkon
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
        {rankingData.map((item, idx) => (
          <button
            key={item.name}
            onClick={() => onSelectGroupItem && onSelectGroupItem(groupBy, item.name)}
            className="w-full p-2.5 rounded-lg border bg-slate-800/40 border-slate-800 hover:border-slate-700 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className="text-xs font-medium text-slate-200 truncate group-hover:text-sky-300">
                {item.name}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">
                {item.closed}/{item.total}
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono w-12 text-right">
                {item.achPct}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
