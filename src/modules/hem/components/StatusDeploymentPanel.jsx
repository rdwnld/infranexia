import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { STAGES, STAGE_SEQUENCE, SUB_STAGES_PERSIAPAN } from '../hem.stageRules';

const STAGE_COLORS = {
  [STAGES.APPROVED_DROP]: { border: 'border-rose-500/50', bg: 'bg-rose-100 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400' },
  [STAGES.PROPOSED_DROP]: { border: 'border-orange-500/50', bg: 'bg-orange-100 dark:bg-orange-950/40', text: 'text-orange-600 dark:text-orange-400' },
  [STAGES.PERSIAPAN]: { border: 'border-amber-500/50', bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400' },
  [STAGES.INSTALASI]: { border: 'border-blue-500/50', bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400' },
  [STAGES.FINISH_INSTALASI]: { border: 'border-sky-500/50', bg: 'bg-sky-100 dark:bg-sky-950/40', text: 'text-sky-600 dark:text-sky-300' },
  [STAGES.BISA_PT1]: { border: 'border-teal-500/50', bg: 'bg-teal-100 dark:bg-teal-950/40', text: 'text-teal-600 dark:text-teal-300' },
  [STAGES.GOLIVE_UT]: { border: 'border-emerald-500/50', bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400' },
};

export function StatusDeploymentPanel({ filteredRows = [], activeStage = null, onSelectStage }) {
  const stageCounts = useMemo(() => {
    const counts = {};
    const subCounts = {};
    STAGE_SEQUENCE.forEach(s => (counts[s] = 0));
    Object.values(SUB_STAGES_PERSIAPAN).forEach(sub => (subCounts[sub] = 0));

    filteredRows.forEach(r => {
      if (counts[r.stage] !== undefined) {
        counts[r.stage]++;
      }
      if (r.stage === STAGES.PERSIAPAN && r.subStagePersiapan) {
        subCounts[r.subStagePersiapan] = (subCounts[r.subStagePersiapan] || 0) + 1;
      }
    });

    return { counts, subCounts };
  }, [filteredRows]);

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 font-semibold text-lg">Status Deployment (Flow View)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Alur progres order dari persiapan ke golive (klik node untuk filter)</p>
        </div>
      </div>

      {/* Main Pipeline Flow — 7 Clean Nodes */}
      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="flex items-center gap-2 min-w-[700px]">
          {STAGE_SEQUENCE.map((stageName, idx) => {
            const count = stageCounts.counts[stageName] || 0;
            const style = STAGE_COLORS[stageName] || STAGE_COLORS[STAGES.APPROVED_DROP];
            const isSelected = activeStage === stageName;

            return (
              <React.Fragment key={stageName}>
                <button
                  onClick={() => onSelectStage && onSelectStage('stage', stageName)}
                  className={`w-32 flex-shrink-0 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? `${style.bg} ${style.border} border-2`
                      : `bg-slate-200 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800/80`
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                    Tahap {idx + 1}
                  </span>
                  <div className={`text-xs font-bold mb-1 truncate ${style.text}`}>{stageName}</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{count}</div>
                </button>

                {idx < STAGE_SEQUENCE.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-slate-600 shrink-0 flex items-center justify-center" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Sub-Tahap Persiapan — Compact Pill Row */}
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sub-Tahap Persiapan</span>
          <span className="text-[10px] text-slate-500">(5 tahap detail)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SUB_STAGES_PERSIAPAN).map(([key, subLabel]) => {
            const count = stageCounts.subCounts[subLabel] || 0;
            return (
              <button
                key={key}
                className="px-3 py-1.5 rounded-full text-xs font-medium border bg-slate-200 dark:bg-slate-800/40 border-amber-500/30 text-amber-600 dark:text-amber-300 hover:bg-amber-500/10 transition-all flex items-center gap-1.5"
                onClick={() => onSelectStage && onSelectStage('subStagePersiapan', subLabel)}
              >
                {subLabel}
                <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900/60 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}