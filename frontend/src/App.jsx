import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import useAuthStore from './features/auth/authStore';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import DashboardHome from './pages/DashboardHome';
import AgentDashboard from './pages/AgentDashboard';
import UserProfile from './pages/UserProfile';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  useEffect(() => {
    // Restore auth state from localStorage on app load
    useAuthStore.getState().initializeAuth();
  }, []);
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

    {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                {/* Customer Dashboard */}
                <Route index element={<DashboardHome />} />

                {/* Ticket Routes */}
                <Route path="tickets/new" element={<CreateTicket />} />
                <Route path="tickets/:id" element={<TicketDetail />} />

                {/* Agent Dashboard - Only for Agents and Admins */}
                <Route path="agent-dashboard" element={<AgentDashboard />} />

                {/* User Profile */}
                <Route path="profile" element={<UserProfile />} />

                {/* Admin Portal - Only for Admins */}
                <Route path="admin" element={<AdminDashboard />} />
              </Route>
            </Route>

            {/* Catch all - Redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
