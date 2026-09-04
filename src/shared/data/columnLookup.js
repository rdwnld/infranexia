/**
 * Column Lookup Helper
 * Cari index kolom berdasarkan nama header (case-insensitive & trim),
 * dengan fallback index dan log warning jika fallback terpakai.
 */
export function colIndex(cols, exactHeaderLabel, fallbackIndex = -1) {
  if (!cols || !Array.isArray(cols)) return fallbackIndex;

  const target = exactHeaderLabel.trim().toLowerCase();
  const foundIndex = cols.findIndex(col => {
    if (!col) return false;
    const label = (col.label || col.id || '').trim().toLowerCase();
    return label === target;
  });

  if (foundIndex !== -1) {
    return foundIndex;
  }

  if (fallbackIndex !== -1) {
    console.warn(`[columnLookup] Header "${exactHeaderLabel}" tidak ditemukan. Menggunakan fallback index: ${fallbackIndex}`);
  }

  return fallbackIndex;
}

/**
 * Get cell raw value or formatted value safely
 */
export function getCellValue(row, index, defaultValue = '') {
  if (!row || !row.c || index < 0 || index >= row.c.length) {
    return defaultValue;
  }
  const cell = row.c[index];
  if (!cell) return defaultValue;

  if (cell.v !== null && cell.v !== undefined) {
    return cell.v;
  }
  if (cell.f !== null && cell.f !== undefined) {
    return cell.f;
  }
  return defaultValue;
}
