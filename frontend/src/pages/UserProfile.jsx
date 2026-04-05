import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import useAuthStore from '../features/auth/authStore';
import { updateUserProfile, changePassword } from '../features/users/userApi';
import { ArrowLeft, Edit2, Lock, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import Alert from '../components/ui/Alert';
import ProfileCard from '../components/profile/ProfileCard';

const UserProfile = () => {
  const { user, setCredentials } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email });
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Update the AuthStore with new user data
      setCredentials(data);
      setFormData({ name: data.name, email: data.email });
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrors({ submit: error.response?.data?.message || 'Failed to update profile' });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: () => changePassword(passwordData.currentPassword, passwordData.newPassword),
    onSuccess: () => {
      setSuccessMessage('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrors({ password: error.response?.data?.message || 'Failed to change password' });
    },
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setErrors({});
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setErrors({});

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ password: 'Passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }

    changePasswordMutation.mutate();
  };

  if (!user) {
    return <div className="p-10 text-center text-slate-500">Loading your profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto p-6 md:p-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to
          Dashboard
        </button>

        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3 tracking-wider">
            ACCOUNT MANAGEMENT
          </div>
          <h1 className="text-4xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600 text-lg mt-2">Manage your profile and security settings</p>
        </div>

        {successMessage && (
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div>
            <ProfileCard user={user} role={user?.role} />
          </div>

          {/* Profile Edit Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    disabled={updateProfileMutation.isPending}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    disabled={updateProfileMutation.isPending}
                  />
                  {errors.submit && <Alert type="error" message={errors.submit} />}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 inline mr-2" />
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({ name: user.name, email: user.email });
                      }}
                      className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                    >
                      <X className="w-4 h-4 inline mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-500 text-sm">Full Name</p>
                    <p className="text-slate-900 font-medium text-lg">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Email Address</p>
                    <p className="text-slate-900 font-medium text-lg">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Account Role</p>
                    <p className="text-slate-900 font-medium text-lg capitalize">{user?.role}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Security</h2>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </button>
                )}
              </div>

              {isChangingPassword ? (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <PasswordInput
                    label="Current Password"
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    disabled={changePasswordMutation.isPending}
                    required
                  />
                  <PasswordInput
                    label="New Password"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    disabled={changePasswordMutation.isPending}
                    minLength="6"
                    required
                  />
                  <PasswordInput
                    label="Confirm New Password"
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    error={errors.password}
                    disabled={changePasswordMutation.isPending}
                    required
                  />
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 inline mr-2" />
                      {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                        setErrors({});
                      }}
                      className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                    >
                      <X className="w-4 h-4 inline mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-slate-600">
                  <p className="mb-4">Protect your account by updating your password regularly.</p>
                  <p className="text-sm text-slate-500">
                    Last changed: <span className="font-medium">Account creation date</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
