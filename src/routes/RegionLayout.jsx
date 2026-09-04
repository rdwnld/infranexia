import React from 'react';
import { NavLink, useParams, useNavigate, Outlet } from 'react-router-dom';
import { RefreshCw, Radio, Layers, Network, MapPin } from 'lucide-react';

const REGION_CONFIG = {
  all: { name: 'Semua Sumatera', badge: 'ALL' },
  sbu: { name: 'Sumatera Bagian Utara (SBU)', badge: 'SBU' },
  sbt: { name: 'Sumatera Bagian Tengah (SBT)', badge: 'SBT' },
  sbs: { name: 'Sumatera Bagian Selatan (SBS)', badge: 'SBS' },
};

export function RegionLayout() {
  const { regional = 'all', module = 'node-b' } = useParams();
  const navigate = useNavigate();

  const currentRegion = REGION_CONFIG[regional.toLowerCase()] || REGION_CONFIG.all;

  const handleRegionChange = (newReg) => {
    navigate(`/${newReg}/${module}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-2">
                INFRANEXIA
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
                  Regional Sumatera
                </span>
              </h1>
              <p className="text-xs text-slate-400">Dashboard Monitoring Deployment Jaringan Live</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Regional Selector */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              {Object.entries(REGION_CONFIG).map(([key, reg]) => (
                <button
                  key={key}
                  onClick={() => handleRegionChange(key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    regional.toLowerCase() === key
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {reg.badge}
                </button>
              ))}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5"
              title="Refresh Data Live"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Secondary Module Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 border-t border-slate-800/60 pt-2 pb-0">
          <NavLink
            to={`/${regional}/node-b`}
            className={({ isActive }) =>
              `px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                isActive
                  ? 'border-sky-400 text-sky-300 bg-sky-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Radio className="w-4 h-4" /> Modul NODE B
          </NavLink>

          <NavLink
            to={`/${regional}/hem`}
            className={({ isActive }) =>
              `px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                isActive
                  ? 'border-emerald-400 text-emerald-300 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Layers className="w-4 h-4" /> Modul HEM
          </NavLink>

          <NavLink
            to={`/${regional}/olo`}
            className={({ isActive }) =>
              `px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                isActive
                  ? 'border-purple-400 text-purple-300 bg-purple-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <MapPin className="w-4 h-4" /> Modul OLO
          </NavLink>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            Wilayah Aktif: <span className="text-sky-400 font-bold">{currentRegion.name}</span>
          </h2>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
