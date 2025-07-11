"use client";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext.js";
import { UploadIcon } from "lucide-react";
import { useRef } from "react";

export default function UploadFileButton({
  templateId,
  onFileAdded,
  variant = "outline",
  size = "sm",
  text = "Add File",
  showIcon = true,
  accept = ".html,.css,.js,.txt,.json,.md",
  disabled = false,
  className = "",
}) {
  const { createFile, loadTemplateFiles } = useAppContext();
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !templateId) return;

    try {
      await createFile(templateId, file);
      if (loadTemplateFiles) await loadTemplateFiles(templateId); // Refresh files
      if (onFileAdded) onFileAdded(file); // Call optional callback
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""; // Clear the file input
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className={`flex items-center gap-2 ${className}`}
      >
        {showIcon && <UploadIcon className="h-4 w-4" />}
        {text}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept={accept}
      />
    </>
  );
}
