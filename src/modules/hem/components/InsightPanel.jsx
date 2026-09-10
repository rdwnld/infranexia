import React, { useMemo } from 'react';
import { Lightbulb, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { STAGES } from '../hem.stageRules';

/**
 * Insight otomatis rule-based dari data terfilter (Fase 4).
 * Bukan prediksi — ringkasan naratif deterministik.
 */
export function InsightPanel({ filteredRows = [] }) {
  const insights = useMemo(() => {
    if (!filteredRows || filteredRows.length === 0) return [];
    const out = [];
    const total = filteredRows.length;

    // 1. Bottleneck district (ach terendah, min 5 order)
    const byDistrict = {};
    filteredRows.forEach(r => {
      const d = r.district || 'UNKNOWN';
      if (!byDistrict[d]) byDistrict[d] = { total: 0, closed: 0, open: 0 };
      byDistrict[d].total++;
      if (r.isClosed) byDistrict[d].closed++;
      else byDistrict[d].open++;
    });
    const candidates = Object.entries(byDistrict)
      .filter(([, v]) => v.total >= 5)
      .map(([name, v]) => ({ name, ...v, ach: (v.closed / v.total) * 100 }))
      .sort((a, b) => a.ach - b.ach);
    if (candidates.length > 0) {
      const worst = candidates[0];
      out.push({
        type: worst.ach < 50 ? 'warn' : 'info',
        text: `Bottleneck: ${worst.name} pencapaian terendah ${worst.ach.toFixed(1)}% (${worst.open} order masih open dari ${worst.total}).`,
      });
      const best = candidates[candidates.length - 1];
      if (best.name !== worst.name) {
        out.push({
          type: 'good',
          text: `${best.name} memimpin dengan ${best.ach.toFixed(1)}% closed (${best.closed}/${best.total}).`,
        });
      }
    }

    // 2. Penumpukan aging
    const agingCounts = {};
    filteredRows.forEach(r => {
      if (!r.isClosed && r.agingBucket) {
        agingCounts[r.agingBucket] = (agingCounts[r.agingBucket] || 0) + 1;
      }
    });
    const agingEntries = Object.entries(agingCounts).sort((a, b) => b[0].localeCompare(a[0]));
    const oldest = agingEntries.find(([, c]) => c > 0);
    const openTotal = Object.values(agingCounts).reduce((s, c) => s + c, 0);
    if (oldest && openTotal > 0) {
      const pct = ((oldest[1] / total) * 100).toFixed(1);
      out.push({
        type: 'warn',
        text: `${oldest[1]} order (${pct}% dari tampilan) menumpuk di bucket tertua ${oldest[0].replace(/^[0-9]\./, '')} — prioritas follow-up.`,
      });
    }

    // 3. Rasio drop
    const dropCount = filteredRows.filter(r =>
      r.stage === STAGES.APPROVED_DROP || r.stage === STAGES.PROPOSED_DROP
    ).length;
    const dropPct = (dropCount / total) * 100;
    if (dropPct >= 10) {
      out.push({
        type: 'warn',
        text: `Rasio drop tinggi: ${dropPct.toFixed(1)}% (${dropCount}/${total} order) berstatus drop — cek kelayakan pipeline.`,
      });
    } else if (dropCount > 0) {
      out.push({
        type: 'info',
        text: `${dropCount} order (${dropPct.toFixed(1)}%) berstatus drop — dalam batas wajar.`,
      });
    }

    // 4. Sub-tahap persiapan dominan
    const subCounts = {};
    filteredRows.forEach(r => {
      if (r.stage === STAGES.PERSIAPAN && r.subStagePersiapan) {
        subCounts[r.subStagePersiapan] = (subCounts[r.subStagePersiapan] || 0) + 1;
      }
    });
    const topSub = Object.entries(subCounts).sort((a, b) => b[1] - a[1])[0];
    if (topSub) {
      out.push({
        type: 'info',
        text: `Hambatan persiapan terbesar: ${topSub[0]} (${topSub[1]} order).`,
      });
    }

    return out.slice(0, 5);
  }, [filteredRows]);

  if (insights.length === 0) return null;

  const iconFor = (type) => {
    if (type === 'warn') return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
    if (type === 'good') return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    return <Info className="w-4 h-4 text-sky-400 shrink-0" />;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Insight Otomatis</h2>
          <p className="text-xs text-slate-400">Ringkasan naratif dari data yang sedang tampil</p>
        </div>
      </div>
      <ul className="space-y-2">
        {insights.map((ins, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/50 border border-slate-800/70 text-xs text-slate-300 leading-relaxed"
          >
            <span className="mt-0.5">{iconFor(ins.type)}</span>
            <span>{ins.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
