import type { Metadata } from "next";
import { UsageView } from "@/components/app/usage-view";

export const metadata: Metadata = {
  title: "Usage",
  description: "Credit usage, plan and per-app consumption.",
};

export default function UsagePage() {
  return <UsageView />;
}
