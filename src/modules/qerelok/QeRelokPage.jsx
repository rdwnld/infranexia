import React, { useEffect } from 'react';
import { useQeRelokData } from './hooks/useQeRelokData';
import { useQeRelokFilters } from './hooks/useQeRelokFilters';
import { DataRefreshBar } from '../../shared/components/DataRefreshBar';
import { QeProfilingOrderPanel } from './components/QeProfilingOrderPanel';
import { QeStatusDeploymentPanel } from './components/QeStatusDeploymentPanel';
import { QeDistrictMatrixPanel } from './components/QeDistrictMatrixPanel';
import { QeSubStatusPanel } from './components/QeSubStatusPanel';
import { QeDataTablePanel } from './components/QeDataTablePanel';
import { OpenLopMatrixPanel } from '../hem/components/OpenLopMatrixPanel';
import { LoadingState } from '../../shared/components/LoadingState';
import { ErrorState } from '../../shared/components/ErrorState';

export function QeRelokPage({ regional = 'all' }) {
  const { rows, allRows, loading, error, lastUpdated, refresh } = useQeRelokData(regional);
  const {
    state,
    filteredRows,
    toggleSingleSelect,
    toggleMultiSelectItem,
    setCellFilter,
    resetFilters,
    isFiltered,
  } = useQeRelokFilters(rows);

  useEffect(() => {
    resetFilters();
  }, [regional, resetFilters]);

  if (loading) {
    return <LoadingState message="Memuat data QE Relok..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div className="space-y-6">
      {/* Last updated + refresh manual */}
      <DataRefreshBar label="QE Relok" lastUpdated={lastUpdated} onRefresh={refresh} />

      {/* Filter Active Badge Indicator */}
      {isFiltered && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sky-600 dark:text-sky-400">Filter Aktif:</span>
            <span>
              Menampilkan <strong className="text-slate-900 dark:text-slate-100">{filteredRows.length}</strong> dari{' '}
              <strong className="text-slate-900 dark:text-slate-100">{rows.length}</strong> LOP
            </span>
          </div>
          <button
            onClick={resetFilters}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* Profiling / KPI Strip (card bisa diklik untuk filter) */}
      <QeProfilingOrderPanel
        filteredRows={filteredRows}
        activeClosedOnly={state.singleSelect.closedOnly === true}
        activeHasRealisasi={state.singleSelect.hasRealisasi === true}
        onToggleFilter={toggleSingleSelect}
        onResetFilters={resetFilters}
      />

      {/* Grid 1: Status Deployment & District Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QeStatusDeploymentPanel
          filteredRows={filteredRows}
          activeStatus={state.singleSelect.statusProgres}
          onSelectStatus={toggleSingleSelect}
        />
        <QeDistrictMatrixPanel
          filteredRows={filteredRows}
          activeDistrict={state.singleSelect.district}
          onSelectDistrict={toggleSingleSelect}
        />
      </div>

      {/* Reused Open LOP / Rekap per Region Matrix Panel */}
      <OpenLopMatrixPanel
        filteredRows={filteredRows}
        activeProgress={state.singleSelect.progressLapangan}
        activeSubStatus={state.singleSelect.subStatus}
        activeRegion={state.singleSelect.selectedRegion}
        onSelectCell={setCellFilter}
      />

      {/* Grid 2: SubStatus / Klasifikasi Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <QeSubStatusPanel
          filteredRows={filteredRows}
          activeKlasifikasi={state.singleSelect.klasifikasiLop}
          onSelectKlasifikasi={toggleSingleSelect}
        />
      </div>

      {/* Full Data Table */}
      <QeDataTablePanel filteredRows={filteredRows} />
    </div>
  );
}
