import { apiService } from "../lib/api";

// Use the same API_BASE_URL as apiService for consistency
const API_BASE_URL = "https://disasterconnect-api.vercel.app/api";

// Helper function to get auth headers using JWT token from apiService
const getAuthHeaders = (): HeadersInit => {
  const token = (apiService as any).getToken?.();
  if (!token) {
    throw new Error("User not authenticated. Please log in.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        errorData.message ||
        `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
};

export interface EvacuationCenter {
  id: string;
  name: string;
  address: string;
  head: string;
  contact: string;
  capacity: number;
  occupied: number;
  lat: number;
  lng: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEvacuationCenterData {
  name: string;
  address: string;
  head?: string;
  contact?: string;
  capacity: number;
  occupied?: number;
  lat: number;
  lng: number;
  lon?: number;
  facilities?: string[];
}

export interface UpdateEvacuationCenterData {
  name?: string;
  address?: string;
  head?: string;
  contact?: string;
  capacity?: number;
  occupied?: number;
  lat?: number;
  lng?: number;
}

export const evacuationCenterService = {
  // Get all evacuation centers for the authenticated organization user
  async getEvacuationCenters(): Promise<EvacuationCenter[]> {
    const response = await apiService.apiRequest<{
      success: boolean;
      data: EvacuationCenter[];
    }>("/organization/centers", { method: "GET" });

    // Normalize backend lon -> frontend lng so maps and forms work consistently
    const normalized: EvacuationCenter[] = response.data.map((item: any) => ({
      ...item,
      lng: item.lng ?? item.lon,
    }));

    return normalized;
  },

  // Create a new evacuation center (org inferred from JWT on backend)
  async createEvacuationCenter(
    data: CreateEvacuationCenterData
  ): Promise<{ id: string; message: string; center?: EvacuationCenter }> {
    const payload = {
      name: data.name,
      address: data.address,
      capacity: data.capacity,
      lat: data.lat,
      lon: data.lon ?? data.lng,
      facilities: data.facilities ?? [],
      // Extra metadata the backend model may choose to store
      head: data.head,
      contact: data.contact,
      occupied: data.occupied ?? 0,
    };

    const response = await apiService.apiRequest<{
      success: boolean;
      data: { id: string; message: string; center?: EvacuationCenter };
    }>("/organization/centers", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.data;
  },

  // Update an existing evacuation center (expects future backend support)
  async updateEvacuationCenter(
    centerId: string,
    data: UpdateEvacuationCenterData
  ): Promise<{ message: string; center?: EvacuationCenter }> {
    const response = await apiService.apiRequest<{
      message: string;
      center?: EvacuationCenter;
    }>(`/organization/centers/${centerId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return response;
  },

  // Delete an evacuation center (expects future backend support)
  async deleteEvacuationCenter(centerId: string): Promise<{ message: string }> {
    const response = await apiService.apiRequest<{
      message: string;
    }>(`/organization/centers/${centerId}`, {
      method: "DELETE",
    });

    return response;
  },
};
