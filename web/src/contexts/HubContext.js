"use client";

import apiClient from "@/lib/apiClient";
import makeToast from "@/utils/makeToast";
import { createContext, useCallback, useContext, useState } from "react";

const HubContext = createContext();

function useHubContext() {
  const context = useContext(HubContext);
  if (!context) throw new Error("useHubContext must be used within a HubProvider");
  return context;
}

function HubProvider({ children }) {
  // Data state
  const [hubTemplates, setHubTemplates] = useState([]);

  // Loading states
  const [isHubTemplatesLoading, setIsHubTemplatesLoading] = useState(false);

  // Hub Template Actions
  const loadHubTemplates = useCallback(async (filters = {}) => {
    setIsHubTemplatesLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(","));
          } else {
            queryParams.append(key, value);
          }
        }
      });

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/api/hub?${queryString}` : "/api/hub";

      console.log("Loading hub templates from:", endpoint);

      const data = await apiClient(endpoint);
      console.log("Hub templates loaded:", data);
      setHubTemplates(data.data.hubTemplates);
      return data.data.hubTemplates;
    } catch (err) {
      makeToast("Failed to load hub templates.", err);
    } finally {
      setIsHubTemplatesLoading(false);
    }
  }, []);

  const contextValue = {
    // Data
    hubTemplates,

    // Loading states
    isHubTemplatesLoading,

    // Actions
    loadHubTemplates,
  };

  return <HubContext.Provider value={contextValue}>{children}</HubContext.Provider>;
}

export { HubProvider, useHubContext };
