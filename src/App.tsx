import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import VerificationPage from './pages/VerificationPage';
import AdminDashboard from './pages/AdminDashboard';
import PollingStationPage from './pages/PollingStationPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a73e8', // Google blue
      light: '#4285f4',
      dark: '#0d47a1',
    },
    secondary: {
      main: '#34a853', // Google green
      light: '#4caf50',
      dark: '#1b5e20',
    },
    error: {
      main: '#ea4335', // Google red
    },
    warning: {
      main: '#fbbc04', // Google yellow
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="verification" element={
                <ProtectedRoute>
                  <VerificationPage />
                </ProtectedRoute>
              } />
              <Route path="admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="polling-station/:id" element={
                <ProtectedRoute>
                  <PollingStationPage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 