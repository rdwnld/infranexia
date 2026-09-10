/**
 * regionConfig.js — Definisi sub-regional + mapping Branch/District → Regional.
 * Satu-satunya sumber kebenaran untuk kode regional di seluruh dashboard.
 * Hasil Data Discovery (skill.md §6.2): kolom REGION berbeda antar tab.
 */

export const REGIONS = [
  { key: 'all', badge: 'ALL', name: 'Semua Sumatera' },
  { key: 'sbu', badge: 'SBU', name: 'Sumatera Bagian Utara (SBU)' },
  { key: 'sbt', badge: 'SBT', name: 'Sumatera Bagian Tengah (SBT)' },
  { key: 'sbs', badge: 'SBS', name: 'Sumatera Bagian Selatan (SBS)' },
];

/** Badge regional standar: SBU / SBT / SBS */
export const REGION_BADGES = ['SBU', 'SBT', 'SBS'];

/**
 * Mapping nilai kolom REGION mentah dari sheet → badge standar.
 * - Tab NODE B memakai SBU/SBT/SBS langsung.
 * - Tab HEM/OLO memakai SUMBAGUT/SUMBAGTENG/SUMBAGSEL.
 */
const RAW_TO_BADGE = {
  SBU: 'SBU',
  SBT: 'SBT',
  SBS: 'SBS',
  SUMBAGUT: 'SBU',
  SUMBAGTENG: 'SBT',
  SUMBAGSEL: 'SBS',
};

export function normalizeRegionCode(raw) {
  if (!raw) return '';
  const str = String(raw).trim().toUpperCase();
  if (RAW_TO_BADGE[str]) return RAW_TO_BADGE[str];
  if (str.includes('SUMBAGUT')) return 'SBU';
  if (str.includes('SUMBAGTENG')) return 'SBT';
  if (str.includes('SUMBAGSEL')) return 'SBS';
  return str;
}

export function getRegionInfo(key) {
  const normalized = String(key || 'all').toLowerCase();
  return REGIONS.find(r => r.key === normalized) || REGIONS[0];
}
