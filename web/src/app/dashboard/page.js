"use client";

import { Button } from "@/components/ui/button.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import ApiKeyCard from "./components/ApiKeyCard.js";
import PdfList from "./components/PdfList.js";
import TemplateList from "./components/TemplateList.js";
import TemplateUploadDialog from "./components/TemplateUploadDialog.js";
import { useDashboard } from "./context/DashboardContext";

export default function DashboardPage() {
  const { templates, pdfs, isLoading, error, handleRefreshPdfsList } = useDashboard();

  if (isLoading.user) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <ApiKeyCard />

        <Card>
          <CardHeader>
            <CardTitle>Usage Stats</CardTitle>
            <CardDescription>Your activity overview.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Templates Uploaded:</strong> {templates.length}
            </p>
            <p>
              <strong>PDFs Generated:</strong> {pdfs.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Templates</h2>
        <TemplateUploadDialog />
      </div>

      <TemplateList />

      <div className="flex justify-between items-center mb-4">
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
    </div>
  );
}
