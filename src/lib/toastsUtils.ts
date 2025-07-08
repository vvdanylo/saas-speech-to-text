import { toast } from 'sonner';

interface ToastOptions {
  message: string;
  description?: string;
  duration?: number;
}

export const showErrorToast = ({
  message,
  description,
  duration = 5000,
}: ToastOptions) => {
  toast.error(message, {
    description,
    duration,
  });
};

export const showSuccessToast = ({
  message,
  description,
  duration = 5000,
}: ToastOptions) => {
  toast.success(message, {
    className:
      'bg-green-600 text-white border-green-800 text-lg p-4 w-[350px] min-h-[60px]',
    description,
    duration,
  });
};
