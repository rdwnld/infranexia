import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';

export function DailyCompoundChart({ 
  rows = [], 
  title = "Compound Harian — Realisasi vs Target/Rencana", 
  subtitle = "Perbandingan harian (7 hari kalender terakhir hingga hari ini) berdasarkan Tanggal Target/Rencana vs Tanggal Realisasi",
  getTargetDate = r => r.targetGolive || r.tglOrder,
  getRealDate = r => r.realisasiGolive || r.tglOrder
}) {
  const chartData = useMemo(() => {
    // 1. Tentukan hari ini (endDate) berdasarkan system date / current date
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // 2. Buat array persis 7 hari kalender (hari ini - 6 hari s.d. hari ini)
    const calendarDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD

      let displayDate = dateStr;
      try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const monthNum = parseInt(parts[1], 10);
          const day = parseInt(parts[2], 10);
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          displayDate = `${day} ${months[monthNum - 1] || parts[1]}`;
        }
      } catch {
        // fallback
      }

      calendarDays.push({
        date: dateStr,
        displayDate,
        Target: 0,
        Realisasi: 0,
      });
    }

    const dateMap = {};
    calendarDays.forEach(item => {
      dateMap[item.date] = item;
    });

    // 3. Masukkan data aktual ke dalam 7 hari kalender tersebut
    if (rows && rows.length > 0) {
      rows.forEach(r => {
        const tDate = getTargetDate(r);
        const rDate = getRealDate(r);

        if (tDate) {
          const dStr = String(tDate).slice(0, 10);
          if (dateMap[dStr]) {
            dateMap[dStr].Target++;
          }
        }
        if (rDate) {
          const dStr = String(rDate).slice(0, 10);
          if (dateMap[dStr]) {
            dateMap[dStr].Realisasi++;
          }
        }
      });
    }

    // calendarDays sudah terurut kronologis dari yang paling lama ke hari ini
    return calendarDays;
  }, [rows, getTargetDate, getRealDate]);

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
              interval={0}
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
            <Bar dataKey="Realisasi" name="Realisasi" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Target" name="Target/Rencana" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
