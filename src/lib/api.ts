// API service for communicating with the backend
// const API_BASE_URL = "https://disasterconnect-api.vercel.app/api";
const API_BASE_URL = "http://localhost:5000/api";

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
  private token: string | null = null; // <-- memory token
  private TOKEN_KEY = "auth_token";

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.restoreTokenFromStorage(); // auto-restore on creation
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
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
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

  // ---------------- TOKEN HANDLING ----------------

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  restoreTokenFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.token = token;
    }
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
    profileData?: any
  ): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, role, profileData }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async googleLogin(
    idToken: string,
    role?: string,
    profileData?: any
  ): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken, role, profileData }),
    });
  }

  async getProfile(): Promise<{ success: boolean; data: { user: User } }> {
    return this.request("/auth/profile", {
      method: "GET",
    });
  }
}

export const apiService = new ApiService();
export default apiService;
