"use client";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext.js";
import { getFileIcon, getFileIconColor } from "@/utils/fileIcons";
import makeToast from "@/utils/makeToast";
import { SaveIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Spinner from "../common/Spinner";
import Status from "../common/Status";
import CreateFileButton from "./CreateFileButton";
import UploadFileButton from "./UploadFileButton";

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <Status variant="loading" title="Loading editor..." />
    </div>
  ),
});

export default function FileEditor({ templateId, fileId }) {
  const {
    currentFile,
    fileContent,
    updateFileContent,
    loadFileContent,
    currentFiles,
    isFileContentLoading,
    isLoading,
  } = useAppContext();

  const [editorContent, setEditorContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    if (templateId && fileId && currentFiles.length > 0) {
      const file = currentFiles.find((f) => f.id === fileId);
      if (file) loadFileContent(templateId, fileId);
    }
  }, [templateId, fileId, currentFiles, loadFileContent]);

  useEffect(() => {
    setEditorContent(fileContent);
    setHasUnsavedChanges(false);
  }, [fileContent]);

  const handleEditorChange = (value) => {
    setEditorContent(value || "");
    setHasUnsavedChanges(value !== fileContent);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      if (value !== fileContent) handleSave(value);
    }, 10000); // Auto-save after 10 seconds of inactivity
  };

  const handleSave = useCallback(
    async (content = editorContent) => {
      if (!currentFile || !templateId) return;
      try {
        await updateFileContent(templateId, currentFile.id, content);
        setHasUnsavedChanges(false);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      } catch (err) {}
    },
    [currentFile, templateId, updateFileContent, editorContent]
  );

  const handleFileCreated = useCallback(
    (file) => {
      router.push(`/app/templates/${templateId}/${file.id}`).catch((err) => {
        makeToast("Failed to navigate to new file:", err);
      });
    },
    [templateId, router]
  );

  // Handle Ctrl+S for explicit save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (hasUnsavedChanges && !isLoading) handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [hasUnsavedChanges, isLoading, handleSave]);

  const FileIconComponent = getFileIcon(currentFile?.name || "");
  const iconColor = getFileIconColor(currentFile?.name || "");

  const getLanguage = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "html":
      case "htm":
        return "html";
      case "css":
        return "css";
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "json":
        return "json";
      case "md":
        return "markdown";
      case "xml":
        return "xml";
      case "yml":
      case "yaml":
        return "yaml";
      default:
        return "plaintext";
    }
  };

  if (isFileContentLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Status variant="loading" title="Loading file..." />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full bg-white">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <FileIconComponent className={`h-4 w-4 ${iconColor}`} />
          <span className="text-sm font-medium">{currentFile?.name || ""}</span>
          {hasUnsavedChanges && (
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <CreateFileButton templateId={templateId} onFileCreated={handleFileCreated} />
          <UploadFileButton templateId={templateId} />
          <Button
            size="sm"
            onClick={() => handleSave()}
            disabled={!hasUnsavedChanges || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? <Spinner /> : <SaveIcon className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage(currentFile?.name || "")}
          value={editorContent}
          onChange={handleEditorChange}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            wordWrap: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            renderWhitespace: "selection",
            tabSize: 2,
            insertSpaces: true,
          }}
        />
      </div>
    </div>
  );
}
