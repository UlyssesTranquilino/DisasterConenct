// API service for communicating with the backend
// const API_BASE_URL = "https://disasterconnect-api.vercel.app/api";
const API_BASE_URL = "http://localhost:5000";

// Simple check for environment variable - TypeScript friendly
const getApiBaseUrl = (): string => {
  // @ts-ignore - We know import.meta.env exists in Vite
  const env = typeof import.meta !== 'undefined' ? import.meta.env : {};
  
  if (env.VITE_API_BASE_URL) {
    return env.VITE_API_BASE_URL;
  }
  
  // Default to production URL
  return "https://disasterconnect-api.vercel.app/api";
};

console.log("API Base URL:", API_BASE_URL);

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
  error?: string; // Added error property
}

// Organization Interface for Volunteer View
export interface Organization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  description?: string;
  type?: string;
  status: 'Active' | 'Inactive';
  joinedDate: string;
  tasksAssigned: number;
  tasksCompleted: number;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  logoUrl?: string;
}

// Disaster Interface
export interface Disaster {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  casualties: {
    injured: number;
    missing: number;
    deceased: number;
  };
  needsHelp: string[];
  status: "Active" | "Contained" | "Resolved";
  reportedAt: string;
  updatedAt: string;
  reportedBy: string;
}

// Help Request Interface
export interface HelpRequest {
  id: string;
  disasterId: string;
  title: string;
  description: string;
  urgency: "Low" | "Medium" | "High" | "Critical";
  type: "Rescue" | "Medical" | "Supplies" | "Evacuation" | "Other";
  numberOfPeople: number;
  location: {
    lat: number;
    lng: number;
  };
  contactInfo: {
    phone: string;
    name?: string;
    email?: string;
  };
  status: "Pending" | "Assigned" | "In Progress" | "Completed" | "Cancelled";
  createdAt: string;
  updatedAt: string;
  assignedTo?: string; // Volunteer ID
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

