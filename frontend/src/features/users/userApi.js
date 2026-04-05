import api from '../../lib/axios';

// User Profile Operations
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('/users/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

// Agent Operations
export const getAgentStats = async () => {
  const response = await api.get('/users/agent-stats');
  return response.data;
};

// Fetch all users (Admin only)
export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Update a user's role (Admin only)
export const updateUserRole = async ({ userId, role }) => {
  const response = await api.put(`/users/${userId}/role`, { role });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// User Status Management (Admin only)
export const restrictUser = async (userId) => {
  const response = await api.put(`/users/${userId}/restrict`);
  return response.data;
};

export const unrestrictUser = async (userId) => {
  const response = await api.put(`/users/${userId}/unrestrict`);
  return response.data;
};

export const toggleUserStatus = async (userId, status) => {
  const response = await api.put(`/users/${userId}/status`, { status });
  return response.data;
};
