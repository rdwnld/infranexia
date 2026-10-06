import React, { useMemo } from 'react';
import { Layers, ListFilter } from 'lucide-react';
import { REGION_BADGES } from '../../../regions/regionConfig';

export function OpenLopMatrixPanel({
  filteredRows = [],
  activeProgress = null,
  activeSubStatus = null,
  activeRegion = null,
  onSelectCell = () => {},
}) {
  // Hanya ambil order yang open (termasuk Rekon, kecuali Closed/Golive, Drop, Hold, dan Bisa PT1)
  const openRows = useMemo(() => {
    return filteredRows.filter(r => {
      if (!r) return false;
      const stage = (r.stage || '').toLowerCase();
      const prog = (r.progressLapangan || '').toUpperCase();
      const sub = (r.subStatus || '').toUpperCase();
      const isDrop = stage.includes('drop');
      const isGolive = r.isClosed;
      const isHold = prog.includes('HOLD') || sub.includes('HOLD');
      const isBisaPt1 = prog.includes('BISA PT1') || sub.includes('BISA PT1');

      return !isGolive && !isDrop && !isHold && !isBisaPt1;
    });
  }, [filteredRows]);

  // Tabel 1: Progress Lapangan x Region (Termasuk Rekon, kecuali BISA PT1 & HOLD)
  const progressMatrix = useMemo(() => {
    const map = {};
    const regions = REGION_BADGES;

    openRows.forEach(r => {
      const prog = r.progressLapangan || 'UNKNOWN';
      if (!map[prog]) {
        map[prog] = { name: prog, SBU: 0, SBT: 0, SBS: 0, total: 0 };
      }
      const reg = r.region;
      if (regions.includes(reg)) {
        map[prog][reg]++;
      }
      map[prog].total++;
    });

    return Object.values(map)
      .filter(row => {
        const n = row.name.toUpperCase();
        return !n.includes('BISA PT1') && !n.includes('HOLD');
      })
      .sort((a, b) => b.total - a.total);
  }, [openRows]);

  // Tabel 2: Sub Status x Region (Termasuk Rekon, kecuali BISA PT1 & HOLD)
  const subStatusMatrix = useMemo(() => {
    const map = {};
    const regions = REGION_BADGES;

    openRows.forEach(r => {
      const sub = r.subStatus || '-';
      if (!map[sub]) {
        map[sub] = { name: sub, SBU: 0, SBT: 0, SBS: 0, total: 0 };
      }
      const reg = r.region;
      if (regions.includes(reg)) {
        map[sub][reg]++;
      }
      map[sub].total++;
    });

    return Object.values(map)
      .filter(row => {
        const n = row.name.toUpperCase();
        return !n.includes('BISA PT1') && !n.includes('HOLD');
      })
      .sort((a, b) => b.total - a.total);
  }, [openRows]);

  const totalProgress = useMemo(() => {
    const totals = { SBU: 0, SBT: 0, SBS: 0, total: 0 };
    progressMatrix.forEach(row => {
      totals.SBU += row.SBU;
      totals.SBT += row.SBT;
      totals.SBS += row.SBS;
      totals.total += row.total;
    });
    return totals;
  }, [progressMatrix]);

  const totalSubStatus = useMemo(() => {
    const totals = { SBU: 0, SBT: 0, SBS: 0, total: 0 };
    subStatusMatrix.forEach(row => {
      totals.SBU += row.SBU;
      totals.SBT += row.SBT;
      totals.SBS += row.SBS;
      totals.total += row.total;
    });
    return totals;
  }, [subStatusMatrix]);

  if (openRows.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Tabel 1: OPEN LOP (Progress Lapangan x Region) */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            OPEN LOP
          </h3>
          <span className="text-[11px] font-mono bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">
            REGION / JLH LOP
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
          Klik pada angka (SBU, SBT, SBS, Total) di tabel untuk memfilter data sesuai region & progress
        </p>

        <div className="overflow-x-auto custom-scrollbar border border-slate-200 dark:border-slate-800 rounded-lg max-h-[380px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-sky-600 text-white font-semibold border-b border-sky-700 uppercase text-[11px]">
                <th className="p-2.5">Progress Lapangan</th>
                <th className="p-2.5 text-center">SBU</th>
                <th className="p-2.5 text-center">SBT</th>
                <th className="p-2.5 text-center">SBS</th>
                <th className="p-2.5 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {progressMatrix.map((row) => {
                const isProgActive = activeProgress === row.name;
                return (
                  <tr key={row.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200 transition-colors">
                    <td className="p-2.5 font-medium truncate max-w-[160px]" title={row.name}>{row.name}</td>
                    <td className="p-2.5 text-center font-mono">
                      {row.SBU > 0 ? (
                        <button
                          onClick={() => onSelectCell('progress', row.name, 'SBU')}
                          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                            isProgActive && activeRegion === 'SBU'
                              ? 'bg-sky-600 text-white font-bold ring-2 ring-sky-300'
                              : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/30'
                          }`}
                          title="Klik untuk filter progress ini di region SBU"
                        >
                          {row.SBU}
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-mono">
                      {row.SBT > 0 ? (
                        <button
                          onClick={() => onSelectCell('progress', row.name, 'SBT')}
                          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                            isProgActive && activeRegion === 'SBT'
                              ? 'bg-sky-600 text-white font-bold ring-2 ring-sky-300'
                              : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/30'
                          }`}
                          title="Klik untuk filter progress ini di region SBT"
                        >
                          {row.SBT}
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-mono">
                      {row.SBS > 0 ? (
                        <button
                          onClick={() => onSelectCell('progress', row.name, 'SBS')}
                          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                            isProgActive && activeRegion === 'SBS'
                              ? 'bg-sky-600 text-white font-bold ring-2 ring-sky-300'
                              : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/30'
                          }`}
                          title="Klik untuk filter progress ini di region SBS"
                        >
                          {row.SBS}
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold">
                      <button
                        onClick={() => onSelectCell('progress', row.name, null)}
                        className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                          isProgActive && activeRegion === null
                            ? 'bg-sky-600 text-white ring-2 ring-sky-300'
                            : 'text-sky-600 dark:text-sky-400 hover:bg-sky-500/20'
                        }`}
                        title="Klik untuk filter progress ini di semua region"
                      >
                        {row.total}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-950/80 font-bold text-slate-900 dark:text-slate-100 border-t border-slate-300 dark:border-slate-700">
                <td className="p-2.5">TOTAL</td>
                <td className="p-2.5 text-center font-mono">{totalProgress.SBU}</td>
                <td className="p-2.5 text-center font-mono">{totalProgress.SBT}</td>
                <td className="p-2.5 text-center font-mono">{totalProgress.SBS}</td>
                <td className="p-2.5 text-center font-mono text-sky-600 dark:text-sky-400">{totalProgress.total}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Tabel 2: DETAIL STATUS OPEN LOP (Sub Status x Region) */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-base flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            DETAIL STATUS OPEN LOP
          </h3>
          <span className="text-[11px] font-mono bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">
            REGION / JLH LOP
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
          Klik pada angka (SBU, SBT, SBS, Total) di tabel untuk memfilter data sesuai region & sub status
        </p>

        <div className="overflow-x-auto custom-scrollbar border border-slate-200 dark:border-slate-800 rounded-lg max-h-[380px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-sky-600 text-white font-semibold border-b border-sky-700 uppercase text-[11px]">
                <th className="p-2.5">Sub Status</th>
                <th className="p-2.5 text-center">SBU</th>
                <th className="p-2.5 text-center">SBT</th>
                <th className="p-2.5 text-center">SBS</th>
                <th className="p-2.5 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {subStatusMatrix.map((row) => {
                const isSubActive = activeSubStatus === row.name;
                return (
                  <tr key={row.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200 transition-colors">
                    <td className="p-2.5 font-medium truncate max-w-[160px]" title={row.name}>{row.name}</td>
                    <td className="p-2.5 text-center font-mono">
                      {row.SBU > 0 ? (
                        <button
                          onClick={() => onSelectCell('subStatus', row.name, 'SBU')}
                          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                            isSubActive && activeRegion === 'SBU'
                              ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-300'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30'
                          }`}
                          title="Klik untuk filter sub status ini di region SBU"
                        >
                          {row.SBU}
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-mono">
                      {row.SBT > 0 ? (
                        <button
                          onClick={() => onSelectCell('subStatus', row.name, 'SBT')}
                          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                            isSubActive && activeRegion === 'SBT'
                              ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-300'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30'
                          }`}
                          title="Klik untuk filter sub status ini di region SBT"
                        >
                          {row.SBT}
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-mono">
                      {row.SBS > 0 ? (
                        <button
                          onClick={() => onSelectCell('subStatus', row.name, 'SBS')}
                          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                            isSubActive && activeRegion === 'SBS'
                              ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-300'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30'
                          }`}
                          title="Klik untuk filter sub status ini di region SBS"
                        >
                          {row.SBS}
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold">
                      <button
                        onClick={() => onSelectCell('subStatus', row.name, null)}
                        className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                          isSubActive && activeRegion === null
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                            : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                        title="Klik untuk filter sub status ini di semua region"
                      >
                        {row.total}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-950/80 font-bold text-slate-900 dark:text-slate-100 border-t border-slate-300 dark:border-slate-700">
                <td className="p-2.5">TOTAL</td>
                <td className="p-2.5 text-center font-mono">{totalSubStatus.SBU}</td>
                <td className="p-2.5 text-center font-mono">{totalSubStatus.SBT}</td>
                <td className="p-2.5 text-center font-mono">{totalSubStatus.SBS}</td>
                <td className="p-2.5 text-center font-mono text-emerald-600 dark:text-emerald-400">{totalSubStatus.total}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OpenLopMatrixPanel;