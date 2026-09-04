import { useState, useEffect, useCallback } from 'react';
import { loadSheet, GID_MAP } from '../../../shared/data/gvizClient';
import { parseNodeBRows } from '../nodeb.parser';

export function useNodeBData(regionalFilter = null) {
  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const table = await loadSheet(GID_MAP.NODE_B);
      const parsed = parseNodeBRows(table);
      setRawRows(parsed);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[useNodeBData] Error fetching NODE B data:', err);
      setError(err.message || 'Gagal memuat data NODE B');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter by Regional route (SBU / SBT / SBS / ALL)
  const rows = regionalFilter && regionalFilter !== 'ALL'
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
