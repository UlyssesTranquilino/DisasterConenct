// src/services/citizenService.ts
import { apiService } from "../lib/api";

export interface HelpRequest {
  id: string;
  userId: string;
  type: "trapped" | "medical" | "food" | "rescue" | "other";
  status: "pending" | "acknowledged" | "in_progress" | "resolved" | "cancelled";
  location: string;
  details: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHelpRequestData {
  type: string;
  location: string;
  details: string;
}

export const citizenService = {
  // Submit a new help request
  async requestHelp(data: CreateHelpRequestData): Promise<HelpRequest> {
    const response = await apiService.apiRequest<{ success: boolean; data: HelpRequest }>(
      "/citizen/requests", 
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  // Get the current user's active requests
  async getMyActiveRequests(): Promise<HelpRequest[]> {
    const response = await apiService.apiRequest<{ success: boolean; data: HelpRequest[] }>(
      "/citizen/requests/active", 
      { method: "GET" }
    );
    return response.data;
  },

  // Cancel a request (optional feature)
  async cancelRequest(requestId: string): Promise<void> {
    await apiService.apiRequest(
      `/citizen/requests/${requestId}/cancel`, 
      { method: "PUT" }
    );
  }
};