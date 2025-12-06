// API service for communicating with the backend
// Use environment variable for API URL, fallback to localhost for development
// const API_BASE_URL =
//   import.meta.env.DEV
//     ? "/api"
//     : "https://disasterconnect-api.vercel.app/api";

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

// Volunteer Interfaces
export interface AvailabilityData {
  date: string;
  status: "Available" | "Unavailable";
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface Assignment {
  id: string;
  title: string;
  organization: string;
  organizationId: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  priority: "Low" | "Medium" | "High" | "Critical";
  location: string;
  coordinates: { lat: number; lng: number };
  requiredSkills: string[];
  estimatedHours: number;
  organizationContact: string;
  supplies?: string[];
  volunteersNeeded?: number;
  volunteersAssigned?: number;
}

export interface Need {
  id: string;
  title: string;
  organization: string;
  organizationId: string;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number };
  skillsRequired: string[];
  volunteersNeeded: number;
  volunteersAssigned: number;
  urgency: "High" | "Medium" | "Low";
  datePosted: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  status: "Open" | "Filled" | "Closed";
  estimatedDuration: string;
  requirements?: string[];
}

export interface SelfAssignData {
  orgId: string;
  needId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;
  private TOKEN_KEY = "auth_token";

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
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async googleLogin(
    idToken: string,
    roles?: UserRole[],
    profileData?: any
  ): Promise<AuthResponse> {
    // Backend expects the Google ID token in a field named `token`
    return this.request<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ token: idToken, roles, profileData }),
    });
  }

  async completeGoogleProfile(
    idToken: string,
    role: string,
    profileData?: any
  ): Promise<AuthResponse> {
    // Same endpoint as googleLogin; backend expects `token` and `role`
    return this.request<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({
        token: idToken,
        role, // Send as single role string
        profileData,
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
    return this.request("/auth/switch-role", {
      method: "POST",
      body: JSON.stringify({ activeRole: role }),
    });
  }

  // Token management
  setToken(token: string): void {
    localStorage.setItem("auth_token", token);
  }

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  removeToken(): void {
    localStorage.removeItem("auth_token");
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // VOLUNTEER ENDPOINTS

  // 1. Set Availability
  async setAvailability(availabilityData: AvailabilityData): Promise<ApiResponse> {
    return this.request<ApiResponse>("/volunteer/availability", {
      method: "POST",
      body: JSON.stringify(availabilityData),
    });
  }

  // 2. Get Assignments
  async getAssignments(): Promise<ApiResponse<Assignment[]>> {
    return this.request<ApiResponse<Assignment[]>>("/volunteer/assignments", {
      method: "GET",
    });
  }

  // 3. Get Needs (Help Wanted Feed)
  async getNeeds(): Promise<ApiResponse<Need[]>> {
    return this.request<ApiResponse<Need[]>>("/volunteer/needs", {
      method: "GET",
    });
  }

  // 4. Self-Assign (Claim Task)
  async selfAssign(selfAssignData: SelfAssignData): Promise<ApiResponse> {
    return this.request<ApiResponse>("/volunteer/self-assign", {
      method: "POST",
      body: JSON.stringify(selfAssignData),
    });
  }

  // 5. Optional: Update Assignment Status (if backend supports it)
  async updateAssignmentStatus(assignmentId: string, status: Assignment['status']): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/volunteer/assignments/${assignmentId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // 6. Optional: Get Volunteer Profile (if backend supports it)
  async getVolunteerProfile(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse>("/volunteer/profile", {
      method: "GET",
    });
  }
}

export const apiService = new ApiService();
export default apiService;