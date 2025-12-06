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

export type UserRole = "Citizen" | "Organization" | "Volunteer";
export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Storage configuration
const STORAGE_CONFIG = {
  VERSION: "1.0",
  KEYS: {
    AUTH: "disasterconnect_auth",
    VERSION: "disasterconnect_version",
  },
} as const;

type StoredUser = {
  version: string;
  user: CurrentUser;
  timestamp: number;
};

const isCurrentUser = (data: any): data is CurrentUser => {
  return (
    data &&
    typeof data === "object" &&
    typeof data.id === "string" &&
    typeof data.email === "string" &&
    typeof data.name === "string" &&
    ["Citizen", "Organization", "Volunteer"].includes(data.role)
  );
};

const saveUserToStorage = (user: CurrentUser): void => {
  try {
    const data: StoredUser = {
      version: STORAGE_CONFIG.VERSION,
      user,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_CONFIG.KEYS.AUTH, JSON.stringify(data));
    localStorage.setItem(STORAGE_CONFIG.KEYS.VERSION, STORAGE_CONFIG.VERSION);
  } catch (error) {
    console.error("Failed to save user to localStorage:", error);
    // Consider implementing a fallback storage mechanism here
  }
};

const getUserFromStorage = (): CurrentUser | null => {
  try {
    const storedData = localStorage.getItem(STORAGE_CONFIG.KEYS.AUTH);
    if (!storedData) return null;

    const parsedData = JSON.parse(storedData) as Partial<StoredUser>;

    // Handle version migrations here if needed
    if (parsedData.version !== STORAGE_CONFIG.VERSION) {
      console.warn(
        `Storage version mismatch: ${parsedData.version} != ${STORAGE_CONFIG.VERSION}`
      );
      // Future: Add migration logic here when needed
    }

    // Validate the user data structure
    if (isCurrentUser(parsedData.user)) {
      return parsedData.user;
    }

    console.error("Invalid user data structure in storage");
    return null;
  } catch (error) {
    console.error("Failed to get user from storage:", error);
    // Clear corrupted data
    removeUserFromStorage();
    return null;
  }
};

const removeUserFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_CONFIG.KEYS.AUTH);
    // Don't remove version as it might be used by other parts of the app
  } catch (error) {
    console.error("Failed to remove user from storage:", error);
    // In case of storage full error, clear everything
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      try {
        localStorage.clear();
      } catch (clearError) {
        console.error(
          "Failed to clear storage after quota exceeded:",
          clearError
        );
      }
    }
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const storedUser = getUserFromStorage();

        if (storedUser && apiService.isAuthenticated()) {
          try {
            // Verify the session is still valid
            const profile = await apiService.getProfile();
            if (isMounted) {
              setCurrentUser(profile.data.user as CurrentUser);
            }
          } catch (apiError) {
            console.error("Session validation failed:", apiError);
            if (isMounted) {
              apiService.removeToken();
              removeUserFromStorage();
            }
          }
        } else if (storedUser) {
          // We have a stored user but no valid token
          console.log("No valid session, requiring re-authentication");
          if (isMounted) {
            removeUserFromStorage();
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        if (isMounted) {
          apiService.removeToken();
          removeUserFromStorage();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Add storage event listener to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_CONFIG.KEYS.AUTH) {
        if (!e.newValue) {
          // User logged out in another tab
          setCurrentUser(null);
        } else {
          // User changed in another tab
          const user = getUserFromStorage();
          if (user) {
            setCurrentUser(user);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    loadUser();

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (isLoading) return; // Prevent multiple login attempts

    try {
      setError(null);
      setIsLoading(true);

      const response = await apiService.login(email, password);
      const user = response.data.user as CurrentUser;

      // Normalize user role to match expected format
      const normalizedUser = {
        ...user,
        role: (user.role.charAt(0).toUpperCase() +
          user.role.slice(1).toLowerCase()) as UserRole,
      };

      // Validate the user data before saving
      if (!isCurrentUser(normalizedUser)) {
        throw new Error("Invalid user data received from server");
      }

      apiService.setToken(response.data.token);
      setCurrentUser(normalizedUser);
      saveUserToStorage(normalizedUser);

      navigate("/citizen/dashboard");
    } catch (error) {
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
    name: string,
    role: UserRole,
    profileData?: any
  ) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiService.register(
        email,
        password,
        name,
        role.toLowerCase()
      );
      navigate("/login");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      setError(errorMessage);
      throw error;
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

      // Send the ID token with role and profile data to backend
      const response = await apiService.googleLogin(
        userInfo.idToken,
        role.toLowerCase(),
        profileData
      );
      const user = response.data.user as CurrentUser;

      // Capitalize the role to match frontend expectations
      const normalizedUser = {
        ...user,
        role: (user.role.charAt(0).toUpperCase() +
          user.role.slice(1).toLowerCase()) as UserRole,
      };

      // Store token and user data
      apiService.setToken(response.data.token);
      setCurrentUser(normalizedUser);
      saveUserToStorage(normalizedUser);

      // Navigate based on role
      if (normalizedUser.role === "Citizen") {
        navigate("/citizen/dashboard");
      } else if (normalizedUser.role === "Organization") {
        navigate("/org/dashboard");
      } else if (normalizedUser.role === "Volunteer") {
        navigate("/volunteer/dashboard");
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

      // Try to login with backend (check if user exists)
      try {
        const response = await apiService.googleLogin(idToken);
        const backendUser = response.data.user as CurrentUser;

        // User exists - log them in
        const normalizedUser = {
          ...backendUser,
          role: (backendUser.role.charAt(0).toUpperCase() +
            backendUser.role.slice(1).toLowerCase()) as UserRole,
        };

        apiService.setToken(response.data.token);
        setCurrentUser(normalizedUser);
        saveUserToStorage(normalizedUser);

        // Navigate based on role
        if (normalizedUser.role === "Citizen") {
          navigate("/citizen/dashboard");
        } else if (normalizedUser.role === "Organization") {
          navigate("/org/dashboard");
        } else if (normalizedUser.role === "Volunteer") {
          navigate("/volunteer/dashboard");
        }
      } catch (backendError: any) {
        // User doesn't exist in backend - redirect to role selection
        if (
          backendError.message?.includes("not found") ||
          backendError.message?.includes("User not registered") ||
          backendError.message?.includes("User does not exist")
        ) {
          // Store Google user info in sessionStorage for role selection page
          sessionStorage.setItem(
            "googleUserInfo",
            JSON.stringify(googleUserInfo)
          );
          navigate("/select-role");
          return; // Exit early to prevent error from being thrown
        } else {
          throw backendError;
        }
      }
    } catch (error) {
      console.error("Google login failed:", error);
      setError("Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
