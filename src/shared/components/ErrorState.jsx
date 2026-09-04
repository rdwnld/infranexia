import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorState({ message = 'Terjadi kesalahan saat memuat data', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-rose-950/20 border border-rose-800/40 rounded-xl text-center">
      <AlertTriangle className="w-10 h-10 text-rose-400 mb-3" />
      <h3 className="text-rose-200 font-semibold text-lg mb-1">Gagal Memuat Data</h3>
      <p className="text-slate-400 text-sm mb-4 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      )}
    </div>
  );
}
