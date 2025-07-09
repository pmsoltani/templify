export default function formatFileSize(bytes) {
  if (bytes === 0) return "Empty";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i < 2 ? 0 : 1)} ${sizes[i]}`;
}
