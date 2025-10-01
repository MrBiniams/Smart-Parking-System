'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { E164Number } from 'libphonenumber-js';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import { useUserStore, User } from '@/store/userStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Gender = 'male' | 'female';

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'signup' | 'attendant'>('phone');
  const [phoneNumber, setPhoneNumber] = useState<E164Number | undefined>();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: 'male' as Gender,
  });
  const [attendantData, setAttendantData] = useState({
    identifier: '',
    password: '',
  });
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAttendant, setIsAttendant] = useState(false);

  const { setUser, setToken, setActiveSession } = useUserStore();
  const router = useRouter();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!phoneNumber) {
      setError('Phone number is required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.sendOtp(phoneNumber.toString());
      setVerificationId(response.verificationId);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.attendantLogin(
        attendantData.identifier,
        attendantData.password
      );

      console.log('=== ATTENDANT LOGIN RESPONSE ===');
      console.log('Full response:', response);
      console.log('User from response:', response.user);
      console.log('Role from response:', response.user?.role);
      console.log('Role name:', response.user?.role?.name);
      console.log('================================');

      if (response.user) {
        setToken(response.jwt);
        const transformedUser: User = {
          id: response.user.id,
          firstName: response.user.firstName || '',
          lastName: response.user.lastName || '',
          phoneNumber: response.user.phoneNumber,
          documentId: response.user.documentId || '',
          username: (response.user as any).username || '',
          email: response.user.email || '',
          gender: 'male',
          isPhoneVerified: response.user.isPhoneVerified || true,
          avatar: (response.user as any).avatar || '',
          role: response.user.role ? {
            documentId: response.user.role.documentId || '',
            name: response.user.role.name || ''
          } : undefined
        };
        setUser(transformedUser);
        setActiveSession(true); // Mark as active login session
        onClose();
        // Redirect to attendant management page
        router.push('/attendant/management');
      }
    } catch (err) {
      // Handle specific error messages from backend
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!phoneNumber) {
      setError('Phone number is required');
      setIsLoading(false);
      return;
    }

    try {
      if (isAttendant) {
        const response = await authService.attendantLogin(
          phoneNumber.toString(),
          otp
        );
        
        if (response.user) {
          setToken(response.jwt);
          const transformedUser: User = {
            id: response.user.id,
            firstName: response.user.firstName || '',
            lastName: response.user.lastName || '',
            phoneNumber: response.user.phoneNumber,
            documentId: response.user.documentId || '',
            username: (response.user as any).username || '',
            email: response.user.email || '',
            gender: 'male',
            isPhoneVerified: response.user.isPhoneVerified || true,
            avatar: (response.user as any).avatar || '',
            role: response.user.role ? {
              documentId: response.user.role.documentId || '',
              name: response.user.role.name || ''
            } : undefined
          };
          setUser(transformedUser);
          setActiveSession(true); // Mark as active login session
          onClose();
          // Redirect to attendant management page
          router.push('/attendant/management');
        } else {
          setError('Invalid attendant credentials');
        }
      } else {
        const response = await authService.verifyOtp(
          verificationId,
          otp,
          phoneNumber.toString()
        );
        
        // If user doesn't exist, switch to signup mode
        if (!response.user) {
          setStep('signup');
          return;
        }

        // Update user store and close modal
        setToken(response.jwt);
        // Transform user data to match User interface
        const transformedUser: User = {
          id: response.user.id,
          firstName: response.user.firstName || '',
          lastName: response.user.lastName || '',
          phoneNumber: response.user.phoneNumber,
          documentId: response.user.documentId || response.user.id?.toString() || '',
          username: (response.user as any).username || '',
          email: response.user.email || '',
          gender: 'male',
          isPhoneVerified: true,
          avatar: (response.user as any).avatar || '',
          role: response.user.role ? {
            documentId: response.user.role.id?.toString() || '',
            name: response.user.role.name || ''
          } : undefined
        };
        setUser(transformedUser);
        setActiveSession(true); // Mark as active login session
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.signup({
        ...formData,
        phoneNumber: phoneNumber?.toString() || '',
        verificationId,
        otp,
      });

      // Update user store and close modal
      if (response.user) {
        setToken(response.jwt);
        const transformedUser: User = {
          id: response.user.id,
          firstName: response.user.firstName || '',
          lastName: response.user.lastName || '',
          phoneNumber: response.user.phoneNumber,
          documentId: response.user.documentId || response.user.id?.toString() || '',
          username: (response.user as any).username || '',
          email: response.user.email || '',
          gender: 'male',
          isPhoneVerified: true,
          avatar: (response.user as any).avatar || '',
          role: response.user.role ? {
            documentId: response.user.role.id?.toString() || '',
            name: response.user.role.name || ''
          } : undefined
        };
        setUser(transformedUser);
        setActiveSession(true); // Mark as active login session
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.firstName) {
      setError('First name is required');
      return false;
    }
    
    if (!formData.lastName) {
      setError('Last name is required');
      return false;
    }
    
    if (!formData.email) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    
    return true;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm w-full rounded-lg bg-white/95 backdrop-blur-sm p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium mb-4">
            {step === 'signup' ? 'Complete Sign Up' : step === 'otp' ? 'Enter OTP' : step === 'attendant' ? 'Sign in as Attendant' : 'Enter Phone Number'}
          </Dialog.Title>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit}>
              <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1 text-center font-semibold">
                  Phone Number
              </label>
                <PhoneInput
                  international
                  defaultCountry="ET"
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  placeholder="Enter phone number"
                  inputComponent={({ className, ...props }) => (
                    <input
                      {...props}
                      className={`${className} text-gray-900 placeholder-gray-500`}
                      style={{
                        color: '#1F2937',
                        backgroundColor: 'white',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        padding: '8px',
                        width: '100%',
                        fontSize: '16px'
                      }}
                    />
                  )}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsAttendant(true);
                    setStep('attendant');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
                >
                  <span>Are you an attendant?</span>
                  <span className="text-blue-600 hover:text-blue-700">Click here</span>
                </button>
              </div>
            </form>
          ) : step === 'attendant' ? (
            <form onSubmit={handleAttendantSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    value={attendantData.identifier}
                    onChange={(e) => setAttendantData({ ...attendantData, identifier: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Enter email or phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={attendantData.password}
                    onChange={(e) => setAttendantData({ ...attendantData, password: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Signing in...' : 'Sign in as Attendant'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAttendant(false);
                    setStep('phone');
                  }}
                  className="w-full text-sm text-gray-600 hover:text-gray-900"
                >
                  Back to phone login
                </button>
              </div>
            </form>
          ) : step === 'otp' ? (
            <form onSubmit={handleOtpSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  placeholder="Enter 6-digit code"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Signing up...' : 'Complete Sign Up'}
              </button>
            </form>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AuthModal;