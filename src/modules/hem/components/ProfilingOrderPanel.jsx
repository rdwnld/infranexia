import React, { useMemo } from 'react';
import { Layers, CheckCircle2, Clock, AlertTriangle, XCircle, DollarSign } from 'lucide-react';
import { STAGES } from '../hem.stageRules';

export function ProfilingOrderPanel({ filteredRows = [], moduleTitle = 'HEM' }) {
  const stats = useMemo(() => {
    let total = filteredRows.length;
    let goliveCount = 0;
    let openCount = 0;
    let dropCount = 0;
    let totalBoq = 0;

    filteredRows.forEach(r => {
      if (r.stage === STAGES.GOLIVE_UT) goliveCount++;
      else if (r.stage === STAGES.APPROVED_DROP || r.stage === STAGES.PROPOSED_DROP) dropCount++;
      else openCount++;

      totalBoq += r.boq || 0;
    });

    const achPct = total > 0 ? ((goliveCount / total) * 100).toFixed(1) : '0.0';

    return { total, goliveCount, openCount, dropCount, totalBoq, achPct };
  }, [filteredRows]);

  const formatRupiah = (val) => {
    if (val >= 1e9) return `Rp ${(val / 1e9).toFixed(1)} M`;
    if (val >= 1e6) return `Rp ${(val / 1e6).toFixed(0)} Jt`;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      {/* Total Order */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Total Order {moduleTitle}</div>
          <div className="text-2xl font-bold text-slate-100">{stats.total}</div>
        </div>
      </div>

      {/* Ach Closed / Golive */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Golive / UT</div>
          <div className="text-2xl font-bold text-emerald-400">
            {stats.goliveCount} <span className="text-xs font-normal text-slate-400">({stats.achPct}%)</span>
          </div>
        </div>
      </div>

      {/* Open Orders */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Order In Progres</div>
          <div className="text-2xl font-bold text-amber-400">{stats.openCount}</div>
        </div>
      </div>

      {/* Drop Orders */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
          <XCircle className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Approved / Propose Drop</div>
          <div className="text-2xl font-bold text-rose-400">{stats.dropCount}</div>
        </div>
      </div>

      {/* Nilai BOQ */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-md col-span-2 lg:col-span-1">
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Total Nilai BOQ</div>
          <div className="text-lg font-bold text-purple-300">{formatRupiah(stats.totalBoq)}</div>
        </div>
      </div>
    </div>
  );
}
