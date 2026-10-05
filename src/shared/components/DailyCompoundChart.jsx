import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';

export function DailyCompoundChart({ 
  rows = [], 
  title = "Compound Harian — Realisasi vs Target/Rencana", 
  subtitle = "Perbandingan harian berdasarkan Tanggal Komitmen Golive (Target/Rencana) vs Tanggal Golive Real (Realisasi)" 
}) {
  const chartData = useMemo(() => {
    if (!rows || rows.length === 0) return [];

    const dateMap = {};

    rows.forEach(r => {
      if (r.targetGolive) {
        const d = r.targetGolive; // YYYY-MM-DD
        if (!dateMap[d]) dateMap[d] = { date: d, Target: 0, Realisasi: 0 };
        dateMap[d].Target++;
      }
      if (r.realisasiGolive) {
        const d = r.realisasiGolive; // YYYY-MM-DD
        if (!dateMap[d]) dateMap[d] = { date: d, Target: 0, Realisasi: 0 };
        dateMap[d].Realisasi++;
      }
    });

    const sortedDates = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

    return sortedDates.map(item => {
      let displayDate = item.date;
      try {
        const parts = item.date.split('-');
        if (parts.length === 3) {
          const monthNum = parseInt(parts[1], 10);
          const day = parseInt(parts[2], 10);
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          displayDate = `${day} ${months[monthNum - 1] || parts[1]}`;
        }
      } catch {
        // fallback
      }
      return {
        ...item,
        displayDate,
      };
    });
  }, [rows]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="mb-4">
          <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-500" />
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="h-64 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
          Tidak ada data tanggal target/realisasi yang tersedia untuk cakupan ini.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-500" />
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
            <XAxis
              dataKey="displayDate"
              stroke="#64748b"
              fontSize={10}
              angle={-35}
              textAnchor="end"
              interval={Math.max(0, Math.floor(chartData.length / 15))}
            />
            <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--nx-tooltip-bg, #0f172a)',
                borderColor: 'var(--nx-tooltip-border, #334155)',
                borderRadius: '0.5rem',
                color: 'var(--nx-tooltip-text, #f8fafc)',
              }}
              formatter={(value, name) => [value, name === 'Realisasi' ? 'Realisasi' : 'Target/Rencana']}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Bar dataKey="Realisasi" name="Realisasi" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Target" name="Target/Rencana" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
