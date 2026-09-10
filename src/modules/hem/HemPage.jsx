import React, { useEffect, useMemo } from 'react';
import { useHemData } from './hooks/useHemData';
import { useHemFilters } from './hooks/useHemFilters';
import { DataRefreshBar } from '../../shared/components/DataRefreshBar';
import { ProfilingOrderPanel } from './components/ProfilingOrderPanel';
import { StatusDeploymentPanel } from './components/StatusDeploymentPanel';
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
import { InsightPanel } from './components/InsightPanel';
import { useDailyBaseline } from './hooks/useDailyBaseline';
import { STAGES } from './hem.stageRules';

export function HemPage({ regional = 'ALL', isOlo = false }) {
  const moduleTitle = isOlo ? 'OLO' : 'HEM';
  const { rows, loading, error, lastUpdated, refresh } = useHemData(regional, isOlo);
  const {
    state,
    filteredRows,
    toggleSingleSelect,
    toggleMultiSelectItem,
    resetFilters,
    isFiltered,
  } = useHemFilters(rows);

  // Reset filter setiap pindah regional agar tidak terbawa antar wilayah
  useEffect(() => {
    resetFilters();
  }, [regional, resetFilters]);

  // Baseline harian "data bergerak" (Fase 4) — dari rows regional, tanpa filter halaman
  const { previous, delta } = useDailyBaseline(isOlo ? 'olo' : 'hem', regional, rows);

  const statusOptions = useMemo(() => [
    { name: STAGES.GOLIVE_UT, color: 'emerald' },
    { name: STAGES.INSTALASI, color: 'blue' },
    { name: STAGES.FINISH_INSTALASI, color: 'sky' },
    { name: STAGES.BISA_PT1, color: 'teal' },
    { name: STAGES.PERSIAPAN, color: 'amber' },
    { name: STAGES.PROPOSED_DROP, color: 'orange' },
    { name: STAGES.APPROVED_DROP, color: 'rose' },
  ], []);

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

      {/* Baseline harian vs kemarin (Fase 4) */}
      <BaselineStrip delta={delta} previousDate={previous?.date} />

      {/* Top Profiling KPI Cards */}
      <ProfilingOrderPanel filteredRows={filteredRows} moduleTitle={moduleTitle} />

      {/* Filter Bar with Calendar Date Picker for Commitment Period */}
      <FilterChecklist
        allRows={rows}
        multiSelect={state.multiSelect}
        singleSelect={state.singleSelect}
        onToggleItem={toggleMultiSelectItem}
        onResetFilters={resetFilters}
        isFiltered={isFiltered}
        statusOptions={statusOptions}
        showCommitmentPeriod={true}
        activeCommitmentPeriod={activePeriodFormatted}
        onSelectCommitmentPeriod={(val) => toggleSingleSelect('commitmentPeriod', val)}
      />

      {/* Status Deployment Flowchart */}
      <StatusDeploymentPanel
        filteredRows={filteredRows}
        activeStage={state.singleSelect.stage}
        onSelectStage={toggleSingleSelect}
      />

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
      <OrderMapPanel filteredRows={filteredRows} moduleTitle={moduleTitle} />
    </div>
  );
}
