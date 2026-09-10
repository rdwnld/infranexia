const SPREADSHEET_ID = '1dnXcxcN9uhmBff_Sau5Yz4kBpTZeDtt-Otf7EmHREqM';

export const GID_MAP = {
  NODE_B: '636051156',
  HEM: '1129058778',
  OLO: '1544967736'
};

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
