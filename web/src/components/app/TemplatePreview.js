"use client";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext.js";
import apiClient from "@/lib/apiClient";
import { DownloadIcon, FileIcon, RefreshCwIcon, VariableIcon } from "lucide-react";
import { useEffect, useState } from "react";
import VariablesModal from "./VariablesModal";

export default function TemplatePreview({ templateId }) {
  const { currentTemplate } = useAppContext();
  const [pdfUrl, setPdfUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [isVariablesModalOpen, setIsVariablesModalOpen] = useState(false);

  // Generate preview on component mount
  useEffect(() => {
    if (currentTemplate && templateId) generatePreview();
  }, [currentTemplate, templateId]);

  const generatePreview = async (variables = null) => {
    setIsGenerating(true);
    setError(null);

    try {
      const data = await apiClient(`/api/templates/${templateId}/preview`, {
        method: "POST",
        body: variables || { name: "John Doe" },
      });

      setPdfUrl(data.data.tempUrl);
      if (isVariablesModalOpen) setIsVariablesModalOpen(false);
    } catch (error) {
      console.error("Failed to generate PDF preview:", error);
      setError("Failed to generate PDF preview. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVariablesGenerate = (variableValues) => generatePreview(variableValues);

  const downloadPdf = async () => {
    if (!pdfUrl) return await generatePreview();
    try {
      let downloadUrl = pdfUrl;

      // If pdfUrl is a blob URL, use it directly
      // If it's a pre-signed URL, fetch it first for proper download naming
      if (pdfUrl.startsWith("blob:")) {
        downloadUrl = pdfUrl;
      } else {
        // Fetch from pre-signed URL and create blob for proper filename
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        downloadUrl = URL.createObjectURL(blob);
      }

      // Create download link
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${currentTemplate?.name || "template"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up if we created a new blob URL
      if (downloadUrl !== pdfUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error("Failed to download PDF:", error);
      setError("Failed to download PDF. Please try again.");
    }
  };

  // Handle Ctrl+S for refresh
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!isGenerating) {
          generatePreview();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isGenerating]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <>
      <div className="flex flex-col bg-white border-l border-gray-200 h-full">
        {/* Preview Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">PDF Preview</span>
            {error && (
              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                {error}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVariablesModalOpen(true)}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <VariableIcon className="h-4 w-4" />
              Variables
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generatePreview}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
              ) : (
                <RefreshCwIcon className="h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPdf}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <DownloadIcon className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 bg-gray-100">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Preview"
              style={{ display: "block" }}
            />
          ) : isGenerating ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 mx-auto mb-4" />
                <p>Generating PDF preview...</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FileIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Click "Refresh Preview" to generate PDF preview</p>
                <p className="text-xs mt-2">Or press Ctrl+S</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Variables Modal */}
      <VariablesModal
        templateId={templateId}
        isOpen={isVariablesModalOpen}
        onClose={() => setIsVariablesModalOpen(false)}
        onGenerate={handleVariablesGenerate}
        isGenerating={isGenerating}
      />
    </>
  );
}
