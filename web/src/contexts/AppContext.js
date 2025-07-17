"use client";

import apiClient from "@/lib/apiClient";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AppContext = createContext();

function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
}

function AppProvider({ children }) {
  // Data state
  const [templates, setTemplates] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [currentFiles, setCurrentFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [fileContent, setFileContent] = useState(""); // For text-based file content
  const [user, setUser] = useState(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [isPdfsLoading, setIsPdfsLoading] = useState(false);
  const [isFilesLoading, setIsFilesLoading] = useState(false);
  const [isFileContentLoading, setIsFileContentLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // UI state
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Callback subscriptions for file save events
  const [fileSaveCallbacks, setFileSaveCallbacks] = useState([]);

  // Subscription system for file save events
  const subscribeToFileSaves = useCallback((callback) => {
    setFileSaveCallbacks((prev) => [...prev, callback]);
    // Return unsubscribe function
    return () => setFileSaveCallbacks((prev) => prev.filter((cb) => cb !== callback));
  }, []);

  // API Actions
  const loadTemplates = useCallback(async () => {
    setIsTemplatesLoading(true);
    try {
      const data = await apiClient("/api/templates/");
      setTemplates(data.data.templates);
    } catch (err) {
      console.error("Failed to load templates:", err); // TODO: Handle errors appropriately
    } finally {
      setIsTemplatesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (templates.length === 0) loadTemplates();
  }, [templates.length, loadTemplates]);

  const loadPdfs = useCallback(async () => {
    setIsPdfsLoading(true);
    try {
      const data = await apiClient("/api/pdfs/");
      setPdfs(data.data.pdfs);
    } catch (err) {
      console.error("Failed to load PDFs:", err); // TODO: Handle errors appropriately
    } finally {
      setIsPdfsLoading(false);
    }
  }, []);

  const loadTemplateFiles = useCallback(
    async (templateId) => {
      setIsFilesLoading(true);
      try {
        const data = await apiClient(`/api/templates/${templateId}/files`);
        setCurrentFiles(data.data.files);

        const template = templates.find((t) => t.id === templateId);
        if (template) setCurrentTemplate(template);
      } catch (err) {
        console.error("Failed to load template files:", err); // TODO: Handle errors appropriately
      } finally {
        setIsFilesLoading(false);
      }
    },
    [templates]
  );

  const loadFileContent = useCallback(
    async (templateId, fileId) => {
      setIsFileContentLoading(true);
      try {
        const data = await apiClient(
          `/api/templates/${templateId}/files/${fileId}/content`
        );
        setFileContent(data.data.content || "");

        // Update current file
        const file = currentFiles.find((f) => f.id === fileId);
        if (file) setCurrentFile(file);
      } catch (err) {
        console.error("Failed to load file content:", err); // TODO: Handle errors appropriately
      } finally {
        setIsFileContentLoading(false);
      }
    },
    [currentFiles]
  );

  const createTemplate = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("entrypoint", data.entrypoint);
      if (data.files) {
        Array.from(data.files).forEach((file) => formData.append("files", file));
      }
      const newTemplate = await apiClient("/api/templates", {
        method: "POST",
        body: formData,
      });

      setTemplates((prev) => [...prev, newTemplate.data.template]);
      return newTemplate.data.template;
    } catch (err) {
      console.error("Failed to create template:", err); // TODO: Handle errors appropriately
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(
    async (templateId, data) => {
      setIsLoading(true);
      try {
        const updatedTemplate = await apiClient(`/api/templates/${templateId}`, {
          method: "PATCH",
          body: data,
        });

        setTemplates((prev) =>
          prev.map((t) => (t.id === templateId ? updatedTemplate.data.template : t))
        );
        if (currentTemplate?.id === templateId) {
          setCurrentTemplate(updatedTemplate.data.template);
        }

        return updatedTemplate.data.template;
      } catch (err) {
        console.error("Failed to update template:", err); // TODO: Handle errors appropriately
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentTemplate]
  );

  const removeTemplate = useCallback(
    async (templateId) => {
      setIsLoading(true);
      try {
        await apiClient(`/api/templates/${templateId}`, { method: "DELETE" });
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));

        if (currentTemplate?.id === templateId) {
          setCurrentTemplate(null);
          setCurrentFiles([]);
          setCurrentFile(null);
          setFileContent("");
        }
      } catch (err) {
        console.error("Failed to remove template:", err); // TODO: Handle errors appropriately
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentTemplate]
  );

  const downloadTemplate = useCallback(async (templateId) => {
    setIsLoading(true);
    let url;
    let link;
    try {
      const blob = await apiClient(`/api/templates/${templateId}/download`, {
        responseType: "blob",
      });

      url = window.URL.createObjectURL(blob);

      // Create temporary link and click it to trigger download
      link = document.createElement("a");
      link.href = url;
      link.download = `${templateId}.zip`;
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Failed to download template:", err);
      throw err;
    } finally {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setIsLoading(false);
    }
  }, []);

  const createFile = useCallback(async (templateId, file) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const newFile = await apiClient(`/api/templates/${templateId}/files`, {
        method: "POST",
        body: formData,
      });

      setCurrentFiles((prev) => [...prev, newFile.data.file]);
      return newFile.data.file;
    } catch (err) {
      console.error("Failed to create file:", err); // TODO: Handle errors appropriately
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFileContent = useCallback(
    async (templateId, fileId, content) => {
      setIsLoading(true);
      try {
        await apiClient(`/api/templates/${templateId}/files/${fileId}/content`, {
          method: "PATCH",
          body: { content },
        });
        setFileContent(content);

        // Notify all subscribers that file was saved
        fileSaveCallbacks.forEach((callback) => {
          try {
            callback(templateId, fileId, content);
          } catch (err) {
            console.error("Error in file save callback:", err);
          }
        });
      } catch (err) {
        console.error("Failed to update file content:", err); // TODO: Handle errors appropriately
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fileSaveCallbacks]
  );

  const removeFile = useCallback(
    async (templateId, fileId) => {
      setIsLoading(true);
      try {
        await apiClient(`/api/templates/${templateId}/files/${fileId}`, {
          method: "DELETE",
        });
        setCurrentFiles((prev) => prev.filter((f) => f.id !== fileId));

        if (currentFile?.id === fileId) {
          setCurrentFile(null);
          setFileContent("");
        }
      } catch (err) {
        console.error("Failed to remove file:", err); // TODO: Handle errors appropriately
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentFile]
  );

  const downloadPdf = useCallback(async (pdfId) => {
    try {
      const data = await apiClient(`/api/pdfs/${pdfId}/download`);
      return data.data.pdf.tempUrl;
    } catch (err) {
      console.error("Failed to get PDF download URL:", err);
      throw err;
    }
  }, []);

  const loadUser = useCallback(async () => {
    setIsUserLoading(true);
    try {
      const data = await apiClient("/api/me");
      setUser(data.data.user);
    } catch (err) {
      console.error("Failed to load user data:", err);
    } finally {
      setIsUserLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (updateData) => {
    setIsLoading(true);
    try {
      await apiClient("/api/me", { method: "PATCH", body: updateData });
    } catch (err) {
      console.error("Failed to update user:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserPassword = useCallback(async (passwordData) => {
    setIsLoading(true);
    try {
      await apiClient("/api/me/password", { method: "PUT", body: passwordData });
    } catch (err) {
      console.error("Failed to update password:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const regenerateApiKey = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient("/api/me/regenerate-key", { method: "POST" });
      setUser(data.data.user);
      return data.data.user;
    } catch (err) {
      console.error("Failed to regenerate API key:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const contextValue = {
    // Data
    templates,
    pdfs,
    currentTemplate,
    currentFiles,
    currentFile,
    fileContent,
    user,

    // Loading states
    isLoading,
    isTemplatesLoading,
    isPdfsLoading,
    isFilesLoading,
    isFileContentLoading,
    isUserLoading,

    // Actions
    loadTemplates,
    loadPdfs,
    loadTemplateFiles,
    loadFileContent,
    createTemplate,
    downloadTemplate,
    updateTemplate,
    removeTemplate,
    createFile,
    updateFileContent,
    removeFile,
    downloadPdf,
    loadUser,
    updateUser,
    updateUserPassword,
    regenerateApiKey,

    // Event subscriptions
    subscribeToFileSaves,

    // UI State
    selectedTemplateId,
    setSelectedTemplateId,
    selectedFileId,
    setSelectedFileId,
    isTemplateModalOpen,
    setIsTemplateModalOpen,
    editingTemplate,
    setEditingTemplate,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export { AppProvider, useAppContext };
