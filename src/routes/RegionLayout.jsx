import React, { useState } from 'react';
import { NavLink, useParams, useNavigate, Outlet } from 'react-router-dom';
import { RefreshCw, Radio, Layers, Network, MapPin, LayoutDashboard, Sun, Moon, Menu, X } from 'lucide-react';
import { REGIONS, getRegionInfo } from '../regions/regionConfig';
import { useTheme } from '../shared/theme/ThemeContext';

const MODULES = [
  { key: 'node-b', label: 'Modul NODE B', icon: Radio, active: 'border-sky-400 text-sky-600 dark:text-sky-300 bg-sky-500/10' },
  { key: 'hem', label: 'Modul HEM', icon: Layers, active: 'border-emerald-400 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10' },
  { key: 'olo', label: 'Modul OLO', icon: MapPin, active: 'border-purple-400 text-purple-600 dark:text-purple-300 bg-purple-500/10' },
  { key: 'summary', label: 'Ringkasan', icon: LayoutDashboard, active: 'border-amber-400 text-amber-600 dark:text-amber-300 bg-amber-500/10' },
];

export function RegionLayout() {
  const { regional = 'all', module = 'node-b' } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentRegion = getRegionInfo(regional);

  const handleRegionChange = (newReg) => {
    navigate(`/${newReg}/${module}`);
    setSidebarOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
          <Network className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            INFRANEXIA
          </h1>
          <p className="text-[10px] font-mono text-sky-600 dark:text-sky-400">Regional Sumatera</p>
        </div>
      </div>

      {/* Regional Selector */}
      <div className="px-4 mt-2">
        <p className="px-1 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Wilayah
        </p>
        <div className="flex flex-col gap-1 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
          {REGIONS.map((reg) => (
            <button
              key={reg.key}
              onClick={() => handleRegionChange(reg.key)}
              className={`px-3 py-2 rounded-md text-xs font-semibold text-left transition-all ${
                regional.toLowerCase() === reg.key
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {reg.badge}
              <span className="block text-[10px] font-normal opacity-70 truncate">{reg.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Module Navigation */}
      <div className="px-4 mt-5">
        <p className="px-1 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Modul
        </p>
        <nav className="flex flex-col gap-1">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <NavLink
                key={mod.key}
                to={`/${regional}/${mod.key}`}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 text-xs font-semibold border-l-2 rounded-r-lg transition-all flex items-center gap-2.5 ${
                    isActive
                      ? mod.active
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" /> {mod.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom actions */}
      <div className="mt-auto p-4 flex items-center gap-2 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={toggleTheme}
          className="flex-1 p-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5"
          title={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          <span className="hidden xl:inline">{theme === 'dark' ? 'Terang' : 'Gelap'}</span>
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 p-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5"
          title="Refresh Data Live"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Refresh</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Buka menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
              <Network className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight truncate">
                INFRANEXIA
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {currentRegion.name}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors shrink-0"
            title={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out overflow-y-auto custom-scrollbar ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-3 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
          title="Tutup menu"
        >
          <X className="w-4 h-4" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        <main className="px-4 py-6 w-full">
          <div className="mb-4 hidden lg:flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              Wilayah Aktif: <span className="text-sky-600 dark:text-sky-400 font-bold">{currentRegion.name}</span>
            </h2>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
