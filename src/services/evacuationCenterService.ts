import { apiService } from "../lib/api";

const API_BASE_URL =
  "https://disasterconnect-api.vercel.app/api" || "http://localhost:5000/api";

// Helper function to get auth headers using JWT token from apiService
const getAuthHeaders = (): HeadersInit => {
  const token = apiService.getToken();
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
    const response = await fetch(`${API_BASE_URL}/organization/centers`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const json = (await handleResponse(response)) as {
      success: boolean;
      data: EvacuationCenter[];
    };

    return json.data;
  },

  // Create a new evacuation center (org inferred from JWT on backend)
  async createEvacuationCenter(
    data: CreateEvacuationCenterData
  ): Promise<{ id: string; message: string; center?: EvacuationCenter }> {
    const response = await fetch(`${API_BASE_URL}/organization/centers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = (await handleResponse(response)) as {
      success: boolean;
      data: { id: string; message: string; center?: EvacuationCenter };
    };

    return json.data;
  },

  // Update an existing evacuation center (expects future backend support)
  async updateEvacuationCenter(
    centerId: string,
    data: UpdateEvacuationCenterData
  ): Promise<{ message: string; center?: EvacuationCenter }> {
    const response = await fetch(
      `${API_BASE_URL}/organization/centers/${centerId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return handleResponse(response);
  },

  // Delete an evacuation center (expects future backend support)
  async deleteEvacuationCenter(centerId: string): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/organization/centers/${centerId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};
