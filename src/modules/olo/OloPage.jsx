import React from 'react';
import { MapPin } from 'lucide-react';

export function OloPage({ regional }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
      <MapPin className="w-12 h-12 text-purple-400 mx-auto mb-3" />
      <h2 className="text-xl font-bold text-slate-100 mb-1">Modul OLO ({regional.toUpperCase()})</h2>
      <p className="text-slate-400 text-sm max-w-md mx-auto">
        Modul OLO siap untuk diimplementasikan di Fase 2. Data Discovery telah selesai.
      </p>
    </div>
  );
}
