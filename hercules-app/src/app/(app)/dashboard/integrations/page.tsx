import type { Metadata } from "next";
import { IntegrationsView } from "@/components/app/integrations-view";

export const metadata: Metadata = {
  title: "Integrations",
  description: "Connect payments, email, storage and 6,000 more services.",
};

export default function IntegrationsPage() {
  return <IntegrationsView />;
}
