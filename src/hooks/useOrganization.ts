// src/hooks/useOrganization.ts
// Custom hooks for Organization CRUD operations
import { useState, useCallback } from "react";
import {
  organizationService,
  EvacuationCenter,
  Announcement,
  Resource,
  Assignment,
  Need,
  Report,
  VolunteerProfile,
} from "../services/organizationService";

export function useEvacuationCenters() {
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCenters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizationService.getEvacuationCenters();
      if (response.success) {
        setCenters(response.data);
      } else {
        setError("Failed to fetch centers");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch centers");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCenter = useCallback(async (center: EvacuationCenter) => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizationService.createEvacuationCenter(center);
      if (response.success) {
        setCenters([...centers, response.data]);
        return response.data;
      } else {
        setError("Failed to create center");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create center");
    } finally {
      setLoading(false);
    }
  }, []);

  return { centers, loading, error, fetchCenters, createCenter };
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizationService.getAnnouncements();
      if (response.success) {
        setAnnouncements(response.data);
      } else {
        setError("Failed to fetch announcements");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  }, []);

  const createAnnouncement = useCallback(async (announcement: Announcement) => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizationService.createAnnouncement(
        announcement
      );
      if (response.success) {
        setAnnouncements([...announcements, response.data]);
        return response.data;
      } else {
        setError("Failed to create announcement");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create announcement");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    announcements,
    loading,
    error,
    fetchAnnouncements,
    createAnnouncement,
  };
}

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizationService.getResources();
      if (response.success) {
        setResources(response.data);
      } else {
        setError("Failed to fetch resources");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  }, []);

  const createResource = useCallback(async (resource: Resource) => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizationService.createResource(resource);
      if (response.success) {
        setResources([...resources, response.data]);
        return response.data;
      } else {
        setError("Failed to create resource");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create resource");
    } finally {
      setLoading(false);
    }
  }, []);

  return { resources, loading, error, fetchResources, createResource };
}

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAssignment = useCallback(async (assignment: Assignment) => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizationService.assignTask(assignment);
      if (response.success) {
        setAssignments([...assignments, response.data]);
        return response.data;
      } else {
        setError("Failed to assign task");
      }
    } catch (err: any) {
      setError(err.message || "Failed to assign task");
    } finally {
      setLoading(false);
    }
  }, []);

  return { assignments, loading, error, createAssignment };
}

export function useNeeds() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNeeds = useCallback(async () => {
    // Backend currently has only POST /api/organization/needs (postNeed).
    // There is no GET route yet, so we keep whatever is in local state.
    return;
  }, []);

  const createNeed = useCallback(async (need: Need) => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizationService.postNeed(need);
      if (response.success) {
        setNeeds([...needs, response.data]);
        return response.data;
      } else {
        setError("Failed to create need");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create need");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNeed = useCallback(async (id: string, need: Partial<Need>) => {
    try {
      setNeeds((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...need } : n))
      );
    } catch (err: any) {
      setError(err.message || "Failed to update need");
    }
  }, []);

  const deleteNeed = useCallback(async (id: string) => {
    try {
      setNeeds((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete need");
    }
  }, []);

  return {
    needs,
    loading,
    error,
    fetchNeeds,
    createNeed,
    updateNeed,
    deleteNeed,
  };
}

// Additional hooks you might need
export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizationService.getReports();
      if (response.success) {
        setReports(response.data);
      } else {
        setError("Failed to fetch reports");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (report: Report) => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizationService.createReport(report);
      if (response.success) {
        setReports([...reports, response.data]);
        return response.data;
      } else {
        setError("Failed to create report");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create report");
    } finally {
      setLoading(false);
    }
  }, []);

  return { reports, loading, error, fetchReports, createReport };
}

export function useVolunteers() {
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVolunteers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizationService.getOrgVolunteers();
      if (response.success) {
        setVolunteers(response.data);
      } else {
        setError("Failed to fetch volunteers");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch volunteers");
    } finally {
      setLoading(false);
    }
  }, []);

  return { volunteers, loading, error, fetchVolunteers };
}
