import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { statusPinIcon } from '../../../shared/components/mapPins';

const STATUS_MARKER_COLORS = {
  CLOSED: '#10b981',
  OPEN: '#3b82f6',
  KENDALA: '#f59e0b',
  DROP: '#ef4444',
  UNKNOWN: '#64748b',
};

// Status bermasalah dapat pulse perhatian di peta
const PULSE_STATUSES = new Set(['KENDALA', 'DROP']);

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

/**
 * Enable zoom only when Ctrl + Mouse Scroll Wheel is pressed
 */
function CtrlScrollZoom() {
  const map = useMap();

  useEffect(() => {
    map.scrollWheelZoom.disable();

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        map.scrollWheelZoom.enable();
      } else {
        map.scrollWheelZoom.disable();
      }
    };

    const container = map.getContainer();
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [map]);

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
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 font-semibold text-lg">Peta Sebaran Site</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Lokasi geografis ({mapData.length} site dengan koordinat valid)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="nx-legend-pin bg-emerald-500" /> Closed
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="nx-legend-pin bg-blue-500" /> Open
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="nx-legend-pin bg-amber-500" /> Kendala
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="nx-legend-pin bg-rose-500" /> Drop
          </span>
        </div>
      </div>

      <div className="h-[500px] w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 relative z-0">
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
              icon={statusPinIcon(STATUS_MARKER_COLORS[p.status] || '#64748b', {
                pulse: PULSE_STATUSES.has(p.status),
              })}
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
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
