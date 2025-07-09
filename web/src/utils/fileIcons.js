import {
  CodeIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  ImageIcon,
  PaletteIcon,
  SettingsIcon,
} from "lucide-react";

function getFileIcon(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "html":
    case "htm":
      return FileTextIcon;
    case "css":
      return PaletteIcon;
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return CodeIcon;
    case "json":
      return FileCodeIcon;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
    case "webp":
      return ImageIcon;
    case "md":
    case "txt":
      return FileTextIcon;
    case "xml":
    case "yml":
    case "yaml":
      return SettingsIcon;
    default:
      return FileIcon;
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
