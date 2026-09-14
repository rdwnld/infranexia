import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LayoutDashboard } from 'lucide-react';
import { useHemData } from '../modules/hem/hooks/useHemData';
import { useNodeBData } from '../modules/nodeb/hooks/useNodeBData';
import { REGION_BADGES } from '../regions/regionConfig';
import { STAGES } from '../modules/hem/hem.stageRules';
import { LoadingState } from '../shared/components/LoadingState';
import { ErrorState } from '../shared/components/ErrorState';
import { DataRefreshBar } from '../shared/components/DataRefreshBar';
import { SummaryTelegramPanel } from './SummaryTelegramPanel';

function classifyHemOlo(r) {
  if (r.stage === STAGES.GOLIVE_UT) return 'golive';
  if (r.stage === STAGES.APPROVED_DROP || r.stage === STAGES.PROPOSED_DROP) return 'drop';
  return 'open';
}

function classifyNodeB(r) {
  if (r.statusLapangan === 'CLOSED') return 'golive';
  if (r.statusLapangan === 'DROP') return 'drop';
  return 'open';
}

function aggregateByRegion(rows, classify) {
  const result = {};
  REGION_BADGES.forEach(badge => {
    result[badge] = { region: badge, total: 0, golive: 0, open: 0, drop: 0 };
  });

  rows.forEach(r => {
    const bucket = result[r.region];
    if (!bucket) return;
    bucket.total++;
    bucket[classify(r)]++;
  });

  return REGION_BADGES.map(badge => {
    const b = result[badge];
    return {
      ...b,
      ach: b.total > 0 ? Number(((b.golive / b.total) * 100).toFixed(1)) : 0,
    };
  });
}

function ModuleSummarySection({ title, badge, rows, accent, classify, closedLabel = 'Golive', unitLabel = 'order' }) {
  const data = useMemo(() => aggregateByRegion(rows, classify), [rows, classify]);
  const totalAll = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`font-semibold text-lg ${accent}`}>{title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Perbandingan antar sub-regional (total {totalAll} {unitLabel})</p>
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">{badge}</span>
      </div>

      {/* Region KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {data.map(d => (
          <div key={d.region} className="bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <div className="text-xs font-bold text-sky-600 dark:text-sky-300 mb-2">Regional {d.region}</div>
            <div className="flex items-end justify-between mb-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{d.total}</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">{d.ach}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, d.ach)}%` }} />
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-emerald-600 dark:text-emerald-400">{closedLabel} {d.golive}</span>
              <span className="text-blue-600 dark:text-blue-400">Open {d.open}</span>
              <span className="text-rose-600 dark:text-rose-400">Drop {d.drop}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison bar chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <XAxis dataKey="region" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--nx-tooltip-bg)', borderColor: 'var(--nx-tooltip-border)', borderRadius: '0.5rem' }}
              itemStyle={{ color: 'var(--nx-tooltip-text)' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="golive" name={closedLabel} stackId="a" fill="#10b981" />
            <Bar dataKey="open" name="Open" stackId="a" fill="#3b82f6" />
            <Bar dataKey="drop" name="Drop" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SummaryPage() {
  const hem = useHemData('ALL', false);
  const olo = useHemData('ALL', true);
  const nodeb = useNodeBData('ALL');

  const loading = hem.loading || olo.loading || nodeb.loading;
  const error = hem.error || olo.error || nodeb.error;

  if (loading) {
    return <LoadingState message="Memuat ringkasan lintas-regional..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          hem.refresh();
          olo.refresh();
          nodeb.refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 font-semibold text-lg">Ringkasan Lintas-Regional</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Perbandingan cepat SBU vs SBT vs SBS (FR-3)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DataRefreshBar label="NODE B" lastUpdated={nodeb.lastUpdated} onRefresh={nodeb.refresh} />
        <DataRefreshBar label="HEM" lastUpdated={hem.lastUpdated} onRefresh={hem.refresh} />
        <DataRefreshBar label="OLO" lastUpdated={olo.lastUpdated} onRefresh={olo.refresh} />
      </div>

      <SummaryTelegramPanel nodebRows={nodeb.allRows} hemRows={hem.allRows} oloRows={olo.allRows} />

      <ModuleSummarySection title="Modul NODE B" badge="NODE B" rows={nodeb.allRows} accent="text-sky-600 dark:text-sky-300" classify={classifyNodeB} closedLabel="Closed" unitLabel="site" />
      <ModuleSummarySection title="Modul HEM" badge="HEM" rows={hem.allRows} accent="text-emerald-600 dark:text-emerald-300" classify={classifyHemOlo} />
      <ModuleSummarySection title="Modul OLO" badge="OLO" rows={olo.allRows} accent="text-purple-600 dark:text-purple-300" classify={classifyHemOlo} />
    </div>
  );
}


