"use client";

import PDFTable from "@/components/app/PDFTable";
import TemplateModal from "@/components/app/TemplateModal";
import TemplateTable from "@/components/app/TemplateTable";
import UploadTemplateDialog from "@/components/app/UploadTemplateDialog";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext.js";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppDashboard({ templateId = null }) {
  const router = useRouter();
  const {
    loadTemplates,
    loadPdfs,
    templates,
    isTemplatesLoading,
    isPdfsLoading,
    setEditingTemplate,
  } = useAppContext();

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadPdfs();
  }, [loadTemplates, loadPdfs]);

  // Set editing template when templates are loaded
  useEffect(() => {
    if (templates.length > 0 && templateId) {
      const template = templates.find((t) => t.id === templateId);
      if (!template) router.replace("/app");
      setEditingTemplate(template);
    }
  }, [templates, templateId, setEditingTemplate, router]);

  const handleRefresh = async () => {
    await Promise.all([loadTemplates(), loadPdfs()]);
  };

  const handleUploadTemplate = () => {
    setEditingTemplate(null);
    setIsUploadDialogOpen(true);
  };

  const handleModalClose = () => templateId && router.push("/app");

  return (
    <>
      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Templates Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Templates</h2>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isTemplatesLoading || isPdfsLoading}
                className="flex items-center gap-2"
              >
                <RefreshCwIcon
                  className={`h-4 w-4 ${
                    isTemplatesLoading || isPdfsLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={handleUploadTemplate}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Create New Template
              </Button>
            </div>
          </div>
          <TemplateTable />
        </div>

        {/* PDFs Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated PDFs</h2>
          <PDFTable />
        </div>
      </div>

      {/* Dialogs */}
      <UploadTemplateDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />

      {/* Template Modal - Only show when templateId is provided */}
      {templateId && (
        <TemplateModal
          open={true}
          onOpenChange={(open) => !open && handleModalClose()}
        />
      )}
    </>
  );
}
