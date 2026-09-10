/**
 * telegram-digest.mjs — Digest otomatis INFRANEXIA via GitHub Actions (cron).
 * Fetch Google Sheets (gviz, tanpa auth) → agregasi → kirim ke Telegram.
 *
 * Secrets yang dibutuhkan di repo GitHub:
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 *
 * Jalankan manual:  node scripts/telegram-digest.mjs
 */

const SPREADSHEET_ID = '1dnXcxcN9uhmBff_Sau5Yz4kBpTZeDtt-Otf7EmHREqM';
const GIDS = { NODE_B: '636051156', HEM: '1129058778', OLO: '1544967736' };

const norm = (s) => String(s || '').trim().toLowerCase().replace(/[\s_]+/g, '');

function findCol(cols, name) {
  const target = norm(name);
  const idx = cols.findIndex(c => c && norm(c.label || c.id) === target);
  return idx;
}

function cellVal(row, idx) {
  if (!row || !row.c || idx < 0 || idx >= row.c.length) return '';
  const cell = row.c[idx];
  if (!cell) return '';
  return cell.v ?? cell.f ?? '';
}

async function loadSheet(gid, headers) {
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

function normalizeRegion(raw) {
  const s = String(raw || '').trim().toUpperCase();
  if (!s) return '';
  if (s === 'SBU' || s.includes('SUMBAGUT')) return 'SBU';
  if (s === 'SBT' || s.includes('SUMBAGTENG')) return 'SBT';
  if (s === 'SBS' || s.includes('SUMBAGSEL')) return 'SBS';
  return s;
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

function summarizeNodeB(table) {
  const iRegion = findCol(table.cols, 'REGION');
  const iStatus = findCol(table.cols, 'Status Lapangan');
  let total = 0, closed = 0, open = 0, drop = 0;
  for (const row of table.rows || []) {
    if (iRegion < 0 || !normalizeRegion(cellVal(row, iRegion))) continue;
    const st = String(cellVal(row, iStatus, '')).trim().toUpperCase();
    if (!st) continue;
    total++;
    if (st === 'CLOSED') closed++;
    else if (st === 'DROP') drop++;
    else open++;
  }
  return { total, golive: closed, open, drop, ach: total ? Number(((closed / total) * 100).toFixed(1)) : 0 };
}

function summarizeHemOlo(table) {
  const iRegion = findCol(table.cols, 'REGION');
  const iProgress = findCol(table.cols, 'Progress Lapangan');
  let total = 0, golive = 0, open = 0, drop = 0;
  for (const row of table.rows || []) {
    const region = normalizeRegion(cellVal(row, iRegion));
    const prog = String(cellVal(row, iProgress, '')).trim();
    if (!region || !prog) continue;
    total++;
    const stage = hemStage(prog);
    if (stage === 'Golive / UT') golive++;
    else if (stage === 'Approved Drop' || stage === 'Proposed Drop') drop++;
    else open++;
  }
  return { total, golive, open, drop, ach: total ? Number(((golive / total) * 100).toFixed(1)) : 0 };
}

const fmt = (n) => Number(n || 0).toLocaleString('id-ID');

async function main() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    throw new Error('Secrets TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID belum di-set.');
  }

  const [nodebTable, hemTable, oloTable] = await Promise.all([
    loadSheet(GIDS.NODE_B, 2),
    loadSheet(GIDS.HEM, 1),
    loadSheet(GIDS.OLO, 1),
  ]);

  const nb = summarizeNodeB(nodebTable);
  const hem = summarizeHemOlo(hemTable);
  const olo = summarizeHemOlo(oloTable);

  const dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const lines = [
    `INFRANEXIA — Ringkasan Otomatis • ${dateStr} ${timeStr}`,
    '',
    `NODE B (${fmt(nb.total)} site): Closed ${fmt(nb.golive)} (${nb.ach}%) | Open ${fmt(nb.open)} | Drop ${fmt(nb.drop)}`,
    `HEM (${fmt(hem.total)} order): Golive ${fmt(hem.golive)} (${hem.ach}%) | Open ${fmt(hem.open)} | Drop ${fmt(hem.drop)}`,
    `OLO (${fmt(olo.total)} order): Golive ${fmt(olo.golive)} (${olo.ach}%) | Open ${fmt(olo.open)} | Drop ${fmt(olo.drop)}`,
  ];

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: lines.join('\n') }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    throw new Error(`Telegram gagal: ${json.description || `HTTP ${res.status}`}`);
  }
  console.log('Digest terkirim:', lines.join(' | '));
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
