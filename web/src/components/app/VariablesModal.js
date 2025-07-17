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
import { VariableIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Status from "../common/Status";

export default function VariablesModal({
  variables,
  variableValues,
  isOpen,
  onClose,
  onUpdate,
  isGenerating = false,
  isLoadingVariables,
}) {
  const [localVariableValues, setLocalVariableValues] = useState(variableValues);

  // Update local state when props change
  useEffect(() => {
    setLocalVariableValues(variableValues);
  }, [variableValues]);

  const handleVariableChange = (variableName, value) => {
    setLocalVariableValues((prev) => ({ ...prev, [variableName]: value }));
  };
  const handleUpdate = () => onUpdate(localVariableValues);
  const handleReset = () => setLocalVariableValues(variableValues);

  const isDiff = JSON.stringify(localVariableValues) !== JSON.stringify(variableValues);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <VariableIcon className="h-5 w-5" />
            Template Variables
          </DialogTitle>
          <DialogDescription>
            Modify the variables and click &quot;Update Preview&quot; to generate a new
            preview.
          </DialogDescription>
        </DialogHeader>

        {isLoadingVariables ? (
          <div className="flex items-center justify-center py-8">
            <Status variant="loading" title="Loading variables..." />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            {variables.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <VariableIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No variables found in this template</p>
                <p className="text-xs mt-1">
                  {"Use {{ variableName }} syntax in your HTML"}
                </p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-4 p-2 h-full">
                {variables.map((variable) => (
                  <Input
                    key={variable}
                    id={variable}
                    value={localVariableValues[variable] || ""}
                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                    placeholder={`Enter ${variable}`}
                    required={variable.required}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex gap-2 flex-shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          {isDiff && (
            <Button variant="ghost" onClick={handleReset} disabled={isGenerating}>
              Reset
            </Button>
          )}
          <Button
            onClick={handleUpdate}
            disabled={isGenerating || variables.length === 0}
          >
            {isGenerating ? "Updating..." : "Update Preview"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
