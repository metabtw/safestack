/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Scan } from './pages/Scan';
import { NewStack } from './pages/NewStack';
import { StackDetail } from './pages/StackDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="scan" element={<Scan />} />
          <Route path="stack/new" element={<NewStack />} />
          <Route path="stack/:id" element={<StackDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
