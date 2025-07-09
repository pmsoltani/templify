import { Code, File, FileCode, FileText, Image, Palette, Settings } from "lucide-react";

function getFileIcon(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "html":
    case "htm":
      return FileText;
    case "css":
      return Palette;
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return Code;
    case "json":
      return FileCode;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
    case "webp":
      return Image;
    case "md":
    case "txt":
      return FileText;
    case "xml":
    case "yml":
    case "yaml":
      return Settings;
    default:
      return File;
  }
}

function getFileIconColor(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "html":
    case "htm":
      return "text-orange-500";
    case "css":
      return "text-blue-500";
    case "js":
    case "jsx":
      return "text-yellow-500";
    case "ts":
    case "tsx":
      return "text-blue-600";
    case "json":
      return "text-green-500";
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
    case "webp":
      return "text-purple-500";
    case "md":
      return "text-gray-600";
    case "txt":
      return "text-gray-500";
    case "xml":
    case "yml":
    case "yaml":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
}

export { getFileIcon, getFileIconColor };
