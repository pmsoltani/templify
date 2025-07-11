"use client";

import TemplatePreview from "@/components/app/TemplatePreview";
import { useParams, usePathname } from "next/navigation";

export default function TemplateLayout({ children }) {
  const { templateId } = useParams();
  const path = usePathname();

  const isFileEditorPage = path.includes("/templates/") && path.split("/").length > 4;
  if (!isFileEditorPage) return <>{children}</>;

  // For /app/templates/[templateId]/[fileId] pages, show split view
  return (
    <div className="h-[calc(100vh-2.5rem)] flex overflow-hidden">
      <div className="w-1/2 flex flex-col border-r border-gray-200">{children}</div>

      <div className="w-1/2 flex flex-col">
        <TemplatePreview templateId={templateId} />
      </div>
    </div>
  );
}
