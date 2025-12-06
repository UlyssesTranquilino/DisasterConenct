// src/services/organizationService.ts
// Organization Service for CRUD and utility operations

import { apiService } from "../lib/api";

// --- TYPES ---
export interface EvacuationCenter {
  id?: string;
  name: string;
  address: string;
  capacity: number;
  lat: number;
  lon: number;
  facilities: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Announcement {
  id?: string;
  title: string;
  body: string;
  status: 'Draft' | 'Published' | 'Archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface Resource {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Report {
  id?: string;
  title: string;
  body: string;
  status: 'Pending' | 'Reviewed' | 'Closed';
  author: string;
  createdAt?: string;
}

export interface VolunteerProfile {
    id: string; // The volunteer's UID
    name: string;
    email: string;
    phone?: string;
    // Add other relevant volunteer fields here
}

// Assignment type needed for Direct Assignment route
export interface Assignment {
  id?: string;
  volunteerId: string;
  title: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate?: string; 
  location?: string; // Added to match controller data
  requiredSkills?: string[]; // Added to match controller data
  status?: 'Pending' | 'Accepted' | 'Completed' | 'Declined';
  createdAt?: string;
  updatedAt?: string;
}

// Need type needed for Post a Need route
export interface Need {
  id?: string;
  title: string;
  description: string;
  urgency?: 'Low' | 'Medium' | 'High' | 'Critical';
  volunteersNeeded?: number;
  skillsRequired?: string[];
  location?: { 
    lat?: number;
    lng?: number;
    address?: string;
  };
  volunteersAssigned?: number;
  status?: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt?: string;
  updatedAt?: string;
}

// --- ORGANIZATION SERVICE IMPLEMENTATION ---

export const organizationService = {
  // Base path for all requests to match the backend router prefix
  BASE_PATH: '/api/organization',

  // ============ EVACUATION CENTERS ============
  async createEvacuationCenter(center: EvacuationCenter) {
    return apiService.request<{ success: boolean; data: EvacuationCenter }>(
      `${organizationService.BASE_PATH}/centers`,
      {
        method: 'POST',
        body: JSON.stringify(center),
      }
    );
  },

  // Add these methods to your organizationService object:

async updateEvacuationCenter(id: string, center: Partial<EvacuationCenter>) {
  return apiService.request<{ success: boolean; data: EvacuationCenter }>(
    `${organizationService.BASE_PATH}/centers/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(center),
    }
  );
},

async deleteEvacuationCenter(id: string) {
  return apiService.request<{ success: boolean }>(
    `${organizationService.BASE_PATH}/centers/${id}`,
    { method: 'DELETE' }
  );
},

async updateAnnouncement(id: string, announcement: Partial<Announcement>) {
  return apiService.request<{ success: boolean; data: Announcement }>(
    `${organizationService.BASE_PATH}/announcements/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(announcement),
    }
  );
},

async deleteAnnouncement(id: string) {
  return apiService.request<{ success: boolean }>(
    `${organizationService.BASE_PATH}/announcements/${id}`,
    { method: 'DELETE' }
  );
},

async updateResource(id: string, resource: Partial<Resource>) {
  return apiService.request<{ success: boolean; data: Resource }>(
    `${organizationService.BASE_PATH}/resources/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(resource),
    }
  );
},

async deleteResource(id: string) {
  return apiService.request<{ success: boolean }>(
    `${organizationService.BASE_PATH}/resources/${id}`,
    { method: 'DELETE' }
  );
},

// Add these methods to get assignments and needs
async getAssignments() {
  // Note: You'll need to add this endpoint to your backend
  return apiService.request<{ success: boolean; data: Assignment[] }>(
    `${organizationService.BASE_PATH}/assignments`,
    { method: 'GET' }
  );
},

async updateAssignment(id: string, assignment: Partial<Assignment>) {
  // Note: You'll need to add this endpoint to your backend
  return apiService.request<{ success: boolean; data: Assignment }>(
    `${organizationService.BASE_PATH}/assignments/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(assignment),
    }
  );
},

