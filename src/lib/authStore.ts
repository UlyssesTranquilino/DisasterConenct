import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiService } from "./api";

type UserRole = "Citizen" | "Organization" | "Volunteer";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  token?: string;
}

interface AuthState {
  user: CurrentUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      error: null,

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiService.login(email, password);
          if (response.success && response.data) {
            const user = response.data.user;
            set({
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role as UserRole,
                token: response.data.token,
              },
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Login failed");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        try {
          apiService.removeToken();
          set({ user: null });
        } catch (error) {
          console.error("Error during logout:", error);
          // Force clear all auth-related data
          localStorage.removeItem("auth-storage");
          set({ user: null });
        }
      },

      initialize: async () => {
        const { setLoading, setError } = get();
        try {
          setLoading(true);
          const { isAuthenticated, user } = await apiService.initializeAuth();
          if (isAuthenticated && user) {
            set({
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role as UserRole,
                token: apiService.getToken() || undefined,
              },
              isLoading: false,
            });
          } else {
            set({ user: null, isLoading: false });
          }
        } catch (error) {
          console.error("Failed to initialize auth:", error);
          setError("Failed to initialize authentication. Please try again.");
          set({ user: null, isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // use localStorage for persistence
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

// Initialize auth state when the store is created
const initializeAuth = async () => {
  try {
    const { initialize } = useAuthStore.getState();
    await initialize();
  } catch (error) {
    console.error("Auth initialization error:", error);
  }
};

// Call initialize on app load
if (typeof window !== "undefined") {
  initializeAuth();
}
