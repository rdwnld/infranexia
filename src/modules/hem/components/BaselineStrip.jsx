import React from 'react';
import { TrendingUp, TrendingDown, Minus, History, Activity } from 'lucide-react';
import { formatBaselineDate } from '../../../shared/utils/snapshot';

function DeltaBadge({ value, suffix = '', invert = false }) {
  const num = Number(value) || 0;
  const isZero = num === 0;
  const isUp = num > 0;
  // Untuk open/drop, naik = buruk → warna dibalik
  const good = isZero ? null : (invert ? !isUp : isUp);
  const Icon = isZero ? Minus : isUp ? TrendingUp : TrendingDown;
  const color = isZero
    ? 'text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/60'
    : good
      ? 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
      : 'text-rose-600 dark:text-rose-300 bg-rose-500/10 border-rose-500/30';

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold font-mono border ${color}`}>
      <Icon className="w-3 h-3" />
      {isUp && !isZero ? '+' : ''}{num}{suffix}
    </span>
  );
}

export function BaselineStrip({ delta, previousDate, current, previousStats }) {
  if (!delta || !previousStats || !current) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5">
        <History className="w-3.5 h-3.5 text-amber-500" />
        <span>Baseline harian: kunjungi halaman ini lagi besok untuk melihat perbandingan pergerakan data hari ini vs kemarin.</span>
      </div>
    );
  }

  const prevDateFormatted = formatBaselineDate(previousDate);
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const fmt = (n) => Number(n || 0).toLocaleString('id-ID');

  // Penjelasan naratif pergerakan data kemarin vs hari ini
  const explanations = [];
  if (delta.golive !== 0) {
    const dir = delta.golive > 0 ? 'bertambah' : 'berkurang';
    explanations.push(`Golive ${dir} ${delta.golive > 0 ? '+' : ''}${delta.golive} order (dari ${fmt(previousStats.golive)} menjadi ${fmt(current.golive)})`);
  }
  if (delta.open !== 0) {
    const dir = delta.open > 0 ? 'bertambah' : 'berkurang';
    explanations.push(`Order Open ${dir} ${delta.open > 0 ? '+' : ''}${delta.open} (dari ${fmt(previousStats.open)} menjadi ${fmt(current.open)})`);
  }
  if (delta.drop !== 0) {
    const dir = delta.drop > 0 ? 'bertambah' : 'berkurang';
    explanations.push(`Drop ${dir} ${delta.drop > 0 ? '+' : ''}${delta.drop} (dari ${fmt(previousStats.drop)} menjadi ${fmt(current.drop)})`);
  }

  const narrativeText = explanations.length > 0
    ? explanations.join('; ') + '.'
    : 'Data hari ini stabil dibandingkan tanggal sebelumnya.';

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-2.5">
      {/* Header & Metric Comparison Chips */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
          <History className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Perbandingan Hari Ini ({todayFormatted}) vs Kemarin ({prevDateFormatted}):</span>
        </span>

        {/* Total */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <span className="font-medium text-slate-500 dark:text-slate-400">Total:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{fmt(current.total)}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">(Kmrn: {fmt(previousStats.total)})</span>
          <DeltaBadge value={delta.total} />
        </div>

        {/* Golive */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <span className="font-medium text-slate-500 dark:text-slate-400">Golive:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmt(current.golive)}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">(Kmrn: {fmt(previousStats.golive)})</span>
          <DeltaBadge value={delta.golive} />
        </div>

        {/* Open */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <span className="font-medium text-slate-500 dark:text-slate-400">Open:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{fmt(current.open)}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">(Kmrn: {fmt(previousStats.open)})</span>
          <DeltaBadge value={delta.open} invert />
        </div>

        {/* Drop */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <span className="font-medium text-slate-500 dark:text-slate-400">Drop:</span>
          <span className="font-bold text-rose-600 dark:text-rose-400">{fmt(current.drop)}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">(Kmrn: {fmt(previousStats.drop)})</span>
          <DeltaBadge value={delta.drop} invert />
        </div>

        {/* Ach */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <span className="font-medium text-slate-500 dark:text-slate-400">Ach:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{current.ach}%</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">(Kmrn: {previousStats.ach}%)</span>
          <DeltaBadge value={delta.ach} suffix="%" />
        </div>
      </div>

      {/* Narrative Progress Explanation */}
      <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-lg px-3 py-2">
        <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-amber-700 dark:text-amber-300 font-semibold mr-1">Penjelasan Progres:</strong>
          {narrativeText}
        </p>
      </div>
    </div>
  );
}

export default BaselineStrip;