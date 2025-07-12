"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppContext } from "@/contexts/AppContext.js";
import { FileTextIcon } from "lucide-react";
import { useState } from "react";

export default function CreateFileButton({
  templateId,
  onFileCreated,
  variant = "outline",
  size = "sm",
  text = "Create File",
  showIcon = true,
  disabled = false,
  className = "",
}) {
  const { createFile, loadTemplateFiles, isLoading } = useAppContext();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const allowedExtensions = ["html", "css"];
  const mimeTypes = { html: "text/html", css: "text/css" };

  const handlePopoverOpenChange = (open) => {
    setIsPopoverOpen(open);
    if (!open) {
      setError(null);
      setFileName("");
    }
  };

  const handleCreateFile = async () => {
    setError(null);
    if (!templateId) return;
    if (!fileName.trim()) return setError("File name is required.");
    const extension = fileName.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return setError(`Invalid extension. Allowed: ${allowedExtensions.join(", ")}`);
    }
    setIsCreating(true);
    try {
      // Create a Blob with empty content
      const fileOptions = { type: mimeTypes[extension] || "text/plain" };
      const blob = new Blob([""], fileOptions);
      const file = new File([blob], fileName.trim(), fileOptions);

      const createdFile = await createFile(templateId, file);

      if (loadTemplateFiles) await loadTemplateFiles(templateId); // Reload files
      if (onFileCreated) onFileCreated(createdFile); // Call optional callback
      handlePopoverOpenChange(false); // Reset form and close popover
    } catch (err) {
      console.error("Error creating file:", err);
      setError("Failed to create file. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && fileName.trim()) {
      e.preventDefault();
      handleCreateFile();
    } else if (e.key === "Escape") {
      setIsPopoverOpen(false);
      setFileName("");
      setError(null);
    }
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isLoading}
          className={`flex items-center gap-2 ${className}`}
        >
          {showIcon && <FileTextIcon className="h-4 w-4" />}
          {text}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Create New File</h4>
            <p className="text-sm text-gray-600">Enter a name for your new file</p>
          </div>
          <Input
            id="fileName"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="New file name"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreateFile}
              disabled={!fileName?.trim() || isCreating}
              className="flex-1"
            >
              {isCreating ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white mr-1" />
              ) : (
                <FileTextIcon className="h-4 w-4 mr-1" />
              )}
              {isCreating ? "Creating..." : "Create"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePopoverOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
