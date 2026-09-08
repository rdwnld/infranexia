import React, { useMemo } from 'react';
import { useHemData } from './hooks/useHemData';
import { useHemFilters } from './hooks/useHemFilters';
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
import { STAGES } from './hem.stageRules';

export function HemPage({ regional = 'ALL', isOlo = false }) {
  const moduleTitle = isOlo ? 'OLO' : 'HEM';
  const { rows, loading, error, refresh } = useHemData(regional, isOlo);
  const {
    state,
    filteredRows,
    toggleSingleSelect,
    toggleMultiSelectItem,
    setLocalToggle,
    resetFilters,
    isFiltered,
  } = useHemFilters(rows);

  const statusOptions = useMemo(() => [
    { name: STAGES.GOLIVE_UT, color: 'emerald' },
    { name: STAGES.INSTALASI, color: 'blue' },
    { name: STAGES.FINISH_INSTALASI, color: 'sky' },
    { name: STAGES.BISA_PT1, color: 'teal' },
    { name: STAGES.PERSIAPAN, color: 'amber' },
    { name: STAGES.PROPOSED_DROP, color: 'orange' },
    { name: STAGES.APPROVED_DROP, color: 'rose' },
  ], []);

  const commitmentPeriodOptions = useMemo(() => {
    const periods = new Set();
    rows.forEach(r => {
      if (r.tglOrder && typeof r.tglOrder === 'string') {
        periods.add(r.tglOrder);
      }
    });
    return Array.from(periods).sort();
  }, [rows]);

  // Format YYYY-MM-DD date string for native <input type="date">
  const formatDateForInput = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    // Sheet might send "Date(2026,0,15)" or "15/Jan/2026" — fall back to raw string
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

      {/* Grid 1: Aging Pareto & Ach Closed Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgingParetoPanel
          filteredRows={filteredRows}
          activeBucket={state.singleSelect.agingBucket}
          onSelectBucket={toggleSingleSelect}
        />
        <AchClosedPanel
          filteredRows={filteredRows}
          groupBy={state.localToggles.achGroupBy}
          onChangeGroupBy={(val) => setLocalToggle('achGroupBy', val)}
          onSelectGroupItem={toggleSingleSelect}
        />
      </div>

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
