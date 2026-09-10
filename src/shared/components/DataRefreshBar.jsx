import React from 'react';
import { RefreshCw, Clock } from 'lucide-react';

function formatDateTime(date) {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '-';
  }
}

export function DataRefreshBar({ lastUpdated, onRefresh, label = 'Data' }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2.5">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Clock className="w-3.5 h-3.5 text-sky-400" />
        <span>
          {label} diperbarui: <strong className="text-slate-200 font-medium">{formatDateTime(lastUpdated)}</strong>
        </span>
      </div>
      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-medium rounded-lg transition-colors shrink-0 self-start sm:self-auto"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Refresh {label}
      </button>
    </div>
  );
}
