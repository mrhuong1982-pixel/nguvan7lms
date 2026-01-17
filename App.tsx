
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import AdminLayout from './pages/admin/AdminLayout';
import StudentLayout from './pages/student/StudentLayout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/app/*" element={<StudentLayout />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
