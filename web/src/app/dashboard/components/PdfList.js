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
import { Spinner } from "@/components/ui/spinner";
import { Link } from "lucide-react";

export default function PdfList({ isLoadingPDFs, pdfs, getPdfLink, gettingPdfLinkId }) {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!pdfs || pdfs.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold">No PDFs Yet</h3>
        <p className="text-gray-500 mt-2">Make an API call to generate a PDF.</p>
      </div>
    );
  }

  if (isLoadingPDFs) return <div className="p-8">Loading PDFs...</div>;
  return (
    <Table>
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
                // className="text-red-600 hover:text-red-600 hover:bg-red-200"
                size="sm"
                title="Get download link"
                variant="outline"
                onClick={() => getPdfLink(pdf.id)}
                disabled={gettingPdfLinkId === pdf.id}
              >
                {gettingPdfLinkId === pdf.id ? (
                  <Spinner className="size-4" />
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
