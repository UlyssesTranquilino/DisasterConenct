import { useState, createContext, useContext, ReactNode } from 'react';
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastAction } from '../../components/ui/toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  toast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useSimpleToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useSimpleToast must be used within a ToastProvider');
  }
  return context;
};

export function SimpleToastProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');

  const toast = (msg: string, toastType: ToastType = 'info') => {
    setMessage(msg);
    setType(toastType);
    setOpen(true);
  };

  const success = (msg: string) => toast(msg, 'success');
  const error = (msg: string) => toast(msg, 'error');
  const info = (msg: string) => toast(msg, 'info');

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <ToastProvider>
      <ToastContext.Provider value={{ success, error, info, toast }}>
        {children}
        <Toast
          open={open}
          onOpenChange={setOpen}
          className={`${getBackgroundColor()} text-white`}
        >
          <div className="grid gap-1">
            <ToastTitle className="font-medium">
              {type === 'success' && 'Success'}
              {type === 'error' && 'Error'}
              {type === 'info' && 'Info'}
            </ToastTitle>
            <ToastDescription>{message}</ToastDescription>
          </div>
          <ToastAction altText="Close" className="text-white hover:bg-black/10">
            Close
          </ToastAction>
        </Toast>
        <ToastViewport className="fixed bottom-0 right-0 flex flex-col p-4 gap-2 w-full max-w-sm m-0 z-[100]" />
      </ToastContext.Provider>
    </ToastProvider>
  );
}
