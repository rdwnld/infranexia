import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function StatusByBranchPanel({ filteredRows = [], activeDistrict = null, onSelectDistrict }) {
  const chartData = useMemo(() => {
    const map = {};
    filteredRows.forEach(r => {
      const dist = r.district || 'UNKNOWN';
      if (!map[dist]) {
        map[dist] = { district: dist, CLOSED: 0, OPEN: 0, KENDALA: 0, DROP: 0, total: 0 };
      }
      const st = r.statusLapangan;
      if (map[dist][st] !== undefined) {
        map[dist][st]++;
      }
      map[dist].total++;
    });

    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 12); // Top 12 districts
  }, [filteredRows]);

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 font-semibold text-lg">Status by Branch / District</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Breakdown status site per wilayah (klik bar untuk filter)</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
            onClick={(state) => {
              if (state && state.activeLabel) {
                onSelectDistrict && onSelectDistrict('district', state.activeLabel);
              }
            }}
          >
            <XAxis type="number" stroke="#64748b" fontSize={11} />
            <YAxis
              type="category"
              dataKey="district"
              stroke="#94a3b8"
              fontSize={11}
              width={110}
              tickFormatter={(v) => v.length > 15 ? `${v.slice(0, 13)}...` : v}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--nx-tooltip-bg)', borderColor: 'var(--nx-tooltip-border)', borderRadius: '0.5rem' }}
              itemStyle={{ color: 'var(--nx-tooltip-text)' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="CLOSED" stackId="a" fill="#10b981" className="cursor-pointer" />
            <Bar dataKey="OPEN" stackId="a" fill="#3b82f6" className="cursor-pointer" />
            <Bar dataKey="KENDALA" stackId="a" fill="#f59e0b" className="cursor-pointer" />
            <Bar dataKey="DROP" stackId="a" fill="#ef4444" className="cursor-pointer" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


