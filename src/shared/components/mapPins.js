import L from 'leaflet';

/**
 * Pin penanda peta gaya menara sinyal untuk dashboard deployment.
 * Warna mengikuti status; pulse untuk status yang butuh perhatian (drop/kendala).
 *
 * @param {string} color - hex warna pin, mis. '#10b981'
 * @param {{ pulse?: boolean }} opts
 */
export function statusPinIcon(color = '#64748b', opts = {}) {
  const { pulse = false } = opts;
  const html = `
    <div class="nx-pin">
      ${pulse ? `<div class="nx-pin-pulse" style="border-color:${color}"></div>` : ''}
      <div class="nx-pin-shape" style="background:${color}"></div>
      <div class="nx-pin-dot"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'nx-pin-wrap',
    iconSize: [26, 36],
    iconAnchor: [13, 34],
    popupAnchor: [0, -30],
  });
}
