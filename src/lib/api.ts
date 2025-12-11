// src/lib/api.ts
// API service for communicating with the backend

// Use environment variable for API URL, fallback to localhost for development
// toggle these comments to switch between local and production if needed
const API_BASE_URL = "https://disasterconnect-api.vercel.app/api";
// const API_BASE_URL = "http://localhost:5000/api";

// UPDATED: Include "civilian" as a potential role returned by the backend.
export type UserRole = "citizen" | "organization" | "volunteer" | "civilian";

export type User = {
  id: string;
  email: string;
  displayName: string;
  roles: UserRole[]; // multiple roles
  activeRole: UserRole | null; // currently active
  organizations?: string[]; // org IDs if user has organization role
  citizenId?: string;
  volunteerId?: string;
  phoneNumber?: string;
  isVerified?: boolean;
  profilePicture?: string;
  location?: {
    lat: number | null;
    lng: number | null;
    address: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export interface AuthResponse {
  success: boolean;
  message: string;
  error?: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;
  private TOKEN_KEY = "auth_token";

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.restoreTokenFromStorage();
  }

  // --- NEW HELPER: Converts "citizen" -> "civilian" ---
  private normalizeRole(role: string): string {
    return role === 'citizen' ? 'civilian' : role;
  }
  // ----------------------------------------------------

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Important for cookies/sessions
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      // Handle network errors
      if (!response.ok && response.status === 0) {
        throw new Error(
          "Network error: Could not connect to the server. Please ensure the backend is running."
        );
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T;
      }

      // Try to parse JSON, but handle cases where response might not be JSON
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          text || `Request failed with status ${response.status}`
        );
      }

      if (response.status === 401) {
        // Check if this is an auth endpoint (login/register/google) - don't redirect for those
        const isAuthEndpoint =
          endpoint.includes("/auth/login") ||
          endpoint.includes("/auth/register") ||
          endpoint.includes("/auth/google");

        if (!isAuthEndpoint) {
          // Token expired or invalid for protected routes
          this.clearToken();
          window.location.href = "/login";
          throw new Error("Session expired. Please log in again.");
        }
        // For auth endpoints, let the error message through so the caller can handle it
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `Request failed with status ${response.status}`
        );
      }

      return data;
    } catch (error: any) {
      // Enhanced error handling
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error(
          `API request to ${endpoint} failed: Network error - Backend may not be running`
        );
        throw new Error(
          "Cannot connect to server. Please ensure the backend is running on port 5000."
        );
      }
      console.error(`API request to ${endpoint} failed:`, error);
      throw error;
    }
  }

  // Public request method for organization service
  public async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, options);
  }

  // ---------------- TOKEN HANDLING ----------------

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem(this.TOKEN_KEY);
  }

  restoreTokenFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) this.token = token;
  }

  removeToken(): void {
    this.token = null;
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // ---------------- AUTH API ----------------

  // Note: 'role' and 'profileData' handle the backend's need for 'civilian' and multi-role array
  async register(
    email: string,
    password: string,
    name: string,
    role: string, // Frontend role (e.g., "citizen")
    profileData: any = {}
  ): Promise<AuthResponse> {
    
    // FIX: Force 'civilian' even if UI sends 'citizen'
    const backendRole = this.normalizeRole(role);
    
    // Also fix the role inside the profile data array if it exists
    const safeProfileData = { ...profileData };
    if (safeProfileData.roles && Array.isArray(safeProfileData.roles)) {
        safeProfileData.roles = safeProfileData.roles.map((r: string) => this.normalizeRole(r));
    }

    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        name,
        role: backendRole, // Send translated role
        profileData: safeProfileData, // Contains the full role array
      }),
    });
  }

  async login(email: string, password: string, role: string): Promise<AuthResponse> {
    // FIX: Force 'civilian'
    const backendRole = this.normalizeRole(role);

    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ 
        email, 
        password, 
        role: backendRole // Send translated role
      }), 
    });
  }

  async googleLogin(
    idToken: string,
    roles?: UserRole[],
    profileData?: any
  ): Promise<AuthResponse> {
    // FIX: Normalize roles array if it exists
    const backendRoles = roles ? roles.map(r => this.normalizeRole(r) as UserRole) : undefined;

    // Backend expects the Google ID token in a field named `token`
    return this.request<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ 
        token: idToken, 
        roles: backendRoles, 
        profileData 
      }),
    });
  }

  // Note: 'role' and 'profileData' handle the backend's need for 'civilian' and multi-role array
  async completeGoogleProfile(
    idToken: string,
    role: string, // Frontend primary role
    profileData?: any // Contains the full role array
  ): Promise<AuthResponse> {
    
    // FIX: Force 'civilian'
    const backendRole = this.normalizeRole(role);

    // Same endpoint as googleLogin; backend expects `token` and `role`
    return this.request<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({
        token: idToken,
        role: backendRole, // Send translated role
        profileData, // Contains the full role array
      }),
    });
  }

  async getProfile(): Promise<{ success: boolean; data: { user: User } }> {
    return this.request("/auth/profile", { method: "GET" });
  }

  // Optional: switch active role for the current user
  async switchRole(
    role: UserRole
  ): Promise<{ success: boolean; data: { user: User } }> {
    // Make sure we switch to the backend-safe name
    const backendRole = this.normalizeRole(role);
    
    return this.request("/auth/switch-role", {
      method: "POST",
      body: JSON.stringify({ activeRole: backendRole }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;