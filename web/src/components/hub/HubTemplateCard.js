"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHubContext } from "@/contexts/HubContext.js";
import formatDate from "@/utils/formatDate";
import { DownloadIcon, EyeIcon, StarIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Spinner from "../common/Spinner";

export default function HubTemplateCard({ template }) {
  const { importHubTemplate } = useHubContext();
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    try {
      setIsImporting(true);
      await importHubTemplate(template.id);
      toast.success(`Template "${template.name}" imported successfully!`);
    } catch (error) {
      toast.error("Failed to import template");
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  };

  const formatDownloads = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-blue-600 transition-colors">
            {template.name}
          </CardTitle>
          {template.featured && (
            <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
              <StarIcon className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>

        <CardDescription className="line-clamp-2 min-h-[2.5rem]">
          {template.description || "No description available"}
        </CardDescription>

        {/* Author & Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <UserIcon className="h-4 w-4" />
          <span>by {template.author_name}</span>
          <span>•</span>
          <span>{formatDate(template.created_at)}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Category & Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {template.category && (
            <Badge variant="outline" className="text-xs">
              {template.category}
            </Badge>
          )}
          {template.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags?.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <DownloadIcon className="h-4 w-4" />
            <span>{formatDownloads(template.download_count || 0)}</span>
          </div>
          <div className="flex items-center gap-1">
            <EyeIcon className="h-4 w-4" />
            <span>{formatDownloads(template.view_count || 0)}</span>
          </div>
          {template.rating && (
            <div className="flex items-center gap-1">
              <StarIcon className="h-4 w-4 fill-current text-yellow-400" />
              <span>{template.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button onClick={handleImport} disabled={isImporting} className="flex-1">
            {isImporting ? (
              <>
                <Spinner variant="outline" />
                <span className="ml-2">Importing...</span>
              </>
            ) : (
              <>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
