import type { Metadata } from "next";
import { SignupForm } from "@/components/app/auth-form";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a Hercules account and build your first app.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string }>;
}) {
  const { prompt } = await searchParams;
  return <SignupForm prompt={typeof prompt === "string" ? prompt.slice(0, 600) : ""} />;
}
