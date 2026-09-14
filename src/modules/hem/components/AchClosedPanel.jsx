import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Search } from 'lucide-react';

function buildRanking(rows, key, query, topN = 8) {
  const map = {};
  rows.forEach(r => {
    const name = r[key] || 'Tanpa Data';
    if (!map[name]) map[name] = { name, total: 0, closed: 0 };
    map[name].total++;
    if (r.isClosed) map[name].closed++;
  });

  const q = query.trim().toLowerCase();
  return Object.values(map)
    .map(item => ({
      ...item,
      ach: item.total > 0 ? Number(((item.closed / item.total) * 100).toFixed(1)) : 0,
    }))
    .filter(item => !q || item.name.toLowerCase().includes(q))
    .sort((a, b) => b.ach - a.ach || b.total - a.total)
    .slice(0, topN);
}

function AchBarChart({ title, subtitle, data, filterKey, onSelect }) {
  return (
    <div className="bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col min-w-0">
      <div className="mb-2">
        <h3 className="text-slate-800 dark:text-slate-200 font-semibold text-sm">{title}</h3>
        <p className="text-[11px] text-slate-500">{subtitle}</p>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 12, left: 8, bottom: 0 }}
            onClick={(state) => {
              const label = state?.activeLabel;
              if (label && onSelect) onSelect(filterKey, label);
            }}
          >
            <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}%`} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#94a3b8"
              fontSize={10}
              width={95}
              tickFormatter={(v) => (v.length > 13 ? `${v.slice(0, 12)}…` : v)}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--nx-tooltip-bg)', borderColor: 'var(--nx-tooltip-border)', borderRadius: '0.5rem' }}
              itemStyle={{ color: 'var(--nx-tooltip-text)' }}
              formatter={(val, _name, props) => [`${val}% (${props.payload.closed}/${props.payload.total})`, 'Ach Closed']}
            />
            <Bar dataKey="ach" radius={[0, 4, 4, 0]} className="cursor-pointer">
              {data.map(entry => (
                <Cell key={entry.name} fill={entry.ach >= 80 ? '#10b981' : entry.ach >= 50 ? '#38bdf8' : '#f59e0b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AchClosedPanel({ filteredRows = [], onSelectGroupItem }) {
  const [query, setQuery] = useState('');

  const byDistrict = useMemo(() => buildRanking(filteredRows, 'district', query), [filteredRows, query]);
  const byBatch = useMemo(() => buildRanking(filteredRows, 'batchOrder', query), [filteredRows, query]);
  const bySubkon = useMemo(() => buildRanking(filteredRows, 'subkon', query), [filteredRows, query]);

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 font-semibold text-lg">Pencapaian Ach Closed</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tiga chart terpisah per District, Batch & Subkon (klik bar untuk filter)</p>
        </div>
        <div className="relative shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama…"
            className="pl-8 pr-3 py-1.5 bg-slate-200 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/60 rounded-md text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/60 w-44"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <AchBarChart title="Per District" subtitle="Top 8 % closed per district" data={byDistrict} filterKey="district" onSelect={onSelectGroupItem} />
        <AchBarChart title="Per Batch" subtitle="Top 8 % closed per batch order" data={byBatch} filterKey="batchOrder" onSelect={onSelectGroupItem} />
        <AchBarChart title="Per Subkon" subtitle="Top 8 % closed per subkontraktor" data={bySubkon} filterKey="subkon" onSelect={onSelectGroupItem} />
      </div>
    </div>
  );
}


