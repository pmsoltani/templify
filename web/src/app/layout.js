import ErrorBoundary from "@/components/common/ErrorBoundry";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL),
  title: "Templify | Automated PDF Generation Made Simple",
  description: "Generate custom PDFs from data using your own HTML/CSS templates.",
  authors: [{ name: "Pooria Soltani", url: "https://github.com/pmsoltani" }],
  keywords: [
    "PDF Generator API",
    "HTML to PDF",
    "PDF Templates",
    "Dynamic PDF Generation",
    "Custom PDF Creation",
    "PDF Automation",
    "Template to PDF",
    "PDF Generation Service",
  ],
  creator: "Pooria Soltani",
  publisher: "Templify",
  robots: "index, follow",
  manifest: "/manifest.json",
  openGraph: {
    title: "Templify | Automated PDF Generation Made Simple",
    description: "Generate custom PDFs from data using your own HTML/CSS templates.",
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Templify | Automated PDF Generation Made Simple",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Templify | Automated PDF Generation Made Simple",
    description: "Generate custom PDFs from data using your own HTML/CSS templates.",
    images: ["/images/twitter-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/images/icons/icon0.svg", type: "image/svg+xml" },
      { url: "/images/icons/icon1.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/images/icons/apple-touch-icon.png",
  },
};

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
