import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export interface UserRole {
  documentId?: string;
  name?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  documentId: string;
  username?: string;
  email?: string;
  gender?: string;
  isPhoneVerified?: boolean;
  role?: UserRole;
  avatar?: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isActiveSession: boolean; // Track if user is in an active login session
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveSession: (isActive: boolean) => void;
  logout: () => void;
  clearUser: () => void;
  isTokenValid: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isActiveSession: false,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token });
        // Also store in localStorage for compatibility with other services
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setActiveSession: (isActive) => set({ isActiveSession: isActive }),
      logout: () => {
        set({ user: null, token: null, isActiveSession: false });
        localStorage.removeItem('token');
      },
      clearUser: () => {
        set({ user: null, token: null, isActiveSession: false });
        localStorage.removeItem('token');
      },
      isTokenValid: () => {
        const state = useUserStore.getState();
        if (!state.token) return false;
        
        try {
          // Decode JWT token to check expiry
          const payload = JSON.parse(atob(state.token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          return payload.exp > currentTime;
        } catch (error) {
          console.error('Invalid token format:', error);
          return false;
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        // Exclude isActiveSession, isLoading, error from persistence
      }),
      onRehydrateStorage: () => (state) => {
        // Force reset isActiveSession to false on rehydration (page reload)
        if (state) {
          state.isActiveSession = false;
          state.isLoading = false;
          state.error = null;
        }
      },
    }
  )
); 