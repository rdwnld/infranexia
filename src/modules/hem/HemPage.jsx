import React, { useEffect, useMemo } from 'react';
import { useHemData } from './hooks/useHemData';
import { useHemFilters } from './hooks/useHemFilters';
import { DataRefreshBar } from '../../shared/components/DataRefreshBar';
import { ProfilingOrderPanel } from './components/ProfilingOrderPanel';
import { DistrictMatrixPanel } from './components/DistrictMatrixPanel';
import { AgingParetoPanel } from './components/AgingParetoPanel';
import { AchClosedPanel } from './components/AchClosedPanel';
import { FocusListPanel } from './components/FocusListPanel';
import { OrderMapPanel } from './components/OrderMapPanel';
import { SubStatusPanel } from './components/SubStatusPanel';
import { FilterChecklist } from '../../shared/components/FilterChecklist';
import { LoadingState } from '../../shared/components/LoadingState';
import { ErrorState } from '../../shared/components/ErrorState';
import { BaselineStrip } from './components/BaselineStrip';
import { DonutChartPanel } from '../../shared/components/DonutChartPanel';
import { InsightPanel } from './components/InsightPanel';
import { DataTablePanel } from './components/DataTablePanel';
import { OpenLopMatrixPanel } from './components/OpenLopMatrixPanel';
import { SCurveChartPanel } from './components/SCurveChartPanel';
import { useDailyBaseline } from './hooks/useDailyBaseline';
import { STAGES } from './hem.stageRules';

export function HemPage({ regional = 'ALL', isOlo = false }) {
  const moduleTitle = isOlo ? 'OLO' : 'HEM';
  const { rows, loading, error, lastUpdated, refresh } = useHemData(regional, isOlo);
  const {
    state,
    filteredRows,
    cardFilteredRows,
    toggleSingleSelect,
    toggleMultiSelectItem,
    setCellFilter,
    resetFilters,
    isFiltered,
  } = useHemFilters(rows);

  // Reset filter setiap pindah regional agar tidak terbawa antar wilayah
  useEffect(() => {
    resetFilters();
  }, [regional, resetFilters]);

  // Baseline harian "data bergerak" (Fase 4) — dari rows regional, tanpa filter halaman
  const { previous, delta, current } = useDailyBaseline(isOlo ? 'olo' : 'hem', regional, rows);

  const statusOptions = useMemo(() => {
    const counts = {};
    rows.forEach(r => {
      if (r.progressLapangan && r.progressLapangan !== 'UNKNOWN') {
        counts[r.progressLapangan] = (counts[r.progressLapangan] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [rows]);

  // tglOrder sudah dinormalisasi ke ISO YYYY-MM-DD di hem.parser.js
  const formatDateForInput = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
    return '';
  };

  const activePeriodFormatted = formatDateForInput(state.singleSelect.commitmentPeriod);

  if (loading) {
    return <LoadingState message={`Memuat data modul ${moduleTitle}...`} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  const handleMatrixCellClick = (districtName, stageName) => {
    toggleSingleSelect('district', districtName);
    toggleSingleSelect('stage', stageName);
  };

  return (
    <div className="space-y-6">
      {/* Last updated + refresh manual (FR-4) */}
      <DataRefreshBar label={moduleTitle} lastUpdated={lastUpdated} onRefresh={refresh} />

      {/* Donut Chart Persentase Status (dihitung dari data asli, FR-XX) */}
      <DonutChartPanel
        rows={rows}
        title={`Persentase Status Deployment ${moduleTitle}`}
        groupByKey="stage"
        activeCategory={state.singleSelect.stage}
        onSelectCategory={toggleSingleSelect}
      />

      {/* Baseline harian vs kemarin (Fase 4) */}
      <BaselineStrip
        delta={delta}
        previousDate={previous?.date}
        current={current}
        previousStats={previous?.stats}
      />

      {/* Top Profiling KPI Cards */}
      <ProfilingOrderPanel
        filteredRows={cardFilteredRows}
        activeCard={state.singleSelect.profilingCard}
        onSelectCard={(cardKey) => toggleSingleSelect('profilingCard', cardKey === 'ALL' ? null : cardKey)}
      />

       {/* Filter Bar */}
      <FilterChecklist
        allRows={rows}
        multiSelect={state.multiSelect}
        singleSelect={state.singleSelect}
        onToggleItem={toggleMultiSelectItem}
        onResetFilters={resetFilters}
        isFiltered={isFiltered}
        statusOptions={statusOptions}
      />

      {/* OPEN LOP & DETAIL STATUS OPEN LOP Matrix */}
      <OpenLopMatrixPanel
        filteredRows={filteredRows}
        activeProgress={state.singleSelect.progressLapangan}
        activeSubStatus={state.singleSelect.subStatus}
        activeRegion={state.singleSelect.selectedRegion}
        onSelectCell={setCellFilter}
      />

      {/* Tabel Data Detail LOP */}
      <DataTablePanel filteredRows={filteredRows} moduleTitle={moduleTitle} />

      {/* Matrix District x Stage */}
      <DistrictMatrixPanel
        filteredRows={filteredRows}
        onSelectMatrixCell={handleMatrixCellClick}
      />

      {/* Grid 1: Aging Pareto */}
      <div className="grid grid-cols-1 gap-6">
        <AgingParetoPanel
          filteredRows={filteredRows}
          activeBucket={state.singleSelect.agingBucket}
          onSelectBucket={toggleSingleSelect}
        />
      </div>

      {/* Kurva S (Komitmen vs Realisasi Golive) */}
      <SCurveChartPanel filteredRows={filteredRows} moduleTitle={moduleTitle} />

      {/* Ach Closed — tiga bar chart terpisah (FR-18) */}
      <AchClosedPanel
        filteredRows={filteredRows}
        onSelectGroupItem={toggleSingleSelect}
      />

      {/* Insight otomatis (Fase 4) */}
      <InsightPanel filteredRows={filteredRows} />

      {/* Grid 2: Sub Status Ranking & Focus List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubStatusPanel filteredRows={filteredRows} />
        <FocusListPanel filteredRows={filteredRows} />
      </div>

      {/* Order Map (full width) */}
      {/* <OrderMapPanel filteredRows={filteredRows} moduleTitle={moduleTitle} /> */}
    </div>
  );
}
