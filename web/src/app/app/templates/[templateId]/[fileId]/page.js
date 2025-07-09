"use client";

import { FileEditor } from "@/components/app/FileEditor";
import { TemplatePreview } from "@/components/app/TemplatePreview";
import { useAppContext } from "@/contexts/AppContext.js";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function FileEditorPage() {
  const { templateId, fileId } = useParams();
  const { loadTemplateFiles } = useAppContext();

  useEffect(() => {
    if (templateId) {
      loadTemplateFiles(templateId);
    }
  }, [templateId, loadTemplateFiles]);

  return (
    <>
      <div className="flex">
        <FileEditor templateId={templateId} fileId={fileId} />

        {/* Preview Panel */}
        <TemplatePreview templateId={templateId} />
      </div>
    </>
  );
}
