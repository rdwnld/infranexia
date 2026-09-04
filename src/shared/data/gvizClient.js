const SPREADSHEET_ID = '1sQuMVrp-GAZu4TrUO5bn3Ul5fLELgNa_rIWDGAI-ujU';

export const GID_MAP = {
  NODE_B: '636051156',
  HEM: '1129058778',
  OLO: '1544967736'
};

/**
 * Load raw table data from Google Sheets via gviz/tq
 */
export async function loadSheet(gid, options = {}) {
  const { headers = null, query = 'SELECT *' } = options;
  
  let url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${gid}&tq=${encodeURIComponent(query)}`;
  if (headers !== null) {
    url += `&headers=${headers}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} saat mengambil data spreadsheet`);
  }

  const text = await response.text();
  // Extract JSON payload from google.visualization.Query.setResponse(...)
  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
  
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Format respon Google Sheets tidak valid');
  }

  const payload = JSON.parse(jsonMatch[1]);
  if (payload.status === 'error') {
    const msg = payload.errors?.[0]?.detailed_message || payload.errors?.[0]?.message || 'Gagal query sheet';
    throw new Error(`Google Sheets Query Error: ${msg}`);
  }

  return payload.table; // { cols: [...], rows: [...] }
}
