import api from '../../lib/axios';

export const getTickets = async () => {
  const response = await api.get('/tickets');
  return response.data;
};

export const createTicket = async (ticketData) => {
  const response = await api.post('/tickets', ticketData);
  return response.data;
};

export const getTicketById = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

export const addComment = async ({ id, message }) => {
  const response = await api.post(`/tickets/${id}/comments`, { message });
  return response.data;
};

export const updateTicket = async ({ id, updateData }) => {
  // updateData could contain status, aiPriority, aiCategory, etc.
  const response = await api.put(`/tickets/${id}`, updateData);
  return response.data;
};

export const deleteTicket = async (id) => {
  const response = await api.delete(`/tickets/${id}`);
  return response.data;
};
