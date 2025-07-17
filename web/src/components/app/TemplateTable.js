"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppContext } from "@/contexts/AppContext.js";
import makeToast from "@/utils/makeToast";
import { DownloadIcon, EyeIcon, FileTextIcon, HashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Status from "../common/Status";
import TableLoading from "../common/TableLoading";

export default function TemplateTable() {
  const { templates, isTemplatesLoading, downloadTemplate } = useAppContext();
  const router = useRouter();

  const handleViewTemplate = (template) => {
    // Navigate to the template page instead of opening modal
    router.push(`/app/templates/${template.id}`);
  };

  const handleDownloadTemplate = (template) => {
    downloadTemplate(template.id).catch((err) => {
      makeToast("Failed to download template.", err);
    });
  };

  const renderTableHeader = () => (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[160px]">
          <div className="flex items-center gap-2">
            <HashIcon className="h-4 w-4" />
            Template ID
          </div>
        </TableHead>
        <TableHead className="w-[160px]">
          <div className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4" />
            Name
          </div>
        </TableHead>
        <TableHead>Description</TableHead>
        <TableHead className="w-[100px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  if (isTemplatesLoading) {
    return (
      <Table>
        {renderTableHeader()}
        <TableBody>
          <TableLoading cols={4} rows={3} />
        </TableBody>
      </Table>
    );
  }

  return (
    <Table className="border">
      {renderTableHeader()}
      <TableBody>
        {templates.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4}>
              <Status
                variant="empty"
                title="No templates yet"
                message="Create a template to get started."
              />
            </TableCell>
          </TableRow>
        ) : (
          templates.map((template) => (
            <TableRow
              key={template.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => handleViewTemplate(template)}
            >
              <TableCell className="font-mono text-sm">{template.id}</TableCell>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                {template.description}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTemplate(template);
                    }}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadTemplate(template);
                    }}
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
