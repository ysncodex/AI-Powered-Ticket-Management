import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import useAuthStore from '../../features/auth/authStore';
import { login } from '../../features/auth/authApi';
import { Mail, AlertCircle } from 'lucide-react';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userData = await login(email, password);
      setCredentials(userData); // Save to Zustand store
      navigate('/'); // Redirect to dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>

      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-slate-200 relative z-10">
        <div className="mb-8 text-center">
          <div className="inline-block p-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl mb-4">
            <span className="text-3xl">🎫</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600">Sign in to manage your support tickets</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 flex items-center gap-3 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-600 font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                placeholder="agent@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
              Password
            </label>
            <PasswordInput
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all disabled:opacity-70 flex justify-center items-center gap-2 shadow-md hover:shadow-lg active:scale-95 uppercase tracking-wide"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span> Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
