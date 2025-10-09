import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import './App.css';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import PaymentForm from './components/PaymentForm';
import CustomerPortal from './components/CustomerPortal';
import TransactionHistory from './components/TransactionHistory';
import PaymentMethods from './components/PaymentMethods';
import PendingTransactions from './components/PendingTransactions';
import { ErrorBoundary } from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import AppLayout from './components/AppLayout';
import RoleRoute from './components/RoleRoute';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4f86e2' },
    secondary: { main: '#7a8aa0' },
    background: { default: '#0b1020', paper: 'rgba(255, 255, 255, 0.06)' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegistrationForm />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                {/* Customer routes */}
                <Route path="/payment" element={<RoleRoute required="customer"><CustomerPortal /></RoleRoute>} />
                <Route path="/transactions" element={<RoleRoute required="customer"><TransactionHistory /></RoleRoute>} />
                <Route path="/methods" element={<RoleRoute required="customer"><PaymentMethods /></RoleRoute>} />
                {/* Employee routes */}
                <Route path="/pending" element={<RoleRoute required="employee"><PendingTransactions /></RoleRoute>} />
              </Route>
              
              {/* Redirect root to login if not authenticated */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
