"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/contexts/AppContext.js";
import { getFileIcon, getFileIconColor } from "@/utils/fileIcons.js";
import formatFileSize from "@/utils/formatFileSize";
import { ChevronDownIcon, FolderOpenIcon, HomeIcon } from "lucide-react";
import Link from "next/link";

export default function AppBreadcrumb({ templateId, fileId }) {
  const { templates, currentTemplate, currentFiles } = useAppContext();

  const currentTemplateData =
    currentTemplate || templates.find((t) => t.id === templateId);
  const currentFileData = currentFiles.find((f) => f.id === fileId);
  const fileName = currentFileData ? currentFileData.name : null;

  const renderTemplatesDropdown = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 hover:text-accent-foreground">
          {currentTemplateData?.name || templateId}
          <ChevronDownIcon className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">
            Switch Template
          </div>
          {templates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              asChild
              className={template.id === templateId ? "bg-gray-50" : ""}
            >
              <Link
                href={`/app/templates/${template.id}`}
                className="flex items-center gap-4"
              >
                <FolderOpenIcon className="w-4 h-4" />
                <div className="flex-1">
                  <div className="font-medium">{template.name}</div>
                  {template.description && (
                    <div className="text-xs text-gray-500 truncate">
                      {template.description}
                    </div>
                  )}
                </div>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderFilesDropdown = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 hover:text-accent-foreground">
          {fileName}
          <ChevronDownIcon className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">
            Switch File
          </div>
          {currentFiles.map((file) => {
            const IconComponent = getFileIcon(file.name);
            const iconColor = getFileIconColor(file.name);
            return (
              <DropdownMenuItem
                key={file.id}
                asChild
                className={file.id === currentFileData?.id ? "bg-gray-50" : ""}
              >
                <Link
                  href={`/app/templates/${templateId}/${file.id}`}
                  className="flex items-center gap-4"
                >
                  <IconComponent className={`h-4 w-4 ${iconColor}`} />
                  <div className="flex-1">
                    <div className="font-medium">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  if (templateId) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/app" className="flex items-center gap-1">
                <HomeIcon className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem className="cursor-default">Templates</BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>{renderTemplatesDropdown()}</BreadcrumbItem>

          {fileName && <BreadcrumbSeparator />}
          {fileName && <BreadcrumbItem>{renderFilesDropdown()}</BreadcrumbItem>}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }
}
