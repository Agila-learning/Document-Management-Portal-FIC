import React, { useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './App.css';

import Documents from './pages/Documents';
import Candidates from './pages/Candidates';
import Categories from './pages/Categories';
import Alerts from './pages/Alerts';
import Archive from './pages/Archive';
import RecycleBin from './pages/RecycleBin';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/documents" 
            element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/candidates" 
            element={
              <ProtectedRoute>
                <Candidates />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/categories" 
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/alerts" 
            element={
              <ProtectedRoute>
                <Alerts />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/archive" 
            element={
              <ProtectedRoute>
                <Archive />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/trash" 
            element={
              <ProtectedRoute>
                <RecycleBin />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />

          {/* Catch all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
