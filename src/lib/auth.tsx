import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { apiService, type User } from "./api";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export type UserRole = "citizen" | "organization" | "volunteer";

// --- Helper for role mapping ---
const toBackendRole = (frontendRole: UserRole): string => {
  if (frontendRole === "citizen") return "civilian";
  return frontendRole;
};

const getRegistrationRoles = (selectedRole: UserRole): string[] => {
  const primaryRole = toBackendRole(selectedRole);
  if (primaryRole === "civilian" || primaryRole === "volunteer") {
    return ["civilian", "volunteer"];
  }
  return [primaryRole];
};

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string;
  roles: UserRole[];
  activeRole: UserRole | null;
  organizations?: string[];
  profilePicture?: string;
  isVerified?: boolean;
};

type AuthContextValue = {
  currentUser: CurrentUser | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    profileData?: any
  ) => Promise<void>;
  completeGoogleProfile: (
    userInfo: any,
    role: UserRole,
    profileData: any
  ) => Promise<void>;
  logout: () => void;
  error: string | null;
  switchRole: (role: UserRole) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "disasterconnect_auth";

const saveUserToStorage = (user: CurrentUser) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to save user to localStorage:", error);
  }
};

const getUserFromStorage = (): CurrentUser | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to get user from localStorage:", error);
    return null;
  }
};

