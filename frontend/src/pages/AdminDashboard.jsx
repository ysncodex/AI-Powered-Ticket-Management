import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllUsers,
  updateUserRole,
  restrictUser,
  unrestrictUser,
} from '../features/users/userApi';
import {
  ShieldCheck,
  User as UserIcon,
  Mail,
  ShieldAlert,
  Lock,
  LockOpen,
  AlertCircle,
} from 'lucide-react';
import useAuthStore from '../features/auth/authStore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Alert from '../components/ui/Alert';
import Pagination from '../components/ui/Pagination';

const AdminDashboard = () => {
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user has permission to access Admin Dashboard
  if (currentUser?.role !== 'Admin') {
    return (
      <div className="p-10 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 mb-6">Only Administrators can access this portal.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // 1. Fetch Users
  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  // 2. Mutation for Role Updates
  const roleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSuccessMessage('User role updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.message || 'Failed to update user role');
      setTimeout(() => setErrorMessage(''), 3000);
    },
  });

  // 3. Restriction Mutations
  const restrictMutation = useMutation({
    mutationFn: restrictUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSuccessMessage('User restricted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.message || 'Failed to restrict user');
      setTimeout(() => setErrorMessage(''), 3000);
    },
  });

  const unrestrictMutation = useMutation({
    mutationFn: unrestrictUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSuccessMessage('User unrestricted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.message || 'Failed to unrestrict user');
      setTimeout(() => setErrorMessage(''), 3000);
    },
  });

  const handleRoleChange = (userId, newRole) => {
    if (userId === currentUser._id) {
      setErrorMessage('You cannot change your own role from this panel.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    roleMutation.mutate({ userId, role: newRole });
  };

  const handleRestrictUser = (userId) => {
    if (userId === currentUser._id) {
      setErrorMessage('You cannot restrict yourself.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    restrictMutation.mutate(userId);
  };

  const handleUnrestrictUser = (userId) => {
    unrestrictMutation.mutate(userId);
  };

  if (isLoading)
    return <div className="p-10 text-center text-slate-500">Loading user database...</div>;
  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        Failed to load users. Are you sure you are an Admin?
      </div>
    );

  // Pagination
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10">
      {successMessage && (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
      )}
      {errorMessage && (
        <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
      )}

      <div className="mb-8 flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-brand-600" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Portal</h1>
          <p className="text-slate-500 mt-1">
            Manage system access, user roles, and account status.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="px-4 py-4">Name</th>
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4 hidden md:table-cell">Registered</th>
                <th className="px-4 py-4">Role</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.map((dbUser) => (
                <tr key={dbUser._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-slate-900 truncate">{dbUser.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm min-w-0">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{dbUser.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-sm text-slate-600 whitespace-nowrap">
                      {new Date(dbUser.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={dbUser.role || 'Customer'}
                      onChange={(e) => handleRoleChange(dbUser._id, e.target.value)}
                      disabled={
                        roleMutation.isPending ||
                        dbUser._id === currentUser._id ||
                        dbUser.restricted
                      }
                      className={`px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium outline-none transition-all ${
                        dbUser._id === currentUser._id
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : dbUser.restricted
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-white hover:border-blue-400 focus:ring-2 focus:ring-blue-500'
                      }`}
                    >
                      <option value="Customer">Customer</option>
                      <option value="Agent">Agent</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1 w-fit ${
                        dbUser.restricted
                          ? 'bg-red-100 text-red-700'
                          : dbUser.active === false
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {dbUser.restricted && <AlertCircle className="w-3 h-3" />}
                      {dbUser.restricted
                        ? 'Restricted'
                        : dbUser.active === false
                          ? 'Inactive'
                          : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {dbUser._id !== currentUser._id && (
                        <>
                          {dbUser.restricted ? (
                            <button
                              onClick={() => handleUnrestrictUser(dbUser._id)}
                              disabled={unrestrictMutation.isPending}
                              className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors disabled:opacity-50"
                              title="Unrestrict User"
                            >
                              <LockOpen className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestrictUser(dbUser._id)}
                              disabled={restrictMutation.isPending}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                              title="Restrict User"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={users.length}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
