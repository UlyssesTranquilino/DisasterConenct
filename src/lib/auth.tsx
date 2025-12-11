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
export type UserRole = "citizen" | "organization" | "volunteer"; // Frontend UI names

// --- Helper for role mapping to backend names (civilian) ---
const toBackendRole = (frontendRole: UserRole): string => {
  if (frontendRole === "citizen") return "civilian"; // Translate "citizen" to backend's "civilian"
  return frontendRole;
};

// --- Helper to get all roles for registration (multi-role logic) ---
const getRegistrationRoles = (selectedRole: UserRole): string[] => {
  const primaryRole = toBackendRole(selectedRole);

  if (primaryRole === "civilian" || primaryRole === "volunteer") {
    // If citizen/volunteer is selected, ensure both roles are present
    return ["civilian", "volunteer"];
  }

  // Organization is exclusive
  return [primaryRole];
};


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

  // UPDATED: Map incoming "civilian" to internal "citizen"
  const normalizeRole = (role: string): UserRole | string => {
    const normalized = role.toLowerCase();

    // Translate backend's "civilian" to frontend's "citizen"
    if (normalized === "civilian") return "citizen"; 
    
    // Ensure it's a valid UserRole
    if (
      normalized === "citizen" ||
      normalized === "organization" ||
      normalized === "volunteer"
    ) {
      return normalized as UserRole;
    }
    return "citizen"; // default fallback for clarity
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
          // Use the updated normalizeRole here
          roles: storedUser.roles?.map(normalizeRole) as UserRole[] || [], 
          activeRole: storedUser.activeRole
            ? normalizeRole(storedUser.activeRole) as UserRole
            : null,
        };

        setCurrentUser(normalizedUser);

        const token = localStorage.getItem("auth_token");
        if (token) apiService.setToken(token);

        // Fetch latest profile
        try {
          const profile = await apiService.getProfile();
          const profileUser = profile.data.user;
          // Use the updated normalizeRole here
          setCurrentUser({
            ...profileUser,
            roles: profileUser.roles?.map(normalizeRole) as UserRole[] || [],
            activeRole: profileUser.activeRole
              ? normalizeRole(profileUser.activeRole) as UserRole
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
    // 1. Normalize roles from backend (e.g., "civilian" -> "citizen")
    const rawRoles = Array.isArray(user.roles)
      ? user.roles.map(normalizeRole)
      : [normalizeRole(user.role || "citizen")];

    // 2. Filter out duplicates or raw backend role if present, ensuring it matches the front-end type
    const uniqueRoles: UserRole[] = Array.from(new Set(
      rawRoles.filter((r: string) => r === "citizen" || r === "volunteer" || r === "organization")
    )) as UserRole[];
    
    // 3. Determine active role using normalized roles
    const activeRole = user.activeRole
      ? normalizeRole(user.activeRole)
      : uniqueRoles[0] || "citizen";

    return {
      id: user.id || user.uid,
      email: user.email,
      displayName: user.displayName || user.name || user.email.split("@")[0],
      roles: uniqueRoles,
      activeRole: activeRole as UserRole, // Cast to our frontend type
      organizations: user.organizations || [],
      isVerified: user.isVerified || user.emailVerified || false,
      profilePicture: user.profilePicture || user.photoURL,
      ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
      ...(user.location && { location: user.location }),
    } as CurrentUser;
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

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      setError(null);
      setIsLoading(true);

      // Translate the frontend role ("citizen") to the backend role ("civilian")
      const backendRole = toBackendRole(role); 
      
      const response = await apiService.login(email, password, backendRole); // <-- PASS THE TRANSLATED ROLE

      if (response.success) {
        const { token, user } = response.data;
        const normalizedUser = normalizeUser(user);
        
        // Ensure the user is logged in with the role they selected on the LoginPage form
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
    role: UserRole, // Frontend role is passed here
    profileData: any = {}
  ) => {
    try {
      setError(null);
      setIsLoading(true);

      // 1. Translate primary role for backend
      const backendRole = toBackendRole(role);
      
      // 2. Determine all roles for backend linking (civilian/volunteer link)
      const allRoles = getRegistrationRoles(role); 

      const response = await apiService.register(
        email,
        password,
        name,
        backendRole, // Send the single, translated primary role (e.g., "civilian")
        { ...profileData, roles: allRoles } // Pass the full set of roles for backend processing
      );

      if (response.success) {
        const { token, user } = response.data;
        const normalizedUser = normalizeUser(user);

        // FIX: Ensure the user is redirected to the role they just selected
        // This overrides the backend's default or the frontend's 'uniqueRoles[0]' fallback.
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

        const normalizedUser = normalizeUser(backendUser);
        
        // NOTE: For existing users, we trust the backend's activeRole or fall back to default logic.

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
    role: UserRole, // Frontend role is passed here
    profileData: any
  ) => {
    try {
      setError(null);
      setIsLoading(true);

      // 1. Translate primary role for backend
      const backendRole = toBackendRole(role);
      
      // 2. Determine all roles for backend linking (civilian/volunteer link)
      const allRoles = getRegistrationRoles(role);

      // Pass single primary role string and all roles list in profileData
      const response = await apiService.completeGoogleProfile(
        userInfo.idToken,
        backendRole, // Send the single, translated primary role (e.g., "civilian")
        { ...profileData, roles: allRoles } // Send all roles as a list in profileData
      );

      if (response.success) {
        const backendUser = response.data.user;

        const normalizedUser = normalizeUser(backendUser); // Use updated normalizeUser

        // FIX: Ensure the user is redirected to the role they just selected
        // This overrides the backend's default or the frontend's 'uniqueRoles[0]' fallback.
        normalizedUser.activeRole = role;

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