import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const BUCKET_COLORS = {
  '1.<7HR': '#10b981',    // emerald
  '2.8-14HR': '#84cc16',  // lime
  '3.15-21HR': '#eab308', // yellow
  '4.22-30HR': '#f97316', // orange
  '5.>1BLN': '#ef4444',   // red
  '6.>2BLN': '#b91c1c',   // dark red
};

const BUCKET_LABELS = {
  '1.<7HR': '< 7 Hari',
  '2.8-14HR': '8–14 Hari',
  '3.15-21HR': '15–21 Hari',
  '4.22-30HR': '22–30 Hari',
  '5.>1BLN': '> 1 Bulan',
  '6.>2BLN': '> 2 Bulan',
};

export function AgingParetoPanel({ filteredRows = [], activeBucket = null, onSelectBucket }) {
  const chartData = useMemo(() => {
    const counts = {
      '1.<7HR': 0,
      '2.8-14HR': 0,
      '3.15-21HR': 0,
      '4.22-30HR': 0,
      '5.>1BLN': 0,
      '6.>2BLN': 0,
    };

    // Count open orders only
    filteredRows.forEach(r => {
      if (!r.isClosed && r.agingBucket) {
        counts[r.agingBucket] = (counts[r.agingBucket] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([key, value]) => ({
      key,
      name: BUCKET_LABELS[key] || key,
      count: value,
      color: BUCKET_COLORS[key] || '#64748b',
    }));
  }, [filteredRows]);

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 font-semibold text-lg">Analisis Durasi Order (Aging)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pengelompokan order open berdasarkan umur (klik bar untuk filter)</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            onClick={(state) => {
              if (state && state.activePayload) {
                const item = state.activePayload[0].payload;
                onSelectBucket && onSelectBucket('agingBucket', item.key);
              }
            }}
          >
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-15} textAnchor="end" />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--nx-tooltip-bg)', borderColor: 'var(--nx-tooltip-border)', borderRadius: '0.5rem' }}
              itemStyle={{ color: 'var(--nx-tooltip-text)' }}
              formatter={(val) => [`${val} Order Open`, 'Jumlah']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} className="cursor-pointer">
              {chartData.map(entry => (
                <Cell
                  key={entry.key}
                  fill={entry.color}
                  stroke={activeBucket === entry.key ? '#ffffff' : 'none'}
                  strokeWidth={2}
                  opacity={activeBucket && activeBucket !== entry.key ? 0.4 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


