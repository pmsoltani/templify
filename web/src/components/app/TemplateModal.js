"use client";

import ConfirmRemovePopover from "@/components/app/ConfirmRemovePopover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppContext } from "@/contexts/AppContext.js";
import formatDate from "@/utils/formatDate";
import { CalendarIcon, FolderOpenIcon, HashIcon, PlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import EditableField from "../EditableField";
import FileTable from "./FileTable";

export default function TemplateModal({ open, onOpenChange }) {
  const {
    editingTemplate,
    setEditingTemplate,
    loadTemplateFiles,
    updateTemplate,
    removeTemplate,
    createFile,
    isLoading,
  } = useAppContext();

  const [editingFields, setEditingFields] = useState({});
  const [editValues, setEditValues] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingTemplate && open) {
      loadTemplateFiles(editingTemplate.id);
    }
  }, [editingTemplate, open, loadTemplateFiles]);

  const startEditing = (field, currentValue) => {
    setEditingFields((prev) => ({ ...prev, [field]: true }));
    setEditValues((prev) => ({ ...prev, [field]: currentValue }));
  };

  const cancelEditing = (field) => {
    setEditingFields((prev) => ({ ...prev, [field]: false }));
    setEditValues((prev) => ({ ...prev, [field]: "" }));
  };

  const saveField = async (field) => {
    try {
      const updateData = { [field]: editValues[field] };
      console.log("Saving", field, updateData);
      const updatedTemplate = await updateTemplate(editingTemplate.id, updateData);
      setEditingTemplate(updatedTemplate);
      setEditingFields((prev) => ({ ...prev, [field]: false }));
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !editingTemplate) return;

    try {
      await createFile(editingTemplate.id, file);
      await loadTemplateFiles(editingTemplate.id);
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""; // Clear the file input
    }
  };

  const handleRemoveTemplate = async () => {
    await removeTemplate(editingTemplate.id);
    onOpenChange(false);
  };

  if (!editingTemplate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            <HashIcon className="h-5 w-5" />
            {editingTemplate.id}
          </DialogTitle>
          <DialogDescription>
            View and edit template information and manage files
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Template Information */}
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  Created At
                </label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {formatDate(editingTemplate.createdAt)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  Updated At
                </label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {formatDate(editingTemplate.updatedAt)}
                </p>
              </div>
            </div>

            <EditableField
              fieldName="name"
              fieldLabel="Name"
              fieldValue={editingTemplate.name}
              editingField={editingFields.name}
              editValues={editValues}
              onChange={setEditValues}
              onSave={saveField}
              onCancel={cancelEditing}
              onEdit={startEditing}
            />

            <EditableField
              fieldName="description"
              fieldLabel="Description"
              fieldValue={editingTemplate.description}
              editingField={editingFields.description}
              editValues={editValues}
              onChange={setEditValues}
              onSave={saveField}
              onCancel={cancelEditing}
              onEdit={startEditing}
            />

            <EditableField
              fieldName="htmlEntrypoint"
              fieldLabel=" HTML Entrypoint"
              fieldValue={editingTemplate.htmlEntrypoint}
              editingField={editingFields.htmlEntrypoint}
              editValues={editValues}
              onChange={setEditValues}
              onSave={saveField}
              onCancel={cancelEditing}
              onEdit={startEditing}
            />
          </div>

          {/* Files Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <FolderOpenIcon className="h-5 w-5" />
                Template Files
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add File
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                accept=".html,.css,.js,.txt,.json,.md"
              />
            </div>

            <FileTable />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t">
          <ConfirmRemovePopover
            title="Remove Template"
            message="This action cannot be undone. This will permanently remove the template, all its files, and any PDFs generated using it."
            onConfirm={handleRemoveTemplate}
            isLoading={isLoading}
            triggerText="Remove Template"
            confirmText="Remove"
          />

          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
