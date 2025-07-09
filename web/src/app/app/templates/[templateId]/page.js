"use client";

import AppDashboard from "@/components/app/AppDashboard";
import { AppProvider } from "@/contexts/AppContext.js";
import { useParams } from "next/navigation";

export default function TemplatePage() {
  const { templateId } = useParams();

  return (
    <AppProvider>
      <AppDashboard templateId={templateId} />
    </AppProvider>
  );
}
