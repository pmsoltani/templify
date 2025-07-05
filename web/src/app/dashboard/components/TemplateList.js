"use client";

import CodeInline from "@/components/CodeInline";
import Status from "@/components/Status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import formatDate from "@/utils/formatDate";
import { useDashboard } from "../context/DashboardContext";
import { RemoveConfirmPopover } from "./RemoveConfirmPopover";
import TemplateUploadDialog from "./TemplateUploadDialog";

export default function TemplateList() {
  const { templates, isLoading } = useDashboard();

  const renderTableBody = () => {
    if (isLoading.templates) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-12">
            <Status type="loading" title="Loading templates..." />
          </TableCell>
        </TableRow>
      );
    }

    if (templates.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-12">
            <Status
              type="empty"
              title="No templates yet"
              message="Upload a template to get started."
            />
          </TableCell>
        </TableRow>
      );
    }

    return templates.map((template) => (
      <TableRow key={template.id}>
        <TableCell>
          <CodeInline>{template.id}</CodeInline>
        </TableCell>
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
    ));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Template ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[140px]">HTML Entrypoint</TableHead>
          <TableHead className="w-[140px]">Created At</TableHead>
          <TableHead className="w-[140px]">Updated At</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>{renderTableBody()}</TableBody>
    </Table>
  );
}
