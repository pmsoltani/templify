import { toast } from "sonner";

/**
 * Displays an error toast notification with a given message and error details.
 *
 * @param {string} message - The main error message to display.
 * @param {Error} err - The error object containing additional details.
 * @param {number} [duration=5000] - Visible duration (milliseconds) of the toast.
 */
export default function makeToast(message, err, duration = 5000) {
  console.error(message, err);
  toast.error(message, {
    description: err.message || "An unexpected error occurred.",
    duration,
  });
}
