import React, { useState, useMemo } from 'react';
import { Search, Table, ChevronLeft, ChevronRight } from 'lucide-react';

function formatRupiah(num) {
  if (!num) return 'Rp 0';
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export function QeDataTablePanel({ filteredRows = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const searchedRows = useMemo(() => {
    if (!searchTerm.trim()) return filteredRows;
    const term = searchTerm.toLowerCase();
    return filteredRows.filter(r =>
      r.namaLop.toLowerCase().includes(term) ||
      r.district.toLowerCase().includes(term) ||
      r.sto.toLowerCase().includes(term) ||
      r.idDigasss.toLowerCase().includes(term) ||
      r.statusProgres.toLowerCase().includes(term) ||
      r.subconTa.toLowerCase().includes(term) ||
      r.klasifikasiLop.toLowerCase().includes(term)
    );
  }, [filteredRows, searchTerm]);

  const totalPages = Math.ceil(searchedRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return searchedRows.slice(start, start + pageSize);
  }, [searchedRows, page]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Detail Data LOP QE Relok</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Menampilkan {searchedRows.length} dari {filteredRows.length} baris data
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder="Cari LOP, STO, District, Status..."
            className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-2.5">No</th>
              <th className="p-2.5">Region</th>
              <th className="p-2.5">District</th>
              <th className="p-2.5">STO</th>
              <th className="p-2.5">Nama LOP</th>
              <th className="p-2.5">ID Digasss</th>
              <th className="p-2.5">Klasifikasi</th>
              <th className="p-2.5">Status Progres</th>
              <th className="p-2.5 text-right">Nilai Plan</th>
              <th className="p-2.5 text-right">Nilai Realisasi</th>
              <th className="p-2.5">Subcon TA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-6 text-center text-slate-500">
                  Tidak ada data yang cocok dengan pencarian
                </td>
              </tr>
            ) : (
              paginatedRows.map((r, i) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-2.5 font-mono text-slate-500">{(page - 1) * pageSize + i + 1}</td>
                  <td className="p-2.5 font-semibold text-sky-600 dark:text-sky-400">{r.region}</td>
                  <td className="p-2.5 font-medium text-slate-900 dark:text-slate-100">{r.district}</td>
                  <td className="p-2.5 font-mono">{r.sto}</td>
                  <td className="p-2.5 font-medium text-slate-900 dark:text-slate-100 max-w-[280px] truncate" title={r.namaLop}>
                    {r.namaLop}
                  </td>
                  <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">{r.idDigasss}</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-300 font-semibold">
                      {r.klasifikasiLop}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      r.isClosed
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                      {r.statusProgres}
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-mono">{formatRupiah(r.nilaiPlan)}</td>
                  <td className="p-2.5 text-right font-mono">{formatRupiah(r.nilaiRealisasi)}</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-400">{r.subconTa}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs pt-2 text-slate-500 dark:text-slate-400">
          <div>
            Halaman {page} dari {totalPages} ({searchedRows.length} total baris)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 disabled:opacity-40 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono font-medium">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 disabled:opacity-40 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
