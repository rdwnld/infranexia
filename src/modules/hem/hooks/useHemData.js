import { useState, useEffect, useCallback } from 'react';
import { loadSheet, GID_MAP } from '../../../shared/data/gvizClient';
import { parseHemRows } from '../hem.parser';

export function useHemData(regionalFilter = null, isOlo = false) {
  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const gid = isOlo ? GID_MAP.OLO : GID_MAP.HEM;
      const table = await loadSheet(gid, { headers: 1 });
      const parsed = parseHemRows(table, isOlo);
      setRawRows(parsed);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(`[useHemData] Error fetching ${isOlo ? 'OLO' : 'HEM'} data:`, err);
      setError(err.message || `Gagal memuat data ${isOlo ? 'OLO' : 'HEM'}`);
    } finally {
      setLoading(false);
    }
  }, [isOlo]);

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
