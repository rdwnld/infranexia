import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Memuat data dari Google Sheets...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl">
      <Loader2 className="w-8 h-8 text-sky-600 dark:text-sky-400 animate-spin mb-3" />
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{message}</p>
    </div>
  );
}
