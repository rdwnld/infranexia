import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { STAGES } from '../hem.stageRules';
import { statusPinIcon } from '../../../shared/components/mapPins';

function ChangeView({ bounds }) {
  const map = useMap();
  if (bounds && bounds.length > 0) {
    try {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
    } catch {
      // Ignore map bounds fit error
    }
  }
  return null;
}

// District coordinates lookup dictionary for all 17 Districts in Regional Sumatera (inland coordinates)
const DISTRICT_COORDINATES = {
  'BANDA ACEH': { lat: 5.5350, lng: 95.3400 },
  'BATAM': { lat: 1.1000, lng: 104.0200 },
  'BENGKULU': { lat: -3.8000, lng: 102.2800 },
  'BINJAI': { lat: 3.6000, lng: 98.4900 },
  'BUKIT TINGGI': { lat: -0.3056, lng: 100.3692 },
  'BUKITTINGGI': { lat: -0.3056, lng: 100.3692 },
  'DUMAI': { lat: 1.6600, lng: 101.4600 },
  'JAMBI': { lat: -1.6100, lng: 103.6100 },
  'LAMPUNG': { lat: -5.4200, lng: 105.2600 },
  'MEDAN': { lat: 3.5952, lng: 98.6722 },
  'PADANG': { lat: -0.9300, lng: 100.3800 },
  'PADANG SIDEMPUAN': { lat: 1.3733, lng: 99.2694 },
  'PALEMBANG': { lat: -2.9909, lng: 104.7565 },
  'PANGKAL PINANG': { lat: -2.1306, lng: 106.1108 },
  'PEKANBARU': { lat: 0.5071, lng: 101.4478 },
  'PEMATANG SIANTAR': { lat: 2.9600, lng: 99.0600 },
  'RANTAU PRAPAT': { lat: 2.0983, lng: 99.8292 },
  'SUMUT': { lat: 3.5952, lng: 98.6722 },
  'RIDAR': { lat: 0.5071, lng: 101.4478 },
  'SUMSEL': { lat: -2.9909, lng: 104.7565 },
};

function getMarkerColor(stage, isClosed) {
  if (stage === STAGES.APPROVED_DROP || stage === STAGES.PROPOSED_DROP) {
    return '#ef4444'; // red (Drop)
  }
  if (isClosed || stage === STAGES.GOLIVE_UT) {
    return '#10b981'; // emerald (Golive)
  }
  return '#3b82f6'; // blue (In Progres)
}

// Compact jitter offset (max ~2.5 km) so points stay within district land area
function getJitter(idStr, index) {
  let hash = 0;
  const str = String(idStr || index);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = (((Math.abs(hash) % 1000) / 1000) - 0.5) * 0.025;
  const lngOffset = (((Math.abs(hash * 31) % 1000) / 1000) - 0.5) * 0.025;
  return { latOffset, lngOffset };
}

export function OrderMapPanel({ filteredRows = [], moduleTitle = 'HEM' }) {
  const mapData = useMemo(() => {
    const points = [];
    filteredRows.forEach((r, idx) => {
      const dist = (r.district || '').trim().toUpperCase();
      const coords = DISTRICT_COORDINATES[dist] || DISTRICT_COORDINATES['PEKANBARU'];

      if (coords) {
        const { latOffset, lngOffset } = getJitter(r.id || r.namaLop, idx);
        points.push({
          id: r.id,
          namaLop: r.namaLop,
          district: r.district,
          stage: r.stage,
          subkon: r.subkon,
          lat: coords.lat + latOffset,
          lng: coords.lng + lngOffset,
          isClosed: r.isClosed,
          color: getMarkerColor(r.stage, r.isClosed),
        });
      }
    });
    return points;
  }, [filteredRows]);

  const bounds = useMemo(() => {
    if (mapData.length === 0) return [];
    return mapData.map(p => [p.lat, p.lng]);
  }, [mapData]);

  const defaultCenter = [0.5071, 101.4478];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg mb-6 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Peta Sebaran Order {moduleTitle}</h2>
          <p className="text-xs text-slate-400">
            Lokasi geografis ({mapData.length} order terkelompokkan per District)
          </p>
        </div>

        {/* Legend Header */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="nx-legend-pin bg-emerald-500" /> Golive/UT
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="nx-legend-pin bg-blue-500" /> In Progres
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="nx-legend-pin bg-rose-500" /> Drop
          </span>
        </div>
      </div>

      <div className="h-[500px] w-full rounded-lg overflow-hidden border border-slate-800 relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={6}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', background: '#0f172a' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {bounds.length > 0 && <ChangeView bounds={bounds} />}
          {mapData.map(p => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={statusPinIcon(p.color, {
                pulse: p.stage === STAGES.APPROVED_DROP || p.stage === STAGES.PROPOSED_DROP,
              })}
            >
              <Popup>
                <div className="text-slate-900 font-sans text-xs">
                  <p className="font-bold text-sm mb-0.5">{p.namaLop}</p>
                  <p className="text-slate-600 mb-1">District: {p.district} • Subkon: {p.subkon}</p>
                  <span className="font-semibold px-1.5 py-0.5 bg-slate-100 rounded border text-[10px]">
                    {p.stage}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
