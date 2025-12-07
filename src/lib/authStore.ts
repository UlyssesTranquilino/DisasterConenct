import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "Citizen" | "Organization" | "Volunteer";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  token?: string;
}

interface AuthState {
  currentUser: CurrentUser | null;
  isLoading: boolean;
  error: string | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isLoading: false,
      error: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      clear: () => set({ currentUser: null, error: null }),
    }),
    {
      name: "auth-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
      }),
    }
  )
);

// Helper hook for easier access to auth state and actions
export const useAuth = () => {
  const {
    currentUser,
    isLoading,
    error,
    setCurrentUser,
    setLoading,
    setError: setErrorAction,
    clearError,
    clear,
  } = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Your login logic here
      // const user = await apiService.login(email, password);
      // setCurrentUser(user);
    } catch (error) {
      setErrorAction(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      // Your Google login logic here
    } catch (error) {
      setErrorAction(
        error instanceof Error ? error.message : "Google login failed"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    profileData?: any
  ) => {
    try {
      setLoading(true);
      // Your registration logic here
    } catch (error) {
      setErrorAction(
        error instanceof Error ? error.message : "Registration failed"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeGoogleProfile = async (
    userInfo: any,
    role: UserRole,
    profileData: any
  ) => {
    try {
      setLoading(true);
      // Your complete profile logic here
    } catch (error) {
      setErrorAction(
        error instanceof Error ? error.message : "Failed to complete profile"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clear();
    // Clear any other auth-related data
    localStorage.removeItem("auth-storage");
  };

  return {
    currentUser,
    isLoading,
    error,
    login,
    loginWithGoogle,
    register,
    completeGoogleProfile,
    logout,
    setError: setErrorAction,
    clearError,
  };
};
