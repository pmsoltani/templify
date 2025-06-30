import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata = {
  title: "Templify | API-Driven PDF Generation",
  description: "Generate custom PDFs from data using your own HTML/CSS templates.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
          {children}
        </main>
      </body>
    </html>
  );
}
