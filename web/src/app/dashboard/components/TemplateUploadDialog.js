"use client";

import { useState } from "react";
import { CloudUploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useFormReducer from "@/hooks/useFormReducer";
import apiClient from "@/lib/apiClient";
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

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Upload Template</DialogTitle>
          <DialogDescription>
            Upload a .zip file containing your template.html, style.css, and any other
            assets.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="grid grid-cols-12 items-center gap-4">
            <Label htmlFor="name" className="text-right col-span-4">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formState.name}
              onChange={setField}
              className="col-span-8"
              required={!templateID}
            />
          </div>
          <div className="grid grid-cols-12 items-center gap-4">
            <Label htmlFor="description" className="text-right col-span-4">
              Description
            </Label>
            <Input
              id="description"
              name="description"
              value={formState.description}
              onChange={setField}
              className="col-span-8"
            />
          </div>
          <div className="grid grid-cols-12 items-center gap-2">
            <Label htmlFor="htmlEntrypoint" className="text-right col-span-4">
              HTML Entrypoint
            </Label>
            <Input
              id="htmlEntrypoint"
              name="htmlEntrypoint"
              value={formState.htmlEntrypoint}
              placeholder="HTML file name (default: template.html)"
              onChange={setField}
              className="col-span-8"
            />
          </div>
          <div className="grid grid-cols-12 items-center gap-4">
            <Label htmlFor="zipfile" className="text-right col-span-4">
              Zip File
            </Label>
            <Input
              id="zipfile"
              name="file"
              type="file"
              accept=".zip"
              onChange={setField}
              className="col-span-8"
              required
            />
          </div>
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
