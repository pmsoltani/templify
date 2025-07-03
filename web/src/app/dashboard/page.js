"use client";

import { Button } from "@/components/ui/button.jsx";
import Status from "@/components/Status.js";
import ApiKeyCard from "./components/ApiKeyCard.js";
import PdfList from "./components/PdfList.js";
import TemplateList from "./components/TemplateList.js";
import TemplateUploadDialog from "./components/TemplateUploadDialog.js";
import { useDashboard } from "./context/DashboardContext";
import StatsCard from "./components/StatsCard.js";

export default function DashboardPage() {
  const { isLoading, error, handleRefreshPdfsList } = useDashboard();

  if (isLoading.user) return <Status type="loading" title="Loading the dashboard..." />;
  if (error) return <Status type="error" title="Error" message={error.message} />;
  return (
    <>
      <section className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>

        <div className="flex gap-4 mb-6">
          <ApiKeyCard />
          <StatsCard />
        </div>
      </section>

      <section className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Templates</h2>
          <TemplateUploadDialog />
        </div>

        <TemplateList />
      </section>

      <section className="w-fit self-start">
        <div className="flex justify-between items-center mb-4 w-full">
          <h2 className="text-2xl font-bold">Your PDFs</h2>
          <Button
            variant="outline"
            onClick={handleRefreshPdfsList}
            disabled={isLoading.pdfs}
          >
            {isLoading.pdfs ? "Refreshing..." : "Refresh PDFs"}
          </Button>
        </div>

        <PdfList />
      </section>
    </>
  );
}
