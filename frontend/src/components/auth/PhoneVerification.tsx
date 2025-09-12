import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface PhoneVerificationProps {
  phoneNumber: string;
  onVerificationComplete: () => void;
}

export default function PhoneVerification({ phoneNumber, onVerificationComplete }: PhoneVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const { verifyPhone, resendVerificationCode, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyPhone({ phoneNumber, verificationCode });
      onVerificationComplete();
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  const handleResendCode = async () => {
    try {
      await resendVerificationCode(phoneNumber);
      setCountdown(60); // Start 60-second countdown
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your phone number
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the verification code sent to {phoneNumber}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div>
            <label htmlFor="verificationCode" className="sr-only">
              Verification Code
            </label>
            <input
              id="verificationCode"
              name="verificationCode"
              type="text"
              required
              maxLength={6}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Verify
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={countdown > 0}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400"
            >
              {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 