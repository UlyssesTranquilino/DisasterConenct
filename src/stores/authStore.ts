import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "firebase/auth";

interface StoredUserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  roles: string[];
  activeRole: string;
  token: string;
}

interface AuthState {
  user: StoredUserData | null;
  loading: boolean;
  setUser: (user: StoredUserData | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      clearAuth: () => set({ user: null, loading: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
