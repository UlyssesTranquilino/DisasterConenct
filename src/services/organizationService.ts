// client/DisasterConenct/src/services/organizationService.ts

import { db } from "../lib/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  writeBatch,
  orderBy,
} from "firebase/firestore";
import { auth } from "../lib/firebase";
import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";

// Types
export type AnnouncementStatus = "Published" | "Draft";
export type ReportStatus = "Completed" | "Ongoing" | "Pending";
export type VolunteerStatus = "Active" | "On Duty" | "Standby";

// Interfaces
export interface Announcement {
  id?: string;
  title: string;
  body: string;
  status: AnnouncementStatus;
  date: Date;
  createdAt: Date;
}

export interface EvacuationCenter {
  id?: string;
  name: string;
  address: string;
  head: string;
  contact: string;
  capacity: number;
  occupied: number;
  lat: number;
  lon: number;
  createdAt: Date;
}

export interface Report {
  id?: string;
  title: string;
  author: string;
  status: ReportStatus;
  content: string;
  date: Date;
  createdAt: Date;
}

export interface Resource {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  updatedAt: Date;
}

export interface Volunteer {
  id?: string;
  name: string;
  role: string;
  contact: string;
  location: string;
  status: VolunteerStatus;
  updatedAt: Date;
}

export interface OrganizationMetrics {
  announcements: number;
  centers: number;
  reports: number;
  resources: number;
  volunteers: number;
  evacuationCenters: {
    total: number;
    totalCapacity: number;
    totalOccupied: number;
    availableCapacity: number;
  };
}

// API Client
class OrganizationService {
  private static instance: OrganizationService;
  private baseUrl = "/api/organizations";
  private token: string | null = null;

  private constructor() {
    // Initialize with the current user's token
    auth.onAuthStateChanged((user) => {
      this.token = user ? user.uid : null;
    });
  }

  public static getInstance(): OrganizationService {
    if (!OrganizationService.instance) {
      OrganizationService.instance = new OrganizationService();
    }
    return OrganizationService.instance;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const user = auth.currentUser;
    const token = await user?.getIdToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // Organization CRUD
  async createOrganization(data: {
    name: string;
    email: string;
    type: string;
    description?: string;
    phone?: string;
    website?: string;
    location?: {
      address: string;
      lat: number;
      lng: number;
    };
  }) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Announcements
  async getAnnouncements(orgId: string): Promise<Announcement[]> {
    const response = await fetch(`${this.baseUrl}/${orgId}/announcements`, {
      headers: await this.getAuthHeaders(),
    });
    const data = await this.handleResponse(response);
    return data.map((a: any) => ({
      ...a,
      date: new Date(a.date),
      createdAt: new Date(a.createdAt),
    }));
  }

  async createAnnouncement(
    orgId: string,
    data: Omit<Announcement, "id" | "date" | "createdAt">
  ) {
    const response = await fetch(`${this.baseUrl}/${orgId}/announcements`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Evacuation Centers
  async getEvacuationCenters(orgId: string): Promise<EvacuationCenter[]> {
    const response = await fetch(`${this.baseUrl}/${orgId}/centers`, {
      headers: await this.getAuthHeaders(),
    });
    const data = await this.handleResponse(response);
    return data.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
    }));
  }

  async createEvacuationCenter(
    orgId: string,
    data: Omit<EvacuationCenter, "id" | "createdAt">
  ) {
    const response = await fetch(`${this.baseUrl}/${orgId}/centers`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Reports
  async getReports(orgId: string): Promise<Report[]> {
    const response = await fetch(`${this.baseUrl}/${orgId}/reports`, {
      headers: await this.getAuthHeaders(),
    });
    const data = await this.handleResponse(response);
    return data.map((r: any) => ({
      ...r,
      date: new Date(r.date),
      createdAt: new Date(r.createdAt),
    }));
  }

  async createReport(
    orgId: string,
    data: Omit<Report, "id" | "date" | "createdAt">
  ) {
    const response = await fetch(`${this.baseUrl}/${orgId}/reports`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({
        ...data,
        date: new Date().toISOString(),
      }),
    });
    return this.handleResponse(response);
  }

  // Resources
  async getResources(orgId: string): Promise<Resource[]> {
    const response = await fetch(`${this.baseUrl}/${orgId}/resources`, {
      headers: await this.getAuthHeaders(),
    });
    const data = await this.handleResponse(response);
    return data.map((r: any) => ({
      ...r,
      updatedAt: new Date(r.updatedAt),
    }));
  }

  async createResource(
    orgId: string,
    data: Omit<Resource, "id" | "updatedAt">
  ) {
    const response = await fetch(`${this.baseUrl}/${orgId}/resources`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({
        ...data,
        updatedAt: new Date().toISOString(),
      }),
    });
    return this.handleResponse(response);
  }

  async updateResource(
    orgId: string,
    resourceId: string,
    data: Partial<Omit<Resource, "id" | "updatedAt">>
  ) {
    const response = await fetch(
      `${this.baseUrl}/${orgId}/resources/${resourceId}`,
      {
        method: "PUT",
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          ...data,
          updatedAt: new Date().toISOString(),
        }),
      }
    );
    return this.handleResponse(response);
  }

  async deleteResource(orgId: string, resourceId: string) {
    const response = await fetch(
      `${this.baseUrl}/${orgId}/resources/${resourceId}`,
      {
        method: "DELETE",
        headers: await this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  // Volunteers
  async getVolunteers(orgId: string): Promise<Volunteer[]> {
    const response = await fetch(`${this.baseUrl}/${orgId}/volunteers`, {
      headers: await this.getAuthHeaders(),
    });
    const data = await this.handleResponse(response);
    return data.map((v: any) => ({
      ...v,
      updatedAt: new Date(v.updatedAt),
    }));
  }

  async updateVolunteerStatus(
    orgId: string,
    volunteerId: string,
    status: VolunteerStatus
  ) {
    const response = await fetch(
      `${this.baseUrl}/${orgId}/volunteers/${volunteerId}/status`,
      {
        method: "PUT",
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      }
    );
    return this.handleResponse(response);
  }

  // Metrics
  async getOrganizationMetrics(orgId: string): Promise<OrganizationMetrics> {
    const response = await fetch(`${this.baseUrl}/${orgId}/metrics`, {
      headers: await this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Something went wrong");
    }
    return response.json();
  }
}

export const organizationService = OrganizationService.getInstance();
