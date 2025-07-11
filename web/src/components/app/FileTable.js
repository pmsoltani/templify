"use client";

import ConfirmRemovePopover from "@/components/app/ConfirmRemovePopover";
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
import { getFileIcon, getFileIconColor } from "@/utils/fileIcons.js";
import formatDate from "@/utils/formatDate";
import formatFileSize from "@/utils/formatFileSize";
import { Edit2Icon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import Status from "../Status";
import TableLoading from "../TableLoading";

export default function FileTable() {
  const { editingTemplate, isFilesLoading, currentFiles, removeFile, isLoading } =
    useAppContext();

  const renderTableHeader = () => (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[130px]">File ID</TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Size</TableHead>
        <TableHead>Created At</TableHead>
        <TableHead>Updated At</TableHead>
        <TableHead className="w-[100px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  if (isFilesLoading) {
    return (
      <Table>
        {renderTableHeader()}
        <TableBody>
          <TableLoading cols={6} rows={2} />
        </TableBody>
      </Table>
    );
  }

  return (
    <Table className="border">
      {renderTableHeader()}
      <TableBody>
        {currentFiles.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6}>
              <Status
                type="empty"
                title="No files yet"
                message="Add your first file to get started."
              />
            </TableCell>
          </TableRow>
        ) : (
          currentFiles.map((file) => {
            const IconComponent = getFileIcon(file.name);
            const iconColor = getFileIconColor(file.name);
            return (
              <TableRow key={file.id}>
                <TableCell className="font-mono">{file.id}</TableCell>
                <TableCell className="">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 ${iconColor}`} />
                    {file.name}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatFileSize(file.size)}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDate(file.createdAt)}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDate(file.updatedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/app/templates/${editingTemplate.id}/${file.id}`}>
                      <Button variant="outline" size="sm" title="Open Editor">
                        <Edit2Icon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <ConfirmRemovePopover
                      title="Remove File"
                      message={`This action cannot be undone. This will permanently remove "${file.name}" from the template.`}
                      onConfirm={() => removeFile(editingTemplate.id, file.id)}
                      isLoading={isLoading}
                      triggerVariant="outline"
                      triggerText=""
                      confirmText="Remove File"
                    >
                      <Button variant="destructive" size="sm" title="Remove File">
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </ConfirmRemovePopover>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
