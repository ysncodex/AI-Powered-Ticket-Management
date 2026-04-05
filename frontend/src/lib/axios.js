import axios from 'axios';

// Create a custom Axios instance
const api = axios.create({
  baseURL: 'https://ai-powered-ticket-management.onrender.com/api', // Point to your Express backend
  withCredentials: true, // IMPORTANT: This tells the browser to send the JWT cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
