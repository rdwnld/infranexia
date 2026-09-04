import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';

const STATUS_COLORS = {
  CLOSED: '#10b981', // green-500
  OPEN: '#3b82f6',   // blue-500
  KENDALA: '#f59e0b',// amber-500
  DROP: '#ef4444',   // red-500
  UNKNOWN: '#64748b' // slate-500
};

export function SiteOverviewPanel({ filteredRows = [], activeStatus = null, onSelectStatus }) {
  const stats = useMemo(() => {
    const counts = { CLOSED: 0, OPEN: 0, KENDALA: 0, DROP: 0, UNKNOWN: 0 };
    filteredRows.forEach(r => {
      const key = counts[r.statusLapangan] !== undefined ? r.statusLapangan : 'UNKNOWN';
      counts[key]++;
    });

    const total = filteredRows.length;
    const closedPct = total > 0 ? ((counts.CLOSED / total) * 100).toFixed(1) : '0.0';

    const chartData = [
      { name: 'CLOSED', value: counts.CLOSED, color: STATUS_COLORS.CLOSED },
      { name: 'OPEN', value: counts.OPEN, color: STATUS_COLORS.OPEN },
      { name: 'KENDALA', value: counts.KENDALA, color: STATUS_COLORS.KENDALA },
      { name: 'DROP', value: counts.DROP, color: STATUS_COLORS.DROP },
    ].filter(d => d.value > 0);

    return { counts, total, closedPct, chartData };
  }, [filteredRows]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Site Overview</h2>
          <p className="text-xs text-slate-400">Proporsi status site Node B (klik slice/card untuk filter)</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-emerald-400">{stats.closedPct}%</span>
          <p className="text-xs text-slate-400">Ach Closed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Chart */}
        <div className="h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                onClick={(entry) => onSelectStatus && onSelectStatus('statusLapangan', entry.name)}
                className="cursor-pointer"
              >
                {stats.chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    stroke={activeStatus === entry.name ? '#ffffff' : 'none'}
                    strokeWidth={2}
                    opacity={activeStatus && activeStatus !== entry.name ? 0.4 : 1}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#f8fafc' }}
                formatter={(val, name) => [`${val} Site (${((val / (stats.total || 1)) * 100).toFixed(1)}%)`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-100">{stats.total}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total Site</span>
          </div>
        </div>

        {/* Legend KPI Cards */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelectStatus && onSelectStatus('statusLapangan', 'CLOSED')}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeStatus === 'CLOSED'
                ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> CLOSED
            </div>
            <div className="text-xl font-bold text-slate-100">{stats.counts.CLOSED}</div>
          </button>

          <button
            onClick={() => onSelectStatus && onSelectStatus('statusLapangan', 'OPEN')}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeStatus === 'OPEN'
                ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-blue-400 mb-1 font-medium">
              <Clock className="w-3.5 h-3.5" /> OPEN
            </div>
            <div className="text-xl font-bold text-slate-100">{stats.counts.OPEN}</div>
          </button>

          <button
            onClick={() => onSelectStatus && onSelectStatus('statusLapangan', 'KENDALA')}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeStatus === 'KENDALA'
                ? 'bg-amber-950/60 border-amber-500 ring-1 ring-amber-500'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> KENDALA
            </div>
            <div className="text-xl font-bold text-slate-100">{stats.counts.KENDALA}</div>
          </button>

          <button
            onClick={() => onSelectStatus && onSelectStatus('statusLapangan', 'DROP')}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeStatus === 'DROP'
                ? 'bg-rose-950/60 border-rose-500 ring-1 ring-rose-500'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-rose-500/50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-1 font-medium">
              <XCircle className="w-3.5 h-3.5" /> DROP
            </div>
            <div className="text-xl font-bold text-slate-100">{stats.counts.DROP}</div>
          </button>
        </div>
      </div>
    </div>
  );
}
