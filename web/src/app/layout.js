import ErrorBoundary from "@/components/common/ErrorBoundry";
import { Toaster } from "@/components/ui/sonner";
import { HTML_METADATA } from "@/lib/config";
import "./globals.css";

export const metadata = HTML_METADATA;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <ErrorBoundary>
          {children}
          <Toaster position="top-right" richColors />
        </ErrorBoundary>
      </body>
    </html>
  );
}
