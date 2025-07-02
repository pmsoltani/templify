"use client";

import { Link, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function PdfList() {
  const { pdfs, isLoading, itemIds, handleGetPdfLink } = useDashboard();

  if (!pdfs || pdfs.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold">No PDFs Yet</h3>
        <p className="text-gray-500 mt-2">Make an API call to generate a PDF.</p>
      </div>
    );
  }

  if (isLoading.pdfs) return <div className="p-8">Loading PDFs...</div>;
  return (
    <Table className="w-fit">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[10px]">ID</TableHead>
          <TableHead>Template ID</TableHead>
          <TableHead className="w-[140px]">Created At</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {pdfs.map((pdf) => (
          <TableRow key={pdf.id}>
            <TableCell>{pdf.id}</TableCell>
            <TableCell>{pdf.templateId}</TableCell>
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
                  <Link className="size-4" />
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
