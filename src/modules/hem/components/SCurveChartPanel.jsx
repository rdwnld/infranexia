import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

// Helper to get ISO week string like "2026-01-W1" from YYYY-MM-DD
function getWeekKey(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const weekOfMonth = Math.ceil(d.getDate() / 7);
  return `${year}-${month}-W${weekOfMonth}`;
}

export function SCurveChartPanel({ filteredRows = [], moduleTitle = 'HEM' }) {
  const chartData = useMemo(() => {
    if (!filteredRows || filteredRows.length === 0) return [];

    const weekMap = {};

    filteredRows.forEach(r => {
      if (r.targetGolive) {
        const wk = getWeekKey(r.targetGolive);
        if (wk) {
          if (!weekMap[wk]) weekMap[wk] = { week: wk, rencana: 0, realisasi: 0 };
          weekMap[wk].rencana++;
        }
      }
      if (r.realisasiGolive) {
        const wk = getWeekKey(r.realisasiGolive);
        if (wk) {
          if (!weekMap[wk]) weekMap[wk] = { week: wk, rencana: 0, realisasi: 0 };
          weekMap[wk].realisasi++;
        }
      }
    });

    const sortedWeeks = Object.values(weekMap).sort((a, b) => a.week.localeCompare(b.week));

    let cumRencana = 0;
    let cumRealisasi = 0;

    return sortedWeeks.map(item => {
      cumRencana += item.rencana;
      cumRealisasi += item.realisasi;
      return {
        week: item.week,
        Rencana: cumRencana,
        Realisasi: cumRealisasi,
      };
    });
  }, [filteredRows]);

  const todayStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  if (chartData.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-lg flex items-center gap-2">
            Kurva S — Komitmen vs Realisasi Golive ({moduleTitle})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Kumulatif per minggu (Rencana Komitmen vs Realisasi Tanggal Golive Real)</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
            <XAxis
              dataKey="week"
              stroke="#64748b"
              fontSize={10}
              angle={-35}
              textAnchor="end"
              interval={Math.max(0, Math.floor(chartData.length / 15))}
            />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--nx-tooltip-bg, #0f172a)', borderColor: 'var(--nx-tooltip-border, #334155)', borderRadius: '0.5rem', color: '#fff' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Line
              type="monotone"
              dataKey="Rencana"
              name="Rencana (Komitmen Golive)"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Realisasi"
              name="Realisasi (Tanggal Golive Real)"
              stroke="#14b8a6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-[11px] text-slate-400 dark:text-slate-500 text-right mt-2 font-mono">
        Posisi hari ini: {todayStr}
      </div>
    </div>
  );
}

export default SCurveChartPanel;