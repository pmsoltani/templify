"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/contexts/AppContext.js";
import { UploadIcon, XIcon } from "lucide-react";
import { useState } from "react";

export default function UploadTemplateDialog({ open, onOpenChange }) {
  const { createTemplate, isLoading } = useAppContext();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    htmlEntrypoint: "",
    files: null,
  });
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilesChange = (files) => {
    setFormData((prev) => ({ ...prev, files }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilesChange(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) handleFilesChange(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTemplate(formData);
      setFormData({
        name: "",
        description: "",
        htmlEntrypoint: "",
        files: null,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create template:", error); // TODO: Handle error properly
    }
  };

  const removeFiles = () => {
    setFormData((prev) => ({ ...prev, files: null }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload New Template</DialogTitle>
          <DialogDescription>
            Create a new template by uploading HTML, CSS, and other asset files.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Template"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A brief description of what this template is for..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="htmlEntrypoint">HTML Entrypoint (optional)</Label>
              <Input
                id="htmlEntrypoint"
                placeholder="index.html"
                value={formData.htmlEntrypoint}
                onChange={(e) => handleInputChange("htmlEntrypoint", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Template Files</Label>
              {!formData.files ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  <UploadIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Drop files here or click to upload
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    HTML, CSS, JS, images, and other assets
                  </p>
                  <input
                    id="fileInput"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileInputChange}
                    accept=".html,.htm,.css,.js,.json,.png,.jpg,.jpeg,.gif,.svg,.webp"
                  />
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {formData.files.length} file(s) selected
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFiles}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-18 overflow-y-auto">
                    {Array.from(formData.files).map((file, index) => (
                      <div
                        key={index}
                        className="text-xs text-gray-600 flex justify-between"
                      >
                        <span>{file.name}</span>
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                  Creating...
                </div>
              ) : (
                "Create Template"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
