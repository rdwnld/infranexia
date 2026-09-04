import React from 'react';
import { useNodeBData } from './hooks/useNodeBData';
import { useNodeBFilters } from './hooks/useNodeBFilters';
import { SiteOverviewPanel } from './components/SiteOverviewPanel';
import { StatusByBranchPanel } from './components/StatusByBranchPanel';
import { SubStatusPanel } from './components/SubStatusPanel';
import { BatchOrderPanel } from './components/BatchOrderPanel';
import { SiteMapPanel } from './components/SiteMapPanel';
import { FilterChecklist } from '../../shared/components/FilterChecklist';
import { LoadingState } from '../../shared/components/LoadingState';
import { ErrorState } from '../../shared/components/ErrorState';

export function NodeBPage({ regional = 'ALL' }) {
  const { rows, allRows, loading, error, refresh } = useNodeBData(regional);
  const {
    state,
    filteredRows,
    toggleSingleSelect,
    toggleMultiSelectItem,
    resetFilters,
    isFiltered,
  } = useNodeBFilters(rows);

  if (loading) {
    return <LoadingState message="Memuat data NODE B..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <FilterChecklist
        allRows={rows}
        multiSelect={state.multiSelect}
        singleSelect={state.singleSelect}
        onToggleItem={toggleMultiSelectItem}
        onResetFilters={resetFilters}
        isFiltered={isFiltered}
      />

      {/* Filter Active Badge Indicator */}
      {isFiltered && (
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
          <span className="font-semibold text-sky-400">Filter Aktif:</span>
          <span>
            Menampilkan <strong className="text-slate-100">{filteredRows.length}</strong> dari{' '}
            <strong className="text-slate-100">{rows.length}</strong> site
          </span>
        </div>
      )}

      {/* Grid 1: Overview & Status Branch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SiteOverviewPanel
          filteredRows={filteredRows}
          activeStatus={state.singleSelect.statusLapangan}
          onSelectStatus={toggleSingleSelect}
        />
        <StatusByBranchPanel
          filteredRows={filteredRows}
          activeDistrict={state.singleSelect.district}
          onSelectDistrict={toggleSingleSelect}
        />
      </div>

      {/* Grid 2: SubStatus Ranking & Batch Order */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubStatusPanel
          filteredRows={filteredRows}
          activeProgres={state.singleSelect.progresLapangan}
          onSelectProgres={toggleSingleSelect}
        />
        <BatchOrderPanel
          filteredRows={filteredRows}
          activeBatch={state.singleSelect.batchOrder}
          onSelectBatch={toggleSingleSelect}
        />
      </div>

      {/* Map Panel */}
      <SiteMapPanel
        filteredRows={filteredRows}
      />
    </div>
  );
}
