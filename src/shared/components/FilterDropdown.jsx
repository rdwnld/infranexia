import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export function FilterDropdown({
  label = 'Filter',
  items = [], // Array of { name, count }
  selectedSet = new Set(), // Set of selected names
  onToggleItem,
  onSelectAll,
  onDeselectAll,
  icon: Icon,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(item => item.name.toLowerCase().includes(q));
  }, [items, search]);

  const allSelected = items.length > 0 && items.every(item => selectedSet.has(item.name));
  const someSelected = selectedSet.size > 0 && !allSelected;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      if (onDeselectAll) onDeselectAll();
    } else {
      if (onSelectAll) onSelectAll(items.map(i => i.name));
    }
  };

  const selectedCount = selectedSet.size;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all shadow-sm ${
          selectedCount > 0
            ? 'bg-sky-600 border-sky-500 text-white shadow-md'
            : 'bg-white dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
      >
        {Icon && <Icon className="w-3.5 h-3.5 opacity-80" />}
        <span>{label}</span>
        {selectedCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
            {selectedCount}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-1" />
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <span>{label}</span>
            <span className="text-slate-400 font-normal lowercase">Record Count</span>
          </div>

          {/* Search Bar */}
          <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to search"
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                autoFocus
              />
            </div>
          </div>

          {/* Select All Option */}
          <div
            onClick={handleToggleSelectAll}
            className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-4 h-4 rounded flex items-center justify-center border ${allSelected ? 'bg-sky-600 border-sky-600 text-white' : someSelected ? 'bg-sky-600/50 border-sky-600 text-white' : 'border-slate-400 dark:border-slate-600'}`}>
                {allSelected ? <Check className="w-3 h-3 stroke-[3]" /> : someSelected ? <div className="w-2 h-2 bg-white rounded-sm" /> : null}
              </div>
              <span>(Pilih Semua)</span>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">
              {items.reduce((s, i) => s + i.count, 0)}
            </span>
          </div>

          {/* Scrollable Items List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800/40">
            {filteredItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">Tidak ditemukan</div>
            ) : (
              filteredItems.map(item => {
                const isChecked = selectedSet.has(item.name);
                return (
                  <div
                    key={item.name}
                    onClick={() => onToggleItem(item.name)}
                    className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-4 h-4 rounded shrink-0 flex items-center justify-center border ${isChecked ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-400 dark:border-slate-600'}`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px] shrink-0 ml-2">
                      {item.count}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;