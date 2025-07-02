"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useDashboard } from "../context/DashboardContext";

export default function StatsCard() {
  const { templates, pdfs } = useDashboard();

  return (
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
  );
}
