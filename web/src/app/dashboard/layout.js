import { DashboardProvider } from "./context/DashboardContext";

export default function DashboardLayout({ children }) {
  // This provider will make dashboard state available to the page and all its children.
  return <DashboardProvider>{children}</DashboardProvider>;
}
