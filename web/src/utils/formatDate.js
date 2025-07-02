/**
 * Formats a date string into a human-readable localized string.
 *
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string, or an empty string if input is falsy.
 */
export default function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
