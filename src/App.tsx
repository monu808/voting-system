import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
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
import IndianPollingStations from './pages/PollingStationPage';
import BlockchainVerificationPage from './pages/BlockchainVerificationPage';
import PollingStationsPage from './pages/PollingStationsPage';
// Import for side effects - voterService initializes polling stations in its constructor
import voterService from './services/voterService';

const App: React.FC = () => {
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Initialize polling stations
  useEffect(() => {
    const checkDataLoaded = () => {
      const stations = voterService.getAllPollingStations();
      if (stations.length > 0) {
        setDataLoaded(true);
      } else {
        // Check again after a delay
        setTimeout(checkDataLoaded, 500);
      }
    };
    
    // Start checking for data load
    checkDataLoaded();
    
    console.log("App initialized and waiting for polling stations data");
  }, []);

  if (!dataLoaded) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column'
          }}
        >
          <CircularProgress />
          <Box sx={{ mt: 2 }}>Loading polling station data...</Box>
        </Box>
      </ThemeProvider>
    );
  }

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
                  <IndianPollingStations />
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