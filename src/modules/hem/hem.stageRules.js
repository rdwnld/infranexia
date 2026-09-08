export const STAGES = {
  APPROVED_DROP: 'Approved Drop',
  PROPOSED_DROP: 'Proposed Drop',
  PERSIAPAN: 'Persiapan',
  INSTALASI: 'Instalasi',
  FINISH_INSTALASI: 'Finish Instal',
  BISA_PT1: 'Bisa PT1',
  GOLIVE_UT: 'Golive / UT',
  UNKNOWN: 'Lainnya',
};

export const SUB_STAGES_PERSIAPAN = {
  PERSIAPAN_UMUM: 'Persiapan Umum',
  HOLD: 'Hold',
  AANWIJZING: 'Aanwijzing',
  PERIZINAN: 'Perizinan',
  MATDEL: 'Matdel',
};

/**
 * Classify raw progress string into one of 7 main stages
 */
export function getStage(rawProgress = '') {
  if (!rawProgress) return STAGES.UNKNOWN;
  const str = String(rawProgress).trim().toUpperCase();

  if (str.includes('APPROVED DROP')) return STAGES.APPROVED_DROP;
  if (str.includes('PROPOSED DROP') || str.includes('11 PROPOSED DROP')) return STAGES.PROPOSED_DROP;
  if (str.includes('07 GOLIVE') || str.includes('08 UJI TERIMA') || str.includes('GOLIVE')) return STAGES.GOLIVE_UT;
  if (str.includes('BISA PT1')) return STAGES.BISA_PT1;
  if (str.includes('06 F. INSTALASI') || str.includes('FINISH INSTALASI')) return STAGES.FINISH_INSTALASI;
  if (str.includes('05 INSTALASI') || str.includes('INSTALASI')) return STAGES.INSTALASI;
  
  if (
    str.includes('01 PERSIAPAN') ||
    str.includes('02 AANDWIJZING') ||
    str.includes('03 PERIZINAN') ||
    str.includes('04 MATDEL') ||
    str.includes('10 HOLD') ||
    str.includes('PERSIAPAN')
  ) {
    return STAGES.PERSIAPAN;
  }

  return STAGES.UNKNOWN;
}

/**
 * Get detailed sub-stage for Persiapan
 */
export function getSubStagePersiapan(rawProgress = '') {
  if (!rawProgress) return SUB_STAGES_PERSIAPAN.PERSIAPAN_UMUM;
  const str = String(rawProgress).trim().toUpperCase();

  if (str.includes('10 HOLD') || str.includes('HOLD')) return SUB_STAGES_PERSIAPAN.HOLD;
  if (str.includes('02 AANDWIJZING') || str.includes('AANWIJZING')) return SUB_STAGES_PERSIAPAN.AANWIJZING;
  if (str.includes('03 PERIZINAN') || str.includes('PERIZINAN')) return SUB_STAGES_PERSIAPAN.PERIZINAN;
  if (str.includes('04 MATDEL') || str.includes('MATDEL')) return SUB_STAGES_PERSIAPAN.MATDEL;

  return SUB_STAGES_PERSIAPAN.PERSIAPAN_UMUM;
}

/**
 * Stage order sequence for pipeline flow visualization
 */
export const STAGE_SEQUENCE = [
  STAGES.APPROVED_DROP,
  STAGES.PROPOSED_DROP,
  STAGES.PERSIAPAN,
  STAGES.INSTALASI,
  STAGES.FINISH_INSTALASI,
  STAGES.BISA_PT1,
  STAGES.GOLIVE_UT,
];
