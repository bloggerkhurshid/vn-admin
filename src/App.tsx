import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SuperAdminRoute } from './components/SuperAdminRoute';
import { Layout } from './components/Layout';

import { Login } from './pages/Login';
import { SetPassword } from './pages/SetPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { TemplatesList } from './pages/TemplatesList';
import { TemplateForm } from './pages/TemplateForm';
import { AdminsManagement } from './pages/AdminsManagement';
import { UsersList } from './pages/UsersList';
import { Profile } from './pages/Profile';
import { AppSettings } from './pages/AppSettings';
import { CategoriesPage } from './pages/CategoriesPage';

import { ThemeProvider } from './context/ThemeContext';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/set-password/:token" element={<SetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/templates" element={<TemplatesList />} />
              <Route path="/templates/new" element={<TemplateForm />} />
              <Route path="/templates/edit/:id" element={<TemplateForm />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/users" element={<UsersList />} />
              <Route path="/settings" element={<AppSettings />} />
              <Route path="/profile" element={<Profile />} />

              {/* Super Admin Restricted Route */}
              <Route element={<SuperAdminRoute />}>
                <Route path="/admins" element={<AdminsManagement />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback Catch-All Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
