import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false, // Track if we've checked localStorage

  // Initialize auth from localStorage (called on app mount)
  initializeAuth: () => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        set({
          user,
          isAuthenticated: true,
          isInitialized: true,
        });
      } catch (err) {
        console.error('Failed to parse stored auth user:', err);
        localStorage.removeItem('authUser');
        set({ isInitialized: true });
      }
    } else {
      set({ isInitialized: true });
    }
  },

  // Call this after a successful login
  setCredentials: (userData) => {
    localStorage.setItem('authUser', JSON.stringify(userData));
    set({
      user: userData,
      isAuthenticated: true,
    });
  },

  // Call this after a successful logout
  logout: () => {
    localStorage.removeItem('authUser');
    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
