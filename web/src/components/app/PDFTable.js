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
import formatDate from "@/utils/formatDate";
import { CalendarIcon, DownloadIcon, HashIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Spinner from "../common/Spinner";
import Status from "../common/Status";
import TableLoading from "../common/TableLoading";

export default function PDFTable() {
  const { pdfs, isPdfsLoading, downloadPdf } = useAppContext();
  const [downloadingIds, setDownloadingIds] = useState(new Set());

  const router = useRouter();

  const handleDownload = async (pdfId) => {
    setDownloadingIds((prev) => new Set([...prev, pdfId]));
    try {
      const tempUrl = await downloadPdf(pdfId);
      window.open(tempUrl, "_blank"); // Open the PDF in a new tab
    } catch (err) {
      console.error("Failed to download PDF:", err);
    } finally {
      setDownloadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(pdfId);
        return newSet;
      });
    }
  };

  const renderTableHeader = () => (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[160px]">
          <div className="flex items-center gap-2">
            <HashIcon className="h-4 w-4" />
            PDF ID
          </div>
        </TableHead>
        <TableHead className="w-[160px]">
          <div className="flex items-center gap-2">
            <HashIcon className="h-4 w-4" />
            Template ID
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Created At
          </div>
        </TableHead>
        <TableHead className="w-[100px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  if (isPdfsLoading) {
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
        {pdfs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4}>
              <Status
                variant="empty"
                title="No PDFs yet"
                message="Make an API call to generate a PDF."
              />
            </TableCell>
          </TableRow>
        ) : (
          pdfs.map((pdf) => (
            <TableRow key={pdf.id} className="hover:bg-gray-50">
              <TableCell className="font-mono text-sm">{pdf.id}</TableCell>
              <TableCell className="font-mono text-sm">
                <Link href={`/app/templates/${pdf.templateId}`}>{pdf.templateId}</Link>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {formatDate(pdf.createdAt)}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  title="Get download link"
                  variant="outline"
                  onClick={() => handleDownload(pdf.id)}
                  disabled={downloadingIds.has(pdf.id)}
                >
                  {downloadingIds.has(pdf.id) ? (
                    <Spinner variant="outline" />
                  ) : (
                    <DownloadIcon className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
