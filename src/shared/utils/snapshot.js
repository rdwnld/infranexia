/**
 * snapshot.js — Baseline harian "data bergerak" (Fase 4).
 * Menyimpan ringkasan statistik per hari di localStorage (maks 14 hari),
 * lalu membandingkan snapshot hari ini vs hari sebelumnya.
 */

function localDayISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function storageKey(moduleKey, region) {
  return `infranexia-baseline-${moduleKey}-${String(region || 'ALL').toUpperCase()}`;
}

function readHistory(moduleKey, region) {
  try {
    const raw = localStorage.getItem(storageKey(moduleKey, region));
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Simpan snapshot hari ini, kembalikan snapshot pembanding terakhir
 * (tanggal terbaru sebelum hari ini). Return { date, stats } | null.
 */
export function saveTodayAndGetPrevious(moduleKey, region, stats) {
  const history = readHistory(moduleKey, region);
  const today = localDayISO();

  const pastDates = Object.keys(history).filter(d => d < today).sort();
  const prevDate = pastDates.length > 0 ? pastDates[pastDates.length - 1] : null;
  const previous = prevDate ? { date: prevDate, stats: history[prevDate] } : null;

  history[today] = stats;
  const keys = Object.keys(history).sort();
  while (keys.length > 14) {
    delete history[keys.shift()];
  }

  try {
    localStorage.setItem(storageKey(moduleKey, region), JSON.stringify(history));
  } catch {
    // storage penuh / privat — abaikan, baseline non-blocking
  }

  return previous;
}

export function formatBaselineDate(iso) {
  if (!iso) return '-';
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
