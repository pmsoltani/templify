"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

const DashboardContext = createContext();
const initialState = {
  loadings: { user: true, templates: true, pdfs: true, apiKey: false },
  ids: { templates: new Set(), pdfs: new Set() },
};

// The Provider component will wrap the page.
function DashboardProvider({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [isLoading, setIsLoading] = useState(initialState.loadings);
  const [error, setError] = useState(null);
  const [itemIds, setItemIds] = useState(initialState.ids);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, user: true, templates: true, pdfs: true }));
    try {
      const [userData, templatesData, pdfsData] = await Promise.all([
        apiClient("/api/me"),
        apiClient("/api/templates"),
        apiClient("/api/pdfs"),
      ]);
      setUser(userData.data.user);
      setTemplates(templatesData.data.templates);
      setPdfs(pdfsData.data.pdfs);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading((prev) => ({ ...prev, user: false, templates: false, pdfs: false }));
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("authToken")) return router.push("/login");

    fetchData();
  }, [fetchData]);

  const handleRemoveTemplate = async (templateId) => {
    setItemIds((p) => ({ ...p, templates: new Set(p.templates).add(templateId) }));
    try {
      await apiClient(`/api/templates/${templateId}`, { method: "DELETE" });
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setItemIds((p) => {
        const newSet = new Set(p.templates);
        newSet.delete(templateId);
        return { ...p, templates: newSet };
      });
    }
  };

  const handleRefreshPdfsList = async () => {
    setIsLoading((prev) => ({ ...prev, pdfs: true }));
    try {
      const data = await apiClient(`/api/pdfs`);
      setPdfs(data.data.pdfs);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading((prev) => ({ ...prev, pdfs: false }));
    }
  };

  const handleGetPdfLink = async (pdfId) => {
    setItemIds((p) => ({ ...p, pdfs: new Set(p.pdfs).add(pdfId) }));
    try {
      const data = await apiClient(`/api/pdfs/${pdfId}/download`);
      window.open(data.data.pdf.tempUrl, "_blank");
    } finally {
      setItemIds((p) => {
        const newSet = new Set(p.pdfs);
        newSet.delete(pdfId);
        return { ...p, pdfs: newSet };
      });
    }
  };

  const handleGenApiKey = async () => {
    setIsLoading((prev) => ({ ...prev, apiKey: true }));
    try {
      const data = await apiClient(`/api/me/regenerate-key`, { method: "POST" });
      setUser((prevUser) => ({ ...prevUser, apiKey: data.data.user.apiKey }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading((prev) => ({ ...prev, apiKey: false }));
    }
  };

  const handleCopyApiKey = () => {
    if (!user?.apiKey) return;
    navigator.clipboard.writeText(user.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // reset after 2
  };

  const value = {
    user,
    templates,
    pdfs,
    isLoading,
    error,
    itemIds,
    copied,
    fetchData,
    handleRemoveTemplate,
    handleRefreshPdfsList,
    handleGetPdfLink,
    handleGenApiKey,
    handleCopyApiKey,
  };

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

// Custom hook to easily access the context
function useDashboard() {
  return useContext(DashboardContext);
}

export { DashboardProvider, useDashboard };
