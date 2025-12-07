// components/ui/SimpleToast.tsx
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

export function useSimpleToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, title: string, message: string) => {
    const id = Date.now();
    const newToast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map(toast => {
        let borderColor = '';
        let bgColor = '';
        let icon = null;
        
        switch (toast.type) {
          case 'success':
            borderColor = 'border-l-green-500';
            bgColor = 'bg-gradient-to-r from-gray-800 to-green-900/20';
            icon = <CheckCircle size={20} className="text-green-400" />;
            break;
          case 'error':
            borderColor = 'border-l-red-500';
            bgColor = 'bg-gradient-to-r from-gray-800 to-red-900/20';
            icon = <XCircle size={20} className="text-red-400" />;
            break;
          case 'warning':
            borderColor = 'border-l-yellow-500';
            bgColor = 'bg-gradient-to-r from-gray-800 to-yellow-900/20';
            icon = <AlertCircle size={20} className="text-yellow-400" />;
            break;
          case 'info':
            borderColor = 'border-l-blue-500';
            bgColor = 'bg-gradient-to-r from-gray-800 to-blue-900/20';
            icon = <Info size={20} className="text-blue-400" />;
            break;
        }
        
        return (
          <div
            key={toast.id}
            className={`p-3 rounded-lg border-l-4 min-w-[300px] max-w-md backdrop-blur-sm border border-gray-700 shadow-lg ${borderColor} ${bgColor}`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 pt-0.5">
                {icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-semibold text-white">{toast.title}</h3>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-gray-400 hover:text-white ml-2"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-xs text-gray-300 mt-1 whitespace-pre-line">{toast.message}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return {
    success: (title: string, message: string) => showToast('success', title, message),
    error: (title: string, message: string) => showToast('error', title, message),
    info: (title: string, message: string) => showToast('info', title, message),
    warning: (title: string, message: string) => showToast('warning', title, message),
    ToastContainer
  };
}