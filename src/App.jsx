import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { RegionLayout } from './routes/RegionLayout';
import { NodeBPage } from './modules/nodeb/NodeBPage';
import { HemPage } from './modules/hem/HemPage';
import { OloPage } from './modules/olo/OloPage';

function RouteWrapper() {
  const { regional = 'all', module = 'node-b' } = useParams();

  if (module === 'node-b') {
    return <NodeBPage regional={regional} />;
  }
  if (module === 'hem') {
    return <HemPage regional={regional} />;
  }
  if (module === 'olo') {
    return <OloPage regional={regional} />;
  }

  return <Navigate to={`/${regional}/node-b`} replace />;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/all/node-b" replace />} />
        <Route path="/:regional" element={<RegionLayout />}>
          <Route index element={<Navigate to="node-b" replace />} />
          <Route path=":module" element={<RouteWrapper />} />
        </Route>
        <Route path="*" element={<Navigate to="/all/node-b" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
