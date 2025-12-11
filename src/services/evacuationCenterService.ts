import { apiService } from "../lib/api";

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
  // ✅ FIX: Get all active evacuation centers (Public/Citizen view)
  // This endpoint is open to citizens and does not require Org Admin permissions.
  async getEvacuationCenters(): Promise<EvacuationCenter[]> {
    const response = await apiService.apiRequest<{
      success: boolean;
      data: EvacuationCenter[];
    }>("/citizen/centers", { method: "GET" }); // <--- CHANGED THIS LINE

    // Normalize backend lon -> frontend lng so maps and forms work consistently
    const normalized: EvacuationCenter[] = response.data.map((item: any) => ({
      ...item,
      lng: item.lng ?? item.lon,
    }));

    return normalized;
  },

  // Create a new evacuation center (org inferred from JWT on backend)
  // Note: This will return 403 Forbidden if called by a Citizen (intended behavior)
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

  // Update an existing evacuation center
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

  // Delete an evacuation center
  async deleteEvacuationCenter(centerId: string): Promise<{ message: string }> {
    const response = await apiService.apiRequest<{
      message: string;
    }>(`/organization/centers/${centerId}`, {
      method: "DELETE",
    });

    return response;
  },
};