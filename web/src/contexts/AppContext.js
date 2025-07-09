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

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [isPdfsLoading, setIsPdfsLoading] = useState(false);
  const [isFilesLoading, setIsFilesLoading] = useState(false);
  const [isFileContentLoading, setIsFileContentLoading] = useState(false);

  // UI state
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // API Actions
  const loadTemplates = useCallback(async () => {
    setIsTemplatesLoading(true);
    try {
      const data = await apiClient("/api/templates/");
      setTemplates(data.data.templates);
    } catch (error) {
      console.error("Failed to load templates:", error); // TODO: Handle errors appropriately
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
    } catch (error) {
      console.error("Failed to load PDFs:", error); // TODO: Handle errors appropriately
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
      } catch (error) {
        console.error("Failed to load template files:", error); // TODO: Handle errors appropriately
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
      } catch (error) {
        console.error("Failed to load file content:", error); // TODO: Handle errors appropriately
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
      formData.append("htmlEntrypoint", data.htmlEntrypoint);
      if (data.files) {
        Array.from(data.files).forEach((file) => formData.append("files", file));
      }
      const newTemplate = await apiClient("/api/templates/slim", {
        method: "POST",
        body: formData,
      });

      setTemplates((prev) => [...prev, newTemplate.data.template]);
      return newTemplate.data.template;
    } catch (error) {
      console.error("Failed to create template:", error); // TODO: Handle errors appropriately
      throw error;
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
      } catch (error) {
        console.error("Failed to update template:", error); // TODO: Handle errors appropriately
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentTemplate]
  );

  const deleteTemplate = useCallback(
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
      } catch (error) {
        console.error("Failed to delete template:", error); // TODO: Handle errors appropriately
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentTemplate]
  );

  const createFile = useCallback(async (templateId, data) => {
    setIsLoading(true);
    try {
      const newFile = await apiClient(`/api/templates/${templateId}/files`, {
        method: "POST",
        body: data,
      });

      setCurrentFiles((prev) => [...prev, newFile.data.file]);
      return newFile.data.file;
    } catch (error) {
      console.error("Failed to create file:", error); // TODO: Handle errors appropriately
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFileContent = useCallback(async (templateId, fileId, content) => {
    setIsLoading(true);
    try {
      await apiClient(`/api/templates/${templateId}/files/${fileId}/content`, {
        method: "PATCH",
        body: { content },
      });
      setFileContent(content);
    } catch (error) {
      console.error("Failed to update file content:", error); // TODO: Handle errors appropriately
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteFile = useCallback(
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
      } catch (error) {
        console.error("Failed to delete file:", error); // TODO: Handle errors appropriately
        throw error;
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
    } catch (error) {
      console.error("Failed to get PDF download URL:", error);
      throw error;
    }
  }, []);

  const contextValue = {
    // Data
    templates,
    pdfs,
    currentTemplate,
    currentFiles,
    currentFile,
    fileContent,

    // Loading states
    isLoading,
    isTemplatesLoading,
    isPdfsLoading,
    isFilesLoading,
    isFileContentLoading,

    // Actions
    loadTemplates,
    loadPdfs,
    loadTemplateFiles,
    loadFileContent,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createFile,
    updateFileContent,
    deleteFile,
    downloadPdf,

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
