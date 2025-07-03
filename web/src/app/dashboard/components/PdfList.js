"use client";

import { LinkIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CodeInline from "@/components/CodeInline";
import Status from "@/components/Status";
import formatDate from "@/utils/formatDate";
import { useDashboard } from "../context/DashboardContext";

export default function PdfList() {
  const { pdfs, isLoading, itemIds, handleGetPdfLink } = useDashboard();

  const renderTableBody = () => {
    if (isLoading.pdfs) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-12">
            <Status type="loading" title="Loading PDFs..." />
          </TableCell>
        </TableRow>
      );
    }

    if (pdfs.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-12">
            <Status
              type="empty"
              title="No PDFs yet"
              message="Make an API call to generate a PDF."
            />
          </TableCell>
        </TableRow>
      );
    }

    return pdfs.map((pdf) => (
      <TableRow key={pdf.id}>
        <TableCell>
          <CodeInline>{pdf.id}</CodeInline>
        </TableCell>
        <TableCell>
          <CodeInline>{pdf.templateId}</CodeInline>
        </TableCell>
        <TableCell>{formatDate(pdf.createdAt)}</TableCell>
        <TableCell>
          <Button
            size="sm"
            title="Get download link"
            variant="outline"
            onClick={() => handleGetPdfLink(pdf.id)}
            disabled={itemIds.pdfs.has(pdf.id)}
          >
            {itemIds.pdfs.has(pdf.id) ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <LinkIcon />
            )}
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Table className="w-fit">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[10px]">PDF ID</TableHead>
          <TableHead>Template ID</TableHead>
          <TableHead className="w-[140px]">Created At</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>{renderTableBody()}</TableBody>
    </Table>
  );
}
