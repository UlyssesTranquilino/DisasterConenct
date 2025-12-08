import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  X, 
  ExternalLink,
  Mail,
  MapPin,
  Clock,
  Users,
  Heart
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  details?: string[];
  action?: {
    label: string;
    onClick: () => void;
  };
  autoClose?: boolean;
  duration?: number;
}

interface ToastProps extends ToastData {
  onClose: (id: string) => void;
}

const ToastIcon: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={24} className="text-green-400" />,
  error: <XCircle size={24} className="text-red-400" />,
  warning: <AlertCircle size={24} className="text-yellow-400" />,
  info: <Info size={24} className="text-blue-400" />
};

const ToastBorder: Record<ToastType, string> = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  warning: 'border-l-yellow-500',
  info: 'border-l-blue-500'
};

const ToastBackground: Record<ToastType, string> = {
  success: 'bg-gradient-to-r from-gray-800 to-green-900/20',
  error: 'bg-gradient-to-r from-gray-800 to-red-900/20',
  warning: 'bg-gradient-to-r from-gray-800 to-yellow-900/20',
  info: 'bg-gradient-to-r from-gray-800 to-blue-900/20'
};

export function ToastNotification({ id, type, title, message, details, action, autoClose = true, duration = 5000, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!autoClose) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(interval);
        onClose(id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [autoClose, duration, id, onClose]);

  return (
    <div className={`relative overflow-hidden rounded-lg border border-gray-700 shadow-xl ${ToastBorder[type]} ${ToastBackground[type]} min-w-[320px] max-w-md backdrop-blur-sm`}>
      {/* Progress Bar */}
      {autoClose && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-700">
          <div 
            className="h-full bg-gray-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {ToastIcon[type]}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
              <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors ml-2"
              >
                <X size={16} />
              </button>
            </div>
            
            <p className="text-sm text-gray-300 mb-2">{message}</p>
            
            {details && details.length > 0 && (
              <div className="space-y-1 mb-3">
                {details.map((detail, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            )}
            
            {action && (
              <button
                onClick={() => {
                  action.onClick();
                  onClose(id);
                }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  type === 'success' 
                    ? 'bg-green-600 hover:bg-green-500 text-white' 
                    : type === 'error'
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : type === 'warning'
                    ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {action.label}
                <ExternalLink size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast Manager Component
export function ToastManager() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Create specific toast types
  const toast = {
    success: (title: string, message: string, options?: Partial<ToastData>) => 
      addToast({ type: 'success', title, message, ...options }),
    error: (title: string, message: string, options?: Partial<ToastData>) => 
      addToast({ type: 'error', title, message, ...options }),
    warning: (title: string, message: string, options?: Partial<ToastData>) => 
      addToast({ type: 'warning', title, message, ...options }),
    info: (title: string, message: string, options?: Partial<ToastData>) => 
      addToast({ type: 'info', title, message, ...options }),
    
    // Specialized toasts for common actions
    assignmentCreated: (title: string, organization: string) =>
      addToast({
        type: 'success',
        title: 'Assignment Created!',
        message: `"${title}" has been created successfully.`,
        details: [
          `Organization: ${organization}`,
          'You can now track it in your dashboard',
          'Volunteers will be notified automatically'
        ],
        duration: 6000
      }),
    
    assignmentCompleted: (title: string, hours: number) =>
      addToast({
        type: 'success',
        title: 'Assignment Completed!',
        message: `You've completed "${title}"`,
        details: [
          `${hours} hours contributed`,
          'Your volunteer hours have been logged',
          'Thank you for your service! ❤️'
        ],
        action: {
          label: 'View Details',
          onClick: () => window.location.href = '/volunteer/missions'
        },
        duration: 7000
      }),
    
    volunteerApplied: (opportunity: string, organization: string, contact: string) =>
      addToast({
        type: 'success',
        title: 'Application Submitted!',
        message: `You've applied to "${opportunity}"`,
        details: [
          `Organization: ${organization}`,
          `They'll contact you at: ${contact}`,
          'Check your email for confirmation'
        ],
        action: {
          label: 'Browse More',
          onClick: () => window.location.href = '/volunteer/needs'
        },
        duration: 8000
      }),
    
    profileUpdated: () =>
      addToast({
        type: 'success',
        title: 'Profile Updated!',
        message: 'Your volunteer profile has been saved successfully.',
        details: [
          'Your information is now visible to organizations',
          'Better matching for opportunities',
          'You can update anytime'
        ],
        action: {
          label: 'Go to Dashboard',
          onClick: () => window.location.href = '/volunteer/dashboard'
        },
        duration: 6000
      }),
    
    locationFound: (lat: number, lng: number) =>
      addToast({
        type: 'info',
        title: 'Location Found!',
        message: 'Your current location has been detected.',
        details: [
          `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          'Click below to view on map',
          'Location data is kept private'
        ],
        action: {
          label: 'View on Map',
          onClick: () => {
            const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            window.open(url, '_blank');
          }
        },
        duration: 5000
      }),
    
    directionsStarted: (destination: string) =>
      addToast({
        type: 'info',
        title: 'Directions Started',
        message: `Navigating to ${destination}`,
        details: [
          'Google Maps has been opened',
          'Follow the directions safely',
          'Check traffic conditions'
        ],
        action: {
          label: 'Open Maps',
          onClick: () => {
            window.open('https://maps.google.com', '_blank');
          }
        }
      })
  };

  return {
    ToastContainer: () => (
      <div className="fixed top-4 right-4 z-[9999] space-y-3">
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </div>
    ),
    toast
  };
}

// Context Provider for Toast
interface ToastContextType {
  toast: ReturnType<typeof ToastManager>['toast'];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastManager = ToastManager();
  
  return (
    <ToastContext.Provider value={{ toast: toastManager.toast }}>
      {children}
      <toastManager.ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context.toast;
}