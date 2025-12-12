// src/services/citizenService.ts
import { apiService } from "../lib/api";

// --- FIX 1: Update HelpRequest status enum ---
export interface HelpRequest {
  id: string;
  userId: string;
  type: "trapped" | "medical" | "food" | "rescue" | "other" | string; // Made 'type' flexible
  // ✅ FIX 1: Added 'Closed', 'Filled', 'Open' (and 'resolved' for consistency)
  status: "pending" | "acknowledged" | "in_progress" | "resolved" | "cancelled" | "Closed" | "Filled" | "Open" | string;
  location: string;
  details: string;
  createdAt: string | any; // Made flexible for Firestore Timestamps
  updatedAt: string;
  // NOTE: If status is 'Open' or 'Closed', it originates from the volunteer system.
}

// --- FIX 2: Update CreateHelpRequestData interface ---
export interface CreateHelpRequestData {
  type: string;
  location: string;
  
  // New fields required by your updated Frontend/Backend
  disasterId: string | null; 
  description?: string;      
  
  // ✅ FIX 2: Added status and volunteer tracking fields used by RequestHelpPage.tsx
  status?: string;
  volunteersAssigned?: number;
  volunteersNeeded?: number;
  
  // Kept for backward compatibility (optional now)
  details?: string;          
}
// -----------------------------------------

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
  },
    
  // ✅ FIX 3: Added the missing function 'resolveRequest'
  // This endpoint is used by the Citizen Dashboard to close their active request.
async resolveRequest(requestId: string): Promise<void> {
    await apiService.apiRequest(
        `/citizen/requests/${requestId}/resolve`, // <-- This path is correct!
        { 
            method: "POST",
            body: JSON.stringify({ status: "Resolved" }) // NOTE: Sending body data too
        }
    );
}
};