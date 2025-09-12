import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useUserStore } from '@/store/user';
import { initiatePayment, PaymentType } from '@/services/payment.service';
import { useRouter } from 'next/navigation';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  amount: number;
  type?: PaymentType;
}

const PAYMENT_METHODS = [
  {
    id: 'telebirr',
    name: 'TeleBirr',
    icon: '📱',
    description: 'Pay using TeleBirr mobile money',
    color: 'bg-green-500'
  },
  {
    id: 'cbe-birr',
    name: 'CBE Birr',
    icon: '🏦',
    description: 'Pay using CBE Birr mobile money',
    color: 'bg-blue-500'
  }
];

export default function PaymentModal({ isOpen, onClose, booking, amount, type = 'booking' }: PaymentModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const router = useRouter();

  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    setSelectedMethod(null);
    onClose();
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleCompletePayment = async () => {
    if (!selectedMethod) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await initiatePayment(booking.documentId, selectedMethod, type);
      
      if (response.success && response.payment?.paymentUrl) {
        // Redirect to payment verification page
        router.push(`/payment/verify?transactionId=${response.payment.id}`);
      } else {
        setError('Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white/90 backdrop-blur-md p-8 shadow-xl border border-white/20">
          <Dialog.Title className="text-xl font-medium leading-6 text-gray-900 mb-6">
            Complete Payment
          </Dialog.Title>

          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-2">Total Amount</p>
            <p className="text-3xl font-bold text-gray-900">{amount.toFixed(2)} ETB</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-8">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => handlePaymentMethodSelect(method.id)}
                disabled={isLoading}
                className={`w-full flex items-center p-5 border rounded-lg transition-all duration-200 ${
                  selectedMethod === method.id
                    ? `border-${method.color.split('-')[1]}-500 bg-${method.color.split('-')[1]}-50/50`
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className={`w-12 h-12 ${method.color} rounded-full flex items-center justify-center mr-4`}>
                  <span className="text-2xl text-white">{method.icon}</span>
                </div>
                <div className="text-left flex-1">
                  <p className="text-lg font-medium text-gray-900">{method.name}</p>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
                {selectedMethod === method.id && (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white/80 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCompletePayment}
              disabled={isLoading || !selectedMethod}
              className="flex-1 py-3 px-6 bg-blue-600 rounded-lg text-base font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                'Complete Payment'
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 