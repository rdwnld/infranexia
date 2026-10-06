import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';

export function QeRelokDistrictMatrixPanel({ filteredRows = [], activeDistrict, activeStatus, onSelectCell }) {
  const { districts, statuses, matrix, districtTotals, statusTotals, grandTotal } = useMemo(() => {
    const distSet = new Set();
    const statSet = new Set();
    const mat = {};
    const dTot = {};
    const sTot = {};
    let total = 0;

    filteredRows.forEach(r => {
      const dist = r.district || 'UNKNOWN';
      const stat = r.statusProgres || 'UNKNOWN';
      distSet.add(dist);
      statSet.add(stat);

      if (!mat[dist]) mat[dist] = {};
      mat[dist][stat] = (mat[dist][stat] || 0) + 1;

      dTot[dist] = (dTot[dist] || 0) + 1;
      sTot[stat] = (sTot[stat] || 0) + 1;
      total++;
    });

    const districtsArr = Array.from(distSet).sort();
    const statusesArr = Array.from(statSet).sort();

    return {
      districts: districtsArr,
      statuses: statusesArr,
      matrix: mat,
      districtTotals: dTot,
      statusTotals: sTot,
      grandTotal: total,
    };
  }, [filteredRows]);

  if (grandTotal === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-base sm:text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-600 dark:text-sky-400" /> Matrix District vs Status Progres QE Relok
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Klik sel untuk memfilter data berdasarkan District dan Status
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <th className="p-3">District</th>
              {statuses.map(st => (
                <th key={st} className="p-3 text-center font-mono">{st}</th>
              ))}
              <th className="p-3 text-right font-mono">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-slate-600 dark:text-slate-300">
            {districts.map(dist => (
              <tr key={dist} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 font-sans">{dist}</td>
                {statuses.map(st => {
                  const val = matrix[dist]?.[st] || 0;
                  const isSelected = activeDistrict === dist && activeStatus === st;
                  return (
                    <td
                      key={st}
                      onClick={() => onSelectCell && onSelectCell(dist, st)}
                      className={`p-3 text-center cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-sky-500 text-white font-bold'
                          : val > 0
                          ? 'hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {val > 0 ? val : '-'}
                    </td>
                  );
                })}
                <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                  {districtTotals[dist] || 0}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 dark:bg-slate-950 font-bold text-slate-900 dark:text-slate-100 font-mono border-t border-slate-200 dark:border-slate-800">
              <td className="p-3 font-sans">Total</td>
              {statuses.map(st => (
                <td key={st} className="p-3 text-center">{statusTotals[st] || 0}</td>
              ))}
              <td className="p-3 text-right">{grandTotal}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
