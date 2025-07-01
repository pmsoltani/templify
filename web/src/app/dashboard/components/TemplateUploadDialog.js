"use client";

import { useState } from "react";
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
import apiClient from "@/lib/apiClient";
import { CloudUpload } from "lucide-react";

export default function TemplateUploadDialog({ onUploadSuccess, templateID = null }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [htmlEntrypoint, setHtmlEntrypoint] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a .zip file.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("htmlEntrypoint", htmlEntrypoint);
    formData.append("templateZip", file);

    try {
      const endpoint = templateID ? `/api/templates/${templateID}` : "/api/templates";
      const method = templateID ? "PUT" : "POST";
      const data = await apiClient(endpoint, { method: method, body: formData });

      onUploadSuccess(data.data.template);
      setIsOpen(false); // Close the dialog on success
      clearDialog();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearDialog = () => {
    setIsOpen(false);
    setName("");
    setDescription("");
    setHtmlEntrypoint("");
    setFile(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {templateID ? (
          <Button size="sm" title="Update template" variant="outline">
            <CloudUpload className="size-4" />
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
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-8"
            />
          </div>
          <div className="grid grid-cols-12 items-center gap-2">
            <Label htmlFor="htmlEntrypoint" className="text-right col-span-4">
              HTML Entrypoint
            </Label>
            <Input
              id="htmlEntrypoint"
              value={htmlEntrypoint}
              placeholder="HTML file name (default: template.html)"
              onChange={(e) => setHtmlEntrypoint(e.target.value)}
              className="col-span-8"
            />
          </div>
          <div className="grid grid-cols-12 items-center gap-4">
            <Label htmlFor="zipfile" className="text-right col-span-4">
              Zip File
            </Label>
            <Input
              id="zipfile"
              type="file"
              accept=".zip"
              onChange={(e) => setFile(e.target.files[0])}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Uploading..." : `Upload${templateID ? " & update" : ""}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
