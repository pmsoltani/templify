"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import formatDate from "@/utils/formatDate";
import { RemoveConfirmPopover } from "./RemoveConfirmPopover";
import TemplateUploadDialog from "./TemplateUploadDialog";
import { useDashboard } from "../context/DashboardContext";

export default function TemplateList() {
  const { templates, isLoading } = useDashboard();

  if (!templates || templates.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold">No Templates Yet</h3>
        <p className="text-gray-500 mt-2">Upload a template to get started.</p>
      </div>
    );
  }

  if (isLoading.templates) return <div className="p-8">Loading templates...</div>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[10px]">ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[140px]">HTML Entrypoint</TableHead>
          <TableHead className="w-[140px]">Created At</TableHead>
          <TableHead className="w-[140px]">Updated At</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {templates.map((template) => (
          <TableRow key={template.id}>
            <TableCell>{template.id}</TableCell>
            <TableCell>{template.name}</TableCell>
            <TableCell>{template.description || "No description."}</TableCell>
            <TableCell>{template.htmlEntrypoint}</TableCell>
            <TableCell>{formatDate(template.createdAt)}</TableCell>
            <TableCell>{formatDate(template.updatedAt)}</TableCell>
            <TableCell className="flex items-center justify-end gap-2">
              <TemplateUploadDialog templateID={template.id} />
              <RemoveConfirmPopover templateId={template.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
