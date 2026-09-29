import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const STAGE_COLORS = {
  'Golive / UT': '#10b981',       // Emerald-500
  'Bisa PT1': '#14b8a6',         // Teal-500
  'Finish Instal': '#0284c7',    // Sky-600
  'Instalasi': '#3b82f6',        // Blue-500
  'Persiapan': '#f59e0b',        // Amber-500
  'Proposed Drop': '#f97316',    // Orange-500
  'Approved Drop': '#f43f5e',    // Rose-500
  'Lainnya': '#64748b',          // Slate-500
};

const DEFAULT_COLORS = [
  '#10b981', '#14b8a6', '#0284c7', '#3b82f6',
  '#f59e0b', '#f97316', '#f43f5e', '#8b5cf6',
];

export function DonutChartPanel({
  rows = [],
  title = 'Distribusi Status Deployment',
  groupByKey = 'stage',
  onSelectCategory,
  activeCategory = null,
}) {
  const [hiddenKeys, setHiddenKeys] = useState(new Set());

  // Aggregate raw rows by groupByKey (default: 'stage')
  const { chartData, totalRows, categoryTotals } = useMemo(() => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return { chartData: [], totalRows: 0, categoryTotals: {} };
    }

    const counts = {};
    let total = 0;

    rows.forEach((r) => {
      if (!r) return;
      const key = r[groupByKey] || 'Lainnya';
      counts[key] = (counts[key] || 0) + 1;
      total += 1;
    });

    const data = Object.entries(counts).map(([name, value], idx) => {
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
      const color = STAGE_COLORS[name] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
      return {
        name,
        value,
        percentage: Number(percentage),
        color,
      };
    });

    // Sort by count descending
    data.sort((a, b) => b.value - a.value);

    return { chartData: data, totalRows: total, categoryTotals: counts };
  }, [rows, groupByKey]);

  const toggleHideKey = (name) => {
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const visibleData = useMemo(() => {
    return chartData.filter((item) => !hiddenKeys.has(item.name));
  }, [chartData, hiddenKeys]);

  const visibleTotal = useMemo(() => {
    return visibleData.reduce((sum, item) => sum + item.value, 0);
  }, [visibleData]);

  if (chartData.length === 0 || totalRows === 0) {
    return null;
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs">
          <p className="font-bold text-sm mb-1" style={{ color: data.color }}>
            {data.name}
          </p>
          <p>
            Jumlah Order: <span className="font-semibold">{data.value.toLocaleString('id-ID')}</span>
          </p>
          <p>
            Persentase Total: <span className="font-semibold">{data.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-base sm:text-lg">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Persentase dihitung dari total data asli (<span className="font-semibold text-slate-700 dark:text-slate-300">{totalRows.toLocaleString('id-ID')}</span> order)
          </p>
        </div>
        {hiddenKeys.size > 0 && (
          <button
            onClick={() => setHiddenKeys(new Set())}
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline self-start sm:self-auto"
          >
            Tampilkan Semua ({hiddenKeys.size} tersembunyi)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Donut Chart with Center Summary */}
        <div className="lg:col-span-5 relative h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={visibleData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                onClick={(entry) => {
                  if (onSelectCategory) {
                    onSelectCategory(groupByKey, entry.name);
                  }
                }}
                className="cursor-pointer"
              >
                {visibleData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    stroke={activeCategory === entry.name ? '#000' : 'none'}
                    strokeWidth={activeCategory === entry.name ? 2 : 0}
                    opacity={activeCategory && activeCategory !== entry.name ? 0.4 : 1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {visibleTotal.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Order
            </span>
          </div>
        </div>

        {/* Legend / Breakdown List */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
          {chartData.map((item) => {
            const isHidden = hiddenKeys.has(item.name);
            const isActive = activeCategory === item.name;

            return (
              <div
                key={item.name}
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory(groupByKey, item.name);
                  }
                }}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isHidden
                    ? 'opacity-40 bg-slate-100 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800'
                    : isActive
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-500'
                    : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-right">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                    {item.value.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DonutChartPanel;