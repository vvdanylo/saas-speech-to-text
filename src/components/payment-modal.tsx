'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { showErrorToast, showSuccessToast } from '@/lib/toastsUtils';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function PaymentModal({
  isOpen,
  onCloseAction,
  onPaymentSuccessAction,
}: {
  isOpen: boolean;
  onCloseAction: () => void;
  onPaymentSuccessAction: () => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const hasHandledSuccess = useRef(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const stripe = await stripePromise;
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });
      const { sessionId } = await response.json();

      if (stripe && sessionId) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          showErrorToast({ message: error.message as string });
        }
      } else {
        showErrorToast({ message: 'Failed to initiate Stripe checkout' });
      }
    } catch (error) {
      showErrorToast({ message: `Payment error: ${error}` });
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isOpen || hasHandledSuccess.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('success') === 'true';
    const isCancel = urlParams.get('cancel') === 'true';

    if (isSuccess || isCancel) {
      hasHandledSuccess.current = true;

      if (isSuccess) {
        showSuccessToast({
          message: 'Payment Successful',
          description: 'You can now create more transcriptions.',
        });
        onPaymentSuccessAction();
      }

      if (isCancel) {
        showErrorToast({
          message: 'Payment Cancelled',
          description: 'Please complete the payment to continue transcribing.',
        });
      }

      onCloseAction();
      router.replace('/dashboard');
    }
  }, [isOpen, router, onCloseAction, onPaymentSuccessAction]);

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade Required</DialogTitle>
          <DialogDescription>
            You have reached the limit of 2 free transcriptions. Please make a
            one-time payment to continue transcribing.
          </DialogDescription>
        </DialogHeader>
        <div className={'flex justify-end gap-4 mt-4'}>
          <Button
            variant={'outline'}
            onClick={onCloseAction}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
