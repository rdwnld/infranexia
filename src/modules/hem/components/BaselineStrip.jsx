import React from 'react';
import { TrendingUp, TrendingDown, Minus, History } from 'lucide-react';
import { formatBaselineDate } from '../../../shared/utils/snapshot';

function DeltaBadge({ value, suffix = '', invert = false }) {
  const num = Number(value) || 0;
  const isZero = num === 0;
  const isUp = num > 0;
  // Untuk open/drop, naik = buruk → warna dibalik
  const good = isZero ? null : (invert ? !isUp : isUp);
  const Icon = isZero ? Minus : isUp ? TrendingUp : TrendingDown;
  const color = isZero
    ? 'text-slate-400 bg-slate-800/60 border-slate-700/60'
    : good
      ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
      : 'text-rose-300 bg-rose-500/10 border-rose-500/30';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold font-mono border ${color}`}>
      <Icon className="w-3 h-3" />
      {isUp && !isZero ? '+' : ''}{num}{suffix}
    </span>
  );
}

export function BaselineStrip({ delta, previousDate }) {
  if (!delta) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/40 border border-dashed border-slate-800 rounded-lg px-4 py-2.5">
        <History className="w-3.5 h-3.5" />
        <span>Baseline harian: kunjungi halaman ini lagi besok untuk melihat pergerakan data vs hari ini.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2.5">
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <History className="w-3.5 h-3.5 text-amber-400" />
        vs {formatBaselineDate(previousDate)}:
      </span>
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        Total <DeltaBadge value={delta.total} />
      </span>
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        Golive <DeltaBadge value={delta.golive} />
      </span>
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        Open <DeltaBadge value={delta.open} invert />
      </span>
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        Drop <DeltaBadge value={delta.drop} invert />
      </span>
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        Ach <DeltaBadge value={delta.ach} suffix="%" />
      </span>
    </div>
  );
}
