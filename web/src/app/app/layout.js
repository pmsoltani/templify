"use client";

import AppNavbar from "@/components/app/AppNavbar";
import { AppProvider } from "@/contexts/AppContext.js";

export default function AppLayout({ children }) {
  return (
    <AppProvider>
      <AppNavbar />

      <main className="w-full">{children}</main>
    </AppProvider>
  );
}
