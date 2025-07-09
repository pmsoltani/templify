"use client";

import { useParams } from "next/navigation";
import Navbar from "../Navbar";
import AppBreadcrumb from "./AppBreadcrumb";

export default function AppNavbar() {
  const { templateId, fileId } = useParams();
  const breadcrumb = <AppBreadcrumb templateId={templateId} fileId={fileId} />;
  return <Navbar breadcrumb={breadcrumb} />;
}
