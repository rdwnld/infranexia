import React, { useMemo } from 'react';
import { Layers, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export function QeRelokKpiPanel({ filteredRows = [], activeCard, onSelectCard }) {
  const stats = useMemo(() => {
    let total = filteredRows.length;
    let closed = 0;
    let open = 0;
    let drop = 0;

    filteredRows.forEach(r => {
      const isClosed = r.isClosed || r.statusProgres.includes('CLOSED');
      const isDrop = r.statusProgres.includes('DROP') || r.statusProgres.includes('HOLD');
      if (isClosed) closed++;
      else if (isDrop) drop++;
      else open++;
    });

    const ach = total > 0 ? Number(((closed / total) * 100).toFixed(1)) : 0;

    return { total, closed, open, drop, ach };
  }, [filteredRows]);

  const cards = [
    {
      key: 'ALL',
      label: 'Total LOP',
      value: stats.total,
      sub: `Ach Closed: ${stats.ach}%`,
      icon: Layers,
      color: 'border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400',
    },
    {
      key: 'CLOSED',
      label: 'Closed / Selesai',
      value: stats.closed,
      sub: `${stats.ach}% dari total`,
      icon: CheckCircle2,
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'OPEN',
      label: 'Open / Proses',
      value: stats.open,
      sub: 'Dalam pengerjaan',
      icon: Clock,
      color: 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      key: 'DROP',
      label: 'Drop / Hold Issue',
      value: stats.drop,
      sub: 'Kendala / Dibatalkan',
      icon: AlertTriangle,
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => {
        const Icon = c.icon;
        const isActive = activeCard === c.key || (!activeCard && c.key === 'ALL');
        return (
          <div
            key={c.key}
            onClick={() => onSelectCard(c.key)}
            className={`p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-slate-900/80 shadow-md hover:shadow-lg ${
              isActive
                ? 'border-sky-500 ring-2 ring-sky-500/20 dark:border-sky-400'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {c.label}
              </span>
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {c.value.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-mono">
                {c.sub}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
