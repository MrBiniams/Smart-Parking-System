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
  username: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, token: null }),
      clearUser: () => set({ user: null, token: null }),
    }),
    {
      name: 'user-storage',
    }
  )
); 