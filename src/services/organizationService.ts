// src/services/organizationService.ts
import { auth } from "../lib/firebase";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api") + "/organizations";

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
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Something went wrong");
  }
  return response.json();
};

export const organizationService = {
  // Organization
  async createOrganization(data: {
    name: string;
    email: string;
    type: string;
    description?: string;
    phone?: string;
    website?: string;
    location?: any;
    serviceArea?: string[];
  }) {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Announcements
  async getAnnouncements(orgId: string) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/announcements`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async createAnnouncement(
    orgId: string,
    data: { title: string; body: string; status?: string }
  ) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/announcements`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Evacuation Centers
  async getEvacuationCenters(orgId: string) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/centers`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async createEvacuationCenter(
    orgId: string,
    data: {
      name: string;
      address: string;
      head?: string;
      contact?: string;
      capacity: number;
      occupied?: number;
      lat?: number;
      lng?: number;
    }
  ) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/centers`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Reports
  async getReports(orgId: string) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/reports`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async createReport(
    orgId: string,
    data: { title: string; content: string; status?: string; type?: string }
  ) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/reports`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Resources
  async getResources(orgId: string) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/resources`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async updateResource(
    orgId: string,
    resourceId: string,
    data: { quantity: number; name?: string; unit?: string; category?: string }
  ) {
    const response = await fetch(
      `${API_BASE_URL}/${orgId}/resources/${resourceId}`,
      {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return handleResponse(response);
  },

  // Volunteers
  async getVolunteers(orgId: string) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/volunteers`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async updateVolunteerStatus(
    orgId: string,
    volunteerId: string,
    status: string
  ) {
    const response = await fetch(
      `${API_BASE_URL}/${orgId}/volunteers/${volunteerId}/status`,
      {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ status }),
      }
    );
    return handleResponse(response);
  },

  // Metrics
  async getOrganizationMetrics(orgId: string) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/metrics`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
