import React, { useMemo } from 'react';
import { Layers } from 'lucide-react';

export function AgingOrderTablePanel({
  filteredRows = [],
  activeProgress = null,
  activeBatch = null,
  onSelectCell,
}) {
  const { batches, progressRows, matrixData } = useMemo(() => {
    const batchSet = new Set();
    const progSet = new Set();

    filteredRows.forEach(r => {
      if (!r) return;
      const p = r.progressLapangan || 'UNKNOWN';
      const b = r.batchOrder && r.batchOrder !== '-' ? r.batchOrder : 'Tanpa Batch';
      progSet.add(p);
      batchSet.add(b);
    });

    const cleanBatchNum = (x) => {
      const n = parseFloat(String(x).replace(/[^\d.]/g, ''));
      return isNaN(n) ? 999999 : n;
    };

    const batches = Array.from(batchSet).sort((a, b) => cleanBatchNum(a) - cleanBatchNum(b));
    const progressRows = Array.from(progSet).sort();

    const map = {};
    progressRows.forEach(p => {
      map[p] = {};
      batches.forEach(b => { map[p][b] = 0; });
      map[p].rowTotal = 0;
    });

    const colTotals = {};
    batches.forEach(b => { colTotals[b] = 0; });
    let grandTotal = 0;

    filteredRows.forEach(r => {
      const p = r.progressLapangan || 'UNKNOWN';
      const b = r.batchOrder && r.batchOrder !== '-' ? r.batchOrder : 'Tanpa Batch';
      if (map[p] && map[p][b] !== undefined) {
        map[p][b]++;
        map[p].rowTotal++;
        colTotals[b]++;
        grandTotal++;
      }
    });

    return { batches, progressRows, matrixData: { map, colTotals, grandTotal } };
  }, [filteredRows]);

  if (progressRows.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg mb-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 font-semibold text-lg uppercase tracking-wide flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Aging Order Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            BATCH ORDER / Record Count (klik angka sel untuk memfilter data)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar border border-slate-200 dark:border-slate-800 rounded-lg max-h-[420px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-200 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-300 dark:border-slate-800 text-[11px]">
              <th className="p-2.5 min-w-[160px] border-r border-slate-300 dark:border-slate-800">Progress Lap...</th>
              {batches.map(b => (
                <th key={b} className="p-2.5 text-center font-mono border-r border-slate-300 dark:border-slate-800 last:border-r-0 min-w-[50px]">
                  {b}
                </th>
              ))}
              <th className="p-2.5 text-center font-bold bg-slate-300/60 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-w-[70px]">
                Grand total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {progressRows.map((p, idx) => {
              const row = matrixData.map[p];
              const isEven = idx % 2 === 0;
              return (
                <tr key={p} className={`${isEven ? 'bg-white dark:bg-slate-900/40' : 'bg-slate-50 dark:bg-slate-800/20'} hover:bg-sky-500/10 transition-colors`}>
                  <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 truncate max-w-[180px]" title={p}>
                    {p}
                  </td>
                  {batches.map(b => {
                    const count = row[b] || 0;
                    const isActive = activeProgress === p && activeBatch === b;
                    return (
                      <td key={b} className="p-2.5 text-center font-mono border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                        {count > 0 ? (
                          <button
                            onClick={() => onSelectCell && onSelectCell(p, b)}
                            className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-sky-600 text-white font-bold ring-2 ring-sky-300'
                                : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/30'
                            }`}
                            title={`Progress: ${p}, Batch: ${b} (${count} order)`}
                          >
                            {count}
                          </button>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-2.5 text-center font-mono font-bold bg-slate-100 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100">
                    {row.rowTotal}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-200 dark:bg-slate-950 font-bold text-slate-900 dark:text-slate-100 border-t-2 border-slate-300 dark:border-slate-700">
              <td className="p-2.5 border-r border-slate-300 dark:border-slate-800">Grand total</td>
              {batches.map(b => (
                <td key={b} className="p-2.5 text-center font-mono border-r border-slate-300 dark:border-slate-800 last:border-r-0">
                  {matrixData.colTotals[b] || 0}
                </td>
              ))}
              <td className="p-2.5 text-center font-mono text-sky-600 dark:text-sky-400 bg-slate-300/80 dark:bg-slate-900">
                {matrixData.grandTotal}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default AgingOrderTablePanel;
