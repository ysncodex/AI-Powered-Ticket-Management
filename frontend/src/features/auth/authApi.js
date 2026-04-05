import api from '../../lib/axios';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (name, email, password, role = 'Customer') => {
  // Support role selection: Customer or Agent
  const response = await api.post('/auth/register', { name, email, password, role });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};
