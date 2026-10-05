import React, { useMemo } from 'react';
import { Layers, CheckCircle2, Clock, XCircle, AlertTriangle, Zap } from 'lucide-react';
import { STAGES, SUB_STAGES_PERSIAPAN } from '../hem.stageRules';

export function ProfilingOrderPanel({ filteredRows = [], activeCard = null, onSelectCard }) {
  const stats = useMemo(() => {
    let allLop = filteredRows.length;
    let golive = 0;
    let bisaPt1 = 0;
    let ogp = 0;
    let drop = 0;
    let hold = 0;

    filteredRows.forEach((r) => {
      if (!r) return;
      if (r.subStagePersiapan === SUB_STAGES_PERSIAPAN.HOLD || (r.progressLapangan && r.progressLapangan.toUpperCase().includes('HOLD'))) {
        hold++;
      } else if (r.stage === STAGES.APPROVED_DROP || r.stage === STAGES.PROPOSED_DROP) {
        drop++;
      } else if (r.stage === STAGES.GOLIVE_UT) {
        golive++;
      } else if (r.stage === STAGES.BISA_PT1) {
        bisaPt1++;
      } else {
        ogp++;
      }
    });

    return { allLop, golive, bisaPt1, ogp, drop, hold };
  }, [filteredRows]);

  const cards = [
    {
      key: 'ALL',
      label: 'ALL LOP',
      value: stats.allLop,
      icon: Layers,
      color: 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400',
      valueColor: 'text-slate-900 dark:text-slate-100',
    },
    {
      key: 'GOLIVE',
      label: 'GOLIVE',
      value: stats.golive,
      icon: CheckCircle2,
      color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'BISA_PT1',
      label: 'BISA PT1',
      value: stats.bisaPt1,
      icon: Zap,
      color: 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400',
      valueColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      key: 'OGP',
      label: 'OGP',
      value: stats.ogp,
      icon: Clock,
      color: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      key: 'DROP',
      label: 'DROP',
      value: stats.drop,
      icon: XCircle,
      color: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
      valueColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      key: 'HOLD',
      label: 'HOLD',
      value: stats.hold,
      icon: AlertTriangle,
      color: 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400',
      valueColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = (activeCard === card.key) || (!activeCard && card.key === 'ALL');
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelectCard(card.key)}
            className={`bg-white dark:bg-slate-900/80 border rounded-xl p-4 flex items-center gap-3 shadow-md text-left transition-all cursor-pointer ${
              isActive
                ? 'ring-2 ring-sky-500 border-sky-500 bg-sky-500/10 dark:bg-sky-500/15 shadow-sky-500/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
            title={`Klik untuk memfilter status ${card.label}`}
          >
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${card.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1">
                {card.label}
                {isActive && card.key !== 'ALL' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                )}
              </div>
              <div className={`text-xl sm:text-2xl font-bold font-mono ${card.valueColor}`}>
                {card.value.toLocaleString('id-ID')}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ProfilingOrderPanel;