import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../features/auth/authStore';
import { logout as callLogoutAPI } from '../../features/auth/authApi';
import { Ticket, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout: clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await callLogoutAPI(); // Call logout API
    } catch (error) {
      console.error('Logout API failed', error);
    } finally {
      clearAuth(); // Clear auth state (also clears localStorage)
      navigate('/signin');
    }
  };

  if (!isAuthenticated) return null; // Don't show navbar on login/register screens

  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tight hover:text-brand-400 transition-colors"
        >
          <Ticket className="w-6 h-6 text-brand-500" />
          AI Triage Desk
        </Link>

        {/* User Menu */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <UserIcon className="w-4 h-4" />
            <span>
              {user?.name} <span className="text-slate-500 hidden sm:inline">({user?.role})</span>
            </span>
          </div>

          {user?.role === 'Admin' && (
            <Link
              to="/admin"
              className="text-sm font-semibold bg-brand-600 hover:bg-brand-500 px-3 py-1.5 rounded-md transition-colors"
            >
              Admin Portal
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
