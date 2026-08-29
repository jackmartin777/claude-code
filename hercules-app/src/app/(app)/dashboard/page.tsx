import type { Metadata } from "next";
import { DashboardView } from "@/components/app/dashboard-view";

export const metadata: Metadata = {
  title: "Apps",
  description: "Every app in your Hercules workspace.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
