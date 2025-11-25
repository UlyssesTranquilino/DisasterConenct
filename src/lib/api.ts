// API service for communicating with the backend
// const API_BASE_URL = "https://disasterconnect-api.vercel.app/api";
const API_BASE_URL = "http://localhost:5000";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
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
      ...options,
    };

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Auth methods
  async register(
    email: string,
    password: string,
    name: string,
    role: string,
    profileData?: any
  ): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, role, profileData }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data?.token) {
        this.setToken(response.data.token);
      }

      return response;
    } catch (error) {
      this.removeToken();
      throw error;
    }
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
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    if (typeof window === "undefined") return;
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
