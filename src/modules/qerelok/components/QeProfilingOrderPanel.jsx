import React from 'react';
import { Layers, CheckCircle2, DollarSign, TrendingUp } from 'lucide-react';

function formatRupiah(num) {
  if (!num) return 'Rp 0';
  if (num >= 1e9) return `Rp ${(num / 1e9).toFixed(2)} M`;
  if (num >= 1e6) return `Rp ${(num / 1e6).toFixed(1)} Jt`;
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export function QeProfilingOrderPanel({
  filteredRows = [],
  activeClosedOnly = false,
  activeHasRealisasi = false,
  onToggleFilter,
  onResetFilters,
}) {
  const totalLop = filteredRows.length;
  const closedCount = filteredRows.filter(r => r.isClosed).length;
  const openCount = totalLop - closedCount;
  const achClosed = totalLop > 0 ? ((closedCount / totalLop) * 100).toFixed(1) : 0;

  const totalPlan = filteredRows.reduce((sum, r) => sum + (r.nilaiPlan || 0), 0);
  const totalRealisasi = filteredRows.reduce((sum, r) => sum + (r.nilaiRealisasi || 0), 0);

  const kpis = [
    {
      label: 'Total LOP QE Relok',
      value: totalLop.toLocaleString('id-ID'),
      sub: `${closedCount} Closed · ${openCount} Open`,
      icon: Layers,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      onClick: onResetFilters,
      title: 'Klik untuk tampilkan semua (reset filter)',
      active: false,
    },
    {
      label: 'Ach Closed',
      value: `${achClosed}%`,
      sub: `${closedCount} dari ${totalLop} LOP selesai`,
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      onClick: onToggleFilter ? () => onToggleFilter('closedOnly', true) : undefined,
      title: activeClosedOnly ? 'Klik untuk lepas filter Closed' : 'Klik untuk tampilkan hanya LOP Closed',
      active: activeClosedOnly,
    },
    {
      label: 'Total Nilai Plan',
      value: formatRupiah(totalPlan),
      sub: 'Estimasi RAB / Plan',
      icon: DollarSign,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Total Nilai Realisasi',
      value: formatRupiah(totalRealisasi),
      sub: 'Realisasi Pekerjaan',
      icon: TrendingUp,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      onClick: onToggleFilter ? () => onToggleFilter('hasRealisasi', true) : undefined,
      title: activeHasRealisasi ? 'Klik untuk lepas filter Realisasi' : 'Klik untuk tampilkan hanya LOP yang sudah ada realisasi',
      active: activeHasRealisasi,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const clickable = typeof kpi.onClick === 'function';
        return (
          <div
            key={idx}
            onClick={kpi.onClick}
            title={kpi.title}
            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-all flex items-start justify-between gap-3 ${
              clickable ? 'cursor-pointer hover:shadow-md' : ''
            } ${kpi.active ? 'ring-2 ring-sky-500/70 border-sky-500/60' : ''}`}
          >
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{kpi.label}</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
                {kpi.value}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{kpi.sub}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${kpi.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
