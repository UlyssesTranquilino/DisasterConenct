import { useEffect } from "react";
import { useAuthStore } from "../lib/authStore";
import { useNavigate } from "react-router-dom";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, initialize } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize auth state when component mounts
    initialize();
  }, [initialize]);

  // You can add additional auth-related logic here, like route protection
  // or automatic redirects based on auth state

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};
