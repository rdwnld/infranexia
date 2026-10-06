import { colIndex, getCellValue } from '../../shared/data/columnLookup';
import { normalizeRegionCode } from '../../regions/regionConfig';

function cleanDistrict(raw) {
  if (!raw) return 'UNKNOWN';
  return String(raw)
    .trim()
    .replace(/[\r\n]+/g, '')
    .toUpperCase();
}

function parseNumber(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
  return isNaN(num) ? 0 : num;
}

/**
 * Parse raw table from Google Sheets for QE Relok (gid=1937238989)
 */
export function parseQeRelokRows(table) {
  if (!table || !table.cols || !table.rows) return [];

  const cols = table.cols;

  const iNo = colIndex(cols, 'NO', 0);
  const iRegion = colIndex(cols, 'REGION', 1);
  const iDistrict = colIndex(cols, 'DISTRICT TIF', 2);
  const iSto = colIndex(cols, 'STO', 3);
  const iNamaLop = colIndex(cols, 'NAMA LOP', 4);
  const iBatch = colIndex(cols, 'BATCH', 5);
  const iIdDigasss = colIndex(cols, 'ID DIGASSS', 6);
  const iNilaiPlan = colIndex(cols, 'NILAI PLAN', 7);
  const iNilaiRealisasi = colIndex(cols, 'NILAI REALISASI', 8);
  const iTahunPengerjaan = colIndex(cols, 'TAHUN PENGERJAAN', 9);
  const iStatusProgres = colIndex(cols, 'STATUS PROGRES', 16);
  const iDetailStatus = colIndex(cols, 'DETAIL STATUS', 17);
  const iTimWaspang = colIndex(cols, 'Tim Waspang', 19);
  const iTimUt = colIndex(cols, 'Tim UT', 20);
  const iSubconTa = colIndex(cols, 'SUBCON TA', 23);
  const iKlasifikasiLop = colIndex(cols, 'KLASIFIKASI LOP', 37);
  const iDurasiQe = colIndex(cols, 'DURASI QE', 38);
  const iDueDate = colIndex(cols, 'DUE DATE', 39);

  const parsed = [];

  for (let r = 0; r < table.rows.length; r++) {
    const row = table.rows[r];
    if (!row || !row.c) continue;

    const namaLop = String(getCellValue(row, iNamaLop, '')).trim();
    const idDigasss = String(getCellValue(row, iIdDigasss, '')).trim();
    const districtRaw = String(getCellValue(row, iDistrict, '')).trim();

    // Skip empty rows
    if (!namaLop && !idDigasss && !districtRaw) continue;

    const regionRaw = String(getCellValue(row, iRegion, '')).trim();
    const region = normalizeRegionCode(regionRaw) || 'UNKNOWN';
    const district = cleanDistrict(districtRaw);

    const statusProgres = String(getCellValue(row, iStatusProgres, 'UNKNOWN')).trim().toUpperCase() || 'UNKNOWN';
    const isClosed = statusProgres.includes('CLOSED') || statusProgres.startsWith('08');

    parsed.push({
      id: `qerelok-${r}-${namaLop || r}`,
      no: getCellValue(row, iNo, r + 1),
      region, // SBU, SBT, SBS
      district,
      sto: String(getCellValue(row, iSto, '-')).trim().toUpperCase() || '-',
      namaLop: namaLop || `LOP ${r}`,
      batch: String(getCellValue(row, iBatch, 'Tanpa Batch')).trim() || 'Tanpa Batch',
      idDigasss: idDigasss || '-',
      nilaiPlan: parseNumber(getCellValue(row, iNilaiPlan, 0)),
      nilaiRealisasi: parseNumber(getCellValue(row, iNilaiRealisasi, 0)),
      tahunPengerjaan: String(getCellValue(row, iTahunPengerjaan, '2026')).trim() || '2026',
      statusProgres,
      isClosed,
      detailStatus: String(getCellValue(row, iDetailStatus, '')).trim(),
      timWaspang: String(getCellValue(row, iTimWaspang, '-')).trim() || '-',
      timUt: String(getCellValue(row, iTimUt, '-')).trim() || '-',
      subconTa: String(getCellValue(row, iSubconTa, '-')).trim() || '-',
      klasifikasiLop: String(getCellValue(row, iKlasifikasiLop, 'STANDARD')).trim().toUpperCase() || 'STANDARD',
      durasiQe: parseNumber(getCellValue(row, iDurasiQe, 0)),
      dueDate: String(getCellValue(row, iDueDate, '')).trim(),
    });
  }

  return parsed;
}
