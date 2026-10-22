import { useState, useEffect, useCallback } from 'react';
import { loadSheetCsv, GID_MAP } from '../../../shared/data/gvizClient';
import { parseQeRelokRows } from '../qerelok.parser';

export function useQeRelokData(regionalFilter = null) {
  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pakai CSV export agar filter aktif di sheet tidak menyembunyikan baris lain
      const table = await loadSheetCsv(GID_MAP.QE_RELOK);
      const parsed = parseQeRelokRows(table);
      setRawRows(parsed);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[useQeRelokData] Error fetching QE Relok data:', err);
      setError(err.message || 'Gagal memuat data QE Relok');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter by Regional route (SBU / SBT / SBS / ALL)
  const rows = regionalFilter && regionalFilter.toUpperCase() !== 'ALL'
    ? rawRows.filter(r => r.region === regionalFilter.toUpperCase())
    : rawRows;

  return {
    rows,
    allRows: rawRows,
    loading,
    error,
    lastUpdated,
    refresh: fetchData,
  };
}
