import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { RegionLayout } from './routes/RegionLayout';
import { NodeBPage } from './modules/nodeb/NodeBPage';
import { HemPage } from './modules/hem/HemPage';
import { OloPage } from './modules/olo/OloPage';
import { QeRelokPage } from './modules/qerelok/QeRelokPage';
import { SummaryPage } from './routes/SummaryPage';

function RouteWrapper() {
  const { regional = 'all', module = 'hem' } = useParams();

  if (module === 'node-b') {
    return <NodeBPage regional={regional} />;
  }
  if (module === 'hem') {
    return <HemPage regional={regional} />;
  }
  if (module === 'olo') {
    return <OloPage regional={regional} />;
  }
  if (module === 'qerelok') {
    return <QeRelokPage regional={regional} />;
  }
  if (module === 'summary') {
    return <SummaryPage />;
  }

  return <Navigate to={`/${regional}/hem`} replace />;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/all/hem" replace />} />
        <Route path="/:regional" element={<RegionLayout />}>
          <Route index element={<Navigate to="hem" replace />} />
          <Route path=":module" element={<RouteWrapper />} />
        </Route>
        <Route path="*" element={<Navigate to="/all/hem" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