async deleteAssignment(id: string) {
  // Note: You'll need to add this endpoint to your backend
  return apiService.request<{ success: boolean }>(
    `${organizationService.BASE_PATH}/assignments/${id}`,
    { method: 'DELETE' }
  );
},

async getNeeds() {
  // Note: You'll need to add this endpoint to your backend
  return apiService.request<{ success: boolean; data: Need[] }>(
    `${organizationService.BASE_PATH}/needs`,
    { method: 'GET' }
  );
},

async updateNeed(id: string, need: Partial<Need>) {
  // Note: You'll need to add this endpoint to your backend
  return apiService.request<{ success: boolean; data: Need }>(
    `${organizationService.BASE_PATH}/needs/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(need),
    }
  );
},

async deleteNeed(id: string) {
  // Note: You'll need to add this endpoint to your backend
  return apiService.request<{ success: boolean }>(
    `${organizationService.BASE_PATH}/needs/${id}`,
    { method: 'DELETE' }
  );
},

  async getEvacuationCenters() {
    return apiService.request<{ success: boolean; data: EvacuationCenter[] }>(
      `${organizationService.BASE_PATH}/centers`,
      { method: 'GET' }
    );
  },

  // ============ ANNOUNCEMENTS ============
  async createAnnouncement(announcement: Announcement) {
    return apiService.request<{ success: boolean; data: Announcement }>(
      `${organizationService.BASE_PATH}/announcements`,
      {
        method: 'POST',
        body: JSON.stringify(announcement),
      }
    );
  },

  async getAnnouncements() {
    return apiService.request<{ success: boolean; data: Announcement[] }>(
      `${organizationService.BASE_PATH}/announcements`,
      { method: 'GET' }
    );
  },

  // ============ RESOURCES ============
  async createResource(resource: Resource) {
    return apiService.request<{ success: boolean; data: Resource }>(
      `${organizationService.BASE_PATH}/resources`,
      {
        method: 'POST',
        body: JSON.stringify(resource),
      }
    );
  },

  async getResources() {
    return apiService.request<{ success: boolean; data: Resource[] }>(
      `${organizationService.BASE_PATH}/resources`,
      { method: 'GET' }
    );
  },

  // ============ REPORTS ============
  async createReport(report: Report) {
    return apiService.request<{ success: boolean; data: Report }>(
      `${organizationService.BASE_PATH}/reports`,
      {
        method: 'POST',
        body: JSON.stringify(report),
      }
    );
  },

  async getReports() {
    return apiService.request<{ success: boolean; data: Report[] }>(
      `${organizationService.BASE_PATH}/reports`,
      { method: 'GET' }
    );
  },
  
  // ============ VOLUNTEERS LIST ============
  async getOrgVolunteers() {
    return apiService.request<{ success: boolean; data: VolunteerProfile[] }>(
      `${organizationService.BASE_PATH}/volunteers`,
      { method: 'GET' }
    );
  },
  
  // ============ DIRECT ASSIGN TASK (POST /api/organization/assignments) ============
  async assignTask(assignment: Assignment) {
    return apiService.request<{ success: boolean; data: Assignment }>(
      `${organizationService.BASE_PATH}/assignments`,
      {
        method: 'POST',
        body: JSON.stringify(assignment),
      }
    );
  },

  // ============ POST A NEED (POST /api/organization/needs) ============
  async postNeed(need: Need) {
    return apiService.request<{ success: boolean; data: Need }>(
      `${organizationService.BASE_PATH}/needs`,
      {
        method: 'POST',
        body: JSON.stringify(need),
      }
    );
  },

  // NOTE: All other placeholder CRUD functions (getById, update, delete) were removed 
  // because they do not correspond to routes defined in your backend router.
};