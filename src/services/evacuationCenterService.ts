import { auth } from "../lib/firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Helper function to get auth headers
const getAuthHeaders = async (): Promise<HeadersInit> => {
  // Wait for auth state to be ready
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (!user) {
        reject(new Error("User not authenticated"));
        return;
      }

      try {
        const token = await user.getIdToken();
        resolve({
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        });
      } catch (error) {
        reject(error);
      }
    });
  });
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
  // Get all evacuation centers for an organization
  async getEvacuationCenters(orgId: string): Promise<EvacuationCenter[]> {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${orgId}/centers`,
      {
        method: "GET",
        headers: await getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Create a new evacuation center
  async createEvacuationCenter(
    orgId: string,
    data: CreateEvacuationCenterData
  ): Promise<{ id: string; message: string; center: EvacuationCenter }> {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${orgId}/centers`,
      {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return handleResponse(response);
  },

  // Update an existing evacuation center
  async updateEvacuationCenter(
    orgId: string,
    centerId: string,
    data: UpdateEvacuationCenterData
  ): Promise<{ message: string; centerId: string }> {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${orgId}/centers/${centerId}`,
      {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return handleResponse(response);
  },

  // Delete an evacuation center
  async deleteEvacuationCenter(
    orgId: string,
    centerId: string
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${orgId}/centers/${centerId}`,
      {
        method: "DELETE",
        headers: await getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};
