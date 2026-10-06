import React, { useMemo } from 'react';
import { Filter, RotateCcw, Calendar, MapPin, Layers } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';

export function FilterChecklist({
  allRows = [],
  multiSelect = { district: new Set(), stage: new Set(), priorityByRSO: new Set(), commitmentPeriod: new Set() },
  singleSelect = {},
  onToggleItem,
  onResetFilters,
  isFiltered,
  statusOptions = [],
  priorityLabel = 'PRIORITY BY RSO',
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
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allRows]);

  const commitmentOptions = useMemo(() => {
    const counts = {};
    allRows.forEach(r => {
      const val = r.targetGolive ? String(r.targetGolive).trim() : 'TBC';
      const key = val && val !== '-' ? val : 'TBC';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.name.localeCompare(b.name));
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
          label={priorityLabel}
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

        {/* Komitmen Golive Dropdown */}
        <FilterDropdown
          label="KOMITMEN GOLIVE"
          items={commitmentOptions}
          selectedSet={multiSelect.commitmentPeriod || new Set()}
          onToggleItem={(name) => onToggleItem('commitmentPeriod', name)}
          onSelectAll={(names) => {
            names.forEach(n => {
              if (!multiSelect.commitmentPeriod?.has(n)) onToggleItem('commitmentPeriod', n);
            });
          }}
          onDeselectAll={() => {
            [...(multiSelect.commitmentPeriod || [])].forEach(n => onToggleItem('commitmentPeriod', n));
          }}
          icon={Calendar}
        />

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