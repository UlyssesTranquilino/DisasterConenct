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