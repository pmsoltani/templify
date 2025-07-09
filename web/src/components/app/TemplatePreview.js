"use client";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext.js";
import { Download, FileIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function TemplatePreview({ templateId }) {
  const { currentTemplate, currentFiles, fileContent } = useAppContext();
  const [previewContent, setPreviewContent] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (currentTemplate && currentFiles.length > 0) {
      generatePreviewContent();
    }
  }, [currentTemplate, currentFiles, fileContent]);

  const generatePreviewContent = () => {
    // Find the HTML entrypoint or default to the first HTML file
    const entryFile = currentTemplate.htmlEntrypoint
      ? currentFiles.find((f) => f.name === currentTemplate.htmlEntrypoint)
      : currentFiles.find((f) => f.name.endsWith(".html"));

    if (!entryFile) {
      setPreviewContent("<p>No HTML file found in template</p>");
      return;
    }

    // For now, just show the current file content if it's the entrypoint
    // In a real implementation, you'd need to fetch and combine all files
    if (
      entryFile.name === currentFiles.find((f) => f.id === currentFiles[0]?.id)?.name
    ) {
      setPreviewContent(fileContent);
    } else {
      setPreviewContent(`<p>Loading preview for ${entryFile.name}...</p>`);
    }
  };

  const generatePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      // This would call your PDF generation endpoint
      // For now, just show a placeholder
      console.log("Generating PDF for template:", templateId);
      // You would implement the actual PDF generation here
      // const response = await apiClient(`/api/templates/${templateId}/generate-pdf`, { method: 'POST' });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col bg-white border-l border-gray-200">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <FileIcon className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">Template Preview</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generatePdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2"
          >
            {isGeneratingPdf ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Generate PDF
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-6 overflow-auto bg-gray-100">
        <div className="max-w-[210mm] mx-auto bg-white shadow-lg border border-gray-300 min-h-[297mm] p-8">
          {previewContent ? (
            <iframe
              srcDoc={previewContent}
              className="w-full h-full border-0"
              title="Template Preview"
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <FileIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a file to see the template preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
