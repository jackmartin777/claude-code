import type { Metadata } from "next";
import { SettingsView } from "@/components/app/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Profile, workspace, members, billing.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
