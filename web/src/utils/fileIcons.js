import {
  FileCodeIcon,
  FileCogIcon,
  FileIcon,
  FileImageIcon,
  FileJsonIcon,
  FileTextIcon,
  FileTypeIcon,
  PaletteIcon,
} from "lucide-react";

function getFileIcon(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "htm":
    case "html":
      return FileTextIcon;
    case "css":
      return PaletteIcon;
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return FileCodeIcon;
    case "json":
      return FileJsonIcon;
    case "gif":
    case "jpeg":
    case "jpg":
    case "png":
    case "svg":
    case "webp":
      return FileImageIcon;
    case "otf":
    case "ttf":
    case "woff":
    case "woff2":
      return FileTypeIcon;
    case "md":
    case "txt":
      return FileTextIcon;
    case "xml":
    case "yaml":
    case "yml":
      return FileCogIcon;
    default:
      return FileIcon;
  }
}

function getFileIconColor(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "htm":
    case "html":
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
    case "gif":
    case "jpeg":
    case "jpg":
    case "png":
    case "svg":
    case "webp":
      return "text-purple-500";
    case "otf":
    case "ttf":
    case "woff":
    case "woff2":
      return "text-green-600";
    case "md":
      return "text-gray-600";
    case "txt":
      return "text-gray-500";
    case "xml":
    case "yaml":
    case "yml":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
}

export { getFileIcon, getFileIconColor };
