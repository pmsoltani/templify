"use client";

import FileEditor from "@/components/app/FileEditor";
import TemplatePreview from "@/components/app/TemplatePreview";
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
    <div className="h-[calc(100vh-2.5rem)] flex overflow-hidden">
      <div className="w-1/2 flex flex-col border-r border-gray-200">
        <FileEditor templateId={templateId} fileId={fileId} />
      </div>

      <div className="w-1/2 flex flex-col">
        <TemplatePreview templateId={templateId} />
      </div>
    </div>
  );
}
