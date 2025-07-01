"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button.jsx";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isLoadingPdfs, setIsLoadingPdfs] = useState(false);
  const [removingTemplateId, setRemovingTemplateId] = useState(null);
  const [gettingPdfLinkId, setGettingPdfLinkId] = useState(null);
  const [isApiKeyLoading, setIsApiKeyLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch user and template data in parallel.
    const fetchData = async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };
        const [userResponse, templatesResponse, pdfsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/templates`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdfs`, { headers }),
        ]);

        if (!userResponse.ok || !templatesResponse.ok || !pdfsResponse.ok) {
          throw new Error("Failed to fetch data.");
        }

        const userData = await userResponse.json();
        const templatesData = await templatesResponse.json();
        const pdfsData = await pdfsResponse.json();

        setUser(userData.data.user);
        setTemplates(templatesData.data.templates);
        setPdfs(pdfsData.data.pdfs);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const refreshTemplatesList = async () => {
    const token = localStorage.getItem("authToken");

    setIsLoadingTemplates(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/templates/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to templates.");
      const templatesData = await response.json();
      setTemplates(templatesData.data.templates);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const refreshPdfsList = async () => {
    const token = localStorage.getItem("authToken");
    setIsLoadingPdfs(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdfs/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch PDFs.");
      const pdfsData = await response.json();
      setPdfs(pdfsData.data.pdfs);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingPdfs(false);
    }
  };

  const handleRemove = async (templateId) => {
    setRemovingTemplateId(templateId);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/templates/${templateId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to remove the template.");
      await refreshTemplatesList();
      await refreshPdfsList();
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingTemplateId(null);
    }
  };

  const getPdfLink = async (pdfId) => {
    setGettingPdfLinkId(pdfId);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pdfs/${pdfId}/download`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to get PDF download link.");
      const data = await response.json();
      const downloadLink = data.data.url;

      // Open the download link in a new tab
      window.open(downloadLink, "_blank");
    } catch (err) {
      setError(err.message);
    } finally {
      setGettingPdfLinkId(null);
    }
  };

  const handleCopyToClipboard = () => {
    if (!user?.apiKey) return;
    navigator.clipboard.writeText(user.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // reset after 2
  };

  const handleGenerateApiKey = async () => {
    setIsApiKeyLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/me/regenerate-key`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to request API key.");
      const data = await response.json();
      setUser((prevUser) => ({ ...prevUser, apiKey: data.data.user.apiKey }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsApiKeyLoading(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <ApiKeyCard
          apiKey={user.apiKey}
          isApiKeyLoading={isApiKeyLoading}
          copied={copied}
          onCopy={handleCopyToClipboard}
          onGenerate={handleGenerateApiKey}
        />

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
        <TemplateUploadDialog onUploadSuccess={refreshTemplatesList} />
      </div>

      <TemplateList
        isLoadingTemplates={isLoadingTemplates}
        removingTemplateId={removingTemplateId}
        templates={templates}
        onUploadSuccess={refreshTemplatesList}
        handleRemove={handleRemove}
      />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your PDFs</h2>
        <Button variant="outline" onClick={refreshPdfsList} disabled={isLoadingPdfs}>
          {isLoadingPdfs ? "Refreshing..." : "Refresh PDFs"}
        </Button>
      </div>

      <PdfList
        isLoadingPdfs={isLoadingPdfs}
        pdfs={pdfs}
        gettingPdfLinkId={gettingPdfLinkId}
        getPdfLink={getPdfLink}
      />
    </div>
  );
}
