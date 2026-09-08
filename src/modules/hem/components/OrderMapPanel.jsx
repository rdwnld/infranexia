import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';

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

// STO coordinates lookup dictionary for Regional Sumatera
const STO_COORDINATES = {
  BGO: { lat: -3.2000, lng: 101.8597 },
  ANP: { lat: 2.4365, lng: 99.7639 },
  BKN: { lat: -0.0941, lng: 101.1518 },
  BKR: { lat: -0.1006, lng: 101.1184 },
  BKG: { lat: 4.2813, lng: 100.9250 },
  BST: { lat: 2.9600, lng: 99.0600 },
  PDT: { lat: -2.9900, lng: 104.7500 },
  KAG: { lat: -3.2500, lng: 104.8000 },
  PPN: { lat: 1.6800, lng: 101.4500 },
  DUM: { lat: 1.6667, lng: 101.4500 },
};

export function OrderMapPanel({ filteredRows = [], moduleTitle = 'HEM' }) {
  const mapData = useMemo(() => {
    const points = [];
    filteredRows.forEach(r => {
      const coords = STO_COORDINATES[r.sto];
      if (coords) {
        points.push({
          id: r.id,
          namaLop: r.namaLop,
          district: r.district,
          stage: r.stage,
          subkon: r.subkon,
          lat: coords.lat,
          lng: coords.lng,
          isClosed: r.isClosed,
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
            Lokasi geografis ({mapData.length} order terhubung dengan titik STO)
          </p>
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
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={6}
              pathOptions={{
                color: p.isClosed ? '#10b981' : '#f59e0b',
                fillColor: p.isClosed ? '#10b981' : '#f59e0b',
                fillOpacity: 0.8,
                weight: 1.5,
              }}
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
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
