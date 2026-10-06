import React, { useState } from 'react';
import { Table, Search, Download } from 'lucide-react';

export function QeRelokTablePanel({ filteredRows = [], searchTerm = '', onSearchChange }) {
  const [limit, setLimit] = useState(25);

  const displayedRows = filteredRows.slice(0, limit);

  const exportCsv = () => {
    if (!filteredRows || filteredRows.length === 0) return;
    const headers = ['No', 'Region', 'District', 'STO', 'Nama LOP', 'Batch', 'ID Digasss', 'Nilai Plan', 'Nilai Realisasi', 'Status Progres', 'Detail Status', 'Tim Waspang', 'Tim UT', 'Subcon TA', 'Klasifikasi LOP', 'Durasi QE', 'Due Date'];
    const csvRows = [headers.join(',')];

    filteredRows.forEach(r => {
      const rowData = [
        r.no,
        r.region,
        `"${r.district}"`,
        r.sto,
        `"${r.namaLop.replace(/"/g, '""')}"`,
        `"${r.batch}"`,
        r.idDigasss,
        r.nilaiPlan,
        r.nilaiRealisasi,
        `"${r.statusProgres}"`,
        `"${r.detailStatus.replace(/"/g, '""')}"`,
        `"${r.timWaspang}"`,
        `"${r.timUt}"`,
        `"${r.subconTa}"`,
        `"${r.klasifikasiLop}"`,
        r.durasiQe,
        r.dueDate,
      ];
      csvRows.push(rowData.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `qerelok_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-base sm:text-lg flex items-center gap-2">
            <Table className="w-5 h-5 text-sky-600 dark:text-sky-400" /> Data Detail LOP QE Relok
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-300">{displayedRows.length}</span> dari <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredRows.length}</span> baris data
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari LOP, STO, District, Subcon..."
              className="pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 w-56 sm:w-64"
            />
          </div>

          <button
            onClick={exportCsv}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
              <th className="p-3">No</th>
              <th className="p-3">Region</th>
              <th className="p-3">District</th>
              <th className="p-3">STO</th>
              <th className="p-3">Nama LOP</th>
              <th className="p-3">Batch</th>
              <th className="p-3">ID Digasss</th>
              <th className="p-3 text-right">Plan</th>
              <th className="p-3 text-right">Realisasi</th>
              <th className="p-3">Status Progres</th>
              <th className="p-3">Detail Status</th>
              <th className="p-3">Subcon TA</th>
              <th className="p-3">Klasifikasi</th>
              <th className="p-3 text-right">Durasi (Hari)</th>
              <th className="p-3">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-slate-600 dark:text-slate-300">
            {displayedRows.length === 0 ? (
              <tr>
                <td colSpan={15} className="p-6 text-center text-slate-400 font-sans">
                  Tidak ada data yang cocok dengan filter atau pencarian.
                </td>
              </tr>
            ) : (
              displayedRows.map((r, idx) => (
                <tr key={r.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                  <td className="p-3">{r.no}</td>
                  <td className="p-3 font-bold text-sky-600 dark:text-sky-400">{r.region}</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 font-sans">{r.district}</td>
                  <td className="p-3">{r.sto}</td>
                  <td className="p-3 font-sans font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate" title={r.namaLop}>{r.namaLop}</td>
                  <td className="p-3">{r.batch}</td>
                  <td className="p-3">{r.idDigasss}</td>
                  <td className="p-3 text-right font-bold">{r.nilaiPlan ? r.nilaiPlan.toLocaleString('id-ID') : '-'}</td>
                  <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{r.nilaiRealisasi ? r.nilaiRealisasi.toLocaleString('id-ID') : '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.isClosed || r.statusProgres.includes('CLOSED')
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : r.statusProgres.includes('DROP') || r.statusProgres.includes('HOLD')
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                    }`}>
                      {r.statusProgres}
                    </span>
                  </td>
                  <td className="p-3 font-sans max-w-xs truncate" title={r.detailStatus}>{r.detailStatus || '-'}</td>
                  <td className="p-3 font-sans">{r.subconTa}</td>
                  <td className="p-3">{r.klasifikasiLop}</td>
                  <td className="p-3 text-right">{r.durasiQe}</td>
                  <td className="p-3">{r.dueDate || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredRows.length > limit && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setLimit(prev => prev + 25)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Muat Lebih Banyak ({filteredRows.length - limit} tersisa)
          </button>
        </div>
      )}
    </div>
  );
}
