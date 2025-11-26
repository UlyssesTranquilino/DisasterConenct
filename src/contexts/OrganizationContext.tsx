// src/contexts/OrganizationContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../lib/auth";

import { organizationService } from "../services/organizationService";

interface OrganizationContextType {
  currentOrgId: string | null;
  setCurrentOrgId: (id: string | null) => void;
  announcements: any[];
  centers: any[];
  reports: any[];
  resources: any[];
  volunteers: any[];
  metrics: any;
  loading: boolean;
  error: string | null;
  fetchOrganizationData: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizationData = async () => {
    if (!currentOrgId) return;

    setLoading(true);
    setError(null);

    try {
      const [
        announcementsData,
        centersData,
        reportsData,
        resourcesData,
        volunteersData,
        metricsData,
      ] = await Promise.all([
        organizationService.getAnnouncements(currentOrgId),
        organizationService.getEvacuationCenters(currentOrgId),
        organizationService.getReports(currentOrgId),
        organizationService.getResources(currentOrgId),
        organizationService.getVolunteers(currentOrgId),
        organizationService.getOrganizationMetrics(currentOrgId),
      ]);

      setAnnouncements(announcementsData);
      setCenters(centersData);
      setReports(reportsData);
      setResources(resourcesData);
      setVolunteers(volunteersData);
      setMetrics(metricsData);
    } catch (err) {
      console.error("Error fetching organization data:", err);
      setError("Failed to load organization data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentOrgId) {
      fetchOrganizationData();
    }
  }, [currentUser, currentOrgId]);

  const value = {
    currentOrgId,
    setCurrentOrgId,
    announcements,
    centers,
    reports,
    resources,
    volunteers,
    metrics,
    loading,
    error,
    fetchOrganizationData,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
};
