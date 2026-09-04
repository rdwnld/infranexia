import React, { useMemo } from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export function FilterChecklist({
  allRows = [],
  multiSelect = { district: new Set(), statusLapangan: new Set() },
  singleSelect = {},
  onToggleItem,
  onResetFilters,
  isFiltered,
}) {
  // Available district options with count
  const districts = useMemo(() => {
    const counts = {};
    allRows.forEach(r => {
      if (r.district) {
        counts[r.district] = (counts[r.district] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allRows]);

  const statuses = [
    { name: 'CLOSED', color: 'emerald' },
    { name: 'OPEN', color: 'blue' },
    { name: 'KENDALA', color: 'amber' },
    { name: 'DROP', color: 'rose' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-sky-400" />
          Filter Checklist
        </div>

        {/* Status Multi-select */}
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-4">
          <span className="text-xs text-slate-400 font-medium mr-1">Status:</span>
          {statuses.map(st => {
            const isChecked = multiSelect.statusLapangan?.has(st.name);
            return (
              <button
                key={st.name}
                onClick={() => onToggleItem('statusLapangan', st.name)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                  isChecked
                    ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.name}
              </button>
            );
          })}
        </div>

        {/* District Multi-select Dropdown / quick pills */}
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-4 max-w-xl overflow-x-auto custom-scrollbar py-1">
          <span className="text-xs text-slate-400 font-medium shrink-0">District:</span>
          {districts.map(d => {
            const isChecked = multiSelect.district?.has(d.name);
            return (
              <button
                key={d.name}
                onClick={() => onToggleItem('district', d.name)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border shrink-0 transition-all ${
                  isChecked
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-slate-800/30 border-slate-700/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                {d.name} <span className="opacity-60 text-[10px]">({d.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Button */}
      {isFiltered && (
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium rounded-lg transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
        </button>
      )}
    </div>
  );
}
