import React, { useMemo } from 'react';
import { MapPin, Filter } from 'lucide-react';

export function QeDistrictMatrixPanel({ filteredRows = [], activeDistrict, onSelectDistrict }) {
  const districtStats = useMemo(() => {
    const map = {};
    filteredRows.forEach(r => {
      const dist = r.district || 'UNKNOWN';
      if (!map[dist]) {
        map[dist] = { district: dist, total: 0, closed: 0, plan: 0, real: 0 };
      }
      map[dist].total += 1;
      if (r.isClosed) map[dist].closed += 1;
      map[dist].plan += r.nilaiPlan || 0;
      map[dist].real += r.nilaiRealisasi || 0;
    });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredRows]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Distribusi per District (Cabang)</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Pencapaian dan nilai LOP per district</p>
          </div>
        </div>
        {activeDistrict && (
          <button
            onClick={() => onSelectDistrict('district', null)}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
          >
            <Filter className="w-3 h-3" /> Reset Filter ({activeDistrict})
          </button>
        )}
      </div>

      <div className="overflow-x-auto max-h-[320px] custom-scrollbar">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-2.5">District</th>
              <th className="p-2.5 text-center">Total LOP</th>
              <th className="p-2.5 text-center">Closed</th>
              <th className="p-2.5 text-center">Ach %</th>
              <th className="p-2.5 text-right">Nilai Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {districtStats.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500">Tidak ada data district</td>
              </tr>
            ) : (
              districtStats.map(item => {
                const isSelected = activeDistrict === item.district;
                const ach = item.total > 0 ? ((item.closed / item.total) * 100).toFixed(1) : 0;
                return (
                  <tr
                    key={item.district}
                    onClick={() => onSelectDistrict('district', item.district)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/10 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="p-2.5 font-medium text-slate-900 dark:text-slate-100">{item.district}</td>
                    <td className="p-2.5 text-center font-mono">{item.total}</td>
                    <td className="p-2.5 text-center font-mono text-emerald-600 dark:text-emerald-400">{item.closed}</td>
                    <td className="p-2.5 text-center font-mono">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        Number(ach) >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {ach}%
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                      Rp {(item.plan / 1e6).toFixed(1)} Jt
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