  private restoreTokenFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) this.token = token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem(this.TOKEN_KEY);
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

  // Update user roles (for civilian to volunteer upgrade)
  async updateUserRoles(
    userId: string,
    rolesUpdate: { isVolunteer?: boolean }
  ): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/auth/users/${userId}/roles`, {
      method: "PATCH",
      body: JSON.stringify(rolesUpdate),
    });
  }

  // ---------------- VOLUNTEER ENDPOINTS ----------------

  // 1. Set Availability
  async setAvailability(availabilityData: AvailabilityData): Promise<ApiResponse> {
    return this.request<ApiResponse>("/volunteer/availability", {
      method: "POST",
      body: JSON.stringify(availabilityData),
    });
  }

  // 2. Get Assignments - FIXED VERSION
  async getAssignments(): Promise<ApiResponse<Assignment[]>> {
    try {
      console.log("Fetching assignments from:", `${this.baseURL}/volunteer/assignments`);
      const response = await this.request<any>("/volunteer/assignments", {
        method: "GET",
      });
      
      console.log("Assignments API response:", response);
      
      // Handle different response structures
      if (response.success && response.data) {
        return {
          success: true,
          message: response.message || "Assignments fetched successfully",
          data: Array.isArray(response.data) ? response.data : []
        };
      } else if (Array.isArray(response)) {
        // If response is directly an array
        return {
          success: true,
          message: "Assignments fetched successfully",
          data: response
        };
      } else {
        return {
          success: false,
          message: response.message || "No assignments found",
          data: []
        };
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch assignments",
        data: []
      };
    }
  }

  // 3. Get Needs (Help Wanted Feed) - FIXED VERSION
  async getNeeds(): Promise<ApiResponse<Need[]>> {
    try {
      console.log("Fetching needs from:", `${this.baseURL}/volunteer/needs`);
      const response = await this.request<any>("/volunteer/needs", {
        method: "GET",
      });
      
      console.log("Needs API response:", response);
      
      // Handle different response structures
      if (response.success && response.data) {
        return {
          success: true,
          message: response.message || "Needs fetched successfully",
          data: Array.isArray(response.data) ? response.data : []
        };
      } else if (Array.isArray(response)) {
        // If response is directly an array
        return {
          success: true,
          message: "Needs fetched successfully",
          data: response
        };
      } else {
        return {
          success: false,
          message: response.message || "No needs found",
          data: []
        };
      }
    } catch (error) {
      console.error("Failed to fetch needs:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch needs",
        data: []
      };
    }
  }

  // 4. Self-Assign (Claim Task)
  async selfAssign(selfAssignData: SelfAssignData): Promise<ApiResponse> {
    try {
      console.log("Self-assign called with data:", selfAssignData);
      
      // Send EXACTLY what the backend expects per documentation
      const response = await this.request<ApiResponse>("/volunteer/self-assign", {
        method: "POST",
        body: JSON.stringify({
          orgId: selfAssignData.orgId,        // lowercase "orgId" per docs
          needId: selfAssignData.needId,      // lowercase "needId" per docs
        }),
      });
      
      console.log("Self-assign response:", response);
      
      return response;
    } catch (error: any) {
      console.error("Self-assign failed:", error);
      
      return {
        success: false,
        message: error.message || "Failed to assign to need",
        error: error.toString()
      };
    }
  }

  // 5. Get Volunteer Profile with Organizations
  async getVolunteerProfile(): Promise<ApiResponse<{ user: User; organizations: Organization[] }>> {
    try {
      const response = await this.request<any>("/volunteer/profile", {
        method: "GET",
      });
      
      return {
        success: true,
        message: "Volunteer profile fetched successfully",
        data: response.data || { user: response.user || {}, organizations: [] }
      };
    } catch (error) {
      console.error("Failed to fetch volunteer profile:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch profile",
        data: { user: {} as User, organizations: [] }
      };
    }
  }

  // 6. Get Volunteer's Linked Organizations
  async getVolunteerOrganizations(): Promise<ApiResponse<Organization[]>> {
    try {
      const response = await this.request<any>("/volunteer/organizations", {
        method: "GET",
      });
      
      if (response.success && response.data) {
        return {
          success: true,
          message: response.message || "Organizations fetched successfully",
          data: Array.isArray(response.data) ? response.data : []
        };
      } else if (Array.isArray(response)) {
        return {
          success: true,
          message: "Organizations fetched successfully",
          data: response
        };
      } else {
        return {
          success: false,
          message: response.message || "No organizations found",
          data: []
        };
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch organizations",
        data: []
      };
    }
  }

  // ---------------- ORGANIZATION ENDPOINTS ----------------

  // --- Centers ---
  async getCenters(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>("/organization/centers", {
      method: "GET",
    });
  }

  async createCenter(centerData: any): Promise<ApiResponse> {
    return this.request<ApiResponse>("/organization/centers", {
      method: "POST",
      body: JSON.stringify(centerData),
    });
  }

  async updateCenter(id: string, updates: any): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/organization/centers/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteCenter(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/organization/centers/${id}`, {
      method: "DELETE",
    });
  }

  // --- Announcements ---
  async getAnnouncements(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>("/organization/announcements", {
      method: "GET",
    });
  }

  async createAnnouncement(announcementData: any): Promise<ApiResponse> {
    return this.request<ApiResponse>("/organization/announcements", {
      method: "POST",
      body: JSON.stringify(announcementData),
    });
  }

  async updateAnnouncement(id: string, updates: any): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/organization/announcements/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteAnnouncement(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/organization/announcements/${id}`, {
      method: "DELETE",
    });
  }

  // --- Resources ---
  async getResources(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>("/organization/resources", {
      method: "GET",
    });
  }

  async createResource(resourceData: any): Promise<ApiResponse> {
    return this.request<ApiResponse>("/organization/resources", {
      method: "POST",
      body: JSON.stringify(resourceData),
    });
  }

  async updateResource(id: string, updates: any): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/organization/resources/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteResource(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/organization/resources/${id}`, {
      method: "DELETE",
    });
  }

  // --- Reports ---
  async getReports(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>("/organization/reports", {
      method: "GET",
    });
  }

  async createReport(reportData: any): Promise<ApiResponse> {
    return this.request<ApiResponse>("/organization/reports", {
      method: "POST",
      body: JSON.stringify(reportData),
    });
  }

  async updateReport(id: string, updates: any): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/organization/reports/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteReport(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/organization/reports/${id}`, {
      method: "DELETE",
    });
  }

  // --- Volunteers & Tasks ---
  async getOrgVolunteers(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>("/organization/volunteers", {
      method: "GET",
    });
  }

  async assignTask(assignmentData: any): Promise<ApiResponse> {
    return this.request<ApiResponse>("/organization/assignments", {
      method: "POST",
      body: JSON.stringify(assignmentData),
    });
  }

  async deleteAssignment(volunteerId: string, assignmentId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/organization/assignments/${volunteerId}/${assignmentId}`, {
      method: "DELETE",
    });
  }

  async postNeed(needData: any): Promise<ApiResponse> {
    return this.request<ApiResponse>("/organization/needs", {
      method: "POST",
      body: JSON.stringify(needData),
    });
  }

  // Get Organization Details (for volunteer to view)
  async getOrganizationDetails(orgId: string): Promise<ApiResponse<Organization>> {
    try {
      const response = await this.request<any>(`/organizations/${orgId}`, {
        method: "GET",
      });
      
      return {
        success: true,
        message: "Organization details fetched successfully",
        data: response.data || response
      };
    } catch (error) {
      console.error("Failed to fetch organization details:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch organization",
        data: {} as Organization
      };
    }
  }

  // ---------------- DISASTER ENDPOINTS ----------------

  // Report a disaster
  async reportDisaster(disasterData: {
    title: string;
    description: string;
    type: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    location: {
      lat: number;
      lng: number;
      address: string;
    };
    casualties: {
      injured: number;
      missing: number;
      deceased: number;
    };
    needsHelp: string[];
  }): Promise<ApiResponse<Disaster>> {
    return this.request<ApiResponse<Disaster>>("/disasters", {
      method: "POST",
      body: JSON.stringify(disasterData),
    });
  }

  // Get active disasters
  async getActiveDisasters(): Promise<ApiResponse<Disaster[]>> {
    return this.request<ApiResponse<Disaster[]>>("/disasters/active", {
      method: "GET",
    });
  }

  // Get nearby disasters
  async getNearbyDisasters(lat: number, lng: number, radius: number = 50): Promise<ApiResponse<Disaster[]>> {
    return this.request<ApiResponse<Disaster[]>>(
      `/disasters/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
      { method: "GET" }
    );
  }

  // Get specific disaster
  async getDisaster(id: string): Promise<ApiResponse<Disaster>> {
    return this.request<ApiResponse<Disaster>>(`/disasters/${id}`, {
      method: "GET",
    });
  }

  // ---------------- HELP REQUESTS ENDPOINTS ----------------

  // Request immediate help
  async requestHelp(helpRequestData: {
    disasterId: string;
    title: string;
    description: string;
    urgency: "Low" | "Medium" | "High" | "Critical";
    type: "Rescue" | "Medical" | "Supplies" | "Evacuation" | "Other";
    numberOfPeople: number;
    location: {
      lat: number;
      lng: number;
    };
    contactInfo: {
      phone: string;
      name?: string;
      email?: string;
    };
  }): Promise<ApiResponse<HelpRequest>> {
    return this.request<ApiResponse<HelpRequest>>("/help-requests", {
      method: "POST",
      body: JSON.stringify(helpRequestData),
    });
  }

  // Update request status (mark as complete)
  async updateHelpRequestStatus(id: string, status: "completed" | "cancelled"): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/help-requests/${id}/fulfill`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // Get help requests for a disaster
  async getHelpRequests(disasterId?: string): Promise<ApiResponse<HelpRequest[]>> {
    const url = disasterId ? `/help-requests?disasterId=${disasterId}` : "/help-requests";
    return this.request<ApiResponse<HelpRequest[]>>(url, {
      method: "GET",
    });
  }

  // ---------------- HELPER METHODS ----------------

  // Check if user has a specific role
  hasRole(user: User | null, role: UserRole): boolean {
    if (!user) return false;
    return user.roles.includes(role);
  }

  // Get active role (fallback to first role if activeRole is null)
  getActiveRole(user: User | null): UserRole | null {
    if (!user) return null;
    return user.activeRole || user.roles[0] || null;
  }

  // Set auth headers for manual fetch requests (if needed elsewhere)
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Helper to extract error message from any error
  getErrorMessage(error: any): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'An unknown error occurred';
  }

  // Check if user can access organization features
  canAccessOrganizationFeatures(user: User | null): boolean {
    if (!user) return false;
    
    const hasOrganizationRole = user.roles.includes('organization');
    const isActiveOrganization = user.activeRole === 'organization';
    const hasOrganizations = Boolean(user.organizations?.length);
    
    return hasOrganizationRole || (isActiveOrganization && hasOrganizations);
  }

  // Format API date to readable string
  formatApiDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}

export const apiService = new ApiService();
export default apiService;