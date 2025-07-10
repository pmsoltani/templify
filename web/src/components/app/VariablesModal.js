"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/apiClient";
import { Loader2, Variable } from "lucide-react";
import { useEffect, useState } from "react";

export default function VariablesModal({
  templateId,
  isOpen,
  onClose,
  onGenerate,
  isGenerating = false,
}) {
  const [variables, setVariables] = useState([]);
  const [variableValues, setVariableValues] = useState({});
  const [isLoadingVariables, setIsLoadingVariables] = useState(false);
  const [error, setError] = useState(null);

  // Load variables when modal opens
  useEffect(() => {
    if (isOpen && templateId) {
      loadVariables();
    }
  }, [isOpen, templateId]);

  const loadVariables = async () => {
    setIsLoadingVariables(true);
    setError(null);

    try {
      const data = await apiClient(`/api/templates/${templateId}/variables`);
      setVariables(data.data.variables);

      // Initialize variable values with defaults
      const initialValues = {};
      data.data.variables.forEach((variable) => {
        initialValues[variable.name] = variable.defaultValue || "";
      });
      setVariableValues(initialValues);
    } catch (err) {
      console.error("Failed to load variables:", err);
      setError("Failed to load template variables");
    } finally {
      setIsLoadingVariables(false);
    }
  };

  const handleVariableChange = (variableName, value) => {
    setVariableValues((prev) => ({
      ...prev,
      [variableName]: value,
    }));
  };

  const handleGenerate = () => {
    onGenerate(variableValues);
  };

  const getInputType = (variableType) => {
    switch (variableType) {
      case "number":
        return "number";
      case "email":
        return "email";
      case "url":
        return "url";
      case "date":
        return "date";
      default:
        return "text";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Variable className="h-5 w-5" />
            Template Variables
          </DialogTitle>
          <DialogDescription>
            Fill in the variables to generate a preview with your data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoadingVariables ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading variables...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadVariables}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : variables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Variable className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No variables found in this template</p>
              <p className="text-xs mt-1">
                {"Use {{ variableName }} syntax in your HTML"}
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-4">
              {variables.map((variable) => (
                <div key={variable.name} className="space-y-2">
                  <Label htmlFor={variable.name} className="text-sm font-medium">
                    {variable.name}
                    {variable.required && <span className="text-red-500 ml-1">*</span>}
                    <span className="text-xs text-gray-500 ml-2">
                      ({variable.type})
                    </span>
                  </Label>
                  <Input
                    id={variable.name}
                    type={getInputType(variable.type)}
                    value={variableValues[variable.name] || ""}
                    onChange={(e) =>
                      handleVariableChange(variable.name, e.target.value)
                    }
                    placeholder={`Enter ${variable.name}`}
                    required={variable.required}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isLoadingVariables || isGenerating || variables.length === 0}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              "Generate Preview"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
