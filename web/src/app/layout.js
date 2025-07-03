import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata = {
  title: "Templify | API-Driven PDF Generation",
  description: "Generate custom PDFs from data using your own HTML/CSS templates.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="w-full">
          <Navbar />
        </header>

        <main className="flex flex-grow flex-col items-center gap-4 w-5xl max-w-5xl p-4">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
