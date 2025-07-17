import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import "../globals.css";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />

      <main className="flex flex-grow flex-col items-center gap-4 w-5xl max-w-5xl p-4">
        {children}
      </main>

      <Footer />
    </>
  );
}
