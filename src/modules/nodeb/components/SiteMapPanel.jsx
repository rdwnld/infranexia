import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';

const STATUS_MARKER_COLORS = {
  CLOSED: '#10b981',
  OPEN: '#3b82f6',
  KENDALA: '#f59e0b',
  DROP: '#ef4444',
  UNKNOWN: '#64748b',
};

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

export function SiteMapPanel({ filteredRows = [], onSelectSite }) {
  const mapData = useMemo(() => {
    const points = [];
    filteredRows.forEach(r => {
      if (r.lat && r.lng) {
        points.push({
          id: r.id,
          siteId: r.siteId,
          siteName: r.siteName,
          district: r.district,
          status: r.statusLapangan,
          progres: r.progresLapangan,
          lat: r.lat,
          lng: r.lng,
        });
      }
    });
    return points;
  }, [filteredRows]);

  const bounds = useMemo(() => {
    if (mapData.length === 0) return [];
    return mapData.map(p => [p.lat, p.lng]);
  }, [mapData]);

  // Default center: Regional Sumatera (around Pekanbaru / Padang)
  const defaultCenter = [0.5071, 101.4478];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Peta Sebaran Site</h2>
          <p className="text-xs text-slate-400">
            Lokasi geografis ({mapData.length} site dengan koordinat valid)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Closed
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Open
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Kendala
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Drop
          </span>
        </div>
      </div>

      <div className="h-80 w-full rounded-lg overflow-hidden border border-slate-800 relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={6}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%', background: '#0f172a' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {bounds.length > 0 && <ChangeView bounds={bounds} />}
          {mapData.map(p => (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={5}
              pathOptions={{
                color: STATUS_MARKER_COLORS[p.status] || '#64748b',
                fillColor: STATUS_MARKER_COLORS[p.status] || '#64748b',
                fillOpacity: 0.8,
                weight: 1.5,
              }}
            >
              <Popup>
                <div className="text-slate-900 font-sans text-xs">
                  <p className="font-bold text-sm mb-0.5">{p.siteId} — {p.siteName}</p>
                  <p className="text-slate-600 mb-1">District: {p.district}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="font-semibold px-1.5 py-0.5 bg-slate-100 rounded border text-[10px]">
                      {p.status}
                    </span>
                    <span className="text-slate-500">{p.progres}</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
