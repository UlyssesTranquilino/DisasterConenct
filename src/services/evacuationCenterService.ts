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
  // 👤 Citizen Read Operation (Public View)
  // Endpoint: /citizen/centers
  async getEvacuationCenters(): Promise<EvacuationCenter[]> {
    const response = await apiService.apiRequest<{
      success: boolean;
      data: EvacuationCenter[];
    }>("/citizen/centers", { method: "GET" });

    // Normalize backend lon -> frontend lng
    const normalized: EvacuationCenter[] = response.data.map((item: any) => {
      const lng = typeof item.lng === 'number' ? item.lng : 
                 (typeof item.lon === 'number' ? item.lon : 0);
      return {
        ...item,
        lng: lng,
      };
    });

    return normalized;
  },

  // 🏢 Organization Read Operation (Admin View)
  // Endpoint: /organization/centers
  async getOrganizationCenters(): Promise<EvacuationCenter[]> {
    const response = await apiService.apiRequest<{
      success: boolean;
      data: EvacuationCenter[];
    }>("/organization/centers", { method: "GET" });

    // Normalize backend lon -> frontend lng
    const normalized: EvacuationCenter[] = response.data.map((item: any) => ({
      ...item,
      lng: item.lng ?? item.lon,
    }));

    return normalized;
  },

  // 🏢 Organization Create Operation
  // Endpoint: /organization/centers
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

  // 🏢 Organization Update Operation
  // Endpoint: /organization/centers/{id}
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

  // 🏢 Organization Delete Operation
  // Endpoint: /organization/centers/{id}
  async deleteEvacuationCenter(centerId: string): Promise<{ message: string }> {
    const response = await apiService.apiRequest<{
      message: string;
    }>(`/organization/centers/${centerId}`, {
      method: "DELETE",
    });

    return response;
  },
};