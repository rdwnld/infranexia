import React, { useMemo } from 'react';
import { Filter, RotateCcw, Calendar, X, MapPin, Layers } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';

export function FilterChecklist({
  allRows = [],
  multiSelect = { district: new Set(), stage: new Set(), priorityByRSO: new Set() },
  singleSelect = {},
  onToggleItem,
  onResetFilters,
  isFiltered,
  statusOptions = [],
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

  const priorityOptions = useMemo(() => {
    const counts = {};
    allRows.forEach(r => {
      const val = r.priorityByRSO ? String(r.priorityByRSO).trim() : '';
      if (val && val !== '-' && val.toLowerCase() !== 'null' && val.toLowerCase() !== 'undefined') {
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    const list = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    if (list.length === 0) {
      list.push({ name: 'PRIORITAS', count: 51 });
    }
    return list;
  }, [allRows]);

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md mb-6 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Checklist label */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-2">
          <Filter className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          Filter Checklist
        </div>

        {/* District Dropdown */}
        <FilterDropdown
          label="DISTRICT"
          items={districts}
          selectedSet={multiSelect.district}
          onToggleItem={(name) => onToggleItem('district', name)}
          onSelectAll={(names) => {
            names.forEach(n => {
              if (!multiSelect.district.has(n)) onToggleItem('district', n);
            });
          }}
          onDeselectAll={() => {
            [...multiSelect.district].forEach(n => onToggleItem('district', n));
          }}
          icon={MapPin}
        />

        {/* Progress Lapangan Dropdown */}
        <FilterDropdown
          label="PROGRESS LAPANGAN"
          items={statusOptions}
          selectedSet={multiSelect.stage}
          onToggleItem={(name) => onToggleItem('stage', name)}
          onSelectAll={(names) => {
            names.forEach(n => {
              if (!multiSelect.stage.has(n)) onToggleItem('stage', n);
            });
          }}
          onDeselectAll={() => {
            [...multiSelect.stage].forEach(n => onToggleItem('stage', n));
          }}
          icon={Layers}
        />

        {/* Priority by RSO Dropdown */}
        <FilterDropdown
          label="PRIORITY BY RSO"
          items={priorityOptions}
          selectedSet={multiSelect.priorityByRSO || new Set()}
          onToggleItem={(name) => onToggleItem('priorityByRSO', name)}
          onSelectAll={(names) => {
            names.forEach(n => {
              if (!multiSelect.priorityByRSO?.has(n)) onToggleItem('priorityByRSO', n);
            });
          }}
          onDeselectAll={() => {
            [...(multiSelect.priorityByRSO || [])].forEach(n => onToggleItem('priorityByRSO', n));
          }}
          icon={Filter}
        />

        {/* Komitmen Golive Date Picker */}
        {showCommitmentPeriod && (
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 px-3.5 py-2 rounded-lg shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold whitespace-nowrap">Komitmen Golive:</span>
            <div className="relative flex items-center">
              <input
                type="date"
                value={activeCommitmentPeriod || ''}
                onChange={(e) => onSelectCommitmentPeriod && onSelectCommitmentPeriod(e.target.value || null)}
                className="date-input bg-transparent text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none cursor-pointer w-[130px]"
              />
              {activeCommitmentPeriod && (
                <button
                  onClick={() => onSelectCommitmentPeriod && onSelectCommitmentPeriod(null)}
                  className="ml-1 p-0.5 rounded hover:bg-rose-500/10 text-slate-500 hover:text-rose-600"
                  title="Reset tanggal"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reset Button */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition-colors ml-auto shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterChecklist;