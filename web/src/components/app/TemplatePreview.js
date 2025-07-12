"use client";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext.js";
import apiClient from "@/lib/apiClient";
import { FileIcon, RefreshCwIcon, VariableIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import VariablesModal from "./VariablesModal";

export default function TemplatePreview({ templateId }) {
  const { currentTemplate, subscribeToFileSaves } = useAppContext();
  const [pdfUrl, setPdfUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [isVariablesModalOpen, setIsVariablesModalOpen] = useState(false);

  // Variables state moved here
  const [variables, setVariables] = useState([]);
  const [variableValues, setVariableValues] = useState({});
  const [isLoadingVariables, setIsLoadingVariables] = useState(false);
  const [variablesError, setVariablesError] = useState(null);

  const loadVariables = useCallback(async () => {
    setIsLoadingVariables(true);
    setVariablesError(null);

    try {
      const data = await apiClient(`/api/templates/${templateId}/variables`);
      setVariables(data.data.variables);

      // Initialize variable values with defaults
      const initialValues = {};
      data.data.variables.forEach((variable) => (initialValues[variable] = ""));
      setVariableValues(initialValues);
    } catch (err) {
      console.error("Failed to load variables:", err);
      setVariablesError("Failed to load template variables");
      setVariables([]); // Still generate preview with empty variables
      setVariableValues({});
    } finally {
      setIsLoadingVariables(false);
    }
  }, [templateId]);

  // Load variables when template changes
  useEffect(() => {
    if (currentTemplate && templateId) loadVariables();
  }, [templateId, loadVariables, currentTemplate]);

  const generatePreview = useCallback(
    async (customVariables = null) => {
      setIsGenerating(true);
      setError(null);

      try {
        const data = await apiClient(`/api/templates/${templateId}/preview`, {
          method: "POST",
          body: customVariables || variableValues || {},
        });

        setPdfUrl(data.data.tempUrl);
        if (isVariablesModalOpen) setIsVariablesModalOpen(false);
      } catch (err) {
        console.error("Failed to generate PDF preview:", err);
        setError("Failed to generate PDF preview. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    },
    [templateId, variableValues, isVariablesModalOpen]
  );

  const handleVariablesUpdate = (newVariableValues) => {
    setVariableValues(newVariableValues);
    generatePreview(newVariableValues);
    setIsVariablesModalOpen(false);
  };

  const handleRefreshPreview = () => generatePreview();
  const handleOpenVariablesModal = async () => {
    setIsVariablesModalOpen(true);
    await loadVariables(); // Reload variables to capture any recent changes
  };

  // Subscribe to file save events to auto-regenerate preview
  useEffect(() => {
    const handleFileSaved = (savedTemplateId, fileId, content) => {
      // Only regenerate if it's for the current template and we're not already generating
      if (savedTemplateId === templateId && !isGenerating) generatePreview();
    };

    const unsubscribe = subscribeToFileSaves(handleFileSaved);
    return unsubscribe;
  }, [templateId, isGenerating, generatePreview, subscribeToFileSaves]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => pdfUrl && URL.revokeObjectURL(pdfUrl);
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
            {variablesError && (
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                {variablesError}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenVariablesModal}
              disabled={isGenerating || isLoadingVariables}
              className="flex items-center gap-2"
            >
              <VariableIcon className="h-4 w-4" />
              Variables
              {variables.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                  {variables.length}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshPreview}
              disabled={isGenerating || isLoadingVariables}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
              ) : (
                <RefreshCwIcon className="h-4 w-4" />
              )}
              Refresh
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
          ) : isGenerating || isLoadingVariables ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 mx-auto mb-4" />
                <p>
                  {isLoadingVariables
                    ? "Loading variables..."
                    : "Generating PDF preview..."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FileIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Click &quot;Refresh&quot; to generate PDF preview</p>
                <p className="text-xs mt-2">
                  Preview will auto-update when you save files (Ctrl+S)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Variables Modal */}
      <VariablesModal
        variables={variables}
        variableValues={variableValues}
        isOpen={isVariablesModalOpen}
        onClose={() => setIsVariablesModalOpen(false)}
        onUpdate={handleVariablesUpdate}
        isGenerating={isGenerating}
        isLoadingVariables={isLoadingVariables}
      />
    </>
  );
}
