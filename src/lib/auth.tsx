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

// In your frontend types
export type UserRole = "citizen" | "organization" | "volunteer";

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string;
  roles: UserRole[]; // all roles of the user
  activeRole: UserRole | null; // currently selected role
  organizations?: string[]; // org IDs for organization role
  profilePicture?: string;
  isVerified?: boolean;
};

type AuthContextValue = {
  currentUser: CurrentUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    roles: UserRole[],
    profileData?: any
  ) => Promise<void>;
  completeGoogleProfile: (
    userInfo: any,
    roles: UserRole[],
    profileData: any
  ) => Promise<void>;
  logout: () => void;
  error: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Helper functions for localStorage
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

  const normalizeRole = (role: string): UserRole => {
    const normalized = role.toLowerCase();
    // Ensure it's a valid UserRole
    if (
      normalized === "citizen" ||
      normalized === "organization" ||
      normalized === "volunteer"
    ) {
      return normalized as UserRole;
    }
    return "citizen"; // default fallback
  };

  // Load user from localStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = getUserFromStorage();
        if (!storedUser) {
          setIsLoading(false);
          return;
        }

        // Normalize all roles
        const normalizedUser: CurrentUser = {
          ...storedUser,
          roles: storedUser.roles?.map(normalizeRole) || [],
          activeRole: storedUser.activeRole
            ? normalizeRole(storedUser.activeRole)
            : null,
        };

        setCurrentUser(normalizedUser);

        const token = localStorage.getItem("auth_token");
        if (token) apiService.setToken(token);

        // Fetch latest profile
        try {
          const profile = await apiService.getProfile();
          const profileUser = profile.data.user;
          setCurrentUser({
            ...profileUser,
            roles: profileUser.roles?.map(normalizeRole) || [],
            activeRole: profileUser.activeRole
              ? normalizeRole(profileUser.activeRole)
              : null,
          });
        } catch (err) {
          console.warn("Profile fetch failed, using cached user", err);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Normalize user data from different sources (API, localStorage, etc.)
  const normalizeUser = (user: any): CurrentUser => {
    const roles = Array.isArray(user.roles)
      ? user.roles.map(normalizeRole)
      : [normalizeRole(user.role || "citizen")];

    const activeRole = user.activeRole
      ? normalizeRole(user.activeRole)
      : roles[0] || "citizen";

    return {
      id: user.id || user.uid,
      email: user.email,
      displayName: user.displayName || user.name || user.email.split("@")[0],
      roles,
      activeRole,
      organizations: user.organizations || [],
      isVerified: user.isVerified || user.emailVerified || false,
      profilePicture: user.profilePicture || user.photoURL,
      ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
      ...(user.location && { location: user.location }),
    };
  };

  // Helper function to determine redirect path based on user role
  const getRedirectPath = (user: CurrentUser): string => {
    if (!user.activeRole) return "/select-role";

    switch (user.activeRole.toLowerCase()) {
      case "organization":
        return "/org/dashboard";
      case "volunteer":
        return "/volunteer/dashboard";
      case "citizen":
      default:
        return "/citizen/dashboard";
    }
  };

  // Helper function to get dashboard path from role
  const getDashboardPath = (role: UserRole | null): string => {
    if (!role) return "/select-role";

    switch (role.toLowerCase()) {
      case "organization":
        return "/org/dashboard";
      case "volunteer":
        return "/volunteer/dashboard";
      case "citizen":
      default:
        return "/citizen/dashboard";
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiService.login(email, password);

      if (response.success) {
        const { token, user } = response.data;
        const normalizedUser = normalizeUser(user);

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
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    roles: UserRole[],
    profileData: any = {}
  ) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiService.register(
        email,
        password,
        displayName,
        roles,
        profileData
      );

      if (response.success) {
        const { token, user } = response.data;
        const normalizedUser: CurrentUser = {
          ...user,
          roles: user.roles?.map(normalizeRole) || roles,
          activeRole: user.activeRole
            ? normalizeRole(user.activeRole)
            : roles[0] || "citizen",
        };

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

        // If backend says this is a new user, send them to role selection
        const isNewUser = (response as any)?.data?.isNewUser;
        if (isNewUser) {
          setError(null);
          sessionStorage.setItem(
            "googleUserInfo",
            JSON.stringify(googleUserInfo)
          );
          navigate("/select-role");
          return;
        }

        // Existing user: normalize and log them in directly
        const backendUser = response.data.user;

        const normalizedUser: CurrentUser = {
          ...backendUser,
          roles: backendUser.roles?.map(normalizeRole) || [],
          activeRole: backendUser.activeRole
            ? normalizeRole(backendUser.activeRole)
            : backendUser.roles?.[0] || null,
        };

        apiService.setToken(response.data.token);
        setCurrentUser(normalizedUser);
        saveUserToStorage(normalizedUser);

        // Redirect based on activeRole
        navigate(getDashboardPath(normalizedUser.activeRole));
      } catch (backendError: any) {
        // User not registered yet, complete profile
        const errorMessage = backendError.message?.toLowerCase() || "";
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("user does not exist") ||
          errorMessage.includes("complete registration") ||
          errorMessage.includes("please complete registration")
        ) {
          // Clear any error state before redirecting
          setError(null);
          sessionStorage.setItem(
            "googleUserInfo",
            JSON.stringify(googleUserInfo)
          );
          navigate("/select-role");
          return;
        } else {
          // Re-throw other errors to be handled by outer catch
          throw backendError;
        }
      }
    } catch (error) {
      console.error("Google login failed:", error);
      // Only set error if we're not redirecting to role selection
      const errorMessage =
        error instanceof Error ? error.message.toLowerCase() : "";
      if (
        !errorMessage.includes("not found") &&
        !errorMessage.includes("user does not exist") &&
        !errorMessage.includes("complete registration")
      ) {
        setError("Google login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const completeGoogleProfile = async (
    userInfo: any,
    roles: UserRole[],
    profileData: any
  ) => {
    try {
      setError(null);
      setIsLoading(true);

      // Pass array of roles now instead of single role
      const response = await apiService.completeGoogleProfile(
        userInfo.idToken,
        roles,
        profileData
      );

      if (response.success) {
        const backendUser = response.data.user;

        const normalizedUser: CurrentUser = {
          ...backendUser,
          roles: backendUser.roles?.map(normalizeRole) || roles,
          activeRole: backendUser.activeRole
            ? normalizeRole(backendUser.activeRole)
            : roles[0] || null,
        };

        apiService.setToken(response.data.token);
        setCurrentUser(normalizedUser);
        saveUserToStorage(normalizedUser);

        // Redirect based on activeRole
        navigate(getDashboardPath(normalizedUser.activeRole));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Profile completion failed";
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
