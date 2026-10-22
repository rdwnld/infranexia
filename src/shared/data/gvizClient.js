const SPREADSHEET_ID = '1sQuMVrp-GAZu4TrUO5bn3Ul5fLELgNa_rIWDGAI-ujU';

export const GID_MAP = {
  NODE_B: '636051156',
  HEM: '1129058778',
  OLO: '1544967736',
  QE_RELOK: '1937238989'
};

/**
 * Parse CSV text (RFC 4180-ish) into array of records.
 * Mendukung field ber-quote, koma di dalam quote, escaped quote (""), dan newline di dalam quote.
 */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const s = String(text || '');

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Ubah CSV menjadi struktur table ala gviz ({ cols, rows }) agar parser yang ada tetap kompatibel.
 */
export function csvToTable(text) {
  const records = parseCsv(text);
  if (records.length === 0) return { cols: [], rows: [] };

  const header = records[0];
  const cols = header.map(label => ({ label: String(label || '').trim() }));
  const rows = records.slice(1).map(record => ({
    c: record.map(value => ({ v: value })),
  }));

  return { cols, rows };
}

/**
 * Ambil SELURUH isi sheet via endpoint export CSV.
 * Berbeda dari gviz/tq, endpoint ini mengabaikan filter/hidden rows yang aktif di sheet,
 * sehingga semua baris tetap terbaca. Endpoint ini mengirim Access-Control-Allow-Origin: *.
 */
export async function loadSheetCsv(gid) {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Gagal mengunduh CSV Google Sheets (HTTP ${res.status})`);
  }
  const text = await res.text();
  return csvToTable(text);
}

/**
 * Load raw table data from Google Sheets via JSONP (<script> tag injection)
 * Immune to browser CORS restrictions on Google Sheets gviz endpoint
 */
export function loadSheet(gid, options = {}) {
  const { headers = null, query = 'SELECT *' } = options;

  return new Promise((resolve, reject) => {
    const callbackName = `gviz_cb_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    let url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=responseHandler:${callbackName}&gid=${gid}&tq=${encodeURIComponent(query)}`;
    if (headers !== null) {
      url += `&headers=${headers}`;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout saat mengambil data dari Google Sheets (20s)'));
    }, 20000);

    function cleanup() {
      clearTimeout(timeout);
      try {
        delete window[callbackName];
      } catch {
        window[callbackName] = undefined;
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }

    window[callbackName] = function (response) {
      cleanup();
      if (!response) {
        reject(new Error('Respon Google Sheets kosong'));
        return;
      }
      if (response.status === 'error') {
        const msg = response.errors?.[0]?.detailed_message || response.errors?.[0]?.message || 'Gagal query sheet';
        reject(new Error(`Google Sheets Query Error: ${msg}`));
        return;
      }
      if (!response.table) {
        reject(new Error('Tabel data tidak ditemukan dalam respon'));
        return;
      }
      resolve(response.table);
    };

    script.onerror = function () {
      cleanup();
      reject(new Error('Gagal memuat data dari Google Sheets (Koneksi error/Sheet privat)'));
    };

    document.head.appendChild(script);
  });
}
