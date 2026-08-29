import type { Metadata } from "next";
import { Builder } from "@/components/app/builder";

export const metadata: Metadata = {
  title: "Builder",
  description: "Chat with Hercules and watch your app build itself.",
};

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Builder projectId={id} />;
}
