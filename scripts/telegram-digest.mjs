/**
 * telegram-digest.mjs — Alert overdue otomatis INFRANEXIA via GitHub Actions (cron).
 * Fetch Google Sheets (gviz, tanpa auth) → cari order open yang Komitmen
 * Golive-nya sudah lewat hari ini → kirim daftarnya ke Telegram.
 *
 * Secrets yang dibutuhkan di repo GitHub:
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 *
 * Jadwal cron (lihat .github/workflows/telegram-digest.yml):
 *   08.00 WIB setiap hari (= 01.00 UTC).
 *
 * Jalankan manual:  TELEGRAM_BOT_TOKEN=xxx TELEGRAM_CHAT_ID=yyy node scripts/telegram-digest.mjs
 *   atau via tombol "Run workflow" di GitHub Actions.
 */

const SPREADSHEET_ID = '1sQuMVrp-GAZu4TrUO5bn3Ul5fLELgNa_rIWDGAI-ujU';
const GIDS = { HEM: '1129058778', OLO: '1544967736' };
const MAX_LIST_PER_MODULE = 20;

const norm = (s) => String(s || '').trim().toLowerCase().replace(/[\s_]+/g, '');

function findCol(cols, name) {
  const target = norm(name);
  return cols.findIndex(c => c && norm(c.label || c.id) === target);
}

function cellVal(row, idx) {
  if (!row || !row.c || idx < 0 || idx >= row.c.length) return '';
  const cell = row.c[idx];
  if (!cell) return '';
  return cell.v ?? cell.f ?? '';
}

// Ubah nilai tanggal gviz ("Date(2026,6,13)", ISO, dsb.) jadi YYYY-MM-DD; '' kalau bukan tanggal valid
function toISODate(raw) {
  if (raw === null || raw === undefined || raw === '') return '';
  const str = String(raw).trim();
  const gviz = str.match(/Date\((\d+),\s*(\d+),\s*(\d+)/);
  if (gviz) {
    const y = gviz[1];
    const m = String(Number(gviz[2]) + 1).padStart(2, '0');
    const d = String(gviz[3]).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  return '';
}

// Tanggal hari ini dalam WIB (runner GitHub jalan di UTC)
function todayWIB() {
  const now = new Date(Date.now() + 7 * 3600 * 1000);
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function escapeMd(s) {
  return String(s ?? '').replace(/([*_`[])/g, '\\$1');
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

// Kembalikan daftar order overdue: Komitmen Golive < hari ini, belum Golive/Closed, bukan Drop
function findOverdue(table, isOlo) {
  const iRegion = findCol(table.cols, 'REGION');
  const iProgress = findCol(table.cols, 'Progress Lapangan');
  const iSubStatus = findCol(table.cols, 'Sub Status');
  const iKomitmen = findCol(table.cols, 'Komitmen Golive');
  const iTarget = findCol(table.cols, 'TARGET GOLIVE');
  const iDistrict = findCol(table.cols, 'DISTRICT');
  const iNama = findCol(table.cols, isOlo ? 'NAMA PROYEK' : 'NAMA LOP');
  const iStatus = findCol(table.cols, isOlo ? 'Status Order' : 'Status');
  const today = todayWIB();

  const out = [];
  for (const row of table.rows || []) {
    const prog = String(cellVal(row, iProgress, '')).trim();
    const sub = String(cellVal(row, iSubStatus, '')).trim().toUpperCase();
    const progUp = prog.toUpperCase();
    const komitmen = toISODate(cellVal(row, iKomitmen >= 0 ? iKomitmen : iTarget, ''));
    if (!prog || !komitmen || komitmen >= today) continue;
    const stage = hemStage(prog);
    if (stage === 'Golive / UT') continue;
    if (stage === 'Approved Drop' || stage === 'Proposed Drop') continue;
    if (String(cellVal(row, iStatus, '')).toUpperCase().includes('CLOSED')) continue;
    if (progUp.includes('HOLD') || sub.includes('HOLD')) continue;
    if (progUp.includes('BISA PT1') || sub.includes('BISA PT1')) continue;
    out.push({
      nama: String(cellVal(row, iNama, '')).trim() || '(tanpa nama)',
      region: normalizeRegion(cellVal(row, iRegion, '')) || 'Lainnya',
      district: String(cellVal(row, iDistrict, '')).trim().toUpperCase() || '-',
      komitmen,
      daysLate: Math.round((Date.parse(today) - Date.parse(komitmen)) / 86400000),
    });
  }
  out.sort((a, b) => b.daysLate - a.daysLate);
  return out;
}

const fmt = (n) => Number(n || 0).toLocaleString('id-ID');

function buildMessage(hemOverdue, oloOverdue) {
  const dateStr = new Date().toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric',
  });
  const lines = [
    `*INFRANEXIA — Order Overdue (Otomatis 08.00)*`,
    `Tanggal: ${dateStr}`,
    ``,
  ];

  const block = (label, list) => {
    lines.push(`*Modul ${label} — ${fmt(list.length)} order overdue*`);
    if (list.length === 0) {
      lines.push(`- Tidak ada order overdue.`);
      lines.push(``);
      return;
    }
    const byRegion = ['SBU', 'SBT', 'SBS']
      .map(region => ({ region, rows: list.filter(r => r.region === region) }))
      .filter(g => g.rows.length > 0);
    const rest = list.filter(r => !['SBU', 'SBT', 'SBS'].includes(r.region));
    if (rest.length > 0) byRegion.push({ region: 'Lainnya', rows: rest });
    let shown = 0;
    for (const g of byRegion) {
      lines.push(``);
      lines.push(`*━━ Regional ${g.region} (${fmt(g.rows.length)} ━━*`);
      for (const r of g.rows) {
        if (shown >= MAX_LIST_PER_MODULE) break;
        lines.push(`- *${escapeMd(r.nama)}* | ${escapeMd(r.district)} | Komitmen ${r.komitmen} | Telat ${r.daysLate} hari`);
        shown++;
      }
      if (shown >= MAX_LIST_PER_MODULE) break;
    }
    if (list.length > shown) {
      lines.push(`- ... dan ${fmt(list.length - shown)} order overdue lainnya.`);
    }
    lines.push(``);
  };

  block('HEM', hemOverdue);
  block('OLO', oloOverdue);
  return lines.join('\n');
}

async function main() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    throw new Error('Secrets TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID belum di-set.');
  }

  const [hemTable, oloTable] = await Promise.all([
    loadSheet(GIDS.HEM, 1),
    loadSheet(GIDS.OLO, 1),
  ]);

  const hemOverdue = findOverdue(hemTable, false);
  const oloOverdue = findOverdue(oloTable, true);
  const text = buildMessage(hemOverdue, oloOverdue);

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    throw new Error(`Telegram gagal: ${json.description || `HTTP ${res.status}`}`);
  }
  console.log(`Alert overdue terkirim: HEM ${hemOverdue.length}, OLO ${oloOverdue.length}.`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