const removeUserFromStorage = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to remove user from localStorage:", error);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 1. DEFINE HELPERS FIRST ---

  const normalizeRole = (role: string): UserRole | string => {
    if (!role) return "citizen";
    const normalized = role.toLowerCase();
    if (normalized === "civilian") return "citizen";
    if (
      normalized === "citizen" ||
      normalized === "organization" ||
      normalized === "volunteer"
    ) {
      return normalized as UserRole;
    }
    return "citizen";
  };

  const normalizeUser = (user: any): CurrentUser => {
    if (!user) throw new Error("Cannot normalize null user");

    // 1. Normalize roles
    const rawRoles = Array.isArray(user.roles)
      ? user.roles.map(normalizeRole)
      : [normalizeRole(user.role || "citizen")];

    // 2. Filter duplicates
    const uniqueRoles: UserRole[] = Array.from(new Set(
      rawRoles.filter((r: string) => r === "citizen" || r === "volunteer" || r === "organization")
    )) as UserRole[];

    // 3. Determine active role
    const activeRole = user.activeRole
      ? normalizeRole(user.activeRole)
      : uniqueRoles[0] || "citizen";

    // 4. Map Backend "uid/name" -> Frontend "id/displayName"
    return {
      id: user.id || user.uid,
      email: user.email,
      displayName: user.displayName || user.name || user.email?.split("@")[0] || "User",
      roles: uniqueRoles,
      activeRole: activeRole as UserRole,
      organizations: user.organizations || [],
      isVerified: user.isVerified || user.emailVerified || false,
      profilePicture: user.profilePicture || user.photoURL,
      ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
      ...(user.location && { location: user.location }),
    } as CurrentUser;
  };

  // --- 2. LOAD USER EFFECT ---
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = getUserFromStorage();

        if (storedUser) {
           // Restore from local storage first
           const normalizedStored = {
            ...storedUser,
            roles: storedUser.roles?.map(normalizeRole) as UserRole[] || [],
            activeRole: storedUser.activeRole
              ? normalizeRole(storedUser.activeRole) as UserRole
              : null,
          };
          setCurrentUser(normalizedStored);
          
          const token = localStorage.getItem("auth_token");
          if (token) apiService.setToken(token);
          
          // Fetch fresh profile from API
          try {
            const profile = await apiService.getProfile();
            console.log("Full Profile Response:", profile); 

            // FIX: Cast data to 'any' to bypass strict TS check for .email or .user
            const rawData = profile.data as any;
            let rawBackendUser = null;

            if (rawData?.user) {
                rawBackendUser = rawData.user;
            } else if (rawData?.email) {
                rawBackendUser = rawData;
            }

            if (rawBackendUser) {
                const freshUser = normalizeUser(rawBackendUser);
                setCurrentUser(freshUser);
            } else {
               console.warn("Profile API returned incomplete data structure:", profile);
            }
          } catch (err) {
            console.warn("Profile fetch failed, keeping cached user", err);
          }
        } else {
           setIsLoading(false);
           return;
        }

      } catch (err) {
        console.error("Error inside loadUser:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // --- 3. AUTH ACTIONS ---

  const getRedirectPath = (user: CurrentUser): string => {
    if (!user.activeRole) return "/select-role";
    switch (user.activeRole.toLowerCase()) {
      case "organization": return "/org/dashboard";
      case "volunteer": return "/volunteer/dashboard";
      case "citizen": default: return "/citizen/dashboard";
    }
  };

  const getDashboardPath = (role: UserRole | null): string => {
    if (!role) return "/select-role";
    switch (role.toLowerCase()) {
      case "organization": return "/org/dashboard";
      case "volunteer": return "/volunteer/dashboard";
      case "citizen": default: return "/citizen/dashboard";
    }
  };

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      setError(null);
      setIsLoading(true);

      const backendRole = toBackendRole(role);
      const response = await apiService.login(email, password, backendRole);

      if (response.success) {
        const { token, user } = response.data;
        const normalizedUser = normalizeUser(user);
        normalizedUser.activeRole = role;

        apiService.setToken(token);
        setCurrentUser(normalizedUser);
        saveUserToStorage(normalizedUser);

        const redirectPath = getRedirectPath(normalizedUser);
        navigate(redirectPath);
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    profileData: any = {}
  ) => {
    try {
      setError(null);
      setIsLoading(true);

      const backendRole = toBackendRole(role);
      const allRoles = getRegistrationRoles(role);

      const response = await apiService.register(
        email,
        password,
        name,
        backendRole,
        { ...profileData, roles: allRoles }
      );

      if (response.success) {
        const { token, user } = response.data;
        const normalizedUser = normalizeUser(user);
        normalizedUser.activeRole = role;

        apiService.setToken(token);
        setCurrentUser(normalizedUser);
        saveUserToStorage(normalizedUser);

        navigate(getDashboardPath(normalizedUser.activeRole));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (role: UserRole) => {
    if (!currentUser) return;
    try {
      const updatedUser = { ...currentUser, activeRole: role };
      setCurrentUser(updatedUser);
      saveUserToStorage(updatedUser);
      navigate(getDashboardPath(role));
    } catch (err) {
      console.error(err);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const googleUserInfo = {
        idToken,
        email: user.email || "",
        name: user.displayName || "Google User",
        uid: user.uid,
      };

      try {
        const response = await apiService.googleLogin(idToken);
        const isNewUser = (response as any)?.data?.isNewUser;
        
        if (isNewUser) {
          setError(null);
          sessionStorage.setItem("googleUserInfo", JSON.stringify(googleUserInfo));
          navigate("/select-role");
          return;
        }

        const backendUser = response.data.user;
        const normalizedUser = normalizeUser(backendUser);

        apiService.setToken(response.data.token);
        setCurrentUser(normalizedUser);
        saveUserToStorage(normalizedUser);

        navigate(getDashboardPath(normalizedUser.activeRole));
      } catch (backendError: any) {
        const errorMessage = backendError.message?.toLowerCase() || "";
        if (errorMessage.includes("not found") || errorMessage.includes("user does not exist")) {
          setError(null);
          sessionStorage.setItem("googleUserInfo", JSON.stringify(googleUserInfo));
          navigate("/select-role");
          return;
        } else {
          throw backendError;
        }
      }
    } catch (error) {
      console.error("Google login failed:", error);
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : "";
      if (!errorMessage.includes("not found")) {
        setError("Google login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const completeGoogleProfile = async (
    userInfo: any,
    role: UserRole,
    profileData: any
  ) => {
    try {
      setError(null);
      setIsLoading(true);

      const backendRole = toBackendRole(role);
      const allRoles = getRegistrationRoles(role);

      const response = await apiService.completeGoogleProfile(
        userInfo.idToken,
        backendRole,
        { ...profileData, roles: allRoles }
      );

      if (response.success) {
        const backendUser = response.data.user;
        const normalizedUser = normalizeUser(backendUser);
        normalizedUser.activeRole = role;

        apiService.setToken(response.data.token);
        setCurrentUser(normalizedUser);
        saveUserToStorage(normalizedUser);

        navigate(getDashboardPath(normalizedUser.activeRole));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Profile completion failed";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setError(null);
    apiService.removeToken();
    removeUserFromStorage();
    navigate("/login");
  };

  const value = useMemo(
    () => ({
      currentUser,
      isLoading,
      login,
      loginWithGoogle,
      register,
      completeGoogleProfile,
      logout,
      switchRole,
      error,
    }),
    [currentUser, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}