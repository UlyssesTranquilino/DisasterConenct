// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import {
  checkAuthState,
  signOut as firebaseSignOut,
  loginWithEmail,
  initSessionTracking,
} from "../services/authServices";
import { useAuthStore } from "../stores/authStore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

  children,
}) => {
  const { storedUser, setUser: setStoreUser, setLoading: setStoreLoading, clearAuth } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize session tracking
    initSessionTracking();

    // Set up auth state listener
    const unsubscribe = checkAuthState((firebaseUser) => {
      setUser(firebaseUser);
      setStoreUser(firebaseUser);
      setLoading(false);
      setStoreLoading(false);
    });

    // If we have stored user data, reduce loading time
    if (storedUser) {
      setLoading(false);
    }

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setStoreUser, setStoreLoading, storedUser]);

  const login = async (email: string, password: string) => {
    const result = await loginWithEmail(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      setStoreUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await firebaseSignOut();
    setUser(null);
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
