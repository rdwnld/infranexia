import { useEffect, useMemo, useState } from 'react';
import { saveTodayAndGetPrevious } from '../../../shared/utils/snapshot';

/**
 * Hitung statistik ringkas dari rows (tanpa filter halaman),
 * lalu bandingkan dengan snapshot hari sebelumnya.
 */
export function useDailyBaseline(moduleKey, region, rows = []) {
  const [previous, setPrevious] = useState(null);

  const current = useMemo(() => {
    let total = rows.length;
    let golive = 0;
    let open = 0;
    let drop = 0;
    rows.forEach(r => {
      if (r.isClosed) golive++;
      else if (r.stage && r.stage.toUpperCase().includes('DROP')) drop++;
      else open++;
    });
    const ach = total > 0 ? Number(((golive / total) * 100).toFixed(1)) : 0;
    return { total, golive, open, drop, ach };
  }, [rows]);

  useEffect(() => {
    if (!rows || rows.length === 0) return;
    const prev = saveTodayAndGetPrevious(moduleKey, region, current);
    setPrevious(prev);
  }, [moduleKey, region, current]);

  const delta = useMemo(() => {
    if (!previous) return null;
    const p = previous.stats || {};
    return {
      total: current.total - (p.total || 0),
      golive: current.golive - (p.golive || 0),
      open: current.open - (p.open || 0),
      drop: current.drop - (p.drop || 0),
      ach: Number((current.ach - (p.ach || 0)).toFixed(1)),
    };
  }, [current, previous]);

  return { current, previous, delta };
}
