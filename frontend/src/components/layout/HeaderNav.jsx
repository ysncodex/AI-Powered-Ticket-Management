import React, { useState } from 'react';
import useAuthStore from '../../features/auth/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  User,
  Shield,
} from 'lucide-react';

const HeaderNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = {
    Customer: [
      { label: 'Dashboard', path: '/', icon: Home },
      { label: 'My Profile', path: '/profile', icon: User },
    ],
    Agent: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Tickets', path: '/agent-dashboard', icon: Users },
      { label: 'My Profile', path: '/profile', icon: User },
    ],
    Admin: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Users', path: '/admin', icon: Users },
      { label: 'My Profile', path: '/profile', icon: User },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  };

  const currentNavItems = navItems[user?.role] || navItems.Customer;

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">
              🎫
            </div>
            <span className="font-bold text-lg hidden sm:inline">TicketHub</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-medium text-sm ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center font-bold text-sm">
                {user?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-300 capitalize">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-200 hover:text-white"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all font-medium ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};

export default HeaderNav;
