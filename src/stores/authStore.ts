import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "firebase/auth";

interface StoredUserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  storedUser: StoredUserData | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

// In authStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      storedUser: null,
      setUser: (user) =>
        set({
          user,
          storedUser: user
            ? {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
              }
            : null,
        }),
      setLoading: (loading) => set({ loading }),
      clearAuth: () => set({ user: null, storedUser: null, loading: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist the storedUser to prevent serialization issues
      partialize: (state) => ({
        storedUser: state.storedUser,
      }),
    }
  )
);
