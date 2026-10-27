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

function ThWithFilter({
  label,
  columnKey,
  allRowsForOptions,
  selectedSet,
  onChangeSelected,
  sortOrder,
  onChangeSort,
  align = 'left'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = useMemo(() => {
    const counts = {};
    allRowsForOptions.forEach(r => {
      let val = r[columnKey];
      if (val === null || val === undefined || val === '') val = '-';
      if (columnKey === 'panjangKabel') {
        val = val ? val.toLocaleString('id-ID') : '-';
      }
      const keyStr = String(val);
      counts[keyStr] = (counts[keyStr] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allRowsForOptions, columnKey]);

  const allSelected = selectedSet === null;

  const handleToggleItem = (name) => {
    let current = selectedSet;
    if (current === null) {
      current = new Set(options.map(o => o.name));
    }
    const next = new Set(current);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    onChangeSelected(next);
  };

  const isActive = sortOrder || (selectedSet !== null && selectedSet.size < options.length);

  return (
    <th className={`p-3 relative ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <div className={`flex items-center justify-between gap-1.5 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <span>{label}</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0 ${
            isActive ? 'text-sky-600 dark:text-sky-400 bg-sky-500/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
          title={`Filter & Urutkan ${label}`}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute top-full mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col text-xs text-slate-800 dark:text-slate-200 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* Sort Options */}
          <div className="p-2 border-b border-slate-200 dark:border-slate-800 space-y-1">
            <button
              onClick={() => { onChangeSort('asc'); setIsOpen(false); }}
              className={`w-full px-3 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors ${
                sortOrder === 'asc' ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Urutkan A ke Z (Ascending)</span>
              <span>▲</span>
            </button>
            <button
              onClick={() => { onChangeSort('desc'); setIsOpen(false); }}
              className={`w-full px-3 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors ${
                sortOrder === 'desc' ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Urutkan Z ke A (Descending)</span>
              <span>▼</span>
            </button>
            {sortOrder && (
              <button
                onClick={() => { onChangeSort(null); setIsOpen(false); }}
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
                onClick={() => onChangeSelected(null)}
                className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline font-normal normal-case"
              >
                Pilih Semua
              </button>
              <span>|</span>
              <button
                onClick={() => onChangeSelected(new Set())}
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nilai..."
                className="w-full pl-7 pr-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Checkbox list */}
          <div className="max-h-52 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800/40">
            {options
              .filter(opt => !search || opt.name.toLowerCase().includes(search.toLowerCase()))
              .map(opt => {
                const isChecked = allSelected || selectedSet.has(opt.name);
                return (
                  <div
                    key={opt.name}
                    onClick={() => handleToggleItem(opt.name)}
                    className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center border ${isChecked ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-400 dark:border-slate-600'}`}>
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="truncate" title={opt.name}>{opt.name}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[10px] shrink-0 ml-2">{opt.count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </th>
  );
}

export function DataTablePanel({ filteredRows = [], moduleTitle = 'HEM' }) {
  const [search, setSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState({}); // { [columnKey]: Set | null }
  const [sortColumn, setSortColumn] = useState(null); // string | null
  const [sortOrder, setSortOrder] = useState(null); // 'asc' | 'desc' | null
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const handleColumnFilterChange = (columnKey, newSet) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: newSet
    }));
    setPage(1);
  };

  const handleColumnSortChange = (columnKey, order) => {
    if (!order) {
      setSortColumn(null);
      setSortOrder(null);
    } else {
      setSortColumn(columnKey);
      setSortOrder(order);
    }
  };

  const searchedRows = useMemo(() => {
    let result = filteredRows;

    // 1. Apply column filters
    for (const [key, selSet] of Object.entries(columnFilters)) {
      if (selSet !== null) {
        result = result.filter(r => {
          let val = r[key];
          if (val === null || val === undefined || val === '') val = '-';
          if (key === 'panjangKabel') {
            val = val ? val.toLocaleString('id-ID') : '-';
          }
          return selSet.has(String(val));
        });
      }
    }

    // 2. Global search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        Object.values(r).some(val => String(val).toLowerCase().includes(q))
      );
    }

    // 3. Sort
    if (sortColumn && sortOrder) {
      result = [...result].sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];
        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
        if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [filteredRows, search, columnFilters, sortColumn, sortOrder]);

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
            placeholder="Cari data di tabel..."
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
              <ThWithFilter
                label="Region"
                columnKey="region"
                allRowsForOptions={filteredRows}
                selectedSet={columnFilters.region !== undefined ? columnFilters.region : null}
                onChangeSelected={(set) => handleColumnFilterChange('region', set)}
                sortOrder={sortColumn === 'region' ? sortOrder : null}
                onChangeSort={(order) => handleColumnSortChange('region', order)}
              />
              <ThWithFilter
                label="District"
                columnKey="district"
                allRowsForOptions={filteredRows}
                selectedSet={columnFilters.district !== undefined ? columnFilters.district : null}
                onChangeSelected={(set) => handleColumnFilterChange('district', set)}
                sortOrder={sortColumn === 'district' ? sortOrder : null}
                onChangeSort={(order) => handleColumnSortChange('district', order)}
              />
              <ThWithFilter
                label={moduleTitle === 'OLO' ? 'Nama Proyek' : 'Nama LOP'}
                columnKey="namaLop"
                allRowsForOptions={filteredRows}
                selectedSet={columnFilters.namaLop !== undefined ? columnFilters.namaLop : null}
                onChangeSelected={(set) => handleColumnFilterChange('namaLop', set)}
                sortOrder={sortColumn === 'namaLop' ? sortOrder : null}
                onChangeSort={(order) => handleColumnSortChange('namaLop', order)}
              />
              <ThWithFilter
                label="Progress Lapangan"
                columnKey="progressLapangan"
                allRowsForOptions={filteredRows}
                selectedSet={columnFilters.progressLapangan !== undefined ? columnFilters.progressLapangan : null}
                onChangeSelected={(set) => handleColumnFilterChange('progressLapangan', set)}
                sortOrder={sortColumn === 'progressLapangan' ? sortOrder : null}
                onChangeSort={(order) => handleColumnSortChange('progressLapangan', order)}
              />
              <ThWithFilter
                label="Detail Progres"
                columnKey="detailProgres"
                allRowsForOptions={filteredRows}
                selectedSet={columnFilters.detailProgres !== undefined ? columnFilters.detailProgres : null}
                onChangeSelected={(set) => handleColumnFilterChange('detailProgres', set)}
                sortOrder={sortColumn === 'detailProgres' ? sortOrder : null}
                onChangeSort={(order) => handleColumnSortChange('detailProgres', order)}
              />
              <ThWithFilter
                label="Komitmen Golive"
                columnKey="targetGolive"
                allRowsForOptions={filteredRows}
                selectedSet={columnFilters.targetGolive !== undefined ? columnFilters.targetGolive : null}
                onChangeSelected={(set) => handleColumnFilterChange('targetGolive', set)}
                sortOrder={sortColumn === 'targetGolive' ? sortOrder : null}
                onChangeSort={(order) => handleColumnSortChange('targetGolive', order)}
              />
              <ThWithFilter
                label="Tanggal Submit"
                columnKey="tglOrder"
                allRowsForOptions={filteredRows}
                selectedSet={columnFilters.tglOrder !== undefined ? columnFilters.tglOrder : null}
                onChangeSelected={(set) => handleColumnFilterChange('tglOrder', set)}
                sortOrder={sortColumn === 'tglOrder' ? sortOrder : null}
                onChangeSort={(order) => handleColumnSortChange('tglOrder', order)}
              />
              <ThWithFilter
                label="Jenis Kabel"
                columnKey="jenisKabel"
                allRowsForOptions={filteredRows}
                selectedSet={columnFilters.jenisKabel !== undefined ? columnFilters.jenisKabel : null}
                onChangeSelected={(set) => handleColumnFilterChange('jenisKabel', set)}
                sortOrder={sortColumn === 'jenisKabel' ? sortOrder : null}
                onChangeSort={(order) => handleColumnSortChange('jenisKabel', order)}
              />
              <ThWithFilter
                label="Panjang Kabel (m)"
                columnKey="panjangKabel"
                allRowsForOptions={filteredRows}
                selectedSet={columnFilters.panjangKabel !== undefined ? columnFilters.panjangKabel : null}
                onChangeSelected={(set) => handleColumnFilterChange('panjangKabel', set)}
                sortOrder={sortColumn === 'panjangKabel' ? sortOrder : null}
                onChangeSort={(order) => handleColumnSortChange('panjangKabel', order)}
                align="right"
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-slate-500 dark:text-slate-400">
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
                    <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{r.panjangKabel ? r.panjangKabel.toLocaleString('id-ID') : '-'}</td>
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
