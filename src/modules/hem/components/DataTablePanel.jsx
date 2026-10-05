import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Table, Search, ChevronLeft, ChevronRight, FileText, ChevronDown, Check } from 'lucide-react';

function getProgressBadgeStyle(raw = '') {
  const str = String(raw).toUpperCase();
  if (str.includes('GOLIVE') || str.includes('UJI TERIMA')) {
    return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30';
  }
  if (str.includes('BISA PT1')) {
    return 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30';
  }
  if (str.includes('FINISH')) {
    return 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30';
  }
  if (str.includes('INSTALASI')) {
    return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30';
  }
  if (str.includes('PERSIAPAN') || str.includes('AANDWIJZING') || str.includes('PERIZINAN') || str.includes('MATDEL')) {
    return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30';
  }
  if (str.includes('HOLD')) {
    return 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30';
  }
  if (str.includes('DROP')) {
    return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30';
  }
  return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700';
}

export function DataTablePanel({ filteredRows = [], moduleTitle = 'HEM' }) {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState(null); // null | 'asc' | 'desc'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProgressSet, setSelectedProgressSet] = useState(null); // null means all selected
  const [progressSearch, setProgressSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const filterMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const progressOptions = useMemo(() => {
    const counts = {};
    filteredRows.forEach(r => {
      const p = r.progressLapangan || 'UNKNOWN';
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredRows]);

  const handleToggleProgressItem = (name) => {
    let current = selectedProgressSet;
    if (!current) {
      current = new Set(progressOptions.map(p => p.name));
    }
    const newSet = new Set(current);
    if (newSet.has(name)) {
      newSet.delete(name);
    } else {
      newSet.add(name);
    }
    setSelectedProgressSet(newSet);
    setPage(1);
  };

  const searchedRows = useMemo(() => {
    let result = filteredRows;

    // 1. Filter by selected progress values
    if (selectedProgressSet !== null) {
      result = result.filter(r => selectedProgressSet.has(r.progressLapangan || 'UNKNOWN'));
    }

    // 2. Global search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        Object.values(r).some(val => String(val).toLowerCase().includes(q))
      );
    }

    // 3. Sort by Progress Lapangan
    if (sortOrder) {
      result = [...result].sort((a, b) => {
        const valA = String(a.progressLapangan || '').toLowerCase();
        const valB = String(b.progressLapangan || '').toLowerCase();
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [filteredRows, search, selectedProgressSet, sortOrder]);

  const totalPages = Math.ceil(searchedRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return searchedRows.slice(start, start + pageSize);
  }, [searchedRows, page, pageSize]);

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-lg flex items-center gap-2">
            <Table className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Tabel Data Detail {moduleTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Menampilkan {searchedRows.length} dari total {filteredRows.length} order (sesuai filter aktif)
          </p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari LOP, District, Progress..."
            className="pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/60 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 w-full sm:w-64 transition-all"
          />
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto custom-scrollbar border border-slate-200 dark:border-slate-800 rounded-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
              <th className="p-3 w-12 text-center">No</th>
              <th className="p-3">Region</th>
              <th className="p-3">District</th>
              <th className="p-3">{moduleTitle === 'OLO' ? 'Nama Proyek' : 'Nama LOP'}</th>
              <th className="p-3 relative">
                <div className="flex items-center justify-between gap-2">
                  <span>Progress Lapangan</span>
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${
                      sortOrder || (selectedProgressSet !== null && selectedProgressSet.size < progressOptions.length)
                        ? 'text-sky-600 dark:text-sky-400 bg-sky-500/10'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                    title="Opsi Urutkan & Filter Progress Lapangan (Excel / GSheet Style)"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Excel / GSheet style filter & sort dropdown menu */}
                {isFilterOpen && (
                  <div
                    ref={filterMenuRef}
                    className="absolute left-3 top-full mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col text-xs text-slate-800 dark:text-slate-200"
                  >
                    {/* Sort Options */}
                    <div className="p-2 border-b border-slate-200 dark:border-slate-800 space-y-1">
                      <button
                        onClick={() => { setSortOrder('asc'); setIsFilterOpen(false); }}
                        className={`w-full px-3 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors ${
                          sortOrder === 'asc' ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>Urutkan A ke Z (Ascending)</span>
                        <span>▲</span>
                      </button>
                      <button
                        onClick={() => { setSortOrder('desc'); setIsFilterOpen(false); }}
                        className={`w-full px-3 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors ${
                          sortOrder === 'desc' ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>Urutkan Z ke A (Descending)</span>
                        <span>▼</span>
                      </button>
                      {sortOrder && (
                        <button
                          onClick={() => { setSortOrder(null); setIsFilterOpen(false); }}
                          className="w-full px-3 py-1 text-slate-500 hover:underline text-[11px] text-center"
                        >
                          Hapus Pengurutan
                        </button>
                      )}
                    </div>

                    {/* Filter by values header */}
                    <div className="px-3 py-2 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between font-bold uppercase text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Filter Nilai</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedProgressSet(null); setPage(1); }}
                          className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline font-normal normal-case"
                        >
                          Pilih Semua
                        </button>
                        <span>|</span>
                        <button
                          onClick={() => { setSelectedProgressSet(new Set()); setPage(1); }}
                          className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline font-normal normal-case"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>

                    {/* Search box within filter */}
                    <div className="p-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="relative">
                        <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={progressSearch}
                          onChange={(e) => setProgressSearch(e.target.value)}
                          placeholder="Cari nilai progress..."
                          className="w-full pl-7 pr-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    {/* Checkbox list */}
                    <div className="max-h-52 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800/40">
                      {progressOptions
                        .filter(opt => !progressSearch || opt.name.toLowerCase().includes(progressSearch.toLowerCase()))
                        .map(opt => {
                          const isChecked = selectedProgressSet === null || selectedProgressSet.has(opt.name);
                          return (
                            <div
                              key={opt.name}
                              onClick={() => handleToggleProgressItem(opt.name)}
                              className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center border ${isChecked ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-400 dark:border-slate-600'}`}>
                                  {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                                <span className="truncate">{opt.name}</span>
                              </div>
                              <span className="font-mono text-slate-400 text-[10px] shrink-0 ml-2">{opt.count}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </th>
              <th className="p-3">Detail Progres</th>
              <th className="p-3">Komitmen Golive</th>
              <th className="p-3">Tanggal Submit</th>
              <th className="p-3">Jenis Kabel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            ) : (
              paginatedRows.map((r, idx) => {
                const globalIdx = (page - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={r.id || idx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-slate-800 dark:text-slate-200"
                  >
                    <td className="p-3 text-center font-mono text-slate-500">{globalIdx}</td>
                    <td className="p-3 font-semibold text-sky-600 dark:text-sky-400 whitespace-nowrap">{r.region}</td>
                    <td className="p-3 font-medium whitespace-nowrap">{r.district}</td>
                    <td className="p-3 font-medium max-w-[220px] truncate" title={r.namaLop}>{r.namaLop}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getProgressBadgeStyle(r.progressLapangan)}`}>
                        {r.progressLapangan}
                      </span>
                    </td>
                    <td className="p-3 max-w-[280px] text-slate-600 dark:text-slate-400 truncate" title={r.detailProgres}>
                      {r.detailProgres || '-'}
                    </td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{r.targetGolive || '-'}</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{r.tglOrder || '-'}</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{r.jenisKabel || '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Halaman {page} dari {totalPages} ({searchedRows.length} total baris)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 disabled:opacity-40 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
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
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTablePanel;