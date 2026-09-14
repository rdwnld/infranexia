/**
 * sheets.js — Ambil + agregasi data Google Sheets untuk bot Telegram.
 * gviz tanpa auth, sama seperti dashboard & Actions digest.
 */

export const SPREADSHEET_ID = '1dnXcxcN9uhmBff_Sau5Yz4kBpTZeDtt-Otf7EmHREqM';
export const GIDS = { NODE_B: '636051156', HEM: '1129058778', OLO: '1544967736' };

const norm = (s) => String(s || '').trim().toLowerCase().replace(/[\s_]+/g, '');

export function findCol(cols, name) {
  const target = norm(name);
  return cols.findIndex(c => c && norm(c.label || c.id) === target);
}

export function cellVal(row, idx) {
  if (!row || !row.c || idx < 0 || idx >= row.c.length) return '';
  const cell = row.c[idx];
  if (!cell) return '';
  return cell.v ?? cell.f ?? '';
}

export async function loadSheet(gid, headers) {
  let url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${gid}&tq=${encodeURIComponent('SELECT *')}`;
  if (headers != null) url += `&headers=${headers}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`gviz HTTP ${res.status} (gid=${gid})`);
  const text = await res.text();
  const m = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/);
  if (!m) throw new Error(`Respon gviz tak valid (gid=${gid})`);
  const payload = JSON.parse(m[1]);
  if (payload.status === 'error') {
    throw new Error(`gviz error (gid=${gid}): ${payload.errors?.[0]?.detailed_message || 'query gagal'}`);
  }
  return payload.table;
}

function hemStage(progressRaw) {
  const str = String(progressRaw || '').trim().toUpperCase();
  if (!str) return 'UNKNOWN';
  if (str.includes('APPROVED DROP')) return 'Approved Drop';
  if (str.includes('PROPOSED DROP')) return 'Proposed Drop';
  if (str.includes('07 GOLIVE') || str.includes('08 UJI TERIMA') || str.includes('GOLIVE')) return 'Golive / UT';
  if (str.includes('BISA PT1')) return 'Bisa PT1';
  if (str.includes('06 F. INSTALASI') || str.includes('FINISH INSTALASI')) return 'Finish Instal';
  if (str.includes('05 INSTALASI') || str.includes('INSTALASI')) return 'Instalasi';
  if (str.includes('01 PERSIAPAN') || str.includes('02 AANDWIJZING') || str.includes('03 PERIZINAN') ||
      str.includes('04 MATDEL') || str.includes('10 HOLD') || str.includes('PERSIAPAN')) return 'Persiapan';
  return 'UNKNOWN';
}

export function summarizeNodeB(table) {
  const iStatus = findCol(table.cols, 'Status Lapangan');
  let total = 0, closed = 0, open = 0, drop = 0;
  for (const row of table.rows || []) {
    const st = String(cellVal(row, iStatus, '')).trim().toUpperCase();
    if (!st) continue;
    total++;
    if (st === 'CLOSED') closed++;
    else if (st === 'DROP') drop++;
    else open++;
  }
  return { total, golive: closed, open, drop, ach: total ? Number(((closed / total) * 100).toFixed(1)) : 0 };
}

export function summarizeHemOlo(table) {
  const iProgress = findCol(table.cols, 'Progress Lapangan');
  let total = 0, golive = 0, open = 0, drop = 0;
  for (const row of table.rows || []) {
    const prog = String(cellVal(row, iProgress, '')).trim();
    if (!prog) continue;
    total++;
    const stage = hemStage(prog);
    if (stage === 'Golive / UT') golive++;
    else if (stage === 'Approved Drop' || stage === 'Proposed Drop') drop++;
    else open++;
  }
  return { total, golive, open, drop, ach: total ? Number(((golive / total) * 100).toFixed(1)) : 0 };
}

const fmt = (n) => Number(n || 0).toLocaleString('id-ID');

export async function fetchAllStats() {
  const [nodebTable, hemTable, oloTable] = await Promise.all([
    loadSheet(GIDS.NODE_B, 2),
    loadSheet(GIDS.HEM, 1),
    loadSheet(GIDS.OLO, 1),
  ]);
  return {
    nodeb: summarizeNodeB(nodebTable),
    hem: summarizeHemOlo(hemTable),
    olo: summarizeHemOlo(oloTable),
  };
}

export function formatModuleLine(label, unit, s, closedLabel) {
  return `${label} (${fmt(s.total)} ${unit}): ${closedLabel} ${fmt(s.golive)} (${s.ach}%) | Open ${fmt(s.open)} | Drop ${fmt(s.drop)}`;
}
