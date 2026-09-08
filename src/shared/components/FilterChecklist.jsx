import React, { useMemo } from 'react';
import { Filter, RotateCcw, Calendar, X, MapPin } from 'lucide-react';

export function FilterChecklist({
  allRows = [],
  multiSelect = { district: new Set(), stage: new Set() },
  singleSelect = {},
  onToggleItem,
  onResetFilters,
  isFiltered,
  statusOptions = [
    { name: 'CLOSED', color: 'emerald' },
    { name: 'OPEN', color: 'blue' },
    { name: 'KENDALA', color: 'amber' },
    { name: 'DROP', color: 'rose' },
  ],
  showCommitmentPeriod = false,
  activeCommitmentPeriod = null,
  onSelectCommitmentPeriod,
}) {
  const districts = useMemo(() => {
    const counts = {};
    allRows.forEach(r => {
      if (r.district) counts[r.district] = (counts[r.district] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allRows]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl shadow-md mb-6 overflow-hidden">
      {/* Top Row — Header label + Status + Calendar + Reset */}
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5 flex-1 min-w-0">
          {/* Filter Checklist label */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            <Filter className="w-4 h-4 text-sky-400" />
            Filter Checklist
          </div>

          {/* Vertical divider */}
          <div className="hidden md:block h-5 w-px bg-slate-800" />

          {/* Status Multi-select */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-slate-400 font-medium mr-1">Status:</span>
            {statusOptions.map(st => {
              const isChecked = multiSelect.stage?.has(st.name);
              return (
                <button
                  key={st.name}
                  onClick={() => onToggleItem('stage', st.name)}
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

          {/* Calendar Date Picker — right of Status */}
          {showCommitmentPeriod && (
            <div className="flex items-center gap-2 border-l border-slate-800 pl-5 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Periode Komitmen:</span>
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={activeCommitmentPeriod || ''}
                  onChange={(e) => onSelectCommitmentPeriod && onSelectCommitmentPeriod(e.target.value || null)}
                  className="date-input px-2.5 py-1 bg-slate-800/60 border border-slate-700/60 rounded-md text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500/60 focus:bg-slate-800 transition-all hover:border-sky-500/30 cursor-pointer w-[150px]"
                />
                {activeCommitmentPeriod && (
                  <button
                    onClick={() => onSelectCommitmentPeriod && onSelectCommitmentPeriod(null)}
                    className="ml-1.5 p-1 rounded-md hover:bg-rose-500/10 text-slate-500 hover:text-rose-300 transition-colors"
                    title="Reset tanggal"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium rounded-lg transition-colors shrink-0 self-start md:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
          </button>
        )}
      </div>

      {/* Bottom Row — District Pills (full width, horizontal scroll) */}
      {districts.length > 0 && (
        <div className="px-4 py-3 bg-slate-950/30">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">District</span>
            <span className="text-[10px] text-slate-500">({districts.length})</span>
          </div>
          
          <div className="relative">
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-3 w-10 bg-gradient-to-r from-slate-950/95 to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-3 w-10 bg-gradient-to-l from-slate-950/95 to-transparent pointer-events-none z-10" />
            
            <div className="district-scroll-row overflow-x-auto pb-2.5 -mx-1 px-1">
              <div className="flex items-center gap-2 min-w-max">
                {districts.map(d => {
                  const isChecked = multiSelect.district?.has(d.name);
                  return (
                    <button
                      key={d.name}
                      onClick={() => onToggleItem('district', d.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap shrink-0 ${
                        isChecked
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-sm'
                          : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800/70 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      <MapPin className="w-3 h-3 inline mr-1 opacity-60" />
                      {d.name}
                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900/60 text-slate-300">
                        {d.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
