import { colIndex, getCellValue } from '../../shared/data/columnLookup';
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

/**
 * Normalize regional code to standard route badges: SUMBAGUT->SBU, SUMBAGTENG->SBT, SUMBAGSEL->SBS
 */
function normalizeRegion(raw) {
  if (!raw) return 'ALL';
  const str = String(raw).trim().toUpperCase();
  if (str.includes('SUMBAGUT') || str === 'SBU') return 'SBU';
  if (str.includes('SUMBAGTENG') || str === 'SBT') return 'SBT';
  if (str.includes('SUMBAGSEL') || str === 'SBS') return 'SBS';
  return str;
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
      tglOrder: getCellValue(row, iTglOrder, ''),
      stage,
      subStagePersiapan,
      isClosed,
    });
  }

  return parsed;
}
