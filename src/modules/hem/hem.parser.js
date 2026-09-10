import { colIndex, getCellValue } from '../../shared/data/columnLookup';
import { normalizeRegionCode } from '../../regions/regionConfig';
import { getStage, getSubStagePersiapan, STAGES } from './hem.stageRules';

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

/** Regional badge standar via regionConfig.js (SUMBAGUT→SBU, dst.) */
function normalizeRegion(raw) {
  return normalizeRegionCode(raw) || 'ALL';
}

/**
 * Normalize aging bucket string
 */
function normalizeAgingBucket(raw) {
  if (!raw) return '6.>2BLN';
  const str = String(raw).trim();
  if (str.includes('LEBIHI DARI 1 BLN')) return '5.>1BLN';
  return str;
}

const MONTH_MAP = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', MEI: '05',
  JUN: '06', JUL: '07', AUG: '08', AGS: '08', SEP: '09',
  OCT: '10', OKT: '10', NOV: '11', DEC: '12', DES: '12',
};

/**
 * Normalize sheet date value to ISO YYYY-MM-DD for calendar comparison.
 * Handles gviz Date(YYYY,M,D), "15/Jan/2026", "15-Jan-2026", "January 15, 2026".
 */
function parseSheetDateISO(raw) {
  if (raw === null || raw === undefined || raw === '') return '';
  if (raw instanceof Date && !isNaN(raw)) {
    return raw.toISOString().slice(0, 10);
  }
  const str = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);

  const gviz = str.match(/Date\((\d+),\s*(\d+),\s*(\d+)/);
  if (gviz) {
    const y = gviz[1];
    const m = String(Number(gviz[2]) + 1).padStart(2, '0');
    const d = String(gviz[3]).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const dmy = str.match(/(\d{1,2})[\/\-\s]+([A-Za-z]{3,9})[\/\-\s,]+(\d{4})/);
  if (dmy) {
    const mKey = dmy[2].slice(0, 3).toUpperCase();
    const m = MONTH_MAP[mKey];
    if (m) return `${dmy[3]}-${m}-${String(dmy[1]).padStart(2, '0')}`;
  }

  const mdy = str.match(/([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})/);
  if (mdy) {
    const mKey = mdy[1].slice(0, 3).toUpperCase();
    const m = MONTH_MAP[mKey];
    if (m) return `${mdy[3]}-${m}-${String(mdy[2]).padStart(2, '0')}`;
  }

  return '';
}

/**
 * Parse raw table from Google Sheets for HEM / OLO
 */
export function parseHemRows(table, isOlo = false) {
  if (!table || !table.cols || !table.rows) return [];

  const cols = table.cols;

  const iRegion = colIndex(cols, 'REGION', isOlo ? 8 : 0);
  const iDistrict = colIndex(cols, 'DISTRICT', isOlo ? 11 : 1);
  const iSto = colIndex(cols, 'STO', isOlo ? 10 : 2);
  const iNamaLop = colIndex(cols, isOlo ? 'NAMA PROYEK' : 'NAMA LOP', isOlo ? 6 : 4);
  const iBatchOrder = colIndex(cols, 'BATCH ORDER', isOlo ? 3 : 9);
  const iBoq = colIndex(cols, 'BOQ', isOlo ? 12 : 13);
  const iMitra = colIndex(cols, 'Mitra', isOlo ? 15 : 16);
  const iSubkon = colIndex(cols, 'Subkon', isOlo ? 16 : 17);
  const iProgressLapangan = colIndex(cols, 'Progress Lapangan', isOlo ? 17 : 18);
  const iSubStatus = colIndex(cols, 'Sub Status', isOlo ? 18 : 19);
  const iStatus = colIndex(cols, isOlo ? 'Status Order' : 'Status', isOlo ? 0 : 20);
  const iDetailProgres = colIndex(cols, 'Detail Progres', isOlo ? 19 : 21);
  const iKlafDurasi = colIndex(cols, 'klaf durasi order', isOlo ? 30 : 35);
  const iTglOrder = colIndex(cols, isOlo ? 'TANGGAL ORDER' : 'Tanggal submit order nde', isOlo ? 14 : 33);
  const iNoOrder = colIndex(cols, 'NO ORDER', isOlo ? 2 : 41);

  const parsed = [];

  for (let r = 0; r < table.rows.length; r++) {
    const row = table.rows[r];
    if (!row || !row.c) continue;

    const districtRaw = String(getCellValue(row, iDistrict, '')).trim();
    const namaLop = String(getCellValue(row, iNamaLop, '')).trim();
    const noOrder = String(getCellValue(row, iNoOrder, '')).trim();

    // Skip empty formatting rows
    if (!districtRaw && !namaLop && !noOrder) continue;

    const region = normalizeRegion(getCellValue(row, iRegion, ''));
    const district = cleanDistrict(districtRaw);
    const progressLapangan = String(getCellValue(row, iProgressLapangan, '')).trim();

    const stage = getStage(progressLapangan);
    const subStagePersiapan = stage === STAGES.PERSIAPAN ? getSubStagePersiapan(progressLapangan) : null;

    const isClosed = stage === STAGES.GOLIVE_UT || String(getCellValue(row, iStatus, '')).toUpperCase().includes('CLOSED');

    parsed.push({
      id: `${isOlo ? 'olo' : 'hem'}-${r}-${noOrder || r}`,
      noOrder,
      region, // SBU, SBT, SBS
      district,
      sto: String(getCellValue(row, iSto, '')).trim().toUpperCase(),
      namaLop: namaLop || `Order ${r}`,
      batchOrder: String(getCellValue(row, iBatchOrder, 'Tanpa Batch')).trim() || 'Tanpa Batch',
      boq: Number(getCellValue(row, iBoq, 0)) || 0,
      mitra: String(getCellValue(row, iMitra, '-')).trim() || '-',
      subkon: String(getCellValue(row, iSubkon, '-')).trim() || '-',
      progressLapangan: progressLapangan || 'UNKNOWN',
      subStatus: String(getCellValue(row, iSubStatus, '-')).trim() || '-',
      status: String(getCellValue(row, iStatus, '')).trim(),
      detailProgres: String(getCellValue(row, iDetailProgres, '')).trim(),
      agingBucket: normalizeAgingBucket(getCellValue(row, iKlafDurasi, '6.>2BLN')),
      tglOrder: parseSheetDateISO(getCellValue(row, iTglOrder, '')),
      stage,
      subStagePersiapan,
      isClosed,
    });
  }

  return parsed;
}
