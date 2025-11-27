// src/services/organizationService.ts
import { apiService } from "../lib/api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api") + "/organizations";

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
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || `Request failed with status ${response.status}`);
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
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Announcements
  async getAnnouncements(orgId: string) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/announcements`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async createAnnouncement(
    orgId: string,
    data: { title: string; body: string; status?: string }
  ) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/announcements`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateAnnouncement(
    orgId: string,
    announcementId: string,
    data: { title?: string; body?: string; status?: string }
  ) {
    const response = await fetch(
      `${API_BASE_URL}/${orgId}/announcements/${announcementId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return handleResponse(response);
  },

  async deleteAnnouncement(orgId: string, announcementId: string) {
    const response = await fetch(
      `${API_BASE_URL}/${orgId}/announcements/${announcementId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Evacuation Centers
  async getEvacuationCenters(orgId: string) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/centers`, {
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateEvacuationCenter(
    orgId: string,
    centerId: string,
    data: {
      name?: string;
      address?: string;
      head?: string;
      contact?: string;
      capacity?: number;
      occupied?: number;
      lat?: number;
      lng?: number;
    }
  ) {
    const response = await fetch(
      `${API_BASE_URL}/${orgId}/centers/${centerId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return handleResponse(response);
  },

  async deleteEvacuationCenter(orgId: string, centerId: string) {
    const response = await fetch(
      `${API_BASE_URL}/${orgId}/centers/${centerId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Reports
  async getReports(orgId: string) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/reports`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async createReport(
    orgId: string,
    data: { title: string; content: string; status?: string; type?: string }
  ) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/reports`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateReport(
    orgId: string,
    reportId: string,
    data: { title?: string; content?: string; status?: string; type?: string }
  ) {
    const response = await fetch(
      `${API_BASE_URL}/${orgId}/reports/${reportId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return handleResponse(response);
  },

  async deleteReport(orgId: string, reportId: string) {
    const response = await fetch(
      `${API_BASE_URL}/${orgId}/reports/${reportId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Resources
  async getResources(orgId: string) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/resources`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async createResource(
    orgId: string,
    data: { name: string; quantity: number; unit?: string; category?: string }
  ) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/resources`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateResource(
    orgId: string,
    resourceId: string,
    data: { quantity?: number; name?: string; unit?: string; category?: string }
  ) {
    const response = await fetch(
      `${API_BASE_URL}/${orgId}/resources/${resourceId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return handleResponse(response);
  },

  async deleteResource(orgId: string, resourceId: string) {
    const response = await fetch(
      `${API_BASE_URL}/${orgId}/resources/${resourceId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Volunteers
  async getVolunteers(orgId: string) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/volunteers`, {
      headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      }
    );
    return handleResponse(response);
  },

  // Metrics
  async getOrganizationMetrics(orgId: string) {
    const response = await fetch(`${API_BASE_URL}/${orgId}/metrics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Type definitions
export interface Announcement {
  id: string;
  title: string;
  body: string;
  status: string;
  createdAt?: Date | string;
  date?: Date | string;
}

export interface Resource {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  updatedAt?: Date | string;
  createdAt?: Date | string;
}
