import React from 'react';
import { Layers } from 'lucide-react';

export function HemPage({ regional }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
      <Layers className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
      <h2 className="text-xl font-bold text-slate-100 mb-1">Modul HEM ({regional.toUpperCase()})</h2>
      <p className="text-slate-400 text-sm max-w-md mx-auto">
        Modul HEM siap untuk diimplementasikan di Fase 2. Data Discovery telah selesai.
      </p>
    </div>
  );
}
