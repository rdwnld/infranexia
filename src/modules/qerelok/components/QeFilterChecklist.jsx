import React, { useMemo } from 'react';
import { Filter, RotateCcw, Globe, MapPin, Calendar, Layers, Activity } from 'lucide-react';
import { FilterDropdown } from '../../../shared/components/FilterDropdown';

export function QeFilterChecklist({
  allRows = [],
  multiSelect = { region: new Set(), district: new Set(), tgtDariInstansi: new Set(), statusProgres: new Set(), klasifikasiLop: new Set() },
  onToggleItem,
  onResetFilters,
  isFiltered,
}) {
  const regionOptions = useMemo(() => {
    const counts = {};
    allRows.forEach(r => {
      const v = r.region || 'UNKNOWN';
      counts[v] = (counts[v] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.name.localeCompare(a.name));
  }, [allRows]);

  const districtOptions = useMemo(() => {
    const counts = {};
    allRows.forEach(r => {
      const v = r.district || 'UNKNOWN';
      counts[v] = (counts[v] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allRows]);

  const tgtOptions = useMemo(() => {
    const counts = {};
    allRows.forEach(r => {
      const v = r.tgtDariInstansi ? r.tgtDariInstansi : 'TBC';
      counts[v] = (counts[v] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.name.localeCompare(b.name));
  }, [allRows]);

  const statusOptions = useMemo(() => {
    const counts = {};
    allRows.forEach(r => {
      const v = r.statusProgres || 'UNKNOWN';
      counts[v] = (counts[v] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allRows]);

  const klasifikasiOptions = useMemo(() => {
    const counts = {};
    allRows.forEach(r => {
      const v = r.klasifikasiLop || 'STANDARD';
      counts[v] = (counts[v] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allRows]);

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Label */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-2">
          <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Filter QE Relok
        </div>

        {/* Region */}
        <FilterDropdown
          label="REGION"
          items={regionOptions}
          selectedSet={multiSelect.region || new Set()}
          onToggleItem={(name) => onToggleItem('region', name)}
          onSelectAll={(names) => names.forEach(n => !multiSelect.region?.has(n) && onToggleItem('region', n))}
          onDeselectAll={() => [...(multiSelect.region || [])].forEach(n => onToggleItem('region', n))}
          icon={Globe}
        />

        {/* District */}
        <FilterDropdown
          label="DISTRICT"
          items={districtOptions}
          selectedSet={multiSelect.district || new Set()}
          onToggleItem={(name) => onToggleItem('district', name)}
          onSelectAll={(names) => names.forEach(n => !multiSelect.district?.has(n) && onToggleItem('district', n))}
          onDeselectAll={() => [...(multiSelect.district || [])].forEach(n => onToggleItem('district', n))}
          icon={MapPin}
        />

        {/* TGT Dari Instansi */}
        <FilterDropdown
          label="TGT INSTANSI"
          items={tgtOptions}
          selectedSet={multiSelect.tgtDariInstansi || new Set()}
          onToggleItem={(name) => onToggleItem('tgtDariInstansi', name)}
          onSelectAll={(names) => names.forEach(n => !multiSelect.tgtDariInstansi?.has(n) && onToggleItem('tgtDariInstansi', n))}
          onDeselectAll={() => [...(multiSelect.tgtDariInstansi || [])].forEach(n => onToggleItem('tgtDariInstansi', n))}
          icon={Calendar}
        />

        {/* Status Progres */}
        <FilterDropdown
          label="STATUS PROGRES"
          items={statusOptions}
          selectedSet={multiSelect.statusProgres || new Set()}
          onToggleItem={(name) => onToggleItem('statusProgres', name)}
          onSelectAll={(names) => names.forEach(n => !multiSelect.statusProgres?.has(n) && onToggleItem('statusProgres', n))}
          onDeselectAll={() => [...(multiSelect.statusProgres || [])].forEach(n => onToggleItem('statusProgres', n))}
          icon={Activity}
        />

        {/* Klasifikasi LOP */}
        <FilterDropdown
          label="KLASIFIKASI"
          items={klasifikasiOptions}
          selectedSet={multiSelect.klasifikasiLop || new Set()}
          onToggleItem={(name) => onToggleItem('klasifikasiLop', name)}
          onSelectAll={(names) => names.forEach(n => !multiSelect.klasifikasiLop?.has(n) && onToggleItem('klasifikasiLop', n))}
          onDeselectAll={() => [...(multiSelect.klasifikasiLop || [])].forEach(n => onToggleItem('klasifikasiLop', n))}
          icon={Layers}
        />

        {/* Reset */}
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

export default QeFilterChecklist;
