"use client";

import AppNavbar from "@/components/app/AppNavbar";
import { AppProvider } from "@/contexts/AppContext.js";

export default function AppLayout({ children }) {
  return (
    <AppProvider>
      <AppNavbar />

      <main className="flex-1 w-full overflow-hidden">{children}</main>
    </AppProvider>
  );
}
