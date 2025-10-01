import { AxiosError } from 'axios';
import api from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export interface RegisterData {
  username: string;
  email?: string;
  password: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
}

export interface LoginData {
  identifier: string;
  password: string;
}

export interface VerifyPhoneData {
  phoneNumber: string;
  verificationCode: string;
}

export interface AuthResponse {
  jwt: string;
  user: {
    id: number;
    documentId: string;
    email?: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    gender: string;
    isPhoneVerified: boolean;
    role?: {
      documentId: string;
      name: string;
    };
  };
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: {
    message: string;
  };
}

interface OtpResponse {
  success: boolean;
  verificationId: string;
}

interface VerifyOtpResponse {
  success: boolean;
  jwt: string;
  user: {
    id: number;
    username?: string;
    email?: string;
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
    documentId?: string;
    avatar?: string;
    role?: {
      id?: number;
      documentId?: string;
      name: string;
      description?: string;
      type?: string;
    };
  } | null;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  gender: 'male' | 'female';
  phoneNumber: string;
  verificationId: string;
  otp: string;
}

class AuthService {
  private handleError(error: AxiosError<ApiError>): never {
    // Try different possible error message locations
    const message = 
      error.response?.data?.message || 
      error.response?.data?.error?.message ||
      error.response?.statusText ||
      error.message ||
      'An error occurred';
    
    throw new Error(message);
  }

  async register(data: RegisterData): Promise<{ message: string; user: AuthResponse['user'] }> {
    try {
      const response = await api.post('/api/auth/signup', data);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<ApiError>);
    }
  }

  async verifyPhone(data: VerifyPhoneData): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/verify-phone', data);
      if (response.data.jwt) {
        localStorage.setItem('token', response.data.jwt);
      }
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<ApiError>);
    }
  }

  async resendVerificationCode(phoneNumber: string): Promise<{ message: string }> {
    try {
      const response = await api.post('/api/auth/resend-verification', { phoneNumber });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<ApiError>);
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/login', data);
      if (response.data.jwt) {
        localStorage.setItem('token', response.data.jwt);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.jwt}`;
      }

      if (response.data.user) {
        response.data.user = {
          ...response.data.user,
          firstName: response.data?.user?.firstName || '',
          lastName: response.data?.user?.lastName || '',
          documentId: response.data?.user?.documentId.toString() || '',
          avatar: ''
        };
      }

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<ApiError>);
    }
  }

  async getCurrentUser(): Promise<AuthResponse['user']> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get('/api/auth/users/me');
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<ApiError>);
    }
  }

  async updateProfile(data: Partial<RegisterData>): Promise<AuthResponse['user']> {
    try {
      const response = await api.put('/api/auth/users/me', data);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<ApiError>);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  async checkPermission(permission: string): Promise<boolean> {
    try {
      const response = await api.get('/api/auth/users/me');
      const user = response.data;
      if (!user.role?.permissions) {
        return false;
      }
      return user.role.permissions.includes(permission);
    } catch (error) {
      return false;
    }
  }

  async checkPermissions(permissions: string[]): Promise<boolean> {
    try {
      const response = await api.get('/api/auth/users/me');
      const user = response.data;
      if (!user.role?.permissions) {
        return false;
      }
      return permissions.every(permission => user.role.permissions.includes(permission));
    } catch (error) {
      return false;
    }
  }

  async sendOtp(phoneNumber: string): Promise<OtpResponse> {
    try {
      const response = await api.post('/api/auth/send-otp', { phoneNumber });
      return {
        success: true,
        verificationId: response.data.verificationId
      };
    } catch (error) {
      this.handleError(error as AxiosError<ApiError>);
    }
  }

  async verifyOtp(
    verificationId: string,
    otp: string,
    phoneNumber: string
  ): Promise<VerifyOtpResponse> {
    try {
      const response = await api.post('/api/auth/verify-otp', {
        verificationId,
        otp,
        phoneNumber
      });

      if (response.data.user) {
        response.data.user = {
          ...response.data.user,
          firstName: response.data.user.firstName || '',
          lastName: response.data.user.lastName || '',
          documentId: response.data.user.documentId?.toString() || response.data.user.id?.toString() || '',
          avatar: response.data.user.avatar || '',
          // Handle role transformation
          role: response.data.user.role ? {
            documentId: response.data.user.role.id?.toString() || '',
            name: response.data.user.role.name || ''
          } : undefined
        };
      }

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<ApiError>);
    }
  }

  async signup(data: SignupData): Promise<VerifyOtpResponse> {
    try {
      const response = await api.post<VerifyOtpResponse>(
        `/api/auth/register`,
        data
      );

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message;
      throw new Error(errorMessage);
    }
  }

  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/verify-token', { token });

      if (!response) {
        throw new Error('Token verification failed');
      }

      return response.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to verify token');
    }
  }

  async attendantLogin(identifier: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/attendant-login', {
        identifier,
        password
      });

      if (response.data.jwt) {
        localStorage.setItem('token', response.data.jwt);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.jwt}`;
      }

      if (response.data.user) {
        response.data.user = {
          ...response.data.user,
          firstName: response.data.user.firstName || '',
          lastName: response.data.user.lastName || '',
          documentId: response.data.user.documentId.toString(),
          avatar: '',
          username: response.data.user.username || response.data.user.phoneNumber || `${response.data.user.firstName}_${response.data.user.lastName}`
        };
      }

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<ApiError>);
    }
  }

  async changeAttendantPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/api/auth/attendant/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<ApiError>);
    }
  }
}

export default new AuthService(); 