// API service for communicating with the backend
// const API_BASE_URL = "https://disasterconnect-api.vercel.app/api";
const API_BASE_URL = "http://localhost:5000";

const API_BASE_URL = "https://disasterconnect-api.vercel.app/api";
// const API_BASE_URL = "http://localhost:5000/api";

export type UserRole = "citizen" | "organization" | "volunteer";

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
  private readonly TOKEN_KEY = "auth_token";
  private readonly USER_KEY = "user_data";

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.restoreTokenFromStorage();
  }

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

  async register(
    email: string,
    password: string,
    name: string,
    role: string,
    profileData: any = {}
  ): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        name,
        role,
        profileData,
      }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.success) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }

    return response;
  }

  async googleLogin(
    idToken: string,
    role?: string,
    profileData?: any
  ): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idToken,
        role: role || "citizen",
        profileData: profileData || {},
      }),
    });

    if (response.success) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }

    return response;
  }

  async getProfile(): Promise<{ success: boolean; data: { user: User } }> {
    const response = await this.request<{
      success: boolean;
      data: { user: User };
    }>("/api/auth/profile", {
      method: "GET",
    });

    if (response.success) {
      this.setUser(response.data.user);
    }

    return response;
  }

  // Token management
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // User data management
  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Initialize auth state
  async initializeAuth(): Promise<{
    isAuthenticated: boolean;
    user: User | null;
  }> {
    const token = this.getToken();
    if (!token) {
      return { isAuthenticated: false, user: null };
    }

    try {
      // Try to get user profile to verify token
      const response = await this.getProfile();
      if (response.success) {
        this.setUser(response.data.user);
        return { isAuthenticated: true, user: response.data.user };
      }
      return { isAuthenticated: false, user: null };
    } catch (error) {
      console.error("Auth initialization error:", error);
      this.removeToken();
      return { isAuthenticated: false, user: null };
    }
  }
}

export const apiService = new ApiService();
export default apiService;
