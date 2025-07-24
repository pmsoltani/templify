"use client";

import { HubProvider } from "@/contexts/HubContext";

export default function AppLayout({ children }) {
  return <HubProvider>{children}</HubProvider>;
}
