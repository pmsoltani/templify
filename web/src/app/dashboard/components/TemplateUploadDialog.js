"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useFormReducer from "@/hooks/useFormReducer";
import apiClient from "@/lib/apiClient";
import { CloudUploadIcon } from "lucide-react";
import { useState } from "react";
import { useDashboard } from "../context/DashboardContext";

const initialState = { name: "", description: "", htmlEntrypoint: "", file: null };

export default function TemplateUploadDialog({ templateID = null }) {
  const { fetchData } = useDashboard();
  const [formState, setField, resetForm] = useFormReducer(initialState);

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    if (!formState.file) return setError("Please select a .zip file.");

    const formData = new FormData();
    formData.append("name", formState.name);
    formData.append("description", formState.description);
    formData.append("htmlEntrypoint", formState.htmlEntrypoint);
    formData.append("templateZip", formState.file);

    try {
      const endpoint = templateID ? `/api/templates/${templateID}` : "/api/templates";
      const method = templateID ? "PUT" : "POST";
      await apiClient(endpoint, { method: method, body: formData });
      setIsOpen(false);
      clearDialog();
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearDialog = () => {
    setIsOpen(false);
    resetForm();
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {templateID ? (
          <Button size="sm" title="Update template" variant="outline">
            <CloudUploadIcon />
          </Button>
        ) : (
          <Button>Upload New Template</Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Upload Template</DialogTitle>
          <DialogDescription>
            Upload a .zip file containing your template.html, style.css, and any other
            assets (max 5MB).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Input
            id="name"
            name="name"
            placeholder="Name"
            value={formState.name}
            onChange={setField}
            required={!templateID}
          />
          <Input
            id="description"
            name="description"
            placeholder="Description"
            value={formState.description}
            onChange={setField}
          />
          <Input
            id="htmlEntrypoint"
            name="htmlEntrypoint"
            placeholder="HTML entrypoint (default: template.html)"
            value={formState.htmlEntrypoint}
            onChange={setField}
          />
          <Input
            id="zipfile"
            name="file"
            type="file"
            accept=".zip"
            onChange={setField}
            required
          />
          {error && (
            <p className="col-span-4 text-center text-sm text-red-500">{error}</p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={clearDialog}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : `Upload${templateID ? " & update" : ""}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
