import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../features/auth/authStore';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  // Wait for localStorage to be checked before redirecting
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, boot them to the login page
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Optional Role-Based Access Control (RBAC) for the frontend
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Access Denied: Insufficient Permissions
      </div>
    );
  }

  // If everything is good, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
