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
import { EyeIcon, FileTextIcon, HashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Status from "../Status";
import TableLoading from "../TableLoading";

export default function TemplateTable() {
  const { templates, isTemplatesLoading } = useAppContext();
  const router = useRouter();

  const handleViewTemplate = (template) => {
    // Navigate to the template page instead of opening modal
    router.push(`/app/templates/${template.id}`);
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
        <TableHead className="w-[80px]">Actions</TableHead>
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
                type="empty"
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
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
