import { colIndex, getCellValue } from '../../shared/data/columnLookup';

/**
 * Clean & normalize coordinate value to standard scale
 */
function normalizeRawNum(val) {
  if (val === null || val === undefined || val === '') return null;
  let num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, '.'));
  if (isNaN(num) || num === 0) return null;
  return num;
}

/**
 * Clean district string
 */
function cleanDistrict(raw) {
  if (!raw) return 'UNKNOWN';
  return String(raw)
    .trim()
    .replace(/[\r\n]+/g, '')
    .toUpperCase();
}

/**
 * Parse raw table from Google Sheets for NODE B
 */
export function parseNodeBRows(table) {
  if (!table || !table.cols || !table.rows) return [];

  const cols = table.cols;

  const iNo = colIndex(cols, 'NO', 0);
  const iTipeOrder = colIndex(cols, 'TIPE ORDER', 1);
  const iTahun = colIndex(cols, 'TAHUN', 2);
  const iRegion = colIndex(cols, 'REGION', 3);
  const iDistrict = colIndex(cols, 'DISTRICT', 4);
  const iSto = colIndex(cols, 'STO', 5);
  const iSiteId = colIndex(cols, 'SITEID', 6);
  const iSiteName = colIndex(cols, 'SITE NAME', 7);
  const iLatSite = colIndex(cols, 'LAT SITE', 8);
  const iLongSite = colIndex(cols, 'LONG SITE', 9);
  const iNimOrder = colIndex(cols, 'NIM ORDER', 10);
  const iBatchOrder = colIndex(cols, 'BATCH ORDER', 18);
  const iTglOrder = colIndex(cols, 'TANGGAL ORDER', 19);
  const iMitra = colIndex(cols, 'MITRA', 20);
  const iSubkon = colIndex(cols, 'SUBKON', 21);
  const iStatusLapangan = colIndex(cols, 'Status Lapangan', 23);
  const iProgresLapangan = colIndex(cols, 'PROGRES LAPANGAN', 24);
  const iSubProgresLapangan = colIndex(cols, 'SUB PROGRES LAPANGAN', 25);
  const iDetailProgres = colIndex(cols, 'DETAIL PROGRES', 26);
  const iDurasiOrder = colIndex(cols, 'DURASI ORDER', 27);

  const parsed = [];

  for (let r = 0; r < table.rows.length; r++) {
    const row = table.rows[r];
    if (!row || !row.c) continue;

    const siteId = String(getCellValue(row, iSiteId, '')).trim();
    const siteName = String(getCellValue(row, iSiteName, '')).trim();
    const nimOrder = String(getCellValue(row, iNimOrder, '')).trim();
    const districtRaw = String(getCellValue(row, iDistrict, '')).trim();

    // Skip empty formatting rows
    if (!siteId && !siteName && !nimOrder && !districtRaw) continue;

    const regionRaw = String(getCellValue(row, iRegion, '')).trim().toUpperCase();
    const districtClean = cleanDistrict(districtRaw);

    let rawLat = normalizeRawNum(getCellValue(row, iLatSite, null));
    let rawLng = normalizeRawNum(getCellValue(row, iLongSite, null));

    let lat = null;
    let lng = null;

    if (rawLat !== null || rawLng !== null) {
      // Scale down integer coordinates
      let v1 = rawLat;
      let v2 = rawLng;

      if (v1 !== null) {
        while (Math.abs(v1) > 180.0) v1 /= 10;
      }
      if (v2 !== null) {
        while (Math.abs(v2) > 180.0) v2 /= 10;
      }

      // Check if v1 is longitude and v2 is latitude (swapped)
      if (v1 !== null && Math.abs(v1) >= 80 && Math.abs(v1) <= 140) {
        lng = Math.abs(v1);
        if (v2 !== null && Math.abs(v2) <= 15) lat = v2;
      } else if (v2 !== null && Math.abs(v2) >= 80 && Math.abs(v2) <= 140) {
        lng = Math.abs(v2);
        if (v1 !== null && Math.abs(v1) <= 15) lat = v1;
      } else {
        if (v1 !== null && Math.abs(v1) <= 15) lat = v1;
        if (v2 !== null && Math.abs(v2) >= 80 && Math.abs(v2) <= 140) lng = Math.abs(v2);
      }
    }

    const statusLapangan = String(getCellValue(row, iStatusLapangan, 'UNKNOWN')).trim().toUpperCase() || 'UNKNOWN';
    const progresLapangan = String(getCellValue(row, iProgresLapangan, 'UNKNOWN')).trim() || 'UNKNOWN';
    const subProgres = String(getCellValue(row, iSubProgresLapangan, '-')).trim() || '-';

    parsed.push({
      id: `nodeb-${r}-${siteId || r}`,
      no: getCellValue(row, iNo, r + 1),
      tipeOrder: String(getCellValue(row, iTipeOrder, '')).trim(),
      tahun: getCellValue(row, iTahun, ''),
      region: regionRaw, // SBU, SBT, SBS
      district: districtClean,
      sto: String(getCellValue(row, iSto, '')).trim().toUpperCase(),
      siteId: siteId || `SITE-${r}`,
      siteName: siteName || `Site ${r}`,
      lat,
      lng,
      nimOrder,
      batchOrder: String(getCellValue(row, iBatchOrder, 'Tanpa Batch')).trim() || 'Tanpa Batch',
      tglOrder: getCellValue(row, iTglOrder, ''),
      mitra: String(getCellValue(row, iMitra, '-')).trim() || '-',
      subkon: String(getCellValue(row, iSubkon, '-')).trim() || '-',
      statusLapangan, // CLOSED, OPEN, DROP, KENDALA
      progresLapangan, // 03 AANWIJZING, 08 ON AIR, dll
      subProgres,
      detailProgres: String(getCellValue(row, iDetailProgres, '')).trim(),
      durasiOrder: Number(getCellValue(row, iDurasiOrder, 0)) || 0,
    });
  }

  return parsed;
}
