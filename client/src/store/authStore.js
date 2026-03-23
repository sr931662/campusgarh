import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { setToken, removeToken, setUserInStorage, getUserFromStorage, decodeToken, isTokenExpired } from '../utils/tokenUtils';
import { STORAGE_KEYS } from '../utils/constants';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // Set user and token after login
      setAuth: (user, token) => {
        setToken(token);
        setUserInStorage(user);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // Clear auth on logout
      logout: () => {
        removeToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Initialize from localStorage
      initialize: () => {
        const storedUser = getUserFromStorage();
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (storedToken && !isTokenExpired(storedToken) && storedUser) {
          set({
            user: storedUser,
            token: storedToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Clear invalid data
          removeToken();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Merge partial updates into user (e.g. after toggle saved)
      updateUser: (updates) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const updated = { ...currentUser, ...updates };
        setUserInStorage(updated);
        set({ user: updated });
      },

      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage persistence
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Create a hook to use auth store
export const useAuth = () => useAuthStore((state) => state);

// Initialize store on import
useAuthStore.getState().initialize();

export default useAuthStore;