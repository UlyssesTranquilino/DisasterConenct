// src/contexts/OrganizationContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  organizationService,
  OrganizationMetrics,
} from "../services/organizationService";
import { useAuth } from "./AuthContext";

interface OrganizationContextType {
  metrics: OrganizationMetrics | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  currentOrgId: string | null;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [metrics, setMetrics] = useState<OrganizationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth(); // Assuming you have an AuthContext

  // This would come from your auth or org selection flow
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!currentOrgId) return;

    setLoading(true);
    setError(null);
    try {
      const metricsData = await organizationService.getOrganizationMetrics(
        currentOrgId
      );
      setMetrics(metricsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch organization data"
      );
      console.error("Error fetching organization data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      // For now, we'll use the user's UID as the org ID
      // In a real app, you might have a way for users to select an org
      setCurrentOrgId(currentUser.uid);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentOrgId) {
      fetchData();
    }
  }, [currentOrgId]);

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <OrganizationContext.Provider
      value={{ metrics, loading, error, refreshData, currentOrgId }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
};
