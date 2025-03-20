import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerificationPage from './pages/VerificationPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import PollingStationPage from './pages/PollingStationPage';
import BlockchainVerificationPage from './pages/BlockchainVerificationPage';
import PollingStationsPage from './pages/PollingStationsPage';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AnalyticsProvider>
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verification" element={
                <ProtectedRoute>
                  <VerificationPage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/polling-stations/:stationId" element={
                <ProtectedRoute adminOnly>
                  <PollingStationPage />
                </ProtectedRoute>
              } />
              <Route path="/polling-stations" element={
                <ProtectedRoute adminOnly>
                  <PollingStationsPage />
                </ProtectedRoute>
              } />
              <Route path="/blockchain-verification" element={
                <ProtectedRoute adminOnly>
                  <BlockchainVerificationPage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </AnalyticsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 