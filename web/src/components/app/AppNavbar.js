"use client";

import { useParams } from "next/navigation";
import Navbar from "../layout/Navbar";
import AccountMenuDropdown from "./AccountMenuDropdown";
import AppBreadcrumb from "./AppBreadcrumb";

export default function AppNavbar() {
  const { templateId, fileId } = useParams();
  const breadcrumb = <AppBreadcrumb templateId={templateId} fileId={fileId} />;
  const dropdown = <AccountMenuDropdown />;
  return <Navbar breadcrumb={breadcrumb} dropdown={dropdown} />;
}
