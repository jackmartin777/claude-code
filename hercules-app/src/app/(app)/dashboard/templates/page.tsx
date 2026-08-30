import type { Metadata } from "next";
import { TemplatesView } from "@/components/app/templates-view";

export const metadata: Metadata = {
  title: "Templates",
  description: "Starter briefs for CRMs, ERPs, portals, inventory and more.",
};

export default function TemplatesPage() {
  return <TemplatesView />;
}
