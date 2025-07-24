"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/contexts/AppContext.js";
import { SendIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Spinner from "../common/Spinner";

const CATEGORIES = [
  { value: "invoice", label: "Invoice" },
  { value: "letter", label: "Letter" },
  { value: "certificate", label: "Certificate" },
  { value: "report", label: "Report" },
  { value: "contract", label: "Contract" },
  { value: "receipt", label: "Receipt" },
  { value: "other", label: "Other" },
];

export default function PublishTemplatePopover({
  templateId,
  onPublished,
  variant = "default",
  size = "sm",
  text = "Publish to Hub",
  showIcon = true,
  disabled = false,
  className = "",
}) {
  const { publishTemplate, isPublishing } = useAppContext();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePopoverOpenChange = (open) => {
    setIsPopoverOpen(open);
    if (!open) setForm({ name: "", description: "", category: "", tags: "" });
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePublish = async () => {
    if (!templateId) return toast.error("No template selected.");
    if (!form.name.trim()) return toast.error("Template name is required.");
    if (!form.category) return toast.error("Category is required.");
    setIsSubmitting(true);
    try {
      const tagsArr = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      const result = await publishTemplate(templateId, {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        tags: tagsArr,
      });
      toast.success("Template published to Hub!");
      if (onPublished) onPublished(result);
      handlePopoverOpenChange(false);
    } catch (err) {
      toast.error("Failed to publish template.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handlePublish();
    } else if (e.key === "Escape") {
      setIsPopoverOpen(false);
    }
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isPublishing}
          className={`flex items-center gap-2 ${className}`}
        >
          {showIcon && <SparklesIcon className="h-4 w-4" />}
          {text}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Publish Template</h4>
            <p className="text-sm text-gray-600">
              Share your template with the community
            </p>
          </div>
          <Input
            id="templateName"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Template name"
            autoFocus
          />
          <Input
            id="templateDescription"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Short description (optional)"
          />
          <Select
            value={form.category}
            onValueChange={(value) => handleChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            id="templateTags"
            value={form.tags}
            onChange={(e) => handleChange("tags", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tags (comma separated)"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isSubmitting || !form.name.trim() || !form.category}
              className="flex-1"
            >
              {isSubmitting ? <Spinner /> : <SendIcon className="h-4 w-4" />}
              {isSubmitting ? "Publishing..." : "Publish"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePopoverOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
