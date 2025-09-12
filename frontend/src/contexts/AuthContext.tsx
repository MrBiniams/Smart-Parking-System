'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { AuthResponse, RegisterData, LoginData, VerifyPhoneData } from '../services/auth.service';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  verifyPhone: (data: VerifyPhoneData) => Promise<void>;
  resendVerificationCode: (phoneNumber: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<RegisterData>) => Promise<void>;
  clearError: () => void;
  checkPermission: (permission: string) => Promise<boolean>;
  checkPermissions: (permissions: string[]) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (err) {
      setError('Authentication failed');
      authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login(data);
      setUser(response.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.register(data);
      setUser(response.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPhone = async (data: VerifyPhoneData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.verifyPhone(data);
      setUser(response.user);
    } catch (err: any) {
      setError(err.message || 'Phone verification failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationCode = async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.resendVerificationCode(phoneNumber);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const updateProfile = async (data: Partial<RegisterData>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (err: any) {
      setError(err.message || 'Profile update failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkPermission = async (permission: string): Promise<boolean> => {
    return authService.checkPermission(permission);
  };

  const checkPermissions = async (permissions: string[]): Promise<boolean> => {
    return authService.checkPermissions(permissions);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        verifyPhone,
        resendVerificationCode,
        logout,
        updateProfile,
        clearError,
        checkPermission,
        checkPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 